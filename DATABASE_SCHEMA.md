# Database Schema

## Tables Overview
All tables are in Supabase PostgreSQL database.

---

## occupations
Stores all ANZSCO occupation codes and their metadata.

**Columns:**
- `id` (bigint, primary key) - Auto-increment ID
- `code` (varchar) - ANZSCO code (e.g., "261313")
- `catalogue_version` (varchar) - "v1.3", "v2022", or "OSCA"
- `principal_title` (varchar) - Occupation name (e.g., "Software Engineer")
- `skill_level` (int, nullable) - Skill level 1-5, or NULL
- `alternative_titles` (text[], nullable) - **NEW:** Array of alternative job titles
- `specialisations` (text[], nullable) - **NEW:** Array of specialisation options
- `created_at` (timestamp) - Record creation time
- `updated_at` (timestamp) - Last update time

**Indexes:**
- Primary key on `id`
- Index on `code`
- Index on `catalogue_version`

**Sample Data:**
```
code: 351112
catalogue_version: v2022
principal_title: Pastrycook
skill_level: 3
alternative_titles: ["Baker (Pastrycook)", "Cake Decorator", "Confectionery Baker"]
specialisations: ["Wedding Cake Decorator", "Pastry Chef"]
```

**Sample Data (v1.3, no ANZSCO details):**
```
code: 261313
catalogue_version: v1.3
principal_title: Software Engineer
skill_level: 1
alternative_titles: NULL
specialisations: NULL
```

**Total Records:** 3,261 occupations across all catalogues
**Records with Alternative Titles:** 331 (v2022 only)
**Records with Specialisations:** 510 (v2022 only)

---

## visas
Stores visa subclasses and their streams.

**Columns:**
- `visa_id` (int, primary key) - Unique visa identifier
- `subclass` (varchar) - Visa subclass (e.g., "189", "190", "482")
- `visa_name` (varchar) - Full name (e.g., "Skilled Independent")
- `stream` (varchar, nullable) - Stream name (e.g., "Core Skills", NULL)
- `category` (varchar) - "Permanent" or "Temporary"
- `catalogue_version` (varchar) - Which ANZSCO catalogue this visa uses
- `legislative_instrument` (varchar, nullable) - LIN reference (e.g., "LIN 19/051")
- `created_at` (timestamp)

**Sample Data:**
```
visa_id: 1
subclass: 189
visa_name: Skilled Independent
stream: NULL
category: Permanent
catalogue_version: v1.3
legislative_instrument: LIN 19/051
```

**Total Records:** 13 visa entries (some subclasses have multiple streams)

---

## occupation_lists
Tracks which occupations are on which skilled occupation lists.

**Columns:**
- `id` (bigint, primary key)
- `anzsco_code` (varchar) - Foreign key to occupations.code
- `catalogue_version` (varchar) - "v1.3" or "v2022"
- `list_name` (varchar) - "MLTSSL", "STSOL", "ROL", or "CSOL"
- `date_added` (date) - When occupation was added to list
- `date_removed` (date, nullable) - When removed (NULL if still active)
- `status` (varchar) - "active" or "removed"
- `created_at` (timestamp)

**List Definitions:**
- **MLTSSL** (Medium and Long-term Strategic Skills List) - v1.3, high-demand occupations
- **STSOL** (Short-term Skilled Occupation List) - v1.3, short-term needs
- **ROL** (Regional Occupation List) - v1.3, for regional visas
- **CSOL** (Core Skills Occupation List) - v2022, replaces all v1.3 lists

**Sample Data:**
```
anzsco_code: 261313
catalogue_version: v1.3
list_name: MLTSSL
date_added: 2019-03-11
date_removed: NULL
status: active
```

**Total Records:** 960 active list memberships

---

## visa_eligibility
Pre-calculated eligibility matrix linking occupations to visas.

**Columns:**
- `id` (bigint, primary key)
- `anzsco_code` (varchar) - Foreign key to occupations.code
- `visa_id` (int) - Foreign key to visas.visa_id
- `catalogue_version` (varchar) - Which catalogue version applies
- `is_eligible` (boolean) - TRUE if occupation is eligible for this visa
- `eligibility_reason` (text) - Explanation (e.g., "On MLTSSL - eligible for 189")
- `applicable_lists` (text[]) - Array of list names (e.g., ["MLTSSL", "STSOL"])
- `created_at` (timestamp)

