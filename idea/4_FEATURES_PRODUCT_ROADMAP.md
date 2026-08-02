# SocialToolkit Features & Product Roadmap

**Status:** Development Phase  
**Last Updated:** July 18, 2026  
**Product Manager:** Gehan

---

## Core Features Overview

### Tier Breakdown

```
FREE           PREMIUM              PRO
────────────────────────────────────────────────────────────
Hashtags ✓     + Unlimited ✓        + API ✓
Captions ✓     + No ads ✓           + White-label ✓
Bios ✓         + Save ✓             + Team (3) ✓
Ideas ✓        + Export ✓           + Competitor analysis ✓
               + Variations ✓       + Trending insights ✓
               + Analytics ✓        + Advanced analytics ✓
               + Calendar ✓         + Approval workflow ✓
               + Support ✓          + Brand voice ✓
```

---

## Launch Features (MVP - Week 1-6)

### 1. Hashtag Generator ✓ (Already working)
**Tier:** FREE

**What it does:**
- User enters topic + platform
- AI generates 20 hashtags
- One click copy all
- Mobile optimized

**Details:**
```
Input: "vegan pasta recipe"
Platform: Instagram
Output: #veganpasta #recipeidea #plantbased ...

Implementation:
├─ Frontend: Input form + output display
├─ Backend: /api/generate/hashtags
├─ AI: Gemini API call
├─ Rate limiting: 10/day for free
```

**No changes needed** - already working great.

---

### 2. Caption Writer ✓ (Already working)
**Tier:** FREE

**What it does:**
- User describes photo/content
- Selects tone (funny, professional, inspirational)
- Selects platform (Instagram, TikTok, etc)
- AI generates caption with emojis

**Details:**
```
Input: "sunset beach family photo"
Tone: Inspirational
Platform: Instagram
Output: "Golden hour with my favorites... 🌅💕"
```

**No changes needed** - already working.

---

### 3. Bio Maker ✓ (Already working)
**Tier:** FREE

**What it does:**
- User enters name, niche, location, about
- Selects vibe (fun, professional, minimal)
- AI generates bio (under 150 chars)
- Includes emojis and line breaks

**Details:**
```
Input: 
  Name: Sarah
  Niche: Travel photographer
  Location: Barcelona
  Vibe: Fun & playful
Output: "wanderlust 📸 | capturing moments | ✉️ collabs"
```

**No changes needed** - already working.

---

### 4. Video Ideas Generator ✓ (Already working)
**Tier:** FREE

**What it does:**
- User enters niche + audience
- Platform (YouTube, TikTok, etc)
- AI generates 10 video ideas
- Includes title + description

**Details:**
```
Input:
  Niche: "Budget travel Europe"
  Audience: "College students"
  Platform: TikTok
Output:
  1. "Cheapest coffee in Paris for $1"
     Show yourself ordering at street cafe...
  2. "5-hour train vs flight to Rome"
     Do cost comparison...
```

**No changes needed** - already working.

---

## MVP Premium Features (Launch)

### 5. Save/Favorites System (NEW)
**Tier:** PREMIUM

**What it does:**
- Premium users can save their favorite outputs
- Access "Saved" section to view history
- Delete unwanted saves
- 3-month retention (auto-delete after)

**Database:**
```sql
saved_outputs table:
├─ id (primary key)
├─ user_id (link to user)
├─ content (the caption/hashtag)
├─ tool_type (hashtag|caption|bio|ideas)
├─ created_at
└─ is_favorite (boolean)
```

**UI:**
```
After generation:
[❤️ Save] button
If saved: "✓ Saved to favorites"

Settings → Saved outputs:
├─ Show all saved
├─ Filter by type (hashtags, captions, etc)
├─ Delete individual saves
└─ See save date
```

**Effort:** 8 hours
**Complexity:** Medium
**Launch:** Week 4

---

### 6. Export Features (NEW)
**Tier:** PREMIUM

**What it does:**
- Export generated content as PDF or CSV
- PDF includes branding (header/footer)
- CSV great for bulk importing
- One-click download

