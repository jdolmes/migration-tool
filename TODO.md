# SkillIndex — TODO & Backlog
**Last Updated:** February 26, 2026
**Status:** Phase 4 in progress (Migration News)

---

## ✅ Completed

### Core Platform
- [x] Occupation search (3,261 ANZSCO occupations)
- [x] Visa eligibility checking (9,464 calculations)
- [x] Multi-catalogue support (v1.3, v2022)
- [x] ANZSCO Details (alternative titles, specialisations)
- [x] List membership indicators (MLTSSL, STSOL, ROL, CSOL)
- [x] Direct LIN links to legislation.gov.au
- [x] Info modals for special requirements
- [x] Config-driven visa logic

### UI/UX
- [x] Minimalist professional design system
- [x] SkillIndex logo in navbar
- [x] BETA badge
- [x] Coming Soon pages (Migration News, Points Calculator, Visas)
- [x] Mobile hamburger menu
- [x] Footer with Privacy Policy link
- [x] Single-column visa card layout (mobile-friendly)
- [x] Always-visible LIN links and list membership on cards
- [x] Mobile accordion tap targets fixed
- [x] Z-index overlap fixed (LeadWidget)

### Phase 1: Analytics ✅ (Feb 14)
- [x] analytics_events table
- [x] 6 event types (search, view, tab, LIN, info, related)
- [x] Session-based tracking
- [x] Geographic insights

### Phase 2: Lead Generation ✅ (Feb 15)
- [x] LeadWidget chat bubble
- [x] Auto-expand after 2 minutes
- [x] Lead qualification form
- [x] Supabase database integration
- [x] Calendly booking (URL placeholder — needs update)
- [x] Privacy Policy page (SkillIndex branded)

### Phase 3: RMA Dashboard ✅ (Feb 17)
- [x] Admin authentication (login, logout, route protection)
- [x] Lead inbox with status tabs
- [x] Lead detail page
- [x] Research Journey timeline (session-grouped, noise collapsible)
- [x] Research Summary stats
- [x] Timestamped comments system
- [x] Real intent scoring

### Phase 4: SEO Foundations ✅
- [x] Meta titles and descriptions on occupation pages
- [x] sitemap.xml (3,261 occupation pages)
- [x] robots.txt
- [x] Google Search Console connected
- [x] Custom domain skillindexau.com

### Phase 4: Migration News Backend ✅ (Feb 26)
- [x] news_feeds table (Supabase)
- [x] news_articles table with status field
- [x] Ingestion API (app/api/ingest-news/route.ts)
- [x] Two-list keyword filter (INCLUDE + EXCLUDE)
- [x] Vercel Cron (daily 06:00 UTC)
- [x] Admin review queue (/admin/news)
- [x] Public page (PAGE_HIDDEN = true while tuning)
- [x] SUPABASE_SERVICE_ROLE_KEY + CRON_SECRET added to Vercel

---

## 🔥 IMMEDIATE — Pre-Launch Blockers

- [ ] **Update Calendly URL** in components/lead-capture/LeadForm.tsx
- [ ] **Add contact email** to app/privacy-policy/page.tsx (currently australiamigrationhub@gmail.com)
- [ ] **Change ADMIN_PASSWORD** to secure value in Vercel
- [ ] **Clear test leads** from Supabase leads table

---

## 🚧 IN PROGRESS — Migration News Tuning

- [ ] Add Jobs and Skills Australia feed
- [ ] Find more quality Australian migration RSS sources
- [ ] Tune INCLUDE/EXCLUDE keyword lists with real article examples
- [ ] Daily review at /admin/news
- [ ] Set PAGE_HIDDEN = false when quality is good

---

## 📋 SHORT TERM (Next 2-4 Weeks)

- [ ] Calendly + Stripe integration ($150 AUD paid consultations)
- [ ] Email notifications for new leads (Resend)
- [ ] Find 1-2 beta RMA partners
- [ ] Structured data JSON-LD on occupation pages
- [ ] FAQ sections per occupation page
- [ ] ISR caching on occupation pages

---

## 📅 MEDIUM TERM (1-3 Months)

- [ ] Points Calculator (/points-calculator)
- [ ] Visa Guide (/visas)
- [ ] State nomination tracker
- [ ] Impact note admin interface for Migration News
- [ ] Individual RMA accounts (multi-user)
- [ ] A/B test lead widget messaging

---

## 🔭 LONG TERM (3-12 Months)

- [ ] Blog/news section
- [ ] Country-specific migration guides
- [ ] Occupation deep pages (salary, assessment, pathway)
- [ ] Visa comparison pages
- [ ] Mobile app (PWA)
- [ ] API for agents (white-label)
- [ ] Multi-language support
- [ ] EOI tracker

---

Last Updated: February 26, 2026
Phase 1 ✅ | Phase 2 ✅ | Phase 3 ✅ | Phase 4 🚧
Next: Pre-launch config + Migration News live
