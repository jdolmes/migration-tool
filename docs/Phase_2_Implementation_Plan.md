# Phase 2: RMA Lead Generation - Implementation Plan
**Date:** February 14, 2026  
**Status:** Ready to Build  
**Estimated Time:** 12-15 hours  
**Monthly Cost:** $12 (Calendly)

---

## 🎯 OVERVIEW

Build a lead generation system that converts high-intent users into qualified leads for Registered Migration Agents (RMAs).

**Approved Design:** Option A - "Friendly Helper" nudge widget  
**Placement:** Bottom-right corner (non-invasive)  
**Tone:** Helpful conversational assistant  
**Integration:** Calendly for instant booking

---

## 📋 FEATURES TO BUILD

### 1. Lead Capture Widget (4-5 hours)

#### Component Structure:
```
components/
  lead-capture/
    LeadWidget.tsx          - Main widget component
    LeadForm.tsx            - Full form (expands from widget)
    SuccessScreen.tsx       - Post-submission with Calendly
    TriggerLogic.tsx        - Intent detection
```

#### Widget Design (Bottom-Right):
```
┌─────────────────────────────────────┐
│  💬 Need help with your research?   │
│                                     │
│  We noticed you're exploring:       │
│  • 482 Specialist visa              │
│  • Cyber Security occupations       │
│                                     │
│  Want to speak with an expert?      │
│  It's free and takes 30 minutes.    │
│                                     │
│  [Yes, Let's Talk] [Maybe Later] [✕]│
└─────────────────────────────────────┘
```

**Position:** 24px from bottom-right corner  
**Size:** 360px × 200px  
**Mobile:** Bottom drawer (swipe up)

#### Trigger Logic:

**High-Intent Triggers (show widget):**
1. After LIN click (3 second delay)
2. After 2+ info button clicks
3. After viewing 3+ occupations
4. After 5+ minutes on site + tab switches
5. Exit intent (mouse to close tab)

**Smart Behavior:**
- Only show once per session
- Wait for user pause (3 sec no scrolling)
- Don't interrupt active reading
- Auto-minimize after 10 seconds → `[💬 Chat]`
- Track dismissals (max 2 across sessions → stop showing)

#### Context-Aware Messages:

**Default:**
```
We noticed you're exploring:
• [Occupation name]
• [Visa pathway]
```

**After LIN click:**
```
We noticed you're exploring:
• Legal requirements (LIN documents)
• [Occupation name]
```

**After 482 Specialist:**
```
We noticed you're exploring:
• 482 Specialist visa (complex pathway)
• [Occupation name]
```

**After 3+ occupations:**
```
We noticed you're exploring:
• [Occupation 1]
• [Occupation 2]
• [Occupation 3]
```

---

### 2. Lead Capture Form (2-3 hours)

#### Form Fields (Minimal):
```
Required:
- Name
- Email
- Phone

Optional:
- Current Country (pre-filled from IP)
- Target Occupation (pre-filled from session)
- Best time to reach you (Morning/Afternoon/Evening)
- Brief message

[✓] I agree to the privacy policy
```

#### Form Expansion (from widget):
```
┌──────────────────────────────────────────┐
│  💬 Let's Connect                    [✕] │
├──────────────────────────────────────────┤
│  We'll match you with a migration expert │
│                                          │
│  Your Name                               │
│  [________________________]              │
│                                          │
│  Email                                   │
│  [________________________]              │
│                                          │
│  Phone (optional)                        │
│  [________________________]              │
│                                          │
│  Best time to reach you?                 │
│  ○ Morning  ○ Afternoon  ○ Evening       │
│                                          │
│  [✓] I agree to privacy policy           │
│                                          │
│  [Submit]                                │
│                                          │
│  🔒 Your info is secure                  │
└──────────────────────────────────────────┘
```

#### Validation:
- Name: Min 2 characters
- Email: Valid email format
- Phone: Optional but validate if provided
- Privacy: Must be checked

---

### 3. Success Screen with Calendly (1 hour)

#### After Form Submission:
```
┌──────────────────────────────────────────┐
│  ✅ Thanks! We'll be in touch soon       │
├──────────────────────────────────────────┤
│  Want to chat sooner?                    │
│                                          │
│  📅 Book your free 30-min consultation   │
│     [Pick a Time]  ← Calendly embed      │
│                                          │
│  Or we'll email you within 24 hours.     │
│                                          │
│  [Continue Researching]                  │
└──────────────────────────────────────────┘
```

