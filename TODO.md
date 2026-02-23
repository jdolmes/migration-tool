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
- [x] Color-coded visa categories (green=permanent, yellow=temporary)
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
- [x] **ANZSCO Details section** ✨ (Added Feb 6, 2026)
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

### Data
- [x] 3,261 occupations imported (v1.3, v2022, OSCA)
- [x] **665 occupations with ANZSCO details** ✨ (Added Feb 6, 2026)
  - [x] 331 with alternative titles
  - [x] 510 with specialisations
- [x] 960 occupation list entries
- [x] 8 visa subclasses with 13 total entries (including streams)
- [x] 9,464 visa eligibility calculations

---

## 🚧 In Progress

### Mobile Responsiveness
- [ ] **Mobile-friendly visa table** (Deferred - Feb 12, 2026)
  - Status: Desktop works perfectly, mobile needs card layout
  - Priority: Medium (add after analytics system)
  - Options: Card layout, accordion, or simplified table

---

## 📋 Backlog (Prioritized)

### 🔥 HIGHEST PRIORITY - Analytics & Monetization (NEW - Feb 12, 2026)

**Full Feature Report:** See `docs/Analytics_RMA_Lead_Feature_Report.md`

#### Phase 1: Core Analytics & Lead System (Weeks 1-2)
**Revenue Potential:** $2,000-10,000/month | **Cost:** $0/month

- [ ] **Basic Analytics Setup** (8-10 hours)
  - [ ] Verify Vercel Analytics access (already tracking!)
  - [ ] Create `analytics_events` table in Supabase
  - [ ] Track key events:
    - [ ] `search_performed` - What users search for
    - [ ] `occupation_viewed` - Which occupations interest them
    - [ ] `lin_clicked` - Serious research intent
    - [ ] `info_button_clicked` - Confusion points
    - [ ] `tab_switched` - Engagement patterns
    - [ ] `related_occupation_clicked` - Career exploration
  - [ ] Test event collection

- [ ] **RMA Lead Generation Form** (12-15 hours)
  - [ ] Design lead capture form with consent checkbox
  - [ ] Create `leads` and `lead_summaries` tables
  - [ ] Build session summary generation
  - [ ] Implement intent scoring algorithm (1-10 scale)
  - [ ] Set up email service (Resend.com or SendGrid free tier)
  - [ ] Create RMA email template with research summary
  - [ ] Test end-to-end flow

- [ ] **Privacy Compliance** (4-6 hours)
  - [ ] Write privacy policy (GDPR/CCPA compliant)
  - [ ] Create terms of service
  - [ ] Add privacy policy page to site
  - [ ] Implement data deletion request handling
  - [ ] Add privacy links to footer
  - [ ] **Decision:** Use consent-based approach (recommended)

- [ ] **Basic Analytics Dashboard** (8-12 hours)
  - [ ] Build admin page `/admin/analytics`
  - [ ] Top occupations report
  - [ ] Geographic breakdown
  - [ ] Intent score analytics
  - [ ] Lead pipeline tracking
  - [ ] Data export functionality

**Expected Outcome:**
- Generate 50-200 qualified leads/month
- Revenue: $2,000-10,000/month ($40-60 per lead)
- Free infrastructure (within Supabase/Vercel limits)
- 99%+ profit margin

---

#### Phase 2: Enhanced User Features (Weeks 3-4)
**Impact:** +30% traffic, +20% leads

- [ ] **Visa Information Pages** (1-2 days)
  - [ ] Create template for visa pages
  - [ ] Build 10-15 visa info pages (189, 190, 482, 186, etc.)
  - [ ] Content: Overview, requirements, costs, processing times
  - [ ] Show pathway to PR (e.g., 482 → 186)
  - [ ] List top 10 eligible occupations per visa
  - [ ] Link to official resources (LIN, Home Affairs)
  - [ ] SEO optimization
  - **Benefit:** Keep users on site, build authority, improve SEO

- [ ] **"People Also Researched"** (4-6 hours)
  - [ ] Show occupation combinations based on user behavior
  - [ ] Display "73% also viewed: Developer Programmer"
  - [ ] Geographic variants (e.g., "From India? 89% researched...")
  - [ ] Guide career exploration
  - **Benefit:** Increases engagement, reveals user patterns

- [ ] **Visa Pathway Indicators** (2 hours)
  - [ ] Show "482 → 186 pathway available" on visa table
  - [ ] Highlight permanent residence pathways
  - [ ] Add tooltip explanations
  - **Benefit:** Helps users plan long-term

---

#### Phase 3: Advanced Features (Month 2-3)
**Impact:** +50% engagement, +15% leads

- [ ] **Similar Occupations (Visa-Based)** (6-8 hours)
  - [ ] Show alternatives with same visa eligibility
  - [ ] "Want easier pathway? Try these occupations (on STSOL)"
  - [ ] Help users optimize for visa eligibility

