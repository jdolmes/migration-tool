# Session Context

## Project Status: DEPLOYED & LIVE ✅

**Live URL:** https://migration-tool-git-main-jdolmes-projects.vercel.app

---

## Last Session (February 6, 2026)

### What We Accomplished
1. ✅ Imported ANZSCO alternative titles (331 occupations)
2. ✅ Imported ANZSCO specialisations (510 occupations)
3. ✅ Added ANZSCO Details section to occupation detail page
4. ✅ Updated database schema with new fields (alternative_titles, specialisations)
5. ✅ Extracted data from official ABS Excel files (ANZSCO 2022 Index)

### Data Source
- **File:** ANZSCO 2022 Index of Principal Titles, Alternative Titles and Specialisations (June 2023)
- **Authority:** Australian Bureau of Statistics (ABS)
- **Coverage:** 1,076 occupation codes (v2022)
- **Imported:** 665 occupations updated (331 with alt titles, 510 with specialisations)

### Current State
- **Frontend:** Fully functional with new ANZSCO Details section
- **Database:** 3,261 occupations, 665 with alternative titles/specialisations
- **Deployment:** Ready to deploy (needs git push)
- **Performance:** Fast, responsive, no known bugs

---

## Previous Session (January 30, 2026)

### What We Accomplished
1. ✅ Fixed TypeScript error in visa eligibility query
2. ✅ Deployed to Vercel successfully
3. ✅ Tested live site - all features working
4. ✅ Created comprehensive documentation files

### Current State
- **Frontend:** Fully functional search and detail pages
- **Database:** 3,261 occupations, 960 list entries, 9,464 eligibility records
- **Deployment:** Auto-deploys on git push to main
- **Performance:** Fast, responsive, no known bugs

---

## Active Issues

### 1. Supabase Security Warning (Priority: High)
- **Status:** Email received - 6 security vulnerabilities detected
- **Issue:** Row Level Security (RLS) not enabled on tables
- **Impact:** Tables are publicly readable/writable (should be read-only)
- **Next Step:** Enable RLS policies with public read access
- **Urgency:** Should fix in next session

---

## Current Feature Set

### ✅ Working Features
- Occupation search (by code or name)
- Real-time search with debouncing
- Grouped search results (same code, multiple catalogues)
- OSCA filtering (not shown in search)
- Occupation detail page with visa table
- **NEW: ANZSCO Details section** ✨
  - Alternative titles display
  - Specialisations display
  - Link to ABS website for full descriptions
- All visas displayed (v1.3 + v2022) together
- Color-coded visa categories (green/yellow sidebars)
- List membership indicators (✓/✗/—)
- Direct LIN links to legislation.gov.au
- Info modals for special requirements (482 Specialist, 186 TRT)
- Professional legend explaining symbols
- Proper visa ordering (189, 190, 491...)
- Mobile-responsive (basic)

---

## Known Technical Details

### Key Files
- `/app/page.tsx` - Home page with search
- `/app/occupation/[code]/page.tsx` - Detail page with visa table + ANZSCO details (UPDATED)
- `/components/search/SearchBar.tsx` - Search input
- `/components/search/OccupationCard.tsx` - Result cards
- `/hooks/useOccupationSearch.ts` - Search logic with debouncing
- `/lib/supabase.ts` - Supabase client

### Important Patterns
- Supabase joins return arrays - must transform to single object
- Search debounced at 300ms
- OSCA occupations filtered with `.neq('catalogue_version', 'OSCA')`
- Visa ordering uses custom sort function with predefined order
- **NEW:** Alternative titles and specialisations are PostgreSQL text[] arrays
- **NEW:** ANZSCO details only shown for v2022 occupations

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://eulnvbopvqilqyvyiqux.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[stored securely]
```

---

## Next Priorities

### Immediate (Next Session)
1. **Test ANZSCO Details** - Verify alternative titles and specialisations display correctly
2. **Deploy to production** - Git push to trigger Vercel deployment
3. **Fix Supabase RLS** - Enable read-only public access

### This Week
4. **Add autocomplete dropdown** - Show suggestions as user types
5. **Mobile improvements** - Better responsive design for ANZSCO Details section

### This Month
6. Complete high-priority backlog (see TODO.md)
7. Gather user feedback
8. Iterate based on usage

---

## Development Workflow

### Making Changes
```bash
# Local development
cd ~/Projects/migration-tool-frontend
npm run dev
# Test at http://localhost:3000

