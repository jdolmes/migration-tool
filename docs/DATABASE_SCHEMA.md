# Database Schema

## Tables Overview
All tables are in Supabase PostgreSQL database.

**Last Updated:** February 15, 2026

---

## Core Application Tables

### occupations
Stores all ANZSCO occupation codes and their metadata.

**Columns:**
- `id` (bigint, primary key) - Auto-increment ID
- `code` (varchar) - ANZSCO code (e.g., "261313")
- `catalogue_version` (varchar) - "v1.3", "v2022", or "OSCA"
- `principal_title` (varchar) - Occupation name (e.g., "Software Engineer")
- `skill_level` (int, nullable) - Skill level 1-5, or NULL
- `alternative_titles` (text[], nullable) - Array of alternative job titles (v2022 only)
- `specialisations` (text[], nullable) - Array of specialisation options (v2022 only)
- `major_group` (varchar, nullable) - ANZSCO major group code
- `major_group_title` (varchar, nullable) - Major group name
- `sub_major_group` (varchar, nullable) - Sub-major group code
- `sub_major_group_title` (varchar, nullable) - Sub-major group name
- `minor_group` (varchar, nullable) - Minor group code
- `minor_group_title` (varchar, nullable) - Minor group name
- `unit_group` (varchar, nullable) - Unit group code
- `unit_group_title` (varchar, nullable) - Unit group name
- `description` (text, nullable) - Occupation description
- `tasks` (text[], nullable) - Array of typical tasks
- `unit_group_description` (text, nullable) - Unit group description
- `indicative_skill_level` (text, nullable) - Skill level description
- `created_at` (timestamp) - Record creation time
- `updated_at` (timestamp) - Last update time

**Indexes:**
- Primary key on `id`
- Index on `code`
- Index on `catalogue_version`
- Index on `unit_group`

**Sample Data:**
```
code: 351112
catalogue_version: v2022
principal_title: Pastrycook
skill_level: 3
alternative_titles: ["Baker (Pastrycook)", "Cake Decorator", "Confectionery Baker"]
specialisations: ["Wedding Cake Decorator", "Pastry Chef"]
major_group: 3
unit_group: 3511
```

**Total Records:** 3,261 occupations across all catalogues
**Records with Alternative Titles:** 331 (v2022 only)
**Records with Specialisations:** 510 (v2022 only)

---

### visas
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

### occupation_lists
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

### visa_eligibility
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

## Analytics Tables (Phase 1 - Feb 14, 2026)

### analytics_events
Stores user behavior tracking events for analytics and lead scoring.

**Columns:**
- `id` (bigserial, primary key) - Auto-increment ID
- `session_id` (varchar) - User session identifier (from sessionStorage)
- `event_type` (varchar) - Type of event (see Event Types below)
- `occupation_code` (varchar, nullable) - Related ANZSCO code
- `visa_subclass` (varchar, nullable) - Related visa subclass
- `visa_stream` (varchar, nullable) - Related visa stream
- `user_country` (varchar(2), nullable) - ISO country code (cached per session)
- `user_region` (varchar, nullable) - Geographic region
- `search_term` (varchar, nullable) - Search query text
- `referrer` (varchar, nullable) - Traffic source URL
- `metadata` (jsonb, nullable) - Additional event data (flexible JSON)
- `created_at` (timestamptz, default NOW()) - Event timestamp

**Indexes:**
- `idx_events_type` on event_type
- `idx_events_session` on session_id
- `idx_events_created` on created_at
- `idx_events_country` on user_country

**Event Types:**
- `search_performed` - User searched for occupation
- `occupation_viewed` - User viewed occupation detail page
- `tab_switched` - User switched between Visa Options/ANZSCO Details tabs
- `lin_clicked` - User clicked legislative instrument link (HIGH intent signal)
- `info_button_clicked` - User clicked info button for complex visa requirements
- `related_occupation_clicked` - User explored related occupations (career pathway)

**Sample Data:**
```
id: 1
session_id: session_1771057702573_7oqoncimi
event_type: lin_clicked
occupation_code: 261313
visa_subclass: 482
visa_stream: Core Skills
user_country: MY
metadata: {"lin_code": "LIN 24/089", "is_eligible": true}
created_at: 2026-02-14 08:28:24
```

**Status:** ✅ LIVE - Actively collecting production data
**Total Events (as of Feb 15):** 50+ events captured

---

## Lead Generation Tables (Phase 2 - Feb 15, 2026)

### leads
Stores RMA lead submissions from contact form widget.

