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

### Phase 1: Analytics System ✅ COMPLETE (Feb 14, 2026)
- [x] **Database Setup**
  - [x] `analytics_events` table with indexes
  - [x] `leads` table (ready for Phase 2)
  - [x] `lead_summaries` table (ready for Phase 3)

- [x] **Event Tracking Utility**
  - [x] `lib/analytics.ts` - Core tracking function
  - [x] Session ID generation
  - [x] User geolocation with session caching
  - [x] Graceful error handling

- [x] **6 Event Types - ALL DEPLOYED**
  - [x] `search_performed` - Search queries and results
  - [x] `occupation_viewed` - Occupation page views
  - [x] `tab_switched` - ANZSCO Details engagement
  - [x] `lin_clicked` - Legal research (HIGH intent)
  - [x] `info_button_clicked` - Complex visa interest
  - [x] `related_occupation_clicked` - Career exploration

- [x] **Production Verification**
  - [x] 25+ events captured in first hours
  - [x] Users from Malaysia, Japan
  - [x] High-intent sessions detected
  - [x] Zero cost infrastructure

**Status:** ✅ LIVE - Collecting production data daily

---

### Phase 2: Lead Generation System ✅ COMPLETE (Feb 15, 2026)
- [x] **LeadWidget Component**
  - [x] Always-visible chat bubble (bottom-right)
  - [x] Auto-expand after 2 minutes
  - [x] "Yes, Let's Talk" → Opens form
  - [x] "Maybe Later" → Minimizes to bubble
  - [x] Smooth animations
  - [x] Mobile responsive

- [x] **LeadForm Component**
  - [x] Contact info (name, email, phone)
  - [x] Location (onshore/offshore)
  - [x] Current visa (conditional on onshore)
  - [x] Timeline (ASAP / 6-12mo / 1-2yr / researching)
  - [x] Optional message field
  - [x] Privacy policy consent
  - [x] Real-time validation
  - [x] Success screen with Calendly

- [x] **Database Integration**
  - [x] Save leads to Supabase
  - [x] Extended leads table schema
  - [x] Intent score calculation (5 base for form submission)
  - [x] Session tracking integration
  - [x] Production verified (test lead saved)

- [x] **Privacy Compliance**
  - [x] Privacy Policy page (`/privacy-policy`)
  - [x] GDPR/CCPA compliant
  - [x] Clear data usage explanation
  - [x] User rights documented

- [x] **Calendly Integration**
  - [x] Instant booking link on success screen
  - [x] Opens in new tab
  - [x] ⚠️ URL is placeholder (needs update)

**Status:** ✅ DEPLOYED - Ready for RMA partnerships after Calendly setup

---

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

**Nothing currently in progress** - Phase 2 deployed, ready for Phase 3!

---

## 📋 Backlog (Prioritized)

### 🔥 HIGHEST PRIORITY - Pre-Launch Configuration

**Before going live with RMA partnerships:**

- [ ] **Update Calendly URL** (5 minutes)
  - [ ] Set up Calendly Standard account ($12/month)
  - [ ] Create "Migration Consultation" event (30 min)
  - [ ] Replace placeholder URL in `LeadForm.tsx`
  - **Current:** `https://calendly.com/your-account/migration-consultation`
  
- [ ] **Add Contact Email** (2 minutes)
  - [ ] Update privacy policy with real contact email
  - [ ] Currently shows placeholder
  
- [ ] **Test on Mobile** (30 minutes)
  - [ ] Widget appearance and behavior
  - [ ] Form usability on small screens
  - [ ] Calendly link functionality
  
- [ ] **Clear Test Data** (2 minutes)
  - [ ] Delete test lead from database
  - [ ] Verify clean slate for production leads

**Total Time:** 45 minutes  
**Then:** Ready to launch! 🚀

---

### 🎯 DECISION POINT: What's Next?

**Option A: Launch with Current Features** (Recommended)
- Complete pre-launch checklist above
- Find 1-2 beta RMA partners
- Start generating leads immediately
- Monitor and optimize based on real data
- **Time:** 1 week to first revenue