- [ ] **Visa Comparison Tool** (1-2 days)
  - [ ] Side-by-side comparison for an occupation
  - [ ] Compare: 482 vs 189 vs 190 (duration, cost, requirements)
  - [ ] Show "Best for you" recommendation
  - [ ] Decision support for users

- [ ] **Career Progression Paths** (2-3 days)
  - [ ] Show career ladder (Entry → Mid → Senior → Management)
  - [ ] Link occupations to progression levels
  - [ ] Display visa options at each level
  - [ ] Understand long-term planning

- [ ] **Geographic Insights** (1-2 days)
  - [ ] Show where occupation is in demand (cities/regions)
  - [ ] Regional opportunities for 491/494 visas
  - [ ] Based on visa application data

---

### High Priority (Week 5-6)

#### 1. ANZSCO Details Tab - PARTIALLY COMPLETE ✅
- [x] Display alternative titles ✅ (Feb 6, 2026)
- [x] Show specialisations ✅ (Feb 6, 2026)
- [ ] Display occupation description (NOT in Excel files - needs web scraping or manual entry)
- [ ] Show tasks and duties (NOT in Excel files - needs web scraping or manual entry)
- [ ] Support v1.3 vs v2022 comparison (low priority - most users only need v2022)
- **Status:** Basic ANZSCO details now working! Descriptions/tasks require additional data source.
- **Next Step:** Consider manually adding descriptions for top 50 most-searched occupations
- **Impact:** Major feature gap addressed - users can now see alternative titles and specialisations
- **Remaining Effort:** 4-6 hours (if adding manual descriptions for top occupations)

#### 2. Autocomplete Dropdown
- [ ] Show suggestions as user types (no Enter needed)
- [ ] Dropdown appears below search bar
- [ ] Click suggestion to navigate to detail page
- [ ] Show occupation code + title in suggestions
- [ ] Limit to 5-10 suggestions
- [ ] **BONUS:** Search alternative titles too (now possible with new data!)
- **Impact:** Major UX improvement
- **Effort:** 1-2 hours

#### 3. Last Updated Date
- [ ] Add to header: "Last Updated: [date]"
- [ ] Pull from database or config file
- [ ] Update date automatically on data refresh
- **Impact:** Trust and transparency
- **Effort:** 30 minutes

---

### Medium Priority (Week 7-8)

#### 4. Assessing Authority Display
- [ ] Show assessing authority on detail page (TRA, ACS, VETASSESS, etc.)
- [ ] Add link to authority website
- [ ] Display assessment requirements summary
- **Data:** Already in database, just needs UI
- **Effort:** 1 hour

#### 5. Catalogue Filter Buttons
- [ ] Add top-level filters: [v1.2/v1.3/v2022] [v2022] [OSCA]
- [ ] Control entire search scope
- [ ] Match Anzscosearch UX exactly
- [ ] Update search results based on filter
- **Impact:** Advanced filtering for power users
- **Effort:** 1-2 hours

#### 6. State/Territory Tab
- [ ] Show which states/territories nominate this occupation
- [ ] Display state-specific requirements
- [ ] Link to state nomination programs
- [ ] Show current nomination status
- **Data:** Needs to be imported from state lists
- **Effort:** 4-6 hours (including data import)

#### 7. Search by Alternative Titles
- [ ] Update search query to include alternative_titles field
- [ ] Expand results when searching by alternative title
- [ ] Show "Found via alternative title: [title]" indicator
- **Impact:** Helps users find occupations by different job names
- **Effort:** 1 hour (now that data is available!)
- **Priority:** Moved up - now possible with imported data

---

### Lower Priority (Future)

#### 8. Points Calculator
- [ ] Age points calculator
- [ ] English language points
- [ ] Work experience points
- [ ] Education points
- [ ] Partner points
- [ ] Total points summary
- **Effort:** 6-8 hours

#### 9. Export Features
- [ ] Export occupation report to PDF
- [ ] Include visa eligibility table
- [ ] Include occupation description
- [ ] Professional formatting
- **Effort:** 4-6 hours

#### 10. User Accounts (Optional)
- [ ] Save favorite occupations
- [ ] Track application progress
- [ ] Email notifications
- **Effort:** 10+ hours

#### 11. Advanced Search Filters
- [ ] Filter by skill level
- [ ] Filter by visa category (permanent/temporary)
- [ ] Filter by assessing authority
- [ ] Filter by shortage status
- **Effort:** 2-3 hours

#### 12. Comparison Feature
- [ ] Compare multiple occupations side-by-side
- [ ] Show differences in visa eligibility
- [ ] Compare points potential
- **Effort:** 4-6 hours

---

## 🐛 Known Issues

