# Australian Migration Hub

## What This Is
An intelligent platform that helps people research visa eligibility for Australian migration based on their occupation. Evolved from a simple search tool to a revenue-generating business with comprehensive analytics and qualified lead generation for Registered Migration Agents (RMAs).

## Current Status: Phase 1 & 2 DEPLOYED ✅

**Live URL:** https://migration-tool-git-main-jdolmes-projects.vercel.app

### What's Live Now:
- ✅ **Core Platform** - Comprehensive occupation search and visa eligibility
- ✅ **Analytics System** (Phase 1) - Full behavioral tracking (6 event types)
- ✅ **Lead Generation** (Phase 2) - Qualified leads with instant RMA booking
- 🚧 **RMA Dashboard** (Phase 3) - Ready to build (8-10 hours)

### Revenue Status:
- Infrastructure: **$0/month** (free tier)
- After launch: **$12/month** (Calendly only)
- Revenue potential: **$2,000-10,000/month**
- Profit margin: **99%+**

---

## Tech Stack
- **Frontend:** Next.js 16 (React, TypeScript, Tailwind CSS)
- **Database:** Supabase (PostgreSQL)
- **Analytics:** Custom event tracking (session-based)
- **Deployment:** Vercel (auto-deploy on push)
- **Booking:** Calendly integration
- **Geolocation:** ipapi.co (free tier, session-cached)

---

## Database Schema

### Core Application Tables:
- **occupations** - 3,261 ANZSCO occupations (v1.3, v2022, OSCA)
- **visas** - 13 visa entries (8 subclasses with streams)
- **occupation_lists** - 960 entries (MLTSSL, STSOL, ROL, CSOL)
- **visa_eligibility** - 9,464 pre-calculated eligibility records

### Analytics Tables (Phase 1 - Live):
- **analytics_events** - User behavior tracking
  - 6 event types (search, view, click, engage)
  - Session-based tracking
  - Geographic insights
  - 50+ production events captured

### Lead Generation Tables (Phase 2 - Live):
- **leads** - RMA lead submissions
  - Comprehensive qualification (location, visa, timeline)
  - Intent scoring (1-10 scale)
  - Session linkage to analytics
  - Ready for production leads
  
- **lead_summaries** - Session summaries (Phase 3 feature)

**See:** `docs/DATABASE_SCHEMA.md` for complete schema

---

## Features

### ✅ Core Platform (Live)
1. **Occupation Search**
   - Search by ANZSCO code or job title
   - Real-time results with debouncing (300ms)
   - Alternative titles search (331 occupations)
   - Grouped results by occupation code
   - OSCA filtering (excluded from search)

2. **Visa Eligibility Checking**
   - Comprehensive visa table for each occupation
   - Multi-catalogue support (v1.3 and v2022)
   - Color-coded visa categories (permanent/temporary)
   - List membership indicators (MLTSSL/STSOL/ROL/CSOL)
   - Direct links to legislative instruments (LIN)
   - Info modals for special requirements (482 Specialist, 186 TRT)
   - Config-driven visa logic (easy to maintain)

3. **ANZSCO Details**
   - Alternative job titles (331 occupations)
   - Specialisations (510 occupations)
   - Links to official ABS descriptions
   - v2022 occupation data

4. **Modern UI/UX**
   - Simple, elegant homepage with gradient design
   - Tab navigation (Visa Options default, ANZSCO Details)
   - Professional table layouts
   - Mobile responsive (basic)
   - Clean typography and spacing

---

### ✅ Analytics System (Phase 1 - Live)

**6 Event Types Tracking:**
1. `search_performed` - Search queries and results count
2. `occupation_viewed` - Occupation page views with metadata
3. `tab_switched` - ANZSCO Details engagement
4. `lin_clicked` - Legal research (HIGH intent signal)
5. `info_button_clicked` - Complex visa interest
6. `related_occupation_clicked` - Career pathway exploration

