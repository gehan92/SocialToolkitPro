# SocialToolkit Development & Technical Roadmap

**Status:** Pre-Development  
**Last Updated:** July 18, 2026  
**Tech Lead:** Gehan (Full-stack developer)

---

## Architecture Overview

### Current Architecture (Pre-Migration)
```
Frontend: HTML + JavaScript (Netlify static)
    ↓
AI API: Google Gemini (exposed - SECURITY RISK)
    ↓
No database, no backend, no auth
```

### Target Architecture (Post-Migration)
```
Frontend: Next.js (Vercel)
    ↓
API Routes: Backend endpoints
    ↓
Gemini/OpenAI APIs (secure, server-side only)
    ↓
Database: Supabase (users, subscriptions, usage tracking)
    ↓
Auth: Supabase Auth
    ↓
Payments: Stripe
```

---

## Tech Stack Decision

### Frontend
- **Framework:** Next.js 14+ (Pages Router)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + custom
- **Auth Client:** @supabase/supabase-js
- **State Management:** React hooks (useState, useContext)
- **HTTP Client:** fetch API (built-in)

### Backend
- **Runtime:** Node.js (Next.js API routes)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **AI APIs:** Google Gemini + OpenAI (GPT-4)
- **Payments:** Stripe
- **Monitoring:** Vercel Analytics + Sentry (optional)

### Infrastructure
- **Hosting:** Vercel (Next.js optimized)
- **Database:** Supabase (Cloud PostgreSQL)
- **Storage:** Supabase Storage (user exports)
- **CDN:** Vercel CDN (automatic)
- **Analytics:** Vercel Web Analytics + Plausible (optional)

### Development Tools
- **Package Manager:** npm
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Testing:** Jest + React Testing Library
- **Linting:** ESLint + Prettier
- **Environment:** VS Code

---

## Database Schema

### Users Table (Extends Supabase Auth)
```sql
ALTER TABLE auth.users ADD COLUMN (
  subscription_tier TEXT DEFAULT 'free', -- 'free' | 'premium' | 'pro'
  credits_used INT DEFAULT 0,
  credits_reset_date DATE DEFAULT CURRENT_DATE,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'active', -- 'active' | 'canceled' | 'past_due'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Daily Usage Table
```sql
CREATE TABLE daily_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE,
  generations_count INT DEFAULT 0,
  tool_breakdown JSONB DEFAULT '{}', -- {hashtag: 5, caption: 3, bio: 2, ideas: 1}
  UNIQUE(user_id, usage_date),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT, -- 'active' | 'past_due' | 'canceled' | 'trialing'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at TIMESTAMP,
  price_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Saved Outputs Table (Premium feature)
```sql
CREATE TABLE saved_outputs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  output_type TEXT, -- 'hashtag' | 'caption' | 'bio' | 'ideas'
  content TEXT,
  metadata JSONB, -- {platform: 'Instagram', tone: 'funny', ...}
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '3 months') -- free tier: 3 months
);
```

### API Usage Log (Analytics)
```sql
CREATE TABLE api_usage_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT, -- '/api/generate-hashtags', etc
  status_code INT,
  response_time_ms INT,
  tokens_used INT, -- for billing purposes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_usage_user_date ON api_usage_logs(user_id, created_at);
```

---

## API Endpoints (Backend Routes)

### Authentication Routes
```
POST   /api/auth/signup              Sign up new user
POST   /api/auth/login               Login existing user
POST   /api/auth/logout              Logout
GET    /api/auth/me                  Get current user
POST   /api/auth/refresh             Refresh token
```

### Generation Routes (Core)
```
POST   /api/generate/hashtags        Generate hashtags
POST   /api/generate/captions        Generate captions
POST   /api/generate/bios            Generate bios
POST   /api/generate/ideas           Generate video ideas
```

### Subscription Routes
```
GET    /api/subscription/tier        Check user tier & limits
POST   /api/subscription/checkout    Create Stripe checkout session
GET    /api/subscription/status      Get subscription details
POST   /api/subscription/cancel      Cancel subscription
```

### User Routes
```
GET    /api/user/profile             Get user profile
PUT    /api/user/profile             Update profile
GET    /api/user/usage               Get usage stats
GET    /api/user/saved               Get saved outputs
POST   /api/user/saved               Save an output
DELETE /api/user/saved/:id           Delete saved output
```

### Webhook Routes
```
POST   /api/webhooks/stripe          Stripe events (subscription updates)
```

---

## Implementation Timeline

