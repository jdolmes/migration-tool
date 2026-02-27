# SkillIndex - Session Handoff Document
**Last Updated:** February 26, 2026
**Status:** Phase 4 IN PROGRESS 🚧 — Migration News feature being built

---

## 🎯 PROJECT OVERVIEW

**Project Name:** SkillIndex
**Live URL:** https://skillindexau.com
**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase (PostgreSQL), Vercel
**GitHub:** https://github.com/jdolmes/migration-tool
**Local Dev:** cd ~/Projects/migration-tool-frontend && npm run dev
**Admin Dashboard:** /admin/login (password: in .env.local)
**Business:** Silaga Migration Advisory (Frank, MARN 2619271)

---

## 🚀 WHAT'S DEPLOYED

### Phase 1: Analytics System ✅ (Feb 14)
- Full behavioral tracking (6 event types)
- Session-based analytics
- Geographic insights
- High-intent signal detection

### Phase 2: Lead Generation ✅ (Feb 15)
- Always-visible chat widget (bottom-right)
- Auto-expand after 2 minutes
- Full lead qualification form
- Supabase database integration
- Calendly instant booking (URL needs updating)
- Privacy compliance

### Phase 3: RMA Dashboard ✅ (Feb 17)
- Secure admin authentication
- Lead inbox with status tabs
- Lead detail with research journey timeline
- Session-grouped timeline (30-min gap = new session)
- Timestamped comments system
- Real intent scoring
- Research summary with analytics

### Phase 4: UI & Navigation ✅ (Feb 24-25)
- SkillIndex logo (public/skillindex-logo.png) in navbar
- BETA badge beside logo
- Full navbar with Coming Soon pages:
  - /migration-news (hidden, PAGE_HIDDEN = true — in progress)
  - /points-calculator (Coming Soon)
  - /visas (Coming Soon)
- Mobile hamburger menu
- Footer with Privacy Policy link
- Privacy policy updated to SkillIndex branding
- Research Journey timeline rebuilt (session grouping, noise collapsible)

### Phase 4: Migration News ✅ (Feb 26 — backend deployed, tuning in progress)
- news_feeds table (configurable RSS sources)
- news_articles table (with status: pending/approved/rejected)
- app/api/ingest-news/route.ts — RSS ingestion with keyword filtering
- Two-list keyword filter (INCLUDE + EXCLUDE keywords)
- vercel.json cron job (daily 06:00 UTC)
- app/admin/news/page.tsx — admin review queue (approve/reject)
- Public /migration-news page (shows approved articles only)
- PAGE_HIDDEN = true (hidden from users while tuning)

---

## 📊 CURRENT STATUS

### ✅ All Systems Live:
- Occupation search (3,261 ANZSCO occupations)
- Visa eligibility checking (9,464 calculations)
- Analytics tracking (6 event types)
- Lead generation widget
- Lead capture form
- RMA Dashboard (login, inbox, detail)
- Research journey timeline (session-grouped)
- Real intent scoring
- Navbar with logo + Coming Soon pages
- Footer with privacy policy
- Migration News backend (pending tuning)

### ⚠️ Needs Configuration (Pre-Launch Blockers):
- Calendly URL (placeholder in components/lead-capture/LeadForm.tsx)
- Contact email in app/privacy-policy/page.tsx (still australiamigrationhub@gmail.com)
- ADMIN_PASSWORD — change before sharing with RMAs
- Clear test leads from database

### 🚧 Migration News — Active Work:
- PAGE_HIDDEN = true (set to false when ready to launch)
- Current active feed: Migration Alliance only
- Keyword filter tuned but needs real-world testing
- Admin review queue built and working
- Next: Add Jobs and Skills Australia feed, tune keyword lists
- To enable: change PAGE_HIDDEN = false in app/migration-news/page.tsx

---

## 🗄️ DATABASE

**Supabase:** https://supabase.com/dashboard/project/eulnvbopvqilqyvyiqux

### Tables:
- occupations (3,261 records)
- visas (13 records)
- occupation_lists (960 records)
- visa_eligibility (9,464 records)
- analytics_events (growing — 6 event types)
- leads (growing — extended schema with comments JSONB)
- lead_summaries (ready for future use)
- news_feeds (configurable RSS sources)
- news_articles (status: pending/approved/rejected)