**Features:**
- Session-based tracking (no user accounts)
- Geographic insights (country detection)
- Session-cached geolocation (prevents rate limiting)
- High-intent signal detection
- Zero cost infrastructure
- Production verified (50+ events captured)

**Business Value:**
- Understand user behavior patterns
- Identify high-intent users for lead prioritization
- Geographic demand analysis
- Occupation popularity trends
- Visa interest insights

---

### ✅ Lead Generation (Phase 2 - Live)

**Lead Capture Widget:**
- Always-visible chat bubble (bottom-right)
- Auto-expands after 2 minutes (one-time per session)
- "Friendly helper" approach (not sales-y)
- User-controlled engagement
- Smooth animations

**Lead Qualification Form:**
- Contact: name, email, phone (optional)
- Location: onshore/offshore
- Current visa: Student/Work/Tourist/PR/Other (if onshore)
- Timeline: ASAP / 6-12mo / 1-2yr / researching
- Optional message for unique situations
- Privacy consent checkbox

**Features:**
- Comprehensive lead qualification
- Real-time form validation
- Conditional fields (visa only if onshore)
- Database integration (saves to Supabase)
- Calendly instant booking on success
- Privacy Policy compliance
- Intent score calculation (base: 5 for form submission)
- Session linkage to analytics (full user journey)

**Business Value:**
- Qualified leads ready for RMA follow-up
- Intent scoring for lead prioritization
- Session context (what user researched)
- Instant booking option (reduces friction)
- Expected value: $100-500 per lead

---

### 🚧 RMA Dashboard (Phase 3 - Ready to Build)

**Planned Features:**
1. **Authentication**
   - Login page at `/admin/login`
   - Simple password auth (single shared password for MVP)
   - Session management
   - Protected routes

2. **Lead Inbox**
   - Table view at `/admin/leads`
   - Columns: date, name, email, location, timeline, score, status
   - Filter by status (New/Contacted/Converted)
   - Sort by date, intent score
   - Click row to view details

3. **Lead Detail Page**
   - Full contact information
   - Occupation researched
   - Session analytics summary:
     - Occupations viewed
     - LINs clicked
     - Info buttons clicked
     - Time on site
     - Geographic location
   - Status dropdown (update status)
   - Internal notes field
   - Save changes

**Build Time:** 8-10 hours  
**Cost:** $0 (same infrastructure)  
**Approach:** MVP first, expand based on real RMA feedback

---

## File Structure

### Core Application
```
/app
  /occupation/[code]/page.tsx     # Detail page with analytics + widget
  page.tsx                         # Home page with search
  /privacy-policy/page.tsx         # Privacy policy (NEW)
  
/components
  /search
    SearchBar.tsx                  # Search input
    OccupationCard.tsx             # Search result cards
  /lead-capture                    # NEW - Phase 2
    LeadWidget.tsx                 # Chat bubble widget
    LeadForm.tsx                   # Lead qualification form
    
/hooks
  useOccupationSearch.ts           # Search logic with analytics tracking
  
/lib
  supabase.ts                      # Supabase client
  analytics.ts                     # NEW - Event tracking utility
```

### Documentation
```
/docs
  SESSION_HANDOFF_v5.md                         # Current project status
  Analytics_RMA_Lead_Feature_Report.md          # Full monetization strategy (45 pages)
  Analytics_Implementation_Handoff_COMPLETE.md  # Phase 1 details
  Phase_2_Lead_Generation_COMPLETE.md           # Phase 2 details
  DATABASE_SCHEMA.md                            # Complete database schema
  
PROJECT_README.md                               # This file
CONTEXT.md                                      # Session context
CONVENTIONS.md                                  # Code style guide
TODO.md                                         # Feature backlog
```

---

## Development Commands
```bash
npm run dev          # Start local dev server (http://localhost:3000)
npm run build        # Build for production
git push             # Auto-deploys to Vercel (~30 seconds)
```

---

## Project Evolution

### Phase 0: Foundation (January 2026)
- Basic occupation search
- Visa eligibility table
- Database setup
- Initial deployment

