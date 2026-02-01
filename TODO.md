# Current State & TODO

## ✅ Completed Features

### Core Functionality
- [x] Search occupations by code or name
- [x] Real-time search with debouncing (300ms)
- [x] Group same occupation codes (show single result with multiple catalogue badges)
- [x] Filter out OSCA occupations from search
- [x] Occupation detail page with full visa eligibility
- [x] Display all visas (v1.3 + v2022) in single table

### UI/UX
- [x] Professional table layout (Anzscosearch-inspired)
- [x] Color-coded visa categories (green=permanent, yellow=temporary)
- [x] List membership indicators (✓/✗/—) for MLTSSL, STSOL, ROL, CSOL
- [x] Direct LIN links to legislation.gov.au
- [x] Info button modals for special visa requirements (482 Specialist, 186 TRT)
- [x] Clean legend explaining all symbols
- [x] Visa ordering matches Anzscosearch (189, 190, 491, 485, 482, 186, etc.)
- [x] Stream name formatting (Core Skills, TRT, Direct Entry)

### Technical
- [x] Next.js 16.1.6 with TypeScript
- [x] Supabase database integration
- [x] Deployed to Vercel (live and accessible)
- [x] Auto-deployment on git push
- [x] Environment variables configured
- [x] TypeScript strict mode enabled

### Data
- [x] 3,261 occupations imported (v1.3, v2022, OSCA)
- [x] 960 occupation list entries
- [x] 8 visa subclasses with 13 total entries (including streams)
- [x] 9,464 visa eligibility calculations

---

## 🚧 In Progress

### Security
- [ ] Enable Row Level Security (RLS) on Supabase tables
  - Status: Email received from Supabase (6 errors detected)
  - Priority: High
  - Action: Enable RLS with public read-only access

---

## 📋 Backlog (Prioritized)

### High Priority (Week 5-6)

#### 1. ANZSCO Details Tab
- [ ] Add tab navigation (Visa Options | ANZSCO Details | State/Territory)
- [ ] Display occupation description from ANZSCO
- [ ] Show tasks and duties
- [ ] Display alternative titles
- [ ] Show specialisations
- [ ] Support v1.3 vs v2022 comparison
- **Impact:** Major feature gap vs Anzscosearch
- **Effort:** 2-3 hours

#### 2. Autocomplete Dropdown
- [ ] Show suggestions as user types (no Enter needed)
- [ ] Dropdown appears below search bar
- [ ] Click suggestion to navigate to detail page
- [ ] Show occupation code + title in suggestions
- [ ] Limit to 5-10 suggestions
- **Impact:** Major UX improvement
- **Effort:** 1 hour

#### 3. Mobile Responsiveness
- [ ] Table horizontal scroll on mobile
- [ ] OR: Card-based layout for mobile
- [ ] Test on iPhone/Android sizes
- [ ] Ensure buttons are touch-friendly
- [ ] Fix any layout issues
- **Impact:** Accessibility for mobile users
- **Effort:** 2-3 hours

#### 4. Last Updated Date
- [ ] Add to header: "Last Updated: [date]"
- [ ] Pull from database or config file
- [ ] Update date automatically on data refresh
- **Impact:** Trust and transparency
- **Effort:** 30 minutes

---

### Medium Priority (Week 7-8)

#### 5. Assessing Authority Display
- [ ] Show assessing authority on detail page (TRA, ACS, VETASSESS, etc.)
- [ ] Add link to authority website
- [ ] Display assessment requirements summary
- **Data:** Already in database, just needs UI
- **Effort:** 1 hour

#### 6. Catalogue Filter Buttons
- [ ] Add top-level filters: [v1.2/v1.3/v2022] [v2022] [OSCA]
- [ ] Control entire search scope
- [ ] Match Anzscosearch UX exactly
- [ ] Update search results based on filter
- **Impact:** Advanced filtering for power users
- **Effort:** 1-2 hours

#### 7. State/Territory Tab
- [ ] Show which states/territories nominate this occupation
- [ ] Display state-specific requirements
- [ ] Link to state nomination programs
- [ ] Show current nomination status
- **Data:** Needs to be imported from state lists
- **Effort:** 4-6 hours (including data import)

#### 8. Alternative Titles Toggle
- [ ] Add toggle: "Show Alternative Titles / Specialisations / NEC"
- [ ] Expand search to include alternative titles
- [ ] Display alternative titles in search results
- **Impact:** Helps users find similar occupations
- **Effort:** 2 hours

---

### Lower Priority (Future)

#### 9. Points Calculator
- [ ] Age points calculator
- [ ] English language points
- [ ] Work experience points
- [ ] Education points
- [ ] Partner points
- [ ] Total points summary
- **Effort:** 6-8 hours

#### 10. Export Features
- [ ] Export occupation report to PDF
- [ ] Include visa eligibility table
- [ ] Include occupation description
- [ ] Professional formatting
- **Effort:** 4-6 hours

#### 11. User Accounts (Optional)
- [ ] Save favorite occupations
- [ ] Track application progress
- [ ] Email notifications
- **Effort:** 10+ hours

#### 12. Advanced Search Filters
- [ ] Filter by skill level
- [ ] Filter by visa category (permanent/temporary)
- [ ] Filter by assessing authority
- [ ] Filter by shortage status
- **Effort:** 2-3 hours

#### 13. Comparison Feature
- [ ] Compare multiple occupations side-by-side
- [ ] Show differences in visa eligibility
- [ ] Compare points potential
- **Effort:** 4-6 hours

#### 14. Analytics Dashboard
- [ ] Track popular searches
- [ ] View user demographics
- [ ] Monitor performance
- **Effort:** 2-3 hours (using Vercel Analytics)

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

---

## 📊 Metrics to Track

### Usage Metrics (Future)
- [ ] Total searches per day
- [ ] Most searched occupations
- [ ] Bounce rate
- [ ] Average session duration
- [ ] Mobile vs desktop usage

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
- [x] Environment variables configured

### Post-Deployment
- [x] Verify live site works
- [x] Test search functionality
- [x] Test detail pages
- [x] Test on mobile device
- [ ] Set up monitoring/analytics
- [ ] Share with test users for feedback

---

## 💡 Feature Ideas (Brainstorm)

- Compare v1.3 vs v2022 occupation descriptions side-by-side
- Show occupation trends (growing/declining demand)
- Email alerts when occupation list changes
- Chatbot to help find right occupation
- Skills assessment cost calculator
- Visa processing time estimates
- Success rate statistics by occupation
- Community forum for each occupation
- Connect with migration agents

---

## 📝 Notes

- **Design inspiration:** Anzscosearch (see `Anzscosearch_UI_UX_Analysis.md`)
- **Target users:** People researching Australian migration options
- **Competitive advantage:** Free, comprehensive, up-to-date, fast
- **Data update frequency:** Quarterly (when ANZSCO or lists change)

---

## 🎯 Next Session Goals

**Immediate (Next 1-2 hours):**
1. Fix Supabase RLS security warnings
2. Add autocomplete dropdown to search

**This Week:**
3. Add ANZSCO Details tab
4. Improve mobile responsiveness

**This Month:**
5. Complete all high-priority backlog items
6. Gather user feedback
7. Iterate based on feedback