### Week 1-2: Foundation & Setup
**Tasks:**
- [ ] Create Next.js project structure
- [ ] Set up GitHub repository
- [ ] Set up Supabase project (database + auth)
- [ ] Create database schema (SQL scripts)
- [ ] Set up environment variables (.env.local)
- [ ] Install dependencies (npm packages)

**Deliverables:**
- Working Next.js dev environment
- Database with all tables created
- GitHub repo with proper .gitignore

**Estimated Effort:** 16 hours

---

### Week 2-3: Authentication & Backend Foundation
**Tasks:**
- [ ] Implement Supabase Auth setup
- [ ] Create sign-up/login pages
- [ ] Set up authentication middleware
- [ ] Create user profile page
- [ ] Implement logout functionality
- [ ] Add password reset flow

**Deliverables:**
- Working authentication system
- Protected routes
- User session management

**Estimated Effort:** 20 hours

---

### Week 3-4: Core Generation Backend
**Tasks:**
- [ ] Move API key to backend (environment variable)
- [ ] Create `/api/generate/hashtags.js` endpoint
- [ ] Create `/api/generate/captions.js` endpoint
- [ ] Create `/api/generate/bios.js` endpoint
- [ ] Create `/api/generate/ideas.js` endpoint
- [ ] Implement rate limiting (backend)
- [ ] Add usage tracking to database

**Deliverables:**
- Secure backend API endpoints
- All 4 generators working server-side
- Usage tracking in database

**Estimated Effort:** 24 hours

---

### Week 4-5: Subscription & Payment System
**Tasks:**
- [ ] Set up Stripe account & products
- [ ] Create tier checking endpoint (`/api/subscription/tier`)
- [ ] Implement Free tier limits (10/day enforcement)
- [ ] Create checkout flow (`/api/subscription/checkout`)
- [ ] Implement Stripe webhooks
- [ ] Create subscription status page
- [ ] Add cancel subscription functionality

**Deliverables:**
- Working Stripe integration
- Subscription limits enforced
- Payment processing complete

**Estimated Effort:** 28 hours

---

### Week 5-6: Frontend Migration & UI Updates
**Tasks:**
- [ ] Convert HTML pages to Next.js components
- [ ] Update login/signup UI
- [ ] Create upgrade modals
- [ ] Add tier indicators (Free/Premium badge)
- [ ] Create account dashboard
- [ ] Add settings page

**Deliverables:**
- Full Next.js frontend
- Login required flow
- Tier-based UI rendering

**Estimated Effort:** 20 hours

---

### Week 6-7: Testing & Quality Assurance
**Tasks:**
- [ ] Unit tests for API endpoints
- [ ] Integration tests (auth → generation → payment)
- [ ] Manual testing (full user flow)
- [ ] Security audit (API keys, SQL injection, etc)
- [ ] Performance testing (load testing)
- [ ] Fix bugs found

**Deliverables:**
- Test suite with >80% coverage
- Security audit report
- Performance benchmarks

**Estimated Effort:** 16 hours

---

### Week 7-8: Deployment & Launch Prep
**Tasks:**
- [ ] Deploy to Vercel
- [ ] Configure environment variables on Vercel
- [ ] Set up custom domain (socialtoolkitpro.com)
- [ ] Configure DNS records
- [ ] Set up monitoring & error tracking (Sentry)
- [ ] Create deployment documentation
- [ ] Prepare launch announcement

**Deliverables:**
- Live on Vercel with custom domain
- Monitoring/alerting active
- Deployment runbook created

**Estimated Effort:** 12 hours

---

## Critical Implementation Details

### Environment Variables (`.env.local`)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY (SECRET)

# AI APIs
GEMINI_API_KEY=YOUR-GEMINI-KEY (SECRET)
OPENAI_API_KEY=YOUR-OPENAI-KEY (for future use)

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_... (SECRET)
STRIPE_WEBHOOK_SECRET=whsec_... (SECRET)

# App
NEXT_PUBLIC_URL=https://socialtoolkitpro.com
NODE_ENV=production
```

### Rate Limiting Strategy
```javascript
// Backend-enforced (cannot be bypassed)
- Free tier: 10 generations per day
- Premium: Unlimited
- Pro: Unlimited + API access

