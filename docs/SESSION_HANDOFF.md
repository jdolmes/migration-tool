# Migration Tool Project - Session Handoff Document
**Last Updated:** February 7, 2026
**Status:** Active Development - ANZSCO Details Implementation Phase

---

## 🎯 PROJECT OVERVIEW

**Project Name:** Australian Migration Hub / ANZSCO Occupation Search Tool
**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Supabase (PostgreSQL), Vercel
**Live URL:** [Your production URL]
**GitHub:** [Your repo]

**Purpose:** 
Help people find visa-eligible occupations in Australia by searching ANZSCO (Australian and New Zealand Standard Classification of Occupations) codes and checking which visas they qualify for.

---

## 📊 CURRENT STATUS

### ✅ Completed Features:
1. **Search functionality** - Search by occupation code or name
2. **Occupation detail pages** with:
   - ANZSCO hierarchy (Major/Sub-Major/Minor/Unit Group)
   - Occupation-specific description
   - Tasks (13 tasks per occupation)
   - Alternative titles
   - Specialisations
   - **Unit Group Details section** (NEW - Feb 7, 2026):
     - Unit group description
     - Indicative Skill Level with blue badge
     - Related occupations list (dynamically fetched from database)
     - Current occupation highlighted in blue
3. **Visa eligibility table** - Shows which visas each occupation qualifies for
4. **Dual catalogue support** - v1.3 and v2022 ANZSCO versions

### 📈 Data Import Progress:
**Completed Unit Groups:** 3 of ~364
- ✅ 1111 - Chief Executives and Managing Directors (1 occupation)
- ✅ 2613 - Software and Applications Programmers (8 occupations)
- ✅ 2621 - Database and Systems Administrators, ICT Security Specialists (7 occupations)

**Total Occupations with Full Data:** 16 out of ~1,000

---

## 🗄️ DATABASE SCHEMA

**Key Tables:**

### `occupations` table (main):
```sql
- code (VARCHAR) - 6-digit occupation code
- catalogue_version (VARCHAR) - 'v1.3', 'v2022', or 'OSCA'
- principal_title (TEXT)
- skill_level (INTEGER) - 1-5
- alternative_titles (TEXT[])
- specialisations (TEXT[])
- description (TEXT) - occupation-specific description
- tasks (TEXT[]) - array of tasks
- major_group, major_group_title (VARCHAR)
- sub_major_group, sub_major_group_title (VARCHAR)
- minor_group, minor_group_title (VARCHAR)
- unit_group, unit_group_title (VARCHAR)
- unit_group_description (TEXT) - NEW
- indicative_skill_level (TEXT) - NEW
```

### Other tables:
- `visas` - Visa subclasses and details
- `visa_eligibility` - Which occupations qualify for which visas
- `occupation_lists` - MLTSSL, STSOL, ROL, CSOL membership

**Database:** Supabase PostgreSQL
**Project:** https://supabase.com/dashboard/project/eulnvbopvqilqyvyiqux

---

## 📁 KEY FILES

### Frontend (Next.js):
- **`app/occupation/[code]/page.tsx`** - Main occupation detail page
  - Current version: `page_v1.1_dynamic_occupations.tsx`
  - Shows ANZSCO details, visa options, unit group section
  - Fetches related occupations dynamically

### Documentation (Project root):
- `API_REFERENCE.md` - Supabase queries and API patterns
- `CONTEXT.md` - Project background and goals
- `CONVENTIONS.md` - Coding standards
- `DATABASE_SCHEMA.md` - Complete schema documentation
- `PROJECT_README.md` - Setup instructions
- `TODO.md` - Feature roadmap

### Data Import Files (should be in project):
- `anzsco_progress_tracker.csv` - Tracks which unit groups are done
- `generate_full_tracker.sql` - SQL to generate complete tracker from DB
- LLM prompt for processing ANZSCO data (see below)

---

## 🔄 CURRENT WORKFLOW: Adding Unit Groups

### Process (proven and working):

**Step 1: Get ANZSCO Data**
- Go to ABS website: https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022/browse-classification
- Navigate to a unit group (e.g., 2631 Computer Network Professionals)
- Copy ALL text from the page

**Step 2: Generate SQL with LLM**
- Use the LLM prompt (see section below)
- Paste ANZSCO text and URL
- LLM generates SQL with:
  - Unit group description, skill level, tasks
  - Individual occupation descriptions, alt titles, specialisations

**Step 3: Import to Database**
- Open Supabase SQL Editor
- Paste the generated SQL
- Run it

**Step 4: Verify**
```sql
SELECT code, principal_title, array_length(tasks, 1) as num_tasks
FROM occupations 
WHERE unit_group = '[CODE]' AND catalogue_version = 'v2022'
ORDER BY code;
```

**Step 5: Test Live**
- Changes are INSTANT (database is live)
- Frontend automatically shows new data
- No git push needed for database changes

**Step 6: Update Tracker**
- Mark unit group as DONE in Google Sheets tracker

---

## 🤖 LLM PROMPT FOR PROCESSING ANZSCO DATA

**Copy this entire prompt to ChatGPT/Claude when processing unit groups:**