**Formats:**
```
PDF Export:
├─ Header: "Captions - July 2026"
├─ Date generated
├─ Content formatted nicely
└─ Footer: "Created with SocialToolkit"

CSV Export:
├─ Column 1: Content
├─ Column 2: Date
├─ Column 3: Tool type
└─ Can import to spreadsheet
```

**UI:**
```
After generation:
[📥 Download PDF] [📥 Download CSV]
```

**Effort:** 6 hours
**Complexity:** Medium (use jsPDF library)
**Launch:** Week 4

---

### 7. Variations Generator (NEW)
**Tier:** PREMIUM

**What it does:**
- Generate 5 different versions of same output
- Great for A/B testing
- Keeps same tone/platform but varies wording
- One click to see all variations

**Example:**
```
Original caption: "Sunset at the beach"

Variations:
1. "Golden hour at my favorite beach 🌅"
2. "Chasing sunsets 🌊✨"
3. "Beach sunsets hit different 🏖️"
4. "When the sky painted itself... 🎨"
5. "Nothing beats a beach sunset 🌅💛"
```

**UI:**
```
After generation:
[Generate 5 Variations] button
Shows all 5 with copy buttons
```

**Effort:** 4 hours
**Complexity:** Easy (just call API 5x)
**Launch:** Week 4

---

### 8. Tone/Voice Customization (NEW)
**Tier:** PREMIUM

**What it does:**
- Premium users get more tone options
- Custom voice instructions
- Save favorite tone as default
- Examples of each tone

**Tones Available:**
```
FREE:
├─ Professional
├─ Casual
└─ Inspirational

PREMIUM (additional):
├─ Funny/Witty
├─ Formal/Academic
├─ Sarcastic
├─ Motivational
├─ Storytelling
└─ Custom (describe your voice)
```

**Example:**
```
Input: Hashtag about fitness
FREE tone options: 3
PREMIUM tone options: 9
```

**Effort:** 3 hours
**Complexity:** Easy (UI + backend mapping)
**Launch:** Week 4

---

### 9. Simple Analytics Dashboard (NEW)
**Tier:** PREMIUM

**What it does:**
- Show most-used tool (hashtag vs caption vs bio vs ideas)
- Show total generations this month
- Show which saved outputs are favorites
- Simple charts/stats

**Metrics:**
```
Dashboard shows:
├─ Total generations: 243
├─ This month: 45
├─ Most used tool: Caption Writer (60%)
├─ Saved outputs: 12
├─ Favorites: 5
└─ Last used: 2 hours ago
```

**Data:**
```
Pull from:
├─ api_usage_logs table
├─ daily_usage table
└─ saved_outputs table
```

**Effort:** 8 hours
**Complexity:** Medium (charts + database queries)
**Launch:** Week 5

---

### 10. Content Calendar (NEW)
**Tier:** PREMIUM

**What it does:**
- View next 30 days
- Manually plan when to post
- See which days you plan to post
- Visual calendar view

**UI:**
```
Calendar view (30 days):
├─ Click date to add planned post
├─ See count of posts per day
├─ Export calendar
└─ Share with team (Pro only)
```

**Effort:** 6 hours
**Complexity:** Medium (calendar component)
**Launch:** Week 5

---

### 11. Quick Templates (NEW)
**Tier:** PREMIUM

**What it does:**
- Save 3 custom prompts as templates
- "Coffee shop caption template" → reuse later
- One click to apply template
- Edit template before generating

**Example:**
```
Premium users can save:
1. "Tech review video ideas template"
2. "Coffee shop caption template"
3. "Fitness motivation hashtags"

Later:
Click template → auto-fills input → modify → generate
```

**Effort:** 4 hours
**Complexity:** Easy
**Launch:** Week 5

---

## Phase 2 Features (Month 2-3)

### 12. Better AI Model Access (Month 2)
**Tier:** PREMIUM

**What it does:**
- Premium gets GPT-3.5 Turbo (more advanced)
- Free stays on Gemini (fast, cheap)
- Pro gets GPT-4 (best quality)
- Transparent which model used

**Quality tiers:**
```
FREE:   Gemini Flash   (fast, good)
PREMIUM: GPT-3.5 Turbo (better quality)
PRO:     GPT-4        (best quality)
```

