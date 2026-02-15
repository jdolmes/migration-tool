# Current State & TODO

## ✅ Completed Features

### Core Functionality
- [x] Search occupations by code or name
- [x] Real-time search with debouncing (300ms)
- [x] Group same occupation codes (show single result with multiple catalogue badges)
- [x] Filter out OSCA occupations from search
- [x] Occupation detail page with full visa eligibility
- [x] Display all visas (v1.3 + v2022) in single table
- [x] **Config-driven visa list logic** (Feb 12, 2026)
- [x] **Info buttons for special requirements** (Feb 12, 2026)

### UI/UX
- [x] Professional table layout (Anzscosearch-inspired)
- [x] Color-coded visa categories (green=permanent, gray=temporary)
- [x] List membership indicators (✓/✗/—) for MLTSSL, STSOL, ROL, CSOL
- [x] Direct LIN links to legislation.gov.au
- [x] Info button modals for special visa requirements (482 Specialist, 186 TRT)
- [x] Clean legend explaining all symbols
- [x] Visa ordering matches Anzscosearch (189, 190, 491, 485, 482, 186, etc.)
- [x] Stream name formatting (Core Skills, TRT, Direct Entry)
- [x] **Modern design system v1.3-1.4** (Feb 11, 2026)
  - [x] Simple, elegant homepage with gradient text
  - [x] Tab navigation (Visa Options default)
  - [x] Vibrant gradients and modern color palette
  - [x] Better spacing, typography, and visual hierarchy
- [x] **ANZSCO Details section** ✨ (Feb 6, 2026)
  - [x] Alternative titles display
  - [x] Specialisations display
  - [x] Link to ABS website for full descriptions

### Technical
- [x] Next.js 16.1.6 with TypeScript
- [x] Supabase database integration
- [x] Deployed to Vercel (live and accessible)
- [x] Auto-deployment on git push
- [x] Environment variables configured
- [x] TypeScript strict mode enabled
- [x] **Config-driven VISA_LIST_RULES** for maintainability (Feb 12, 2026)

### Analytics & Tracking ✨ (Feb 14, 2026 - DEPLOYED)
- [x] **Phase 1 Analytics - COMPLETE & LIVE** 🎉
  - [x] Database tables: `analytics_events`, `leads`, `lead_summaries`
  - [x] Event tracking utility (`lib/analytics.ts`)
  - [x] Session ID generation and tracking
  - [x] User geolocation with session-based caching
  - [x] **Search tracking** (`search_performed`)
  - [x] **Occupation view tracking** (`occupation_viewed`)
  - [x] **Tab switch tracking** (`tab_switched`)
  - [x] **LIN click tracking** (`lin_clicked`) ⭐ High intent signal
  - [x] **Info button tracking** (`info_button_clicked`) ⭐ Complex visa interest
  - [x] **Related occupation tracking** (`related_occupation_clicked`)
  - [x] Production deployment verified (25+ events captured)
  - [x] Zero cost infrastructure ($0/month)

**Status:** ✅ ALL 6 EVENT TYPES LIVE IN PRODUCTION

### Data
- [x] 3,261 occupations imported (v1.3, v2022, OSCA)
- [x] **665 occupations with ANZSCO details** ✨ (Feb 6, 2026)
  - [x] 331 with alternative titles
  - [x] 510 with specialisations
- [x] 960 occupation list entries
- [x] 8 visa subclasses with 13 total entries (including streams)
- [x] 9,464 visa eligibility calculations

---

## 🚧 In Progress

**Nothing currently in progress** - Ready to start new features!

---

## 📋 Backlog (Prioritized)

### 🔥 HIGHEST PRIORITY - Phase 2: RMA Lead Generation

**Status:** Ready to build (database & analytics foundation complete)  
**Estimated Time:** 12-15 hours  
**Monthly Cost:** $12 (Calendly)  
**Revenue Potential:** $2,000-10,000/month  
**Profit Margin:** 99%+

**Full Details:** See `docs/Phase_2_Implementation_Plan.md` and `docs/Analytics_RMA_Lead_Feature_Report.md`

#### Core Features to Build:

**1. Lead Capture Widget** (4-5 hours)
- [ ] Option A: "Friendly Helper" bottom-right nudge
- [ ] Context-aware messaging based on user behavior
- [ ] Dismissible with "maybe later" option
- [ ] Triggers on high-intent signals:
  - [ ] LIN clicks (legal research)
  - [ ] Info button clicks (complex visas)
  - [ ] Multiple occupation views
  - [ ] Extended session time (10+ minutes)

**2. Lead Capture Form** (2-3 hours)
- [ ] Minimal fields (name, email, phone, country)
- [ ] Optional: Preferred contact method
- [ ] Privacy consent checkbox
- [ ] Calendly booking integration
- [ ] Mobile-friendly design

**3. Lead Dashboard** (3-4 hours)
- [ ] RMA login (simple password auth with bcrypt)
- [ ] View all leads with intent scores
- [ ] Session summaries:
  - [ ] Occupations viewed
  - [ ] Visas researched  
  - [ ] High-intent signals (LIN clicks, etc.)
  - [ ] Recommended approach
- [ ] Filter by status (new, contacted, converted)
- [ ] Export to CSV

**4. Session Summary Generation** (2-3 hours)
- [ ] Automatic summary when lead submits
- [ ] Query analytics_events by session_id
- [ ] Calculate intent score (1-10):
  - [ ] LIN clicks: +4 points
  - [ ] Info clicks: +2 points
  - [ ] Multiple occupations: +2 points
  - [ ] 10+ min session: +3 points
- [ ] Generate recommended approach for RMA
- [ ] Highlight high-intent behaviors

**5. Email Notifications** (1-2 hours) - OPTIONAL
- [ ] Set up Resend.com (free tier: 3,000 emails/month)
- [ ] Email template for new leads
- [ ] Include session summary
- [ ] Link to lead dashboard

**6. Privacy Policy Page** (1-2 hours)
- [ ] GDPR/CCPA compliant
- [ ] Clear data usage explanation
- [ ] Opt-out instructions
- [ ] Contact for privacy inquiries

---

### 💡 ALTERNATIVE PATH: Visa Detail Pages First

**Rationale:** Build content while collecting more analytics data  
**Timeline:** 8-12 hours (10-15 pages)  
**Then:** Proceed to Phase 2 with richer insights

**Benefits:**
- ✅ More valuable content for users
- ✅ SEO opportunity (rank for "482 visa", "189 visa", etc.)
- ✅ More tracking points (visa page views)
- ✅ Let analytics run 1-2 weeks before Phase 2

**Tasks:**
- [ ] **Create Visa Page Template** (2 hours)
  - [ ] Clean, informative layout
  - [ ] Reusable component structure
  
- [ ] **Build Individual Pages** (30-45 min each):
  - [ ] `/visa/189` - Skilled Independent
  - [ ] `/visa/190` - Skilled Nominated  
  - [ ] `/visa/491` - Skilled Work Regional
  - [ ] `/visa/494` - Skilled Employer Sponsored Regional
  - [ ] `/visa/482` - TSS / SID
  - [ ] `/visa/186` - Employer Nomination
  - [ ] `/visa/485` - Temporary Graduate
  - [ ] Plus 5-10 more visa types

- [ ] **Content Per Page:**
  - [ ] Overview and purpose
  - [ ] Key requirements
  - [ ] Processing times
  - [ ] Costs and fees
  - [ ] Pathway to permanent residence
  - [ ] Top 10 eligible occupations (from database)
  - [ ] Links to LIN and Home Affairs

- [ ] **Add Tracking** (15 min per page):
  - [ ] `visa_page_viewed` event
  - [ ] Scroll depth tracking
  - [ ] CTA clicks

---

### 📊 DECISION POINT: What to Build Next?

**Option A: Phase 2 Lead Generation NOW** (12-15 hours)
- ✅ Start generating revenue immediately
- ✅ Test RMA partnership model
- ✅ Validate lead quality with real data
- ⚠️ Need to find 1-2 beta RMA partners first

**Option B: Let Analytics Run 1 Week, Then Phase 2**
- ✅ Collect more behavioral data (50-100+ events)
- ✅ Validate intent scoring accuracy
- ✅ Build with real user insights
- ✅ Identify top occupations for visa pages
- ⏳ Delays revenue by 1 week