**Calendly Integration:**
- Embed Calendly inline widget
- Event type: "Migration Consultation"
- Duration: 30 minutes
- Auto-attach session summary to booking

---

### 4. Lead Dashboard (6-8 hours)

#### RMA Login Page (`/admin/leads`):
```
┌─────────────────────────────┐
│  Australian Migration Hub   │
│     RMA Lead Dashboard      │
│                             │
│  Email:    [______________] │
│  Password: [______________] │
│                             │
│         [Login]             │
└─────────────────────────────┘
```

**Authentication:**
- Simple bcrypt password hash
- Store in `rma_users` table
- Session-based (no complex OAuth)
- Single account (shared password for team)

#### Lead Inbox:
```
┌────────────────────────────────────────────────────────┐
│ 🎯 Lead Dashboard                        [Logout]      │
├────────────────────────────────────────────────────────┤
│ Filter: [All] [New] [Contacted] [Converted]           │
├────────────────────────────────────────────────────────┤
│ Intent│ Date      │ Name        │ Country│ Occupation │
├───────┼───────────┼─────────────┼────────┼────────────┤
│ 🔥 9  │ Feb 14 5PM│ John Smith  │ 🇲🇾 MY │ Software E │ [View]
│ ⭐ 7  │ Feb 14 3PM│ Jane Doe    │ 🇯🇵 JP │ Constructn │ [View]
│ 🟡 5  │ Feb 13 9AM│ Mike J      │ 🇮🇳 IN │ Accountant │ [View]
└────────────────────────────────────────────────────────┘
```

**Features:**
- Sort by date, intent score
- Filter by status
- Search by name, email
- Color-coded intent (🔥 9-10, ⭐ 7-8, 🟡 5-6)

#### Lead Detail Page:
```
┌────────────────────────────────────────────────────────┐
│ ← Back to Leads                                        │
├────────────────────────────────────────────────────────┤
│ 🔥 High Intent Lead (9/10)              Status: New ▼ │
├────────────────────────────────────────────────────────┤
│ 👤 CONTACT INFORMATION                                 │
│ Name: John Smith                                       │
│ Email: john@example.com              📧 [Send Email]  │
│ Phone: +60 12-345-6789               📱 [WhatsApp]    │
│ Country: 🇲🇾 Malaysia                                  │
│ Submitted: Feb 14, 2026 5:23 PM                       │
│                                                        │
│ 📅 [Book Meeting with Lead] ← Calendly link           │
├────────────────────────────────────────────────────────┤
│ 🔍 SESSION RESEARCH (12 minutes)                       │
│                                                        │
│ Occupations Viewed:                                    │
│ • 261313: Software Engineer                            │
│ • 261315: Cyber Security Engineer                      │
│                                                        │
│ Visa Pathways Explored:                                │
│ • 482 TSS - Specialist Skills ⭐ (clicked info)        │
│ • 186 ENS - TRT Stream ⭐ (clicked info)               │
│ • Clicked LIN 24/089 ⭐ (legal research)               │
│                                                        │
│ High Intent Signals:                                   │
│ ✓ 2 info button clicks (complex case)                 │
│ ✓ 1 LIN click (legal research)                        │
│ ✓ 2 occupations viewed (career exploration)           │
│ ✓ 12 minute session (highly engaged)                  │
├────────────────────────────────────────────────────────┤
│ 📝 INTERNAL NOTES                                      │
│ [Add note...]                                          │
│                                                        │
│ Status: [New ▼] [Contacted ▼] [Converted ▼]           │
│ [Save]                                                 │
└────────────────────────────────────────────────────────┘
```

---

### 5. Session Summary Generation (2 hours)

#### Generate on Lead Submission:

**Input:** Session ID  
**Output:** Structured summary

```javascript
async function generateSessionSummary(sessionId: string) {
  // Get all events for this session
  const events = await supabase
    .from('analytics_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  // Extract key data
  const occupations = events
    .filter(e => e.event_type === 'occupation_viewed')
    .map(e => ({
      code: e.occupation_code,
      title: e.metadata.principal_title
    }))

  const linClicks = events.filter(e => e.event_type === 'lin_clicked')
  const infoClicks = events.filter(e => e.event_type === 'info_button_clicked')
  const searches = events.filter(e => e.event_type === 'search_performed')
  
  // Calculate intent score
  let score = 0
  if (linClicks.length > 0) score += 4
  if (infoClicks.length > 1) score += 3
  if (occupations.length > 2) score += 2
  // ... more scoring logic

  // Calculate duration
  const start = new Date(events[0].created_at)
  const end = new Date(events[events.length - 1].created_at)
  const duration = (end - start) / 1000 / 60 // minutes

  return {
    sessionId,
    occupations,
    visaPathways: [...linClicks, ...infoClicks],
    intentScore: score,
    sessionDuration: duration,
    country: events.find(e => e.user_country)?.user_country,
    // ... more summary data
  }
}
```