**Columns:**
- `id` (uuid, primary key) - Auto-generated UUID
- `session_id` (varchar) - Links to analytics_events for session tracking
- `name` (varchar) - Lead contact name
- `email` (varchar) - Lead email address
- `phone` (varchar, nullable) - Lead phone number (optional)
- `country` (varchar, nullable) - Country (legacy field, use location instead)
- `location` (varchar) - "onshore" or "offshore" (NEW - Feb 15)
- `current_visa` (varchar, nullable) - Current visa type if onshore (NEW - Feb 15)
- `timeline` (varchar) - Migration timeline preference (NEW - Feb 15)
- `message` (text, nullable) - Optional user message (NEW - Feb 15)
- `occupation_code` (varchar, nullable) - Occupation being researched (NEW - Feb 15)
- `intent_score` (integer, default 5) - Lead quality score 1-10 (NEW - Feb 15)
- `share_research` (boolean, default false) - Privacy consent checkbox
- `status` (varchar, default 'new') - Lead status
- `assigned_to` (uuid, nullable) - RMA user ID assigned to (future use)
- `created_at` (timestamptz, default NOW()) - Lead submission time
- `updated_at` (timestamptz, default NOW()) - Last modification time

**Timeline Values:**
- `"asap"` - Within 3 months (urgent)
- `"6-12mo"` - 6-12 months
- `"1-2yr"` - 1-2 years
- `"researching"` - Just researching options

**Current Visa Values** (only if location = "onshore"):
- `"Student"` - Student visa
- `"Work"` - Work visa
- `"Tourist"` - Tourist/visitor visa
- `"Permanent Resident"` - Already has PR
- `"Other"` - Other visa type

**Status Values:**
- `"new"` - Uncontacted lead (default)
- `"contacted"` - RMA has reached out
- `"converted"` - Became a paying client
- `"lost"` - Not converted (optional future status)

**Indexes:**
- `idx_leads_status` on status
- `idx_leads_created` on created_at
- `idx_leads_intent_score` on intent_score

**Sample Data:**
```
id: 550e8400-e29b-41d4-a716-446655440000
session_id: session_1771057702573_7oqoncimi
name: John Smith
email: john@example.com
phone: +61 400 123 456
location: onshore
current_visa: Student
timeline: asap
message: Graduating in 3 months, need work visa
occupation_code: 261313
intent_score: 8
status: new
created_at: 2026-02-15 14:17:14
```

**Status:** ✅ LIVE - Collecting production leads
**Total Leads (as of Feb 15):** 1 test lead (to be cleared before launch)

---

### lead_summaries
Stores comprehensive session summaries for each lead (Phase 3 - future use).

**Columns:**
- `id` (bigserial, primary key) - Auto-increment ID
- `lead_id` (uuid) - Foreign key to leads.id (ON DELETE CASCADE)
- `occupations_viewed` (jsonb) - Array of occupations with time spent
- `visas_interested` (jsonb) - Array of visas viewed/clicked
- `time_spent_seconds` (integer) - Total session duration
- `intent_score` (integer) - Calculated intent score 1-10 from session analytics
- `recommended_pathway` (text) - AI-suggested visa pathway
- `behavior_summary` (text) - Human-readable session summary for RMAs
- `created_at` (timestamptz, default NOW()) - Summary creation time

**Sample Data Format (occupations_viewed):**
```json
[
  {"code": "261313", "title": "Software Engineer", "time_seconds": 300},
  {"code": "261312", "title": "Developer Programmer", "time_seconds": 120}
]
```

**Sample Data Format (visas_interested):**
```json
[
  {"subclass": "482", "stream": "Core Skills", "lin_clicked": true},
  {"subclass": "186", "stream": "Direct Entry", "lin_clicked": false}
]
```

**Status:** Table created, not yet actively populated (Phase 3 feature)

---

## Table Relationships

### Core Application Flow:
```
occupations (code, catalogue_version)
    ↓
occupation_lists (anzsco_code, catalogue_version)
    ↓
visa_eligibility (anzsco_code, visa_id, catalogue_version)
    ↓
visas (visa_id)
```

### Analytics & Lead Generation Flow:
```
User Session
    ↓
analytics_events (session_id, occupation_code)
    ↓
leads (session_id, occupation_code)
    ↓
lead_summaries (lead_id) [future]
```

### Complete Data Flow:
```
occupations
    ↓
analytics_events (user views occupation)
    ↓
leads (user submits form)
    ↓
lead_summaries (RMA sees full session context)
```

---

## Common Query Patterns

### Core Application Queries

**Get occupation with all catalogue versions:**
```sql
SELECT * FROM occupations 
WHERE code = '261313'
ORDER BY catalogue_version;
```