**Option B: Build RMA Dashboard First** (Phase 3a)
- RMA login page (simple password auth)
- Lead inbox (table view with filters)
- Lead detail view (full session data)
- Status management (New → Contacted → Converted)
- Notes system
- **Time:** 8-12 hours
- **Benefit:** Professional system, easier to scale multiple RMAs

**Option C: Add Email Notifications First** (Phase 3b)
- Resend.com integration (free tier)
- Email RMA when high-intent lead arrives
- Include session summary in email
- **Time:** 2-3 hours
- **Benefit:** RMAs don't need to check dashboard constantly

**Current Recommendation:** **Option A** - Launch now, build dashboard based on real feedback

---

### Phase 3a: RMA Dashboard (8-12 hours)

**Core Features:**
- [ ] **Login System** (2 hours)
  - [ ] `/admin/login` page
  - [ ] Simple password auth (bcrypt)
  - [ ] Session management
  - [ ] Logout functionality

- [ ] **Lead Inbox** (3-4 hours)
  - [ ] `/admin/leads` page
  - [ ] Table view with columns:
    - [ ] Created date
    - [ ] Name
    - [ ] Email
    - [ ] Location
    - [ ] Timeline
    - [ ] Intent Score
    - [ ] Status
  - [ ] Filter by status (New/Contacted/Converted)
  - [ ] Sort by date, intent score
  - [ ] Search by name/email
  - [ ] Click row to view details

- [ ] **Lead Detail View** (2-3 hours)
  - [ ] Full contact information
  - [ ] Occupation researched
  - [ ] Session analytics:
    - [ ] Occupations viewed
    - [ ] LINs clicked
    - [ ] Info buttons clicked
    - [ ] Time on site
  - [ ] Intent score breakdown
  - [ ] Timeline and current visa
  - [ ] User message (if provided)
  - [ ] Status dropdown (update status)
  - [ ] Notes field (internal RMA notes)
  - [ ] Save button

- [ ] **Export Functionality** (1 hour)
  - [ ] Export leads to CSV
  - [ ] Filter before export
  - [ ] Include all relevant fields

**Optional Enhancements:**
- [ ] Multi-RMA support (assign leads to specific RMAs)
- [ ] Lead assignment rules (round-robin, by expertise)
- [ ] Performance analytics (conversion rates)

---

### Phase 3b: Email Notifications (2-3 hours)

- [ ] **Resend Integration**
  - [ ] Sign up for Resend (free tier: 3,000 emails/month)
  - [ ] Add API key to environment variables
  - [ ] Install Resend SDK

- [ ] **Email Template**
  - [ ] New lead notification email
  - [ ] Include:
    - [ ] Contact details
    - [ ] Occupation researched
    - [ ] Intent score
    - [ ] Session summary
    - [ ] Link to dashboard
  - [ ] Professional HTML design

- [ ] **Trigger Logic**
  - [ ] Send email when lead submits form
  - [ ] Optional: Only send for high-intent leads (score 7+)
  - [ ] Include error handling

---

### High Priority (After Launch)

#### 1. Mobile Optimization (4-6 hours)
- [ ] Test widget on mobile thoroughly
- [ ] Full-width drawer style for mobile
- [ ] Touch-friendly form fields
- [ ] Fix any layout issues
- [ ] Test across iOS and Android

**Current Status:** Widget works on mobile but not optimized  
**Impact:** 30-40% of traffic is mobile

#### 2. Session Summary Enhancement (3-4 hours)
- [ ] Generate comprehensive session summary
- [ ] Attach to lead in database
- [ ] Query `analytics_events` by session_id
- [ ] Calculate refined intent score from:
  - [ ] Base form submission: 5 points
  - [ ] LIN clicks: +4 each
  - [ ] Info button clicks: +3 each
  - [ ] Multiple occupations: +2
  - [ ] Time on site: +1-3
- [ ] Store in `lead_summaries` table
- [ ] Display in dashboard