**Effort:** 4 hours (mostly backend routing)
**Complexity:** Easy (select model in API call)
**Launch:** Month 2, Week 1

---

### 13. Team Workspace (Month 2)
**Tier:** PRO

**What it does:**
- Invite up to 3 team members
- See what others generated
- Comment on drafts
- Approve before final use

**Team features:**
```
├─ Add members (email invite)
├─ Assign roles (owner, editor, viewer)
├─ See activity feed (who generated what)
├─ Comment on items
├─ Mark as "approved"
└─ Team dashboard
```

**Database:**
```sql
team_members table:
├─ id
├─ account_id
├─ user_id
├─ role (owner|editor|viewer)
└─ joined_at

team_activity table:
├─ id
├─ team_id
├─ action (generated|saved|deleted)
└─ timestamp
```

**Effort:** 20 hours
**Complexity:** Hard (new architecture)
**Launch:** Month 2, Week 2

---

### 14. Competitor Analysis (Month 3)
**Tier:** PRO

**What it does:**
- "Analyze @competitor_account"
- Shows their top captions/hashtags
- Identify their strategy
- Get inspired without copying

**How it works:**
```
User enters: @competitorhandle
AI fetches (via Instagram API or manual input)
Shows:
├─ Their most-liked captions
├─ Hashtags they use most
├─ Posting frequency
├─ Engagement patterns
└─ Recommendations for you
```

**Note:** Requires Instagram API access (complex)
**Alternative:** User manually enters competitor's top captions
**Effort:** 16 hours (if manual) / 40 hours (if API)
**Complexity:** Hard
**Launch:** Month 3, Week 2

---

### 15. Advanced Analytics Dashboard (Month 3)
**Tier:** PRO

**What it does:**
- Detailed usage reports
- Best-performing content types
- Predictions ("This caption will get ~200 likes")
- Export analytics as report

**Metrics:**
```
├─ Generations by type (pie chart)
├─ Daily usage trend
├─ Most-used tones
├─ Conversion rate (free→premium trend)
├─ API usage (for Pro with API)
└─ Export to PDF report
```

**Effort:** 12 hours
**Complexity:** Hard (data visualization)
**Launch:** Month 3, Week 3

---

## Future Features (Post-Launch - Backlog)

### Not for MVP Launch (These can wait)

1. **Scheduling Integration**
   - Auto-post to Instagram/TikTok
   - Require Later/Buffer integration
   - Complex (needs 3rd-party auth)

2. **White-Label/Branded Exports**
   - Add customer's logo to exports
   - For agencies/resellers
   - Medium effort

3. **API Access**
   - For developers
   - Build custom tools on top
   - Requires documentation + support
   - Hard effort

4. **Video Preview**
   - See how caption looks on post
   - Preview hashtags on post
   - Medium effort

5. **Multi-language Support**
   - Generate in 20+ languages
   - Already supported by AI
   - Just add language selector
   - Easy effort

6. **Trending Topics**
   - What's trending in niche
   - Real-time trends
   - Requires data source
   - Medium effort

7. **Brand Voice Builder**
   - Teach AI your speaking style
   - Upload 10 sample captions
   - AI learns your voice
   - Hard effort

---

## Feature Dependency Chart

```
Week 1-3: Foundation
├─ Migrate to Next.js
├─ Set up Supabase
└─ Move API key to backend

Week 4: Core Premium Features
├─ Save/Favorites (depends on: auth)
├─ Export PDF/CSV (depends on: auth)
├─ Variations (depends on: backend AI)
└─ Tone customization (depends on: backend)

Week 5: Advanced Premium Features
├─ Analytics (depends on: API logging)
├─ Content calendar (depends on: auth)
└─ Templates (depends on: database)

Week 6-7: Testing & Deployment
└─ All features integrated & tested

Month 2+: Pro Features
├─ Team workspace (depends on: core working)
├─ Advanced analytics (depends on: data collection)
└─ Competitor analysis (depends on: API/crawling)
```

---

## Feature Implementation Checklist

### Hashtag Generator
- [x] Frontend UI
- [x] Backend endpoint
- [x] AI integration
- [x] Rate limiting
- [x] Error handling
- [x] Mobile responsive

