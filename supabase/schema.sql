-- SocialToolkit database schema
-- Run this in the Supabase SQL editor after creating your project.
--
-- MIGRATION NOTE (trial + pay-as-you-go, added later): if profiles already
-- exists in your live project, `create table if not exists` below won't add
-- the two new columns to it. Run these two lines once in the Supabase SQL
-- editor before the rest of this file:
--   alter table profiles add column if not exists trial_started_at timestamp default current_timestamp;
--   alter table profiles add column if not exists credits_balance int default 0;
--
-- MIGRATION NOTE (Paddle, added later): the columns below are additive,
-- alongside the existing stripe_* ones (Stripe code is left in place but
-- inactive - see README's Billing & payments section). Run these once in
-- the Supabase SQL editor before the rest of this file:
--   alter table profiles add column if not exists paddle_customer_id text;
--   alter table subscriptions add column if not exists paddle_subscription_id text unique;
--   alter table subscriptions add column if not exists paddle_customer_id text;
--   alter table revenue_events add column if not exists paddle_event_id text unique;

-- Supabase manages auth.users itself (you can't ALTER it directly), so
-- subscription/usage fields live in a linked profiles table instead.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  subscription_tier text default 'free', -- 'free' | 'premium' | 'pro'
  role text default 'user', -- 'user' | 'admin' - grants full admin dashboard + Pro access.
                             -- ADMIN_EMAILS (env var) is a separate, always-on fallback
                             -- admin list so this can never be locked out by a DB issue.
                             -- There is deliberately no client-side UPDATE policy on
                             -- profiles, so this column can only ever be changed via the
                             -- admin dashboard's Users tab (service-role backend), never
                             -- by a user editing their own profile.
  credits_used int default 0,
  credits_reset_date date default current_date,
  stripe_customer_id text, -- legacy: Stripe integration is inactive, kept for the not-yet-removed Stripe code
  paddle_customer_id text,
  subscription_status text default 'active', -- 'active' | 'canceled' | 'past_due'
  -- Trial clock for the mandatory-account, 3-day declining trial (day 1-3 =
  -- 3/2/1 generations, enforced in lib/rateLimit.js). Defaults to "now" so
  -- existing rows backfilled by this migration also get a fresh trial
  -- rather than an undefined/expired one.
  trial_started_at timestamp default current_timestamp,
  -- Pay-as-you-go balance: generations available once the trial ends and
  -- the account isn't on a paid plan. Purchased via credit_purchases below.
  credits_balance int default 0,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

-- Auto-create a profile row whenever a new user signs up.
-- username comes from the signup form via supabase.auth.signUp's options.data.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, trial_started_at) values (new.id, new.raw_user_meta_data->>'username', current_timestamp);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Daily usage tracking (backs the free-tier 10/day rate limit)
create table if not exists daily_usage (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  generations_count int default 0,
  tool_breakdown jsonb default '{}', -- {hashtag: 5, caption: 3, bio: 2, ideas: 1}
  created_at timestamp default current_timestamp,
  unique(user_id, usage_date)
);

-- Subscriptions (Paddle; stripe_* columns are legacy/inactive - see README)
create table if not exists subscriptions (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  paddle_subscription_id text unique,
  paddle_customer_id text,
  status text, -- 'active' | 'past_due' | 'canceled' | 'trialing'
  current_period_start timestamp,
  current_period_end timestamp,
  cancel_at timestamp,
  price_id text,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

-- Pay-as-you-go credit purchases: one-time payments (not subscriptions) that
-- top up profiles.credits_balance, spent once a free account's 3-day trial
-- has ended and it isn't on a paid plan (see lib/rateLimit.js).
create table if not exists credit_purchases (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  credits int not null,
  amount numeric(10,2) not null,
  payment_reference text, -- processor's order/transaction id, for support lookups
  created_at timestamp default current_timestamp
);

create index if not exists idx_credit_purchases_user on credit_purchases(user_id);

-- Saved/favorited generations (Premium feature)
create table if not exists saved_outputs (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  output_type text, -- 'hashtag' | 'caption' | 'bio' | 'ideas'
  content text,
  metadata jsonb, -- {platform: 'Instagram', tone: 'funny', ...}
  is_favorite boolean default false,
  created_at timestamp default current_timestamp,
  expires_at timestamp default (current_timestamp + interval '3 months')
);

-- API usage log (for analytics + debugging)
create table if not exists api_usage_logs (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text, -- '/api/generate/hashtags', etc
  status_code int,
  response_time_ms int,
  tokens_used int,
  created_at timestamp default current_timestamp
);

create index if not exists idx_api_usage_user_date on api_usage_logs(user_id, created_at);
create index if not exists idx_daily_usage_user_date on daily_usage(user_id, usage_date);

-- Content calendar (Premium feature): planned posting dates
create table if not exists content_calendar (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  planned_date date not null,
  note text,
  output_type text,
  created_at timestamp default current_timestamp
);

create index if not exists idx_content_calendar_user_date on content_calendar(user_id, planned_date);

-- Quick templates (Premium feature): saved reusable prompt presets
create table if not exists templates (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  tool_type text not null, -- 'hashtag' | 'caption' | 'bio' | 'ideas'
  prompt_data jsonb not null default '{}',
  created_at timestamp default current_timestamp
);

create index if not exists idx_templates_user on templates(user_id);

-- Contact form submissions (viewed in the admin dashboard)
create table if not exists contact_messages (
  id bigserial primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamp default current_timestamp
);

create index if not exists idx_contact_messages_created on contact_messages(created_at desc);

-- Admin-entered settings (e.g. fixed monthly hosting costs for the profit
-- calculation) that can't be pulled from any API and must be typed in once.
create table if not exists admin_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp default current_timestamp
);

-- Revenue ledger: one row per successful/failed Stripe invoice payment.
-- Populated by the Stripe webhook (invoice.paid / invoice.payment_failed) so
-- the admin dashboard can chart real revenue history over time instead of
-- only ever showing today's snapshot (current tier counts x price).
create table if not exists revenue_events (
  id bigserial primary key,
  stripe_event_id text unique, -- idempotency: Stripe may redeliver the same webhook event
  paddle_event_id text unique, -- idempotency: Paddle may redeliver the same webhook event
  user_id uuid references auth.users(id) on delete set null,
  stripe_customer_id text,
  email text,
  tier text, -- 'premium' | 'pro'
  status text not null, -- 'paid' | 'failed'
  amount numeric(10,2) not null default 0, -- gross amount in dollars
  fee_estimate numeric(10,2) not null default 0, -- estimated Stripe processing fee
  created_at timestamp default current_timestamp
);

create index if not exists idx_revenue_events_created on revenue_events(created_at);
alter table revenue_events enable row level security;
-- No public policy: only the backend (service_role key) reads/writes this table.

-- Row Level Security: our backend talks to these tables via the service_role key
-- (which always bypasses RLS), but this locks them down for any future client-side
-- access using the publishable/anon key - users can only see their own rows.
alter table profiles enable row level security;
alter table daily_usage enable row level security;
alter table subscriptions enable row level security;
alter table saved_outputs enable row level security;
alter table api_usage_logs enable row level security;
alter table content_calendar enable row level security;
alter table templates enable row level security;
alter table contact_messages enable row level security;
alter table admin_settings enable row level security;
alter table credit_purchases enable row level security;
-- No public policies for contact_messages/admin_settings: only the backend
-- (service_role key, which bypasses RLS) reads/writes them.

create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can view their own daily_usage" on daily_usage
  for select using (auth.uid() = user_id);

create policy "Users can view their own subscriptions" on subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can manage their own saved_outputs" on saved_outputs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can view their own api_usage_logs" on api_usage_logs
  for select using (auth.uid() = user_id);

create policy "Users can manage their own content_calendar" on content_calendar
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their own templates" on templates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can view their own credit_purchases" on credit_purchases
  for select using (auth.uid() = user_id);
