# Session Context
**Last Updated:** February 26, 2026
**Project:** SkillIndex (skillindexau.com)
**Status:** Phase 4 in progress — Migration News backend live, tuning in progress

---

## Current Session (February 26, 2026)

### What Was Accomplished:

#### UI & Navigation ✅
- SkillIndex logo added to navbar (public/skillindex-logo.png)
- BETA badge beside logo
- Full navbar with Coming Soon pages (Migration News, Points Calculator, Visas)
- Mobile hamburger menu
- Footer with Privacy Policy link on all non-admin pages
- Privacy policy rebranded to SkillIndex throughout
- Research Journey timeline rebuilt — session grouping (30-min gap), noise collapsible

#### Migration News Feature 🚧
- news_feeds + news_articles tables created in Supabase
- Ingestion API with two-list keyword filter (INCLUDE + EXCLUDE)
- Vercel Cron daily 06:00 UTC
- Admin review queue at /admin/news (approve/reject)
- Public page hidden (PAGE_HIDDEN = true)
- Active feeds: Migration Alliance only (broad outlets removed — too noisy)
- First run: 71 found, 31 inserted, 40 skipped by filter
- Environment variables added: SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET

---

## Previous Sessions Summary

- Feb 22-23: Mobile UX fixes (tap targets, z-index, visa card redesign)
- Feb 17: Phase 3 RMA Dashboard complete
- Feb 15: Phase 2 Lead Generation complete
- Feb 14: Phase 1 Analytics complete
- Feb 6-12: Core platform, UI redesign, config-driven visa logic

---

## Active Priorities

### 🔥 Pre-Launch Blockers:
- [ ] Update Calendly URL in components/lead-capture/LeadForm.tsx
- [ ] Add contact email to app/privacy-policy/page.tsx
- [ ] Change ADMIN_PASSWORD to secure value
- [ ] Clear test leads from database

### 🚧 Migration News:
- [ ] Add Jobs and Skills Australia RSS feed
- [ ] Tune keyword filter with real examples
- [ ] Daily review at /admin/news
- [ ] Set PAGE_HIDDEN = false when ready

---

## Key Technical Details

### Migration News Architecture:
- Ingestion: Next.js API route (GET) — not Supabase Edge Function
- Scheduling: Vercel Cron (vercel.json) — daily 06:00 UTC
- Security: CRON_SECRET header check (Bearer skillindex-cron-2026)
- Filtering: INCLUDE keywords → then EXCLUDE keywords (two-pass)
- Storage: news_articles with status field (pending/approved/rejected)
- Public display: only status = 'approved' articles shown

### To Enable Migration News for Public:
```
app/migration-news/page.tsx — line 7
const PAGE_HIDDEN = false
git push
```

### Manual Ingestion Trigger:
```bash
curl -s "https://skillindexau.com/api/ingest-news" \
  -H "Authorization: Bearer skillindex-cron-2026"
```

### Managing News Feeds (Supabase SQL Editor):
```sql
-- View feeds
SELECT source_name, feed_url, is_active FROM news_feeds;

-- Add feed
INSERT INTO news_feeds (source_name, feed_url, is_active)
VALUES ('Name', 'https://url/rss', true);

-- Disable feed
UPDATE news_feeds SET is_active = false WHERE source_name = 'Name';
```

### Environment Variables (Vercel):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY  ← added Feb 26
ADMIN_PASSWORD
CRON_SECRET=skillindex-cron-2026
```

---

## Notes for Claude Code / New Chats

1. Project is SkillIndex, live at skillindexau.com
2. Never use "Australian Migration Hub" — old name, fully replaced
3. Migration News is PAGE_HIDDEN — do not remove without Frank's approval
4. news_feeds table controls RSS sources — managed via SQL
5. Follow CONVENTIONS.md for code style
6. Check TODO.md for priorities before starting work
7. Test locally before pushing: npm run dev

---

Last Updated: February 26, 2026
Phase 1 ✅ | Phase 2 ✅ | Phase 3 ✅ | Phase 4 🚧