**Sample Data:**
```
anzsco_code: 261313
visa_id: 1
catalogue_version: v1.3
is_eligible: true
eligibility_reason: On MLTSSL - eligible for 189 Skilled Independent
applicable_lists: ["MLTSSL"]
```

**Total Records:** 9,464 eligibility calculations

---

## Relationships
```
occupations (code, catalogue_version)
    ↓
occupation_lists (anzsco_code, catalogue_version)
    ↓
visa_eligibility (anzsco_code, visa_id, catalogue_version)
    ↓
visas (visa_id)
```

---

## Query Patterns

**Get occupation with all catalogue versions:**
```sql
SELECT * FROM occupations WHERE code = '261313';
```

**Get occupation with ANZSCO details (v2022 only):**
```sql
SELECT 
    code,
    principal_title,
    alternative_titles,
    specialisations
FROM occupations 
WHERE code = '351112' 
  AND catalogue_version = 'v2022';
```

**Get all occupations with alternative titles:**
```sql
SELECT 
    code,
    principal_title,
    alternative_titles
FROM occupations 
WHERE catalogue_version = 'v2022'
  AND alternative_titles IS NOT NULL;
```

**Get all visas for an occupation:**
```sql
SELECT ve.*, v.* 
FROM visa_eligibility ve
JOIN visas v ON ve.visa_id = v.visa_id
WHERE ve.anzsco_code = '261313'
  AND ve.catalogue_version = 'v1.3'
  AND ve.is_eligible = true;
```

**Check which lists an occupation is on:**
```sql
SELECT list_name 
FROM occupation_lists 
WHERE anzsco_code = '261313' 
  AND catalogue_version = 'v1.3'
  AND status = 'active';
```

---

## Data Sources

### Alternative Titles & Specialisations
- **Source:** Australian Bureau of Statistics (ABS)
- **File:** ANZSCO 2022 Index of Principal Titles, Alternative Titles and Specialisations (June 2023)
- **URL:** https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022
- **Import Date:** February 6, 2026
- **Coverage:** v2022 occupations only (1,076 codes)
- **Records Updated:** 665 occupations (331 with alt titles, 510 with specialisations)

### Notes
- Alternative titles and specialisations are **only available for v2022** occupations
- v1.3 and OSCA occupations have these fields as NULL
- Data is stored as PostgreSQL text[] arrays for efficient querying
- Link to full ANZSCO descriptions provided via ABS website

---

## Phase 3 Updates (February 17, 2026)

### leads table - New Columns Added
- `comments` (JSONB, default '[]') - Array of timestamped RMA comments
  - Structure: [{ id: string, text: string, timestamp: string }]
  - Added via: ALTER TABLE leads ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb

### analytics_events table - Used for Intent Scoring
The analytics_events table is now actively used to calculate real intent scores.
Key fields used:
- `session_id` - Links analytics events to leads
- `event_type` - Used to identify high-intent signals
- `metadata` - Used to detect ANZSCO Details tab views (metadata.to === 'anzsco-details')
- `occupation_code` - Used to count unique occupations explored
- `visa_subclass` - Used to identify visa interests

### Intent Score Calculation
Scores are calculated dynamically from session analytics events:

| Signal | Points |
|---|---|
| Form submitted (base) | +3 |
| LIN click (per click) | +2 |
| Related occupation explored (per unique) | +2 |
| Viewed ANZSCO Details tab | +2 |
| 3+ unique occupations viewed | +2 |
| 2 unique occupations viewed | +1 |
| Research time 15+ minutes | +4 |
| Research time 10-15 minutes | +2 |
| Research time 3-10 minutes | +1 |
| Timeline ASAP | +2 |
| Timeline 6-12 months | +1 |
| Location onshore | +1 |

Score thresholds:
- 15+ = Very High (purple)
- 10-14 = High (green)
- 5-9 = Medium (yellow)
- 1-4 = Low (gray)