**Option C: Visa Pages First, Then Phase 2** (20-27 hours total)
- ✅ More valuable content
- ✅ SEO benefits
- ✅ Additional tracking data
- ✅ Better insights for Phase 2
- ⏳ Delays revenue by 2-3 weeks

**Current Recommendation:** **Option B** - Let analytics run 1 week, analyze data, then build Phase 2 with insights

---

### High Priority (After Phase 2 or Visa Pages)

#### 1. Mobile Optimization (4-6 hours)
- [ ] Mobile-friendly visa table
  - [ ] Card layout for <768px screens
  - [ ] Collapsible sections
  - [ ] Touch-friendly buttons
- [ ] Test on iPhone/Android
- [ ] Fix legend spacing on mobile

**Current Status:** Desktop perfect, mobile needs work  
**Impact:** 30-40% of traffic is mobile

#### 2. ANZSCO Details Enhancement (8-12 hours)
- [x] Alternative titles ✅
- [x] Specialisations ✅
- [ ] Occupation descriptions (manual for top 50 based on analytics)
- [ ] Tasks and duties (manual for top 50 based on analytics)
- [ ] v1.3 vs v2022 comparison view (low priority)

**Strategy:** Use analytics to identify top 50 most-viewed occupations, add descriptions for those first

#### 3. Autocomplete Dropdown (1-2 hours)
- [ ] Show suggestions as user types
- [ ] Include alternative titles in search
- [ ] Keyboard navigation support
- [ ] Limit to 5-10 suggestions

**Impact:** Major UX improvement

#### 4. Last Updated Date (30 minutes)
- [ ] Display in header: "Last Updated: [date]"
- [ ] Pull from database or config

**Impact:** Trust and transparency

---

### Medium Priority (Future)

#### 5. Analytics-Powered Features
*Require 1-2 weeks of data collection first*

- [ ] **"People Also Researched"** (4-6 hours)
  - [ ] Query analytics for common occupation pairs
  - [ ] Display on occupation detail page
  - [ ] Geographic variants ("Users from India also viewed...")

- [ ] **Similar Occupations** (6-8 hours)
  - [ ] Show alternatives with same visa eligibility
  - [ ] "Want easier pathway?" suggestions

- [ ] **Visa Comparison Tool** (1-2 days)
  - [ ] Side-by-side comparison
  - [ ] Recommend best option

#### 6. Standard Features

- [ ] **Search by Alternative Titles** (1 hour)
  - [ ] Update search query
  - [ ] Show indicator when found via alt title

- [ ] **Assessing Authority Display** (1 hour)
  - [ ] Show TRA, ACS, VETASSESS, etc.
  - [ ] Link to authority website

- [ ] **State/Territory Tab** (4-6 hours)
  - [ ] Import state nomination data
  - [ ] Display state-specific requirements

- [ ] **Catalogue Filter Buttons** (1-2 hours)
  - [ ] [v1.2/v1.3/v2022] [v2022] [OSCA]
  - [ ] Match Anzscosearch UX

---

### Lower Priority (Future)

- [ ] Points Calculator (6-8 hours)
- [ ] Export to PDF (4-6 hours)
- [ ] User Accounts (10+ hours) - Optional
- [ ] Advanced Search Filters (2-3 hours)
- [ ] Occupation Comparison (4-6 hours)
- [ ] Career Progression Paths (2-3 days)

---

## 🐛 Known Issues

### Minor Issues
- [ ] Search bar doesn't auto-focus on page load
- [ ] No "Loading" state when switching between occupation versions
- [ ] Legend takes up too much space on mobile

### Technical Debt
- [ ] Duplicate code in CheckIcon, XIcon, DashIcon components
- [ ] src/lib/supabase.ts is duplicate of lib/supabase.ts
- [ ] Hard-coded LIN URLs (should come from database)
- [ ] ANZSCO Details section could be extracted into component

---

## 📊 Metrics to Track

### Analytics Metrics (Currently Tracking ✅)
- [x] Search queries and results
- [x] Occupation views by code and country
- [x] Visa interest (LIN clicks, info buttons)
- [x] Tab engagement
- [x] Career exploration (related occupations)
- [x] Session duration and journeys
- [x] Geographic distribution