# Deploy changes
git add .
git commit -m "Description of changes"
git push
# Vercel auto-deploys in ~2 minutes
```

### Testing Checklist
- [ ] Search works (try "software", "cook", "261313")
- [ ] Detail page loads (click any result)
- [ ] **NEW: ANZSCO Details section displays** ✨
- [ ] **NEW: Alternative titles show correctly** ✨
- [ ] **NEW: Specialisations show correctly** ✨
- [ ] **NEW: ABS link works** ✨
- [ ] Visa table displays correctly
- [ ] LIN links open correct legislation
- [ ] Info buttons show modals
- [ ] Mobile view works (resize browser)

---

## Performance Metrics

### Current Stats
- **Page Load:** <2 seconds
- **Search Response:** <500ms
- **Build Time:** ~30 seconds
- **Deploy Time:** ~2 minutes

### Database Size
- Occupations: 3,261 records
- **Occupations with Alternative Titles:** 331 (NEW)
- **Occupations with Specialisations:** 510 (NEW)
- Visas: 13 records
- Occupation Lists: 960 records
- Visa Eligibility: 9,464 records

---

## User Feedback (To Collect)

Questions to ask test users:
1. Is the search easy to use?
2. Is the visa table clear and understandable?
3. **NEW: Are alternative titles helpful for finding occupations?** ✨
4. **NEW: Are specialisations useful for understanding occupation variations?** ✨
5. What information is missing?
6. What would you add/change?
7. Did you find what you were looking for?

---

## Technical Debt

### Minor Issues
- Duplicate supabase.ts file (src/lib and lib/)
- Hard-coded LIN URLs (should be in database)
- CheckIcon/XIcon/DashIcon components could be extracted
- No analytics tracking yet

### Future Refactoring
- Extract visa table into separate component
- **NEW: Extract ANZSCO Details into separate component** ✨
- Create reusable modal component
- Consolidate color/style utilities
- Add proper TypeScript types for all Supabase queries

---

## Resources

### Documentation
- PROJECT_README.md - Project overview
- DATABASE_SCHEMA.md - Database structure (UPDATED with new fields)
- CONVENTIONS.md - Code style guide
- TODO.md - Feature backlog (UPDATED with completed items)
- API_REFERENCE.md - Supabase query patterns
- Anzscosearch_UI_UX_Analysis.md - Design inspiration

### External Links
- Live Site: https://migration-tool-git-main-jdolmes-projects.vercel.app
- Vercel Dashboard: https://vercel.com/jdolmes-projects/migration-tool
- Supabase Dashboard: https://supabase.com/dashboard/project/eulnvbopvqilqyvyiqux
- GitHub Repo: https://github.com/jdolmes/migration-tool
- ABS ANZSCO 2022: https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022

---

## Notes for Claude Code

When working on this project:
1. Always check TODO.md for current priorities
2. Follow patterns in CONVENTIONS.md
3. Reference DATABASE_SCHEMA.md for query structure
4. Use API_REFERENCE.md for Supabase examples
5. Test locally before pushing (npm run dev)
6. Commit with clear messages (see CONVENTIONS.md)
7. **NEW: Alternative titles and specialisations are text[] arrays in PostgreSQL**
8. **NEW: ANZSCO details section only shows for v2022 occupations**

---

## Session Goals Template

**Before Starting:**
- [ ] Review CONTEXT.md
- [ ] Check TODO.md for priorities
- [ ] Pull latest code: `git pull`

**During Session:**
- [ ] Make incremental commits
- [ ] Test changes locally
- [ ] Update documentation if needed

**After Session:**
- [ ] Push changes: `git push`
- [ ] Verify deployment on Vercel
- [ ] Update CONTEXT.md with progress
- [ ] Update TODO.md to check off completed items

---

Last Updated: February 6, 2026