**Get occupation with ANZSCO details (v2022 only):**
```sql
SELECT 
    code,
    principal_title,
    alternative_titles,
    specialisations,
    description,
    tasks
FROM occupations 
WHERE code = '351112' 
  AND catalogue_version = 'v2022';
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

### Analytics Queries

**Get all events for a session:**
```sql
SELECT * FROM analytics_events 
WHERE session_id = 'session_xyz' 
ORDER BY created_at;
```

**Count events by type:**
```sql
SELECT 
  event_type,
  COUNT(*) as count,
  COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_events
GROUP BY event_type
ORDER BY count DESC;
```

**Find high-intent sessions (multiple LIN clicks):**
```sql
SELECT 
  session_id,
  user_country,
  COUNT(*) as lin_clicks,
  MIN(created_at) as first_click,
  MAX(created_at) as last_click
FROM analytics_events
WHERE event_type = 'lin_clicked'
GROUP BY session_id, user_country
HAVING COUNT(*) >= 2
ORDER BY lin_clicks DESC;
```

**Geographic distribution:**
```sql
SELECT 
  user_country,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(*) as total_events
FROM analytics_events
WHERE user_country IS NOT NULL
GROUP BY user_country
ORDER BY sessions DESC;
```

---

### Lead Generation Queries

**Get high-intent new leads:**
```sql
SELECT * FROM leads 
WHERE intent_score >= 7 
  AND status = 'new'
ORDER BY created_at DESC;
```

**Get leads with session analytics:**
```sql
SELECT 
  l.*,
  COUNT(ae.id) as total_events,
  COUNT(CASE WHEN ae.event_type = 'lin_clicked' THEN 1 END) as lin_clicks,
  COUNT(CASE WHEN ae.event_type = 'info_button_clicked' THEN 1 END) as info_clicks,
  COUNT(DISTINCT ae.occupation_code) as occupations_viewed
FROM leads l
LEFT JOIN analytics_events ae ON l.session_id = ae.session_id
WHERE l.id = 'lead-uuid'
GROUP BY l.id;
```

**Calculate intent score from session behavior:**
```sql
SELECT 
  session_id,
  5 + -- Base score for form submission
  (COUNT(CASE WHEN event_type = 'lin_clicked' THEN 1 END) * 4) +
  (COUNT(CASE WHEN event_type = 'info_button_clicked' THEN 1 END) * 3) +
  (CASE WHEN COUNT(DISTINCT occupation_code) > 1 THEN 2 ELSE 0 END) +
  (CASE WHEN EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) > 600 THEN 2 ELSE 0 END)
  as calculated_intent_score
FROM analytics_events
WHERE session_id = 'session_xyz'
GROUP BY session_id;
```

**Dashboard query - Lead inbox:**
```sql
SELECT 
  l.id,
  l.created_at,
  l.name,
  l.email,
  l.location,
  l.timeline,
  l.intent_score,
  l.status,
  o.principal_title as occupation_title
FROM leads l
LEFT JOIN occupations o ON l.occupation_code = o.code AND o.catalogue_version = 'v2022'
WHERE l.status = 'new'
ORDER BY l.intent_score DESC, l.created_at DESC;
```

---

## Data Sources & Updates

### Alternative Titles & Specialisations
- **Source:** Australian Bureau of Statistics (ABS)
- **File:** ANZSCO 2022 Index of Principal Titles, Alternative Titles and Specialisations
- **URL:** https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022
- **Import Date:** February 6, 2026
- **Coverage:** v2022 occupations only (1,076 codes)
- **Records Updated:** 665 occupations (331 with alt titles, 510 with specialisations)

### Analytics & Leads
- **Phase 1 Deployed:** February 14, 2026
- **Phase 2 Deployed:** February 15, 2026
- **Real-time:** Data collected continuously from production users
- **Geolocation:** ipapi.co free tier (session-cached to prevent rate limits)

---

## Database Configuration

**Platform:** Supabase (PostgreSQL)  
**Dashboard:** https://supabase.com/dashboard/project/eulnvbopvqilqyvyiqux  
**Current Tier:** Free (500MB database, sufficient for 2+ years growth)  
**RLS (Row Level Security):** Disabled for public read-only data  

**Cost:** $0/month (free tier)  
**Upgrade Trigger:** ~100,000 events/month or >500MB storage

---

## Notes

- Alternative titles and specialisations are **only available for v2022** occupations
- v1.3 and OSCA occupations have these fields as NULL
- Analytics events use session-based country caching (one API call per session)
- Lead intent scores start at 5 (form submission) and can be enhanced with session analytics
- `lead_summaries` table created but not actively used until Phase 3 (RMA Dashboard)
- All timestamps use `timestamptz` for proper timezone handling

---

**Last Schema Update:** February 15, 2026  
**Total Tables:** 8 (4 core + 3 analytics/leads + 1 future)  
**Total Records:** ~13,700+ (occupations, visas, lists, eligibility, events, leads)