### Lead Generation Metrics (Phase 2)
- [ ] Lead form submissions per week/month
- [ ] Consent opt-in rate (target: 70-80%)
- [ ] Average intent score (target: 7+/10)
- [ ] RMA conversion rate (target: 40-60%)
- [ ] Revenue per lead (target: $100-500)
- [ ] Total monthly revenue

### Performance Metrics
- [ ] Page load time (<2 seconds)
- [ ] Search response time (<500ms)
- [ ] Analytics event reliability
- [ ] Mobile usability score

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [x] Test locally
- [x] TypeScript build succeeds
- [x] All features tested
- [x] Analytics tracking verified ✅
- [x] Environment variables configured

### Post-Deployment
- [x] Live site verified ✅
- [x] Search working ✅
- [x] Detail pages working ✅
- [x] Analytics collecting data ✅
- [ ] Test on mobile (needs optimization)
- [ ] Share with test users

---

## 💡 Feature Ideas (Brainstorm)

### User Experience
- AI chatbot for occupation recommendation
- Email alerts for occupation list changes
- Interactive visa pathway diagrams
- Success rate statistics by occupation
- Skills assessment cost estimator

### Business Features (Analytics-Powered)
- Market intelligence reports (quarterly trends)
- Subscription platform ($99-299/month for RMAs/recruiters)
- Custom research services ($1k-5k per project)
- API access for partners
- Whitelabel solution for agencies

### Community
- User success stories
- Migration journey timelines
- RMA directory/marketplace
- Blog with migration tips

---

## 📝 Notes

- **Design inspiration:** Anzscosearch
- **Target users:** People researching Australian migration
- **Competitive advantage:** Free, comprehensive, up-to-date, analytics-powered
- **Data update frequency:** Quarterly
- **Analytics:** Phase 1 complete and collecting production data (Feb 14, 2026)

---

## 🎯 Next Session Goals

**Immediate (This Week):**
1. ✅ Phase 1 Analytics deployed
2. Monitor analytics for 3-7 days
3. Analyze high-intent user patterns
4. Review Phase 2 Implementation Plan
5. Decide: Phase 2 now OR visa pages first

**This Month:**
6. Complete Phase 2 OR visa detail pages
7. Find 1-2 beta RMA partners (if Phase 2)
8. Mobile optimization
9. Add top 50 occupation descriptions

**Next 3 Months:**
10. Scale RMA partnerships (if Phase 2 successful)
11. Advanced analytics features
12. Build remaining high-priority features
13. First revenue milestone: $2,000+/month

---

## 💰 Revenue Projections (Phase 2)

**Launch (Month 1-3):**
- 10-50 leads/month × $100-200 = $1,000-10,000/month
- Cost: $12/month
- Net: $988-9,988/month

**Year 1:**
- 50-200 leads/month × $100-500 = $5,000-100,000/month
- Cost: $12-50/month
- Annual Net: ~$60,000-1,200,000

**Conservative Estimate (Year 1):**
- 50 leads/month × $200 = $10,000/month
- Annual: $120,000
- Cost: $144/year
- **Net Profit: ~$119,856/year**

**Profit Margin:** 99%+ 🚀

---

## 📅 Project Timeline

**Completed:**
- Jan 2026: Basic occupation search tool
- Feb 6: ANZSCO details (alt titles, specialisations)
- Feb 11-12: Modern UI, config-driven visa logic
- Feb 14: **Phase 1 Analytics deployed** ← YOU ARE HERE

**Next:**
- Feb 15-21: Analytics data collection OR visa pages
- Feb 22-28: Phase 2 implementation (12-15 hours)
- Mar 2026: Beta launch with RMAs, first revenue

**Future:**
- Q2 2026: Scale to 10+ RMA partners
- Q3 2026: Advanced features, mobile optimization  
- Q4 2026: $5,000-10,000/month revenue target

---

**Last Updated:** February 14, 2026 (Evening)  
**Phase 1 Analytics:** ✅ COMPLETE & DEPLOYED  
**Next Milestone:** Phase 2 Lead Generation OR Visa Detail Pages  
**Status:** Production-ready analytics platform, monetization foundation established
