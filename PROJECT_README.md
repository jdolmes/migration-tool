# Australian Migration Hub

## What This Is
A comprehensive web platform that helps people check their visa eligibility for Australian migration based on their occupation. Expanding from a simple search tool to an intelligence platform with qualified lead generation.

## Tech Stack
- **Frontend:** Next.js 16.1.6 (React, TypeScript, Tailwind CSS)
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Live URL:** https://migration-tool-git-main-jdolmes-projects.vercel.app

## Database Schema

### Current Tables:
- **occupations** - 3,261 ANZSCO occupations (v1.3, v2022, OSCA)
- **visas** - 8 visa subclasses with streams
- **occupation_lists** - 960 entries (MLTSSL, STSOL, ROL, CSOL)
- **visa_eligibility** - 9,464 eligibility records

### Planned Tables (Analytics System):
- **analytics_events** - User behavior tracking (searches, views, clicks)
- **leads** - RMA lead generation
- **lead_summaries** - Qualified lead profiles with intent scoring

## Key Features

### Current (Live):
1. Search occupations by code or name
2. View all eligible visas for an occupation
3. See which occupation lists (MLTSSL/STSOL/ROL/CSOL) the occupation is on
4. Direct links to legislative instruments (LIN)
5. Multi-catalogue support (v1.3 and v2022)
6. Color-coded visa categories (green=permanent, gray=temporary)
7. Info modals for special visa requirements (482 Specialist, 186 TRT)
8. Config-driven visa logic (VISA_LIST_RULES) for easy maintenance
9. Modern, responsive UI with gradient design system

### Planned (Analytics & Monetization):
10. **User Behavior Analytics**
    - Track searches, occupation views, visa interest
    - Geographic patterns and trends
    - Career pathway exploration
    
11. **RMA Lead Generation**
    - Qualified leads with research summaries
    - Intent scoring (1-10 scale)
    - Privacy-compliant consent system
    - Expected revenue: $2k-10k/month
    
12. **Market Intelligence**
    - Migration trend reports
    - Occupation demand analysis
    - Visa pathway insights
    
13. **Enhanced User Features**
    - Visa information pages
    - "People also researched" recommendations
    - Visa comparison tools
    - Career progression paths

**See:** `docs/Analytics_RMA_Lead_Feature_Report.md` for full details

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://eulnvbopvqilqyvyiqux.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[stored in .env.local]
```

## File Structure
```
/app
  /occupation/[code]/page.tsx  - Occupation detail (v1.3 modern with config-driven visa logic)
  page.tsx                      - Home page (v1.4 simple & elegant)
/components
  /search
    SearchBar.tsx               - Search input component
    OccupationCard.tsx          - Search result card
/hooks
  useOccupationSearch.ts        - Search logic with debouncing
/lib
  supabase.ts                   - Supabase client configuration
/docs
  Analytics_RMA_Lead_Feature_Report.md  - Monetization strategy (45 pages)
  SESSION_HANDOFF.md            - Project status and continuity
```

## Development Commands
```bash
npm run dev          # Start local dev server (http://localhost:3000)
npm run build        # Build for production
git push             # Auto-deploys to Vercel
```

## Recent Updates (Feb 2026)

### Feb 12:
- Config-driven visa list logic (easy to add/modify visas)
- Info buttons with modal popups for special requirements
- Comprehensive analytics & monetization proposal
- Updated all project documentation

### Feb 11:
- Modern UI redesign (v1.3-1.4)
- Simple, elegant homepage with gradient text
- Tab navigation system (Visa Options default)
- Vibrant color palette with professional aesthetic

### Feb 6:
- ANZSCO Details section with alternative titles and specialisations
- Dynamic related occupations feature

## Project Vision

### Current Phase: Information Platform
- Free occupation search tool
- Comprehensive visa eligibility checking
- User acquisition focus

### Next Phase: Intelligence Platform (In Planning)
- Analytics tracking system
- Qualified lead generation for RMAs
- Market intelligence reports
- Multiple revenue streams

### Future: Industry Leader
- Leading migration insights provider
- API access for partners
- Subscription intelligence platform
- Strategic partnerships with agencies and education providers

## Business Model (Planned)

**Revenue Streams:**
1. **RMA Lead Generation:** $40-100 per qualified lead
   - Projected: $24k-216k/year
   - Profit margin: 99%+

2. **Market Intelligence Reports:** $500-2,000 per report
   - Quarterly migration trends
   - Geographic analysis
   - Occupation demand forecasts

3. **Subscription Platform:** $99-299/month
   - Real-time trend data
   - Custom analytics
   - API access

4. **Custom Research:** $1,000-5,000 per project
   - Tailored market analysis
   - Partnership opportunities

**Implementation Cost:** $0-20/month (free tier sufficient for 1-2 years)

## Design Inspiration
Based on Anzscosearch UI/UX patterns - professional migration tool interface with modern enhancements.

## Privacy & Compliance
- Consent-based data collection (GDPR/CCPA compliant)
- Transparent privacy policy
- User opt-in for research sharing
- Ethical data practices
- No personal data sale

## Documentation
- **Technical:** See `DATABASE_SCHEMA.md`, `API_REFERENCE.md`, `CONVENTIONS.md`
- **Business:** See `docs/Analytics_RMA_Lead_Feature_Report.md`
- **Project Status:** See `docs/SESSION_HANDOFF.md`
- **Roadmap:** See `TODO.md`

## Contact & Support
- GitHub Issues for bugs and features
- Documentation in `/docs` folder
- Project maintained by Frank