**Store in:** `lead_summaries` table

---

### 6. Calendly Integration (1-2 hours)

#### Setup:
1. Create Calendly account ($12/month Standard plan)
2. Create event type: "Migration Consultation"
3. Get embed URL
4. Set up webhook

#### Embed in Success Screen:
```tsx
<div 
  className="calendly-inline-widget" 
  data-url="https://calendly.com/your-account/migration-consultation"
  style={{height: '600px'}}
/>
<script src="https://assets.calendly.com/assets/external/widget.js"></script>
```

#### Webhook Handler (`/api/calendly-webhook`):
```typescript
export async function POST(req: Request) {
  const { payload } = await req.json()
  
  // Extract booking data
  const { email, event_uri, scheduled_event } = payload
  
  // Find lead by email
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('email', email)
    .single()
  
  if (lead) {
    // Update lead with booking info
    await supabase
      .from('leads')
      .update({
        status: 'meeting_booked',
        calendly_booking_id: event_uri,
        meeting_time: scheduled_event.start_time
      })
      .eq('id', lead.id)
    
    // Attach session summary to calendar event (via Calendly API)
    // ...
  }
  
  return new Response('OK', { status: 200 })
}
```

---

### 7. Email Notifications (2 hours) - OPTIONAL

#### Setup Resend:
```bash
npm install resend
```

#### Email Template:
```typescript
// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendLeadNotification(lead: Lead) {
  await resend.emails.send({
    from: 'leads@yourdomain.com',
    to: process.env.RMA_EMAIL,
    subject: `🔥 New High-Intent Lead - ${lead.occupation} (${lead.country})`,
    html: `
      <h2>New Lead Received</h2>
      <p><strong>Intent Score:</strong> ${lead.intentScore}/10</p>
      <p><strong>Name:</strong> ${lead.name}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      <p><strong>Country:</strong> ${lead.country}</p>
      
      <h3>Research Summary:</h3>
      <ul>
        <li>Occupations: ${lead.occupations.join(', ')}</li>
        <li>Visa Pathways: ${lead.visaPathways.join(', ')}</li>
        <li>Session Duration: ${lead.sessionDuration} minutes</li>
      </ul>
      
      <a href="${process.env.APP_URL}/admin/leads/${lead.id}">
        View Full Details
      </a>
    `
  })
}
```

**Toggle:** RMA can enable/disable in dashboard settings

---

### 8. Privacy Policy Page (1 hour)

#### Create `/privacy-policy` page:

**Content to include:**
- What data we collect (analytics, lead forms)
- How we use it (connect with RMAs, improve service)
- Who we share with (Registered Migration Agents)
- User rights (access, delete, unsubscribe)
- Cookie policy
- GDPR compliance (if EU users)
- Contact information

**Template:** Use privacy policy generator, customize for migration services

---

## 🗄️ DATABASE UPDATES

### New Tables:

```sql
-- RMA users (single account for now)
CREATE TABLE rma_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  calendly_link TEXT,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update leads table (add status tracking)
ALTER TABLE leads
ADD COLUMN status TEXT DEFAULT 'new',
ADD COLUMN notes TEXT,
ADD COLUMN calendly_booking_id TEXT,
ADD COLUMN calendly_event_uri TEXT,
ADD COLUMN meeting_time TIMESTAMP,
ADD COLUMN contacted_at TIMESTAMP,
ADD COLUMN converted_at TIMESTAMP,
ADD COLUMN intent_score INTEGER;

-- Track form dismissals
CREATE TABLE form_dismissals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  dismissed_at TIMESTAMP DEFAULT NOW(),
  dismissal_count INTEGER DEFAULT 1
);

CREATE INDEX idx_dismissals_session ON form_dismissals(session_id);
```

---

## 🎨 STYLING SPECS

### Widget Colors:
```css
Background: #ffffff
Border: 1px solid #e5e7eb
Shadow: 0 4px 12px rgba(0,0,0,0.1)
Text: #374151
Primary button: #2563eb
Secondary button: #6b7280
Close button: #9ca3af
```