### Key Relationships:
- leads.session_id === analytics_events.session_id (links lead to research journey)
- news_articles.status controls public visibility (only 'approved' shown)

### Managing News Feeds:
```sql
-- View current feeds
SELECT source_name, feed_url, is_active FROM news_feeds;

-- Add a feed
INSERT INTO news_feeds (source_name, feed_url, is_active)
VALUES ('Source Name', 'https://feed-url/rss', true);

-- Disable a feed
UPDATE news_feeds SET is_active = false WHERE source_name = 'Source Name';

-- Delete a feed
DELETE FROM news_feeds WHERE source_name = 'Source Name';
```

---

## 🎯 INTENT SCORING SYSTEM

Scores calculated dynamically from analytics_events:

| Signal | Points |
|---|---|
| Form submitted | +3 |
| LIN click (each) | +2 |
| Related occupation (each) | +2 |
| ANZSCO Details tab | +2 |
| 3+ occupations viewed | +2 |
| 2 occupations viewed | +1 |
| 15+ min research | +4 |
| 10-15 min research | +2 |
| 3-10 min research | +1 |
| Timeline ASAP | +2 |
| Timeline 6-12mo | +1 |
| Onshore location | +1 |

Thresholds: 15+=Very High | 10-14=High | 5-9=Medium | 1-4=Low

---

## 🔑 ENVIRONMENT VARIABLES

```
NEXT_PUBLIC_SUPABASE_URL=https://eulnvbopvqilqyvyiqux.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[in Vercel]
SUPABASE_SERVICE_ROLE_KEY=[in Vercel — added Feb 26]
ADMIN_PASSWORD=[in Vercel — change before RMA launch]
CRON_SECRET=skillindex-cron-2026
```

---

## 📋 NEXT PRIORITIES

### Before Showing to RMAs (Urgent):
1. Update Calendly URL in components/lead-capture/LeadForm.tsx
2. Add real contact email to app/privacy-policy/page.tsx
3. Change ADMIN_PASSWORD to secure password
4. Clear test leads from database

### Migration News (Active):
1. Add Jobs and Skills Australia feed: https://www.jobsandskills.gov.au/news_rss
2. Continue tuning keyword filter (share missed articles with Claude for analysis)
3. Review articles daily at /admin/news
4. When quality is good — set PAGE_HIDDEN = false and push

### Short Term:
1. Calendly + Stripe integration ($150 AUD paid consultations)
2. Email notifications for new leads (Resend)
3. Find 1-2 beta RMA partners

---

## 🔑 QUICK REFERENCE

### Key URLs:
- Live site: https://skillindexau.com
- Admin: https://skillindexau.com/admin/login
- Admin News Queue: https://skillindexau.com/admin/news
- Supabase: https://supabase.com/dashboard/project/eulnvbopvqilqyvyiqux
- Vercel: https://vercel.com/jdolmes-projects/migration-tool
- GitHub: https://github.com/jdolmes/migration-tool

### Key Files:
- middleware.ts — Route protection (ROOT directory)
- app/admin/login/page.tsx — Login form
- app/admin/layout.tsx — Admin navigation
- app/admin/leads/page.tsx — Lead inbox
- app/admin/leads/[id]/page.tsx — Lead detail + research journey
- app/admin/news/page.tsx — Migration news review queue
- app/api/ingest-news/route.ts — RSS ingestion + keyword filter
- app/migration-news/page.tsx — Public news page (PAGE_HIDDEN flag line 7)
- vercel.json — Cron job config (daily 06:00 UTC)
- lib/admin.ts — Admin queries and helpers
- lib/analytics.ts — Event tracking
- components/Navbar.tsx — Navigation with logo + Coming Soon flags
- components/Footer.tsx — Footer with privacy policy link
- components/lead-capture/LeadWidget.tsx — Chat bubble
- components/lead-capture/LeadForm.tsx — Lead form (update Calendly URL)
- public/skillindex-logo.png — SkillIndex logo

### Triggering Manual News Ingestion:
```bash
curl -s "https://skillindexau.com/api/ingest-news" \
  -H "Authorization: Bearer skillindex-cron-2026"
```

---

**Version: 7.0 (Feb 26, 2026)**
**Status:** Platform live ✅ | Migration News backend deployed, tuning in progress 🚧
**Next:** Pre-launch config + Migration News tuning + RMA outreach