```
I need help processing ANZSCO unit group data and converting it to SQL for PostgreSQL.

Database Schema:
- occupations table with columns:
  - code (VARCHAR) - 6-digit occupation code
  - unit_group (VARCHAR) - 4-digit unit group code
  - unit_group_description (TEXT)
  - indicative_skill_level (TEXT)
  - description (TEXT) - individual occupation description
  - tasks (TEXT[]) - array of tasks
  - alternative_titles (TEXT[]) - array of alternative titles
  - specialisations (TEXT[]) - array of specialisations

Input Format:
ANZSCO text with:
1. Unit group info (code, title, description, skill level, tasks)
2. Individual occupations (each with code, title, description, alternative titles, specialisations)

Required SQL Output:

-- Unit Group [CODE]: [TITLE]
-- Source: [PASTE THE ABS URL HERE AS A COMMENT]
-- Generated: [DATE]

-- Step 1: Update unit group info for ALL occupations in this group
UPDATE occupations 
SET 
    unit_group_description = '[description]',
    indicative_skill_level = '[skill level]',
    tasks = ARRAY['[task1]', '[task2]', ...]
WHERE unit_group = '[CODE]';

-- Step 2: Update EACH individual occupation
-- Occupation 1: [CODE] - [TITLE]
UPDATE occupations 
SET 
    description = '[occupation-specific description]',
    alternative_titles = ARRAY['[alt1]', '[alt2]'], -- or NULL if none
    specialisations = ARRAY['[spec1]', '[spec2]'] -- or NULL if none
WHERE code = '[6-digit code]';

-- Repeat for all occupations in the unit group

Important Rules:
- Escape single quotes by doubling them (e.g., it's → it''s)
- Use NULL if no alternative titles or specialisations
- Remove bullet markers (*, •) from all text
- Tasks array goes in the FIRST update (unit group level)
- Description, alt titles, and specialisations go in SECOND updates (individual level)
- Add the ABS source URL as a comment at the top for reference

ABS Source URL for this unit group:
[PASTE THE URL HERE]

Process this ANZSCO data:
[PASTE YOUR ANZSCO TEXT HERE]
```

---

## 🚀 DEPLOYMENT INFO

**Hosting:** Vercel (auto-deploys from git)
**Database:** Supabase (shared between dev and production)

**Important:**
- Database changes (SQL) are INSTANT on production
- Code changes (frontend) require `git push` to deploy
- Vercel rebuilds take ~2 minutes

**Deployment commands:**
```bash
git add .
git commit -m "your message"
git push
```

---

## 🎯 NEXT STEPS / TODO

### Immediate Priorities:
1. **Continue importing unit groups** - Target: Get to 50 occupations with full data
2. **Priority unit groups to process next:**
   - 2631 - Computer Network Professionals (3 occupations)
   - 2632 - ICT Support and Test Engineers (4 occupations)
   - 2633 - Telecommunications Engineering Professionals (2 occupations)

### Future Enhancements:
1. Build web scraper to automate unit group imports (currently manual)
2. Add search by description/tasks
3. Add filters (skill level, visa type, etc.)
4. State nomination information
5. Create comparison tool (compare multiple occupations)

---

## 🐛 KNOWN ISSUES

None currently! 🎉

---

## 📚 IMPORTANT PATTERNS & CONVENTIONS

### Frontend Patterns:
- Use Supabase client: `import { supabase } from '@/lib/supabase'`
- Fetch pattern:
  ```typescript
  const { data, error } = await supabase
    .from('occupations')
    .select('*')
    .eq('code', code)
  ```

### SQL Patterns:
- Always update BOTH v1.3 and v2022 versions
- Use ARRAY['item1', 'item2'] for arrays
- Escape quotes: `'it''s'` not `'it's'`

### Git Commit Messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `refactor:` for code improvements

---

## 🔗 KEY LINKS

**Official ANZSCO Source:**
https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022

**Reference Site (competitor analysis):**
https://anzscosearch.com/

**Supabase Dashboard:**
https://supabase.com/dashboard/project/eulnvbopvqilqyvyiqux

---

## 💡 SESSION CONTINUITY TIPS

When starting a new conversation:
1. Share this document with Claude
2. Mention which unit groups you want to process
3. Ask Claude to verify the current state by checking your live site
4. Continue with the proven workflow above

**Key phrase to use:** 
"I'm continuing work on the Australian Migration Hub project. I've uploaded the SESSION_HANDOFF.md document. Can you review it and help me continue where we left off?"

---

## 📊 METRICS

**As of Feb 7, 2026:**
- Database: 3,000+ occupations (codes only)
- Full data: 16 occupations across 3 unit groups
- Total unit groups in DB: ~364
- Completion: ~0.8% (16 out of ~2,000 total occupations)
- Frontend features: 90% complete
- Data import: 1% complete

**Time estimates:**
- Process 1 unit group with LLM: ~5 minutes
- Import and verify: ~2 minutes
- Total per unit group: ~7 minutes
- To complete all ~364 unit groups: ~42 hours of focused work

---

## 🎓 WHAT CLAUDE SHOULD KNOW

**Project philosophy:**
- Focus on user experience - make visa eligibility clear and simple
- Data accuracy is critical - always verify against official ABS sources
- Incremental progress - start with high-value occupations (tech, healthcare, trades)
- Documentation matters - future developers need context

**Current development style:**
- Manual data entry with LLM assistance (safe, accurate)
- Test locally first, then deploy
- Database changes are instant, code changes need git push
- Keep comprehensive documentation

---

**END OF HANDOFF DOCUMENT**
**Good luck with the next session! 🚀**