### Minor Issues
- [ ] Search bar doesn't auto-focus on page load
- [ ] No "Loading" state when switching between occupation versions
- [ ] Legend takes up too much space on mobile

### Technical Debt
- [ ] Duplicate code in CheckIcon, XIcon, DashIcon components (could extract)
- [ ] src/lib/supabase.ts is duplicate of lib/supabase.ts (remove one)
- [ ] Hard-coded LIN URLs (should come from database)
- [ ] ANZSCO Details section could be extracted into separate component

---

## 📊 Metrics to Track

### Usage Metrics (Analytics System - NEW)
- [ ] Total searches per day
- [ ] Most searched occupations
- [ ] Search terms (what people are looking for)
- [ ] Alternative title search usage
- [ ] Occupation views by country
- [ ] Visa interest patterns (LIN clicks)
- [ ] Info button clicks (confusion points)
- [ ] Tab switching behavior
- [ ] Career pathway exploration
- [ ] Bounce rate
- [ ] Average session duration
- [ ] Mobile vs desktop usage

### Lead Generation Metrics (NEW)
- [ ] Lead form submissions per month
- [ ] Consent opt-in rate (target: 70-80%)
- [ ] Average intent score (target: 6-7/10)
- [ ] RMA conversion rate (target: 40-60%)
- [ ] Revenue per lead (target: $40-60)
- [ ] Total monthly revenue

### Performance Metrics
- [ ] Page load time (<2 seconds target)
- [ ] Search response time (<500ms target)
- [ ] Vercel deployment time (~2 minutes)

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [x] Test locally with `npm run dev`
- [x] Run `npm run build` successfully
- [x] Check TypeScript errors (none)
- [x] Test all major features
- [x] Test ANZSCO Details section ✅
- [x] Test info button modals ✅
- [x] Environment variables configured

### Post-Deployment
- [ ] Verify live site works
- [ ] Test search functionality
- [ ] Test detail pages
- [ ] Verify ANZSCO details display correctly ✨
- [ ] Test alternative titles and specialisations ✨
- [ ] Test info button modals ✨
- [ ] Test on mobile device
- [ ] Set up monitoring/analytics
- [ ] Share with test users for feedback

---

## 💡 Feature Ideas (Brainstorm)

### User Experience
- Compare v1.3 vs v2022 occupation descriptions side-by-side
- Show occupation trends (growing/declining demand)
- Email alerts when occupation list changes
- Chatbot to help find right occupation
- Skills assessment cost calculator
- Visa processing time estimates
- Success rate statistics by occupation
- Search by alternative title suggestion chips
- "Similar occupations" based on specialisations

### Business Features (NEW - Feb 12, 2026)
- **RMA lead generation** (qualified leads with behavior data)
- **Market intelligence reports** (quarterly migration trends)
- **Partnership opportunities** (recruitment agencies, education providers)
- **Subscription intelligence platform** ($99-299/month for trend data)
- **Custom research services** ($1,000-5,000 per project)

### Community
- Community forum for each occupation
- Connect with migration agents
- Success stories and testimonials

---

## 📝 Notes

- **Design inspiration:** Anzscosearch (see `Anzscosearch_UI_UX_Analysis.md`)
- **Target users:** People researching Australian migration options
- **Competitive advantage:** Free, comprehensive, up-to-date, fast
- **Data update frequency:** Quarterly (when ANZSCO or lists change)
- **Alternative titles:** From official ABS ANZSCO 2022 Index (Feb 2026)
- **NEW:** Analytics & lead generation system (Feb 12, 2026) - See full report in docs/

---

## 🎯 Next Session Goals

**Immediate (This Week):**
1. Review Analytics & RMA Lead Feature Report
2. Decide on Phase 1 implementation timeline
3. Set up basic analytics tracking (if approved)
4. Begin RMA lead form development (if approved)

**This Month:**
5. Complete Phase 1 (Analytics + Lead System)
6. Launch beta with 2-3 RMAs
7. Monitor and optimize conversion rates
8. Add visa information pages

**Next 3 Months:**
9. Complete Phase 2 (Enhanced features)
10. Scale RMA partnerships
11. Generate first trend reports
12. Explore additional revenue streams

---

## 💰 Revenue Projections (NEW)

**Conservative (Year 1):**
- 50 leads/month × $40 = $2,000/month
- Annual: $24,000
- Costs: $0-20/month
- Net Profit: ~$23,700/year

**Moderate (Year 2):**
- 150 leads/month × $50 = $7,500/month
- Annual: $90,000
- Costs: $20-50/month
- Net Profit: ~$89,400/year

**Optimistic (Year 3):**
- 300 leads/month × $60 = $18,000/month
- Annual: $216,000
- Costs: $50-100/month
- Net Profit: ~$214,800/year

**Profit Margin:** 99%+ 🚀