**Benefit:** Much better lead qualification for RMAs

#### 3. ANZSCO Details Enhancement (8-12 hours)
- [x] Alternative titles ✅
- [x] Specialisations ✅
- [ ] Occupation descriptions (manual for top 50 based on analytics)
- [ ] Tasks and duties (manual for top 50 based on analytics)

**Strategy:** Use analytics to identify top 50 most-viewed, add descriptions for those

#### 4. Autocomplete Dropdown (1-2 hours)
- [ ] Show suggestions as user types
- [ ] Include alternative titles
- [ ] Keyboard navigation
- [ ] Limit to 5-10 suggestions

---

### Medium Priority (Future)

#### 5. Analytics-Powered Features
*Require 2-4 weeks of data first*

- [ ] **"People Also Researched"** (4-6 hours)
  - [ ] Query common occupation pairs from analytics
  - [ ] Display on detail page
  - [ ] Geographic variants

- [ ] **Similar Occupations** (6-8 hours)
  - [ ] Show alternatives with same visa eligibility
  - [ ] Based on user behavior patterns

- [ ] **Visa Comparison Tool** (1-2 days)
  - [ ] Side-by-side comparison
  - [ ] Recommend best option based on user profile

#### 6. Visa Detail Pages (8-12 hours)
- [ ] Create template for visa pages
- [ ] Build 10-15 individual pages:
  - [ ] `/visa/189` - Skilled Independent
  - [ ] `/visa/190` - Skilled Nominated
  - [ ] `/visa/491` - Skilled Work Regional
  - [ ] `/visa/482` - TSS/SID
  - [ ] `/visa/186` - ENS
  - [ ] Plus 5-10 more
- [ ] Content: Requirements, processing times, pathways
- [ ] Top 10 eligible occupations per visa
- [ ] Add tracking to each page

**Benefit:** SEO, user value, more tracking data

#### 7. Standard Features
- [ ] Search by alternative titles (1 hour)
- [ ] Assessing authority display (1 hour)
- [ ] State/Territory tab (4-6 hours with data import)
- [ ] Catalogue filter buttons (1-2 hours)
- [ ] Last updated date (30 minutes)

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

### Critical (Fix Before Launch):
- [ ] Calendly URL is placeholder
- [ ] Contact email in privacy policy is placeholder