### Phase 1: Analytics (February 14, 2026) ✅
- User behavior tracking (6 event types)
- Session-based analytics
- Geographic insights
- Zero cost infrastructure
- **Result:** 50+ events captured, high-intent signals detected

### Phase 2: Lead Generation (February 15, 2026) ✅
- Lead capture widget
- Qualification form
- Database integration
- Calendly booking
- Privacy compliance
- **Result:** Revenue-ready platform, waiting for RMA partners

### Phase 3: RMA Dashboard (Starting February 16, 2026) 🚧
- RMA login system
- Lead inbox
- Lead detail with analytics
- Status management
- **Timeline:** 8-10 hours to build

### Phase 4: Scale (Month 2-3) 📋
- Multiple RMA support
- Email notifications
- Enhanced intent scoring
- Performance analytics
- **Goal:** 10+ RMA partners, $5k-10k/month

---

## Business Model

### Revenue Streams

**1. RMA Lead Generation** (Primary - READY)
- **Status:** ✅ Built, needs RMA partners
- **Pricing:** $100-500 per qualified lead
- **Volume:** 10-50 leads/month (Month 1), 50-200/month (Month 6)
- **Revenue:** $2,000-10,000/month (conservative)
- **Profit Margin:** 99%+ ($12/month cost vs. $2k+ revenue)

**Lead Quality Indicators:**
- Intent score (1-10 based on behavior)
- Session analytics (occupations viewed, LINs clicked)
- Qualification data (location, visa, timeline)
- High-intent leads: score 7+ (legal research, complex visa interest)

**2. Market Intelligence Reports** (Future)
- Quarterly migration trend reports
- Geographic demand analysis
- Occupation popularity insights
- Pricing: $500-2,000 per report

**3. Subscription Platform** (Future)
- Real-time analytics access
- Custom trend reports
- API access for agencies
- Pricing: $99-299/month

**4. Custom Research** (Future)
- Tailored market analysis
- Partnership opportunities
- Pricing: $1,000-5,000 per project

---

## Cost Structure

### Current (Phase 1 & 2):
- **Supabase:** $0/month (free tier: 500MB database)
- **Vercel:** $0/month (free tier)
- **ipapi.co:** $0/month (free tier: 1,000 requests/day, session-cached)
- **Total:** $0/month

### After Launch:
- **Calendly:** $12/month (Standard plan)
- **Everything else:** $0/month
- **Total:** $12/month

### Upgrade Triggers:
- Supabase Pro ($25/month): At ~100,000 events/month (12-18 months away)
- Resend Pro ($20/month): If email volume exceeds free tier
- **Still 99%+ profit margin**

---

## Privacy & Compliance

### Implemented (Phase 2):
- ✅ Privacy Policy page
- ✅ Consent-based data collection
- ✅ Clear data usage explanation
- ✅ User rights documented
- ✅ GDPR/CCPA compliant approach
- ✅ No selling of personal data
- ✅ Transparent about analytics

### Data Practices:
- Session-based tracking (not user accounts)
- Consent required for lead generation
- Country-level location only (no precise tracking)
- Data retention: Leads stored until RMA processes
- User can request data deletion
- Analytics data anonymized

---

## Pre-Launch Checklist

Before going live with RMA partnerships:

- [ ] **Update Calendly URL** (currently placeholder) - 5 minutes
- [ ] **Add contact email** to privacy policy - 2 minutes
- [ ] **Test on mobile** devices - 30 minutes
- [ ] **Clear test data** from leads table - 2 minutes
- [ ] **Find 1-2 beta RMAs** - 1-2 days
- [ ] **Complete Phase 3** (RMA Dashboard) - 8-10 hours (optional)

**Total time to launch:** 45 minutes (or 9-11 hours with dashboard)

---

## Success Metrics

### User Engagement (Analytics):
- Search volume per day
- Occupation views per session
- Average session duration
- Tab engagement rate (Visa Options vs ANZSCO Details)
- High-intent signals (LIN clicks, info buttons)
- Geographic distribution