// Daily reset: 00:00 UTC
// Enforcement: Database check before each generation
```

### Data Security
- API keys NEVER in frontend code
- Passwords hashed by Supabase Auth
- All API calls require authentication token
- HTTPS only (Vercel enforces)
- Environment variables on Vercel (not in code)

### Error Handling
```javascript
// All endpoints return consistent format
{
  success: true/false,
  data: {...}, // On success
  error: "User message", // On error
  code: "ERROR_CODE" // For debugging
}

// HTTP Status Codes:
200 - Success
400 - Bad request
401 - Not authenticated
403 - Not authorized
429 - Rate limited
500 - Server error
```

---

## Dependencies & Packages

### Core Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/auth-helpers-nextjs": "^0.7.0",
    "stripe": "^14.0.0",
    "@stripe/react-js": "^2.0.0",
    "@google/generative-ai": "^0.3.0",
    "openai": "^4.0.0",
    "tailwindcss": "^3.3.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

---

## Testing Strategy

### Unit Tests
- API endpoint handlers
- Utility functions
- Authentication logic
- Rate limiting logic

### Integration Tests
- Sign up → Generate → Save flow
- Free tier limit enforcement
- Premium conversion flow
- Stripe webhook handling

### Manual Testing Checklist
```
Authentication:
☐ Sign up works
☐ Login works
☐ Logout works
☐ Password reset works
☐ Session persistence

Generation:
☐ Free user can generate 10/day
☐ Free user blocked at 10/day
☐ Premium user unlimited
☐ All tools work
☐ Results display correctly

Subscription:
☐ Free tier shows upgrade button
☐ Stripe checkout works
☐ Payment succeeds
☐ Subscription status updates
☐ Premium features unlock
☐ Cancel subscription works

API Security:
☐ API key not in frontend
☐ Cannot bypass auth
☐ Rate limiting works
☐ Database queries safe (no SQL injection)
```

---

## Performance Targets

| Metric | Target | Current | Target |
|---|---|---|---|
| Page load (First Contentful Paint) | <2s | ? | <2s |
| Generation response time | <3s | ? | <3s |
| Database query time | <100ms | ? | <100ms |
| API uptime | >99.9% | ? | >99.9% |

---

## Monitoring & Logging

### What to Monitor
- API response times
- Error rates
- Database query performance
- Stripe webhook success rate
- User authentication success rate
- Generation success rate

### Tools
- Vercel Analytics (built-in)
- Sentry (error tracking)
- LogRocket (optional, user session replay)

### Alerts
- API down for >5 minutes
- Error rate >5%
- Database connection issues
- Stripe webhook failures
- High memory usage

---

## Deployment Checklist

Before deploying to production:

```
Code Quality:
☐ No console.logs in production code
☐ All secrets in env variables
☐ No hardcoded URLs (use env)
☐ All error cases handled
☐ Tests passing (>80% coverage)

Security:
☐ API keys are secrets
☐ CORS configured correctly
☐ Rate limiting active
☐ SQL injection prevention verified
☐ XSS protection enabled

Performance:
☐ Images optimized
☐ Code splitting working
☐ Database indexes created
☐ Caching configured

Operations:
☐ Error tracking active (Sentry)
☐ Monitoring set up
☐ Backups configured
☐ Incident response plan ready
☐ Runbooks documented
```

---

## Known Risks & Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Gemini API quota exceeded | Generation fails | Monitor usage, implement request queuing |
| Database connection failure | Site down | Use connection pooling, auto-retry |
| Stripe webhook missing | Payment not processed | Implement reconciliation job |
| User session hijacking | Account compromise | Use HTTPS, secure cookies, CSRF tokens |
| API rate limit abuse | Service disruption | Implement stricter rate limiting |

---

## Future Scalability Considerations

### When traffic increases:

1. **Database:**
   - Use read replicas for analytics queries
   - Add caching layer (Redis)
   - Archive old usage logs

2. **API:**
   - Switch to background jobs (Bull, Celery)
   - Implement request queuing
   - Use CDN for static assets

3. **AI APIs:**
   - Implement request caching
   - Use cheaper models for simple tasks
   - Batch requests when possible

---

## Documentation Links

- **Code Documentation:** [See code comments in repo]
- **API Documentation:** [To be auto-generated with Swagger]
- **Database Schema:** [See schema file in repo]
- **Deployment Guide:** [See deployment.md]
- **Troubleshooting:** [See troubleshooting.md]

---

## Version Control

| Version | Date | Changes |
|---|---|---|
| 1.0 | July 18, 2026 | Initial technical roadmap |

---

## Contact & Questions

- **Tech Lead:** Gehan (you@email.com)
- **Questions:** Refer to this document or team Slack channel