### Animations:
```css
Slide in: 300ms ease-out
Auto-minimize: 200ms ease-in-out
Hover: 150ms ease
```

### Mobile Responsive:
```css
Desktop: Bottom-right widget (360px × 200px)
Tablet: Same as desktop
Mobile: Bottom drawer (full width, 40% height)
```

---

## 🧪 TESTING CHECKLIST

### Widget Testing:
- [ ] Appears on correct triggers
- [ ] Context-aware messages display correctly
- [ ] Dismissal works (X button, "Maybe Later")
- [ ] Auto-minimizes after 10 seconds
- [ ] Doesn't re-appear after dismissal
- [ ] Mobile drawer works correctly
- [ ] Doesn't cover important content

### Form Testing:
- [ ] Validation works (required fields)
- [ ] Email format validation
- [ ] Privacy checkbox required
- [ ] Submit creates lead in database
- [ ] Session data attached correctly
- [ ] Success screen appears

### Calendly Testing:
- [ ] Embed loads correctly
- [ ] Booking creates entry
- [ ] Webhook receives notification
- [ ] Lead status updates
- [ ] Session summary attached

### Dashboard Testing:
- [ ] Login works
- [ ] Lead list displays correctly
- [ ] Filtering works (status)
- [ ] Lead detail shows all data
- [ ] Status updates save
- [ ] Notes save correctly
- [ ] Logout works

### Email Testing (if enabled):
- [ ] Email sends on lead submission
- [ ] Content displays correctly
- [ ] Links work
- [ ] Unsubscribe works

---

## 📦 DEPLOYMENT CHECKLIST

### Environment Variables:
```env
# Calendly
NEXT_PUBLIC_CALENDLY_URL=your_calendly_url
CALENDLY_WEBHOOK_SECRET=webhook_secret

# Resend (optional)
RESEND_API_KEY=your_api_key
RMA_EMAIL=rma@yourdomain.com

# RMA Dashboard
RMA_PASSWORD_HASH=bcrypt_hash

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Pre-Deploy:
- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Privacy policy published
- [ ] Calendly account set up
- [ ] Resend account set up (if using)

### Post-Deploy:
- [ ] Test widget in production
- [ ] Submit test lead
- [ ] Verify webhook works
- [ ] Test RMA dashboard login
- [ ] Verify email notifications (if enabled)
- [ ] Check mobile responsiveness

---

## 🚀 IMPLEMENTATION TIMELINE

### Week 1 (12-15 hours):

**Day 1-2 (5 hours):**
- [ ] Lead capture widget component
- [ ] Trigger logic
- [ ] Context-aware messaging

**Day 3-4 (6 hours):**
- [ ] Lead capture form
- [ ] Form validation
- [ ] Success screen
- [ ] Database integration

**Day 5-6 (4 hours):**
- [ ] RMA dashboard (login + inbox)
- [ ] Lead detail view
- [ ] Status updates

**Day 7 (2 hours):**
- [ ] Calendly integration
- [ ] Email notifications (optional)
- [ ] Privacy policy page

**Day 8 (2 hours):**
- [ ] Testing end-to-end
- [ ] Mobile testing
- [ ] Deploy to production

---

## 💰 COST BREAKDOWN

**One-Time:**
- Development time: 12-15 hours (your time)

**Monthly:**
- Calendly Standard: $12/month
- Resend: $0/month (free tier: 3,000 emails/month)
- Supabase: $0/month (free tier sufficient)

**Total Monthly Cost: $12**

**Revenue Potential: $2,000-10,000/month**  
**ROI: 16,000%+**

---

## 🎯 SUCCESS METRICS

**Week 1 After Launch:**
- Widget impressions
- Form submissions
- Calendly bookings
- Lead quality (intent scores)

**Month 1:**
- Total leads generated
- Conversion rate (meeting → client)
- Revenue generated
- RMA feedback

**Optimize:**
- A/B test messaging
- Adjust trigger timing
- Refine intent scoring
- Improve form fields

---

## 📝 NEXT STEPS

**To start building:**
1. Create new branch: `git checkout -b feature/phase2-lead-gen`
2. Start with widget component
3. Build incrementally
4. Test frequently
5. Deploy when complete

**Or:**
1. Let analytics run 1 week
2. Analyze data
3. Build with insights

---

**END OF IMPLEMENTATION PLAN**  
**Status:** Ready to build  
**Next:** Start with lead capture widget component