### Lead Generation:
- Widget auto-expand rate
- Form open rate
- Form completion rate
- Calendly booking rate
- Average intent score
- Leads per week/month

### Business Performance:
- Lead conversion rate (lead → consultation)
- Revenue per lead
- RMA satisfaction score
- Total monthly revenue
- Customer acquisition cost

---

## Competitive Advantages

1. **Free for Users** - No registration, no fees
2. **Comprehensive Data** - Multi-catalogue support (v1.3, v2022)
3. **Up-to-date** - Easy to update with config-driven logic
4. **Fast** - Optimized search, instant results
5. **Analytics-Powered** - Data-driven insights and lead scoring
6. **Privacy-First** - Transparent, consent-based, no data selling
7. **Direct RMA Connection** - Instant booking, qualified leads
8. **Scalable** - Zero cost infrastructure, 99%+ profit margin

---

## Roadmap

### Immediate (Week 1):
1. Complete pre-launch checklist
2. Find 1-2 beta RMA partners
3. Launch lead generation
4. Monitor first leads

### This Month:
5. Build RMA Dashboard (Phase 3)
6. Gather RMA feedback
7. Iterate based on real usage
8. Scale to 5-10 RMA partners

### Quarter 1 (Feb-Apr 2026):
9. Enhanced intent scoring from session analytics
10. Visa information pages (10-15 pages)
11. Mobile optimization
12. Email notifications for RMAs
13. Target: $5,000-10,000/month revenue

### Quarter 2 (May-Jul 2026):
14. "People Also Researched" feature
15. Visa comparison tool
16. Multi-RMA support and assignment
17. Performance analytics dashboard
18. Target: $10,000-20,000/month revenue

### Year 1 Goals:
- 10-20 RMA partnerships
- 50-200 leads/month
- $5,000-20,000/month revenue
- Market intelligence report launch
- Consider subscription platform

---

## Technical Highlights

### Performance:
- Page load: <2 seconds
- Search response: <500ms
- Build time: ~30 seconds
- Deploy time: ~30 seconds
- Zero downtime deployments

### Scalability:
- Free tier supports 2+ years of growth
- Session-based (no authentication overhead)
- Cached geolocation (prevents rate limiting)
- Pre-calculated eligibility (fast lookups)

### Code Quality:
- TypeScript (type-safe)
- Component-based architecture
- Config-driven visa logic (maintainable)
- Comprehensive documentation
- Clear conventions

---

## Resources

### Documentation
- **Technical:** `DATABASE_SCHEMA.md`, `CONVENTIONS.md`, `CONTEXT.md`
- **Business:** `docs/Analytics_RMA_Lead_Feature_Report.md` (45 pages)
- **Project Status:** `docs/SESSION_HANDOFF_v5.md`
- **Roadmap:** `TODO.md`
- **Phase Details:** `docs/Analytics_Implementation_Handoff_COMPLETE.md`, `docs/Phase_2_Lead_Generation_COMPLETE.md`

### External Links
- **Live Site:** https://migration-tool-git-main-jdolmes-projects.vercel.app
- **Vercel Dashboard:** https://vercel.com/jdolmes-projects/migration-tool
- **Supabase Dashboard:** https://supabase.com/dashboard/project/eulnvbopvqilqyvyiqux
- **GitHub Repo:** https://github.com/jdolmes/migration-tool
- **ABS ANZSCO:** https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022

---

## Contact & Support
- **GitHub Issues** for bugs and feature requests
- **Documentation** in `/docs` folder
- **Project maintained by:** Frank
- **Current Status:** Production-ready, Phase 1 & 2 deployed, Phase 3 ready to build

---

**Last Updated:** February 15, 2026  
**Version:** 3.0 (Phase 1 & 2 Complete Edition)  
**Status:** Revenue-ready platform, analytics collecting production data, lead generation live  
**Next:** Phase 3 RMA Dashboard → Launch with RMA partners → Scale to $5k-10k/month