### Caption Writer
- [x] Frontend UI
- [x] Backend endpoint
- [x] Tone selection
- [x] Platform-specific
- [x] Emoji support

### Save/Favorites (PRIORITY)
- [ ] Database schema
- [ ] Backend endpoint (/api/user/saved)
- [ ] Frontend save button
- [ ] Saved page UI
- [ ] Delete functionality
- [ ] 3-month expiration logic

### Export Features (PRIORITY)
- [ ] PDF export library
- [ ] CSV export logic
- [ ] Export button UI
- [ ] Handle multiple formats

### Analytics (PRIORITY)
- [ ] Data collection in logs
- [ ] API endpoint for stats
- [ ] Frontend dashboard UI
- [ ] Charts (use Chart.js)
- [ ] Export report

---

## User Feedback Loop

### How to Gather Feedback

1. **In-app surveys** (month 2)
   - "What feature should we build next?"
   - "Rate your experience"
   - Quick 2-question form

2. **Email surveys** (monthly)
   - Send to premium users
   - "What's missing?"
   - Collect feature requests

3. **Support emails** (ongoing)
   - Watch for feature requests
   - Note common asks

4. **Product Hunt comments**
   - Launch feedback
   - Direct user input

### Feature Priority Decision

When deciding next feature, evaluate:

```
Priority Score = (Demand × Impact × Effort)

Where:
- Demand: % users asking for it (0-10)
- Impact: Revenue/retention impact (0-10)
- Effort: Dev time in hours (0-40)

Example:
Analytics: (8 × 7 / 12) = 4.7 (HIGH)
Scheduling: (6 × 8 / 40) = 1.2 (LOW)
Team workspace: (4 × 8 / 20) = 1.6 (LOW-MEDIUM)
```

---

## Competitive Feature Analysis

### What Competitors Have That We Don't (Yet)

| Competitor | Feature | When We'll Add |
|---|---|---|
| Buffer | Scheduling | Q4 2026 |
| Later | IG-native insights | Q3 2026 |
| Hootsuite | Team collaboration | Sept 2026 (Pro) |
| Canva | Design tools | 2027+ |

### What We Have That They Don't

- ✅ AI caption writer (free)
- ✅ Hashtag generator (free)
- ✅ Bio maker (free)
- ✅ Video ideas (free)
- ✅ Combined in one tool
- ✅ $9/month price
- ✅ No ads on premium

---

## Success Metrics for Features

After each feature launches, track:

```
1. Adoption
   ├─ % of Premium users who try feature
   ├─ % who use feature regularly
   └─ Target: >50% try within 2 weeks

2. Satisfaction
   ├─ NPS for feature (0-10 scale)
   ├─ Support tickets about feature
   └─ Target: >7 NPS

3. Retention
   ├─ Do users stay longer after feature launch?
   ├─ Does churn decrease?
   └─ Target: <5% monthly churn

4. Revenue Impact
   ├─ Does feature increase conversion?
   ├─ Does it increase LTV?
   └─ Target: 5-10% improvement per feature
```

---

## Feature Roadmap Timeline (Visual)

```
JULY          AUGUST          SEPTEMBER       OCTOBER
Week 1-2      Week 1-6        Month 2         Month 3
Setup         MVP Launch      Phase 2         Phase 3

              ├─ 4 tools ✓    ├─ Analytics    ├─ API
              ├─ Auth ✓       ├─ Team (Pro)   ├─ White-label
              ├─ Payments ✓   ├─ Better AI    └─ Advanced features
              ├─ Pricing ✓    └─ Scheduling
              └─ Landing
```

---

## Document Version Control

| Version | Date | Changes |
|---|---|---|
| 1.0 | July 18, 2026 | Initial feature roadmap |
| 1.1 | (TBD) | After user feedback |

---

## Appendix: Feature Request Template

When users request features, collect:

```
1. Feature name: _________________
2. Problem it solves: _________________
3. Who needs it: _________________
4. How important (1-10): _________________
5. Would you pay extra for it? Y/N
6. Alternative solutions you use: _________________
```

This helps prioritize development.
