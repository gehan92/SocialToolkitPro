-- SocialToolkit database schema
-- Run this in the Supabase SQL editor after creating your project.

-- Supabase manages auth.users itself (you can't ALTER it directly), so
-- subscription/usage fields live in a linked profiles table instead.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  subscription_tier text default 'free', -- 'free' | 'premium' | 'pro'
  credits_used int default 0,
  credits_reset_date date default current_date,
  stripe_customer_id text,
  subscription_status text default 'active', -- 'active' | 'canceled' | 'past_due'
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

-- Auto-create a profile row whenever a new user signs up.
-- username comes from the signup form via supabase.auth.signUp's options.data.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username) values (new.id, new.raw_user_meta_data->>'username');
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

-- Stripe subscriptions
create table if not exists subscriptions (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status text, -- 'active' | 'past_due' | 'canceled' | 'trialing'
  current_period_start timestamp,
  current_period_end timestamp,
  cancel_at timestamp,
  price_id text,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

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
-- No public policies for contact_messages: only the backend (service_role key,
-- which bypasses RLS) reads/writes it, via the admin dashboard and /api/contact.

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