### Minor:
- [ ] Widget not fully optimized for mobile
- [ ] No email notifications (RMAs won't know about leads)
- [ ] Search bar doesn't auto-focus
- [ ] Legend takes up space on mobile

### Technical Debt:
- [ ] Duplicate icon components (CheckIcon, XIcon, DashIcon)
- [ ] Duplicate supabase.ts files
- [ ] Hard-coded LIN URLs
- [ ] ANZSCO Details could be separate component

---

## 📊 Metrics to Track

### Analytics Metrics (Phase 1 - Currently Tracking ✅)
- [x] Search queries and results
- [x] Occupation views by code and country
- [x] Visa research (LIN clicks, info buttons)
- [x] Tab engagement
- [x] Career exploration
- [x] Session duration and journeys
- [x] Geographic distribution

### Lead Generation Metrics (Phase 2 - Starting Soon)
- [ ] Widget auto-expand rate (after 2 min timer)
- [ ] Form open rate (clicks on "Yes, Let's Talk")
- [ ] Form completion rate (submitted / opened)
- [ ] Calendly booking rate
- [ ] Average intent score
- [ ] Location distribution (onshore vs offshore)
- [ ] Timeline distribution
- [ ] Leads per week/month
- [ ] Revenue per lead
- [ ] Total monthly revenue

### RMA Metrics (Phase 3 - Future)
- [ ] Lead response time (how fast RMAs contact leads)
- [ ] Conversion rate (lead → consultation → client)
- [ ] Revenue per RMA
- [ ] Lead satisfaction scores

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [x] Test locally ✅
- [x] TypeScript build succeeds ✅
- [x] Phase 1 analytics tested ✅
- [x] Phase 2 lead form tested ✅
- [x] Database integration tested ✅
- [x] Widget behavior verified ✅
- [ ] Mobile testing (in progress)
- [ ] Calendly URL updated
- [ ] Contact email updated

### Post-Deployment
- [x] Live site working ✅
- [x] Analytics collecting data ✅
- [x] Widget visible on occupation pages ✅
- [x] Lead form functional ✅
- [x] Database saving leads ✅
- [ ] Test on multiple mobile devices
- [ ] Verify Calendly booking works
- [ ] Share with beta RMAs

---

## 💡 Feature Ideas (Brainstorm)

### User Experience
- Visa eligibility quiz (5 questions → recommended pathway)
- AI chatbot for occupation recommendation
- Email alerts for occupation list changes
- Interactive visa pathway diagrams
- Success stories and testimonials
- Skills assessment cost estimator
- Processing time tracker

### Business Features (Analytics-Powered)
- Market intelligence reports (quarterly trends, $500-2k each)
- Subscription platform for RMAs/recruiters ($99-299/month)
- Custom research services ($1k-5k per project)
- API access for partners
- Whitelabel solution for agencies
- Affiliate program for education agents

### Community
- User success stories
- Migration journey timelines
- RMA marketplace/directory
- Blog with migration tips
- Newsletter with policy updates
- Forum for specific occupations

---

## 📝 Notes

- **Design inspiration:** Anzscosearch
- **Target users:** People researching Australian migration
- **Competitive advantage:** Free, comprehensive, analytics-powered, instant RMA connection
- **Data update frequency:** Quarterly
- **Phase 1:** Analytics deployed Feb 14, 2026
- **Phase 2:** Lead generation deployed Feb 15, 2026
- **Phase 3:** TBD (Dashboard OR Launch)

---

## 🎯 Next Session Goals

**Immediate (This Week):**
1. ✅ Phase 1 Analytics deployed
2. ✅ Phase 2 Lead generation deployed
3. Complete pre-launch checklist (45 min)
4. Find 1-2 beta RMA partners
5. Launch and monitor first leads

**This Month:**
6. Build RMA dashboard OR email notifications
7. Mobile optimization
8. Enhanced session summaries
9. First revenue: $500-2,000

**Next 3 Months:**
10. Scale to 10+ RMA partners
11. Add visa detail pages
12. Build analytics-powered features
13. Target: $5,000-10,000/month revenue

---

## 💰 Revenue Projections

**Phase 2 Active (Current):**

**Month 1 (Launch):**
- 10-20 leads × $100-200 = $1,000-4,000
- Cost: $12/month (Calendly)
- Net: $988-3,988

**Month 3:**
- 30-50 leads × $150-300 = $4,500-15,000
- Cost: $12/month
- Net: $4,488-14,988

**Month 6:**
- 50-100 leads × $200-500 = $10,000-50,000
- Cost: $12-50/month
- Net: $9,950-49,950

**Year 1 Total:**
- Conservative: 500 leads × $150 = $75,000
- Moderate: 1,000 leads × $250 = $250,000
- Optimistic: 2,000 leads × $300 = $600,000
- Cost: ~$200/year
- **Net Profit: $74,800 - $599,800**

**Profit Margin:** 99%+ 🚀

---

## 📅 Project Timeline

**Completed:**
- Jan 2026: Basic occupation search tool
- Feb 6: ANZSCO details (alt titles, specialisations)
- Feb 11-12: Modern UI, config-driven visa logic
- Feb 14: **Phase 1 Analytics deployed**
- Feb 15: **Phase 2 Lead generation deployed** ← YOU ARE HERE

**Next:**
- Feb 16-17: Pre-launch setup, find RMAs
- Feb 18+: **LAUNCH** - Start generating leads
- Mar 2026: Build dashboard, scale RMAs
- Apr-Jun: Advanced features, mobile optimization

**Future:**
- Q2 2026: 10+ RMA partners, $10k/month revenue
- Q3 2026: Advanced features, visa pages
- Q4 2026: Scale to $20k+/month

---

**Last Updated:** February 15, 2026 (Evening)
**Phase 1 Analytics:** ✅ DEPLOYED (Feb 14)
**Phase 2 Lead Generation:** ✅ DEPLOYED (Feb 15)
**Next Milestone:** Launch with RMA partners OR Build dashboard
**Status:** Production-ready revenue-generating platform 🎉

---

## Phase 3 Completion (February 17, 2026) ✅

### Completed Today:
- ✅ Admin authentication system (login, logout, route protection)
- ✅ Lead inbox with status tabs and search
- ✅ Lead detail with contact info and research data
- ✅ Timestamped comments system
- ✅ Research Journey timeline
- ✅ Research Summary (stats, duration, visa interests)
- ✅ Country detection from analytics
- ✅ Occupation names alongside ANZSCO codes
- ✅ Real intent scoring (replaces hardcoded score of 5)
- ✅ Deployed to production

### Next Priorities:

#### Immediate (Before showing to RMAs):
- [ ] Update Calendly URL in LeadForm.tsx
- [ ] Add contact email to privacy policy
- [ ] Test on mobile devices
- [ ] Clear test leads from database
- [ ] Change ADMIN_PASSWORD to something secure

#### Short Term (When ready):
- [ ] Set up Calendly + Stripe ($150 AUD paid consultations)
- [ ] Build Calendly webhook endpoint
- [ ] Add Tier 1 priority (paid consult booked) to dashboard
- [ ] Add email notifications for new leads (Resend)

#### Future:
- [ ] Individual RMA accounts (multi-user support)
- [ ] Mobile optimization
- [ ] A/B test lead widget messaging
- [ ] Advanced analytics dashboard

---

## SEO & Growth Strategy (Future Roadmap)

### Phase 4: SEO Foundations (High Priority - Free)
**Impact:** 100x traffic potential | **Cost:** $0 | **Time:** 4-6 hours

- [ ] **Meta titles & descriptions** - Add unique titles/descriptions to all 3,261 occupation pages
  - Format: "[Occupation Name] ([Code]) - Australian Visa Eligibility | [Site Name]"
  - Example: "Registered Nurse (254111) - Australian Visa Eligibility | AusVisaCheck"

- [ ] **Generate sitemap.xml** - Tell Google about all 3,261 pages

- [ ] **Add robots.txt** - Control what Google crawls

- [ ] **Google Search Console setup** - Essential SEO analytics (free)

- [ ] **Structured data (JSON-LD)** - Help Google understand occupation pages
  - Schema.org types: Occupation, HowTo, FAQPage

- [ ] **FAQ sections per occupation** - Answer common questions
  - "What visas can [occupation] apply for?"
  - "Is [occupation] on the skilled occupation list?"
  - "What is the skills assessment for [occupation]?"

### Phase 5: Content Expansion (Medium Priority)
**Impact:** Long-term organic traffic | **Cost:** Free-$500/mo | **Time:** Ongoing

- [ ] **Points calculator** - High search volume, viral potential
  - "Australia points test calculator 2026"
  - Interactive tool with instant results

- [ ] **Blog/news section** - Target high-volume migration searches
  - "How to migrate to Australia as a [occupation] in 2026"
  - "CSOL occupation list changes - what it means for you"
  - Country-specific guides (Philippines → Australia, India → Australia, etc.)

- [ ] **State nomination tracker** - Which states are open for which occupations

- [ ] **Occupation deep pages** - Expand each occupation page with:
  - Average salary in Australia
  - Career pathways and progression
  - Skills assessment requirements
  - Related occupations

- [ ] **Visa comparison pages** - "482 vs 189 visa - what's the difference"

- [ ] **Document checklist tool** - "What documents do I need for visa 189"

### Phase 6: Domain & Branding
**Impact:** Trust + SEO boost | **Cost:** $20-30/year | **Time:** 2-3 hours

- [ ] **Choose domain name** - Options to consider:
  - Keyword-rich: ausvisacheck.com.au, anzscotools.com.au
  - Professional: migratepath.com.au, visaready.com.au
  - Action: checkmyvisa.com.au, findmyvisa.com.au
  - Authority: australianmigrationhub.com.au

- [ ] **Register .com.au domain** - Builds Australian trust ($20-30/year)

- [ ] **Set up domain with Vercel** - Point new domain to existing site

- [ ] **Update all branding** - Logo, meta tags, social cards

### Phase 7: LLM/AI Discoverability (Emerging Opportunity)
**Impact:** Get cited by AI tools | **Cost:** Free | **Time:** 3-4 hours

- [ ] **Optimize for Perplexity** - Add direct answer paragraphs
  - "Registered Nurse (254111) is eligible for the 189 visa because..."

- [ ] **Add Q&A format content** - LLMs extract and cite Q&A well

- [ ] **Keep data fresh with dates** - "Last updated: [date]" on all pages

- [ ] **Citation-worthy summaries** - Write concise, accurate summaries LLMs can quote

### Phase 8: Distribution & Reach (Free → Paid)
**Impact:** Immediate traffic | **Cost:** $0-600/mo | **Time:** Ongoing

**Free channels:**
- [ ] Reddit presence - r/AusVisa, r/australia, r/immigration (helpful posts, not spam)
- [ ] Facebook Groups - "Moving to Australia", "Australian Visa Help" groups
- [ ] LinkedIn targeting - HR professionals, recruiters, migration agents
- [ ] YouTube tutorials - "How to check your visa eligibility" (link to tool)
- [ ] Quora answers - Link to relevant occupation pages
- [ ] Migration forums - Expat forums, Whirlpool Australia

**Paid channels (when ready):**
- [ ] Google Ads - $5-20/day targeting "migrate to Australia [occupation]"
- [ ] Facebook/Instagram Ads - Target Philippines, India, UK, Malaysia users
- [ ] SEO tools - Ahrefs or SEMrush ($100-200/mo) for keyword research
- [ ] Content writers - $50-200/post for migration blog content

### Phase 9: Advanced Features (Future)
**Impact:** Competitive moat | **Cost:** Varies | **Time:** 10-20 hours each

- [ ] **EOI tracker** - Invitation rounds data and predictions
- [ ] **Agent directory** - List of RMAs (monetization opportunity)
- [ ] **Salary database** - Average salaries per occupation in Australia
- [ ] **Job board integration** - Link to actual job openings per occupation
- [ ] **Mobile app** - React Native or PWA
- [ ] **Multi-language support** - Chinese, Tagalog, Hindi, Spanish
- [ ] **API for migration agents** - White-label or embed on their sites

---

## Analytics-Driven Content Strategy

Use your lead intelligence to prioritize content:

**Data to track monthly:**
- Which occupations get the most searches
- Which countries users come from (target content)
- Which visas users research most
- Which occupations have highest intent scores
- Drop-off points in research journey

**Content decisions based on data:**
- If 40% of searches are nursing → write nurse migration guides
- If Malaysia dominates traffic → write Malaysia-specific pathway content
- If users click lots of 482 info buttons → create detailed 482 explainer
- If users spend 15+ min on certain occupations → those need deep content pages

---

## Success Metrics to Track

**SEO Performance:**
- Google Search Console impressions and clicks
- Organic traffic growth month-over-month
- Number of keywords ranking in top 10
- Backlinks from migration sites/forums

**Lead Quality:**
- Average intent score of leads
- Conversion rate (lead → booked consultation)
- Revenue per lead
- Time from first visit to lead submission

**Content Effectiveness:**
- Which blog posts drive the most traffic
- Which occupation pages convert to leads best
- Bounce rate vs engagement rate
- Pages per session

**LLM Citations (emerging):**
- Track Perplexity citations (manual check)
- Monitor referral traffic from AI tools
- Track branded searches (site name awareness)

---

Last Updated: February 17, 2026
Status: Phase 3 complete ✅ | SEO roadmap defined
Next: Choose domain name + implement SEO foundations
