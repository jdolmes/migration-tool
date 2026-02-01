# Australian Migration Tool

## What This Is
A web application that helps people check their visa eligibility for Australian migration based on their occupation.

## Tech Stack
- **Frontend:** Next.js 16.1.6 (React, TypeScript, Tailwind CSS)
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Live URL:** https://migration-tool-git-main-jdolmes-projects.vercel.app

## Database Schema
- **occupations** - 3,261 ANZSCO occupations (v1.3, v2022, OSCA)
- **visas** - 8 visa subclasses with streams
- **occupation_lists** - 960 entries (MLTSSL, STSOL, ROL, CSOL)
- **visa_eligibility** - 9,464 eligibility records

## Key Features
1. Search occupations by code or name
2. View all eligible visas for an occupation
3. See which occupation lists (MLTSSL/STSOL/ROL/CSOL) the occupation is on
4. Direct links to legislative instruments (LIN)
5. Multi-catalogue support (v1.3 and v2022)
6. Color-coded visa categories (green=permanent, yellow=temporary)
7. Info modals for special visa requirements (482 Specialist, 186 TRT)

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://eulnvbopvqilqyvyiqux.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[stored in .env.local]
```

## File Structure
```
/app
  /occupation/[code]/page.tsx  - Occupation detail page with visa table
  page.tsx                      - Home page with search
/components
  /search
    SearchBar.tsx               - Search input component
    OccupationCard.tsx          - Search result card
/hooks
  useOccupationSearch.ts        - Search logic with debouncing
/lib
  supabase.ts                   - Supabase client configuration
```

## Development Commands
```bash
npm run dev          # Start local dev server (http://localhost:3000)
npm run build        # Build for production
git push             # Auto-deploys to Vercel
```

## Design Inspiration
Based on Anzscosearch UI/UX patterns - professional migration tool interface.
