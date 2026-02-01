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
- `created_at` (timestamp) - Record creation time

**Indexes:**
- Primary key on `id`
- Index on `code`
- Index on `catalogue_version`

**Sample Data:**
```
code: 261313
catalogue_version: v1.3
principal_title: Software Engineer
skill_level: 1
```

**Total Records:** 3,261 occupations across all catalogues

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
