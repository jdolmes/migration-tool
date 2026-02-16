# Development Conventions

## Code Style

### TypeScript
- Use TypeScript for all new files
- Define interfaces for all data structures
- Use explicit types, avoid `any` except for Supabase responses
- Enable strict mode

### React/Next.js
- Use functional components (no class components)
- Use `'use client'` directive for components with hooks or interactivity
- Server components by default (no directive needed)
- Keep components small and focused

### Styling
- Use Tailwind CSS exclusively (no custom CSS files)
- Use utility classes inline
- Follow mobile-first approach
- Common patterns:
  - `className="flex items-center gap-2"` for horizontal layouts
  - `className="space-y-3"` for vertical spacing
  - `className="hover:bg-gray-50"` for hover states
  - `className="from-blue-600 via-indigo-600 to-purple-600"` for gradients

---

## Naming Conventions

### Files
- **Components:** PascalCase with `.tsx` extension
  - `OccupationCard.tsx`
  - `SearchBar.tsx`
  - `LeadWidget.tsx` (NEW)
  
- **Hooks:** camelCase with `use` prefix and `.ts` extension
  - `useOccupationSearch.ts`
  
- **Utilities:** camelCase with `.ts` extension
  - `supabase.ts`
  - `analytics.ts` (NEW)
  
- **Pages:** lowercase with `.tsx` extension (Next.js convention)
  - `page.tsx`
  - `[code]/page.tsx` (dynamic routes use brackets)

### Variables & Functions
- **Components:** PascalCase
  - `OccupationCard`
  - `LeadForm` (NEW)
  
- **Functions:** camelCase
  - `getCatalogueBadgeColor()`
  - `trackEvent()` (NEW)
  
- **Variables:** camelCase
  - `allVisaOptions`
  - `isLoading`
  - `sessionId` (NEW)
  
- **Constants:** UPPER_SNAKE_CASE
  - `SUPABASE_URL`

---

## Component Structure
```typescript
'use client' // Only if needed

import { ... } from '...'

interface ComponentProps {
  // Props definition
}

export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // State
  const [state, setState] = useState(...)
  
  // Effects
  useEffect(() => {
    // ...
  }, [dependencies])
  
  // Handlers
  const handleClick = () => {
    // ...
  }
  
  // Render helpers
  const renderSomething = () => {
    // ...
  }
  
  // Early returns
  if (loading) return <LoadingState />
  if (error) return <ErrorState />
  
  // Main render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

---

## Supabase Patterns

### Basic Query
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('columns')
  .eq('column', value)
```

### Join with Transform (IMPORTANT!)
```typescript
const { data, error } = await supabase
  .from('visa_eligibility')
  .select('*, visa:visas!inner(*)')  // !inner for inner join
  .eq('anzsco_code', code)

// Transform array to single object
const transformed = data.map(item => ({
  ...item,
  visa: Array.isArray(item.visa) ? item.visa[0] : item.visa
}))
```

### Insert Pattern (NEW - Phase 2)
```typescript
const { data, error } = await supabase
  .from('leads')
  .insert([{
    session_id: sessionId,
    name: formData.name,
    email: formData.email,
    // ... other fields
  }])
  .select()
```

### Search Pattern
```typescript
.or(`column1.ilike.%${term}%,column2.eq.${term}`)
```

---

## Analytics Patterns (NEW - Phase 1)

### Event Tracking
```typescript
import { trackEvent } from '@/lib/analytics'

// Track user action
trackEvent('event_type', {
  occupationCode: code,
  visaSubclass: subclass,
  metadata: { custom: 'data' }
})
```

### Event Types
- `search_performed` - Search queries
- `occupation_viewed` - Page views
- `tab_switched` - Tab navigation
- `lin_clicked` - Legislative instrument clicks (high intent)
- `info_button_clicked` - Complex visa interest
- `related_occupation_clicked` - Career exploration

### Session Management
```typescript
// Get session ID (automatically created if not exists)
const sessionId = sessionStorage.getItem('session_id') || 
  `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Store for session duration
sessionStorage.setItem('session_id', sessionId)
```

### Country Caching (Prevent Rate Limiting)
```typescript
// Check cache first
const cachedCountry = sessionStorage.getItem('user_country')
if (cachedCountry) return cachedCountry

// Only call API once per session
const response = await fetch('https://ipapi.co/json/')
const data = await response.json()
sessionStorage.setItem('user_country', data.country_code)
```

---

## Lead Generation Patterns (NEW - Phase 2)

### Widget Trigger Logic
```typescript
// Simple 2-minute timer (one-time auto-expand)
useEffect(() => {
  const hasExpanded = sessionStorage.getItem('lead_widget_auto_expanded')
  if (hasExpanded) return

  const timer = setTimeout(() => {
    setShowWidget(true)
    sessionStorage.setItem('lead_widget_auto_expanded', 'true')
  }, 120000) // 2 minutes

  return () => clearTimeout(timer)
}, [])
```

### Form Validation
```typescript
const [errors, setErrors] = useState<Record<string, string>>({})

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleSubmit = () => {
  const newErrors: Record<string, string> = {}
  
  if (!formData.name || formData.name.length < 2) {
    newErrors.name = 'Name is required (minimum 2 characters)'
  }
  
  if (!validateEmail(formData.email)) {
    newErrors.email = 'Please enter a valid email address'
  }
  
  setErrors(newErrors)
  
  if (Object.keys(newErrors).length === 0) {
    // Submit form
  }
}
```

### Conditional Fields
```typescript
// Only show if condition met
{formData.location === 'onshore' && (
  <div>
    <label>Current Visa</label>
    <select value={formData.currentVisa} onChange={...}>
      <option value="Student">Student</option>
      <option value="Work">Work</option>
      {/* ... */}
    </select>
  </div>
)}
```

---

## Privacy & Compliance Patterns (NEW)

### Consent Checkbox
```typescript
<label className="flex items-start gap-2">
  <input
    type="checkbox"
    checked={formData.privacyAccepted}
    onChange={(e) => setFormData({
      ...formData,
      privacyAccepted: e.target.checked
    })}
    className="mt-1"
  />
  <span className="text-sm text-gray-600">
    I agree to the{' '}
    <a 
      href="/privacy-policy" 
      target="_blank"
      className="text-blue-600 hover:underline"
    >
      Privacy Policy
    </a>
  </span>
</label>
```

### Data Minimization
```typescript
// Only collect what's needed
const leadData = {
  session_id: sessionId,
  name: formData.name,
  email: formData.email,
  phone: formData.phone || null, // Optional fields as null
  location: formData.location,
  current_visa: formData.location === 'onshore' ? formData.currentVisa : null,
  timeline: formData.timeline,
  message: formData.message || null,
  occupation_code: code,
  intent_score: 5, // Base score
  share_research: formData.privacyAccepted
}
```

---

## Git Workflow

### Commit Messages
Format: `Action: Description`

Examples:
- `Add: ANZSCO details tab`
- `Fix: TypeScript error in visa query`
- `Update: Search to filter OSCA occupations`
- `Refactor: Extract visa table into component`
- `feat: Complete Phase 2 lead generation system` (NEW - for major features)
- `docs: Update database schema with Phase 1 & 2 tables` (NEW - for documentation)

### Branch Strategy
- Work on `main` branch (small project)
- Push frequently
- Vercel auto-deploys on every push to main

### Before Pushing
```bash
# Test locally
npm run dev

# Build check
npm run build

# Commit and push
git add .
git commit -m "Action: Description"
git push
```

---

## Error Handling

### API Calls
```typescript
try {
  const { data, error } = await supabase.from('table').select()
  if (error) throw error
  // Use data
} catch (err: any) {
  console.error('Error:', err)
  setError(err.message)
}
```

### Component Error States
```typescript
if (error) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800">Error: {error}</p>
    </div>
  )
}
```

### Analytics Error Handling (Graceful Failure)
```typescript
// Analytics should NEVER break the app
export async function trackEvent(eventType: string, eventData: EventData) {
  try {
    // Track event
  } catch (error) {
    console.error('Analytics error (non-critical):', error)
    // Don't throw - fail silently
  }
}
```

---

## Known Issues & Workarounds

### Issue 1: Supabase Join Returns Array
**Problem:** When using `.select('*, visa:visas(*)')`, Supabase returns `visa` as an array.

**Solution:** Transform after query:
```typescript
const transformed = data.map(item => ({
  ...item,
  visa: Array.isArray(item.visa) ? item.visa[0] : item.visa
}))
```

### Issue 2: TypeScript Strict Mode
**Problem:** TypeScript complains about `any` types from Supabase.

**Solution:** Define explicit interfaces and cast:
```typescript
const data = result as VisaOption[]
```

### Issue 3: Environment Variables in Browser
**Problem:** Need Supabase keys in client components.

**Solution:** Use `NEXT_PUBLIC_` prefix:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Issue 4: IP Geolocation Rate Limiting (NEW)
**Problem:** ipapi.co free tier limits to 1,000 requests/day.

**Solution:** Cache country per session:
```typescript
const cachedCountry = sessionStorage.getItem('user_country')
if (cachedCountry) return cachedCountry // Use cached value
```

---

## Testing

### Local Testing
```bash
npm run dev
# Visit http://localhost:3000
# Test search, detail pages, all features
```

### Build Testing
```bash
npm run build
# Check for TypeScript errors
# Check for build errors
```

### Manual Test Checklist - Core Features
- [ ] Search for occupation by name
- [ ] Search for occupation by code
- [ ] Click occupation card → detail page loads
- [ ] Visa table displays correctly
- [ ] List indicators (✓/✗/—) show correctly
- [ ] LIN links open correct legislation
- [ ] Info buttons show modals
- [ ] Mobile responsive (test on small screen)

### Manual Test Checklist - Analytics & Leads (NEW)
- [ ] Chat bubble visible on occupation pages
- [ ] Widget auto-expands after 2 minutes
- [ ] Lead form validates required fields
- [ ] Conditional visa field (only shows if onshore)
- [ ] Form submission saves to database
- [ ] Success screen shows Calendly link
- [ ] Privacy policy link opens in new tab
- [ ] Check Supabase analytics_events table for events
- [ ] Check Supabase leads table for submissions

---

## Performance Guidelines

- Use `useState` for local state only
- Use `useEffect` with proper dependencies
- Debounce search input (300ms)
- Limit search results (20-40 items)
- Avoid unnecessary re-renders
- Use `React.memo()` for expensive components (if needed)
- **Cache sessionStorage reads** (don't read repeatedly)
- **Batch analytics events** if sending multiple at once (future optimization)

---

## Accessibility

- Use semantic HTML (`<button>`, `<a>`, `<table>`)
- Add `aria-label` for icon-only buttons
- Ensure color contrast meets WCAG AA
- Keyboard navigation works
- Screen reader friendly text
- **Modal focus trapping** (for lead form, info modals)
- **Form labels properly associated** with inputs

---

## Security Best Practices

### Client-Side Security
- Never store sensitive data in sessionStorage/localStorage
- Use HTTPS for all API calls
- Validate all user input
- Sanitize data before display (React does this by default)

### Password Handling (Phase 3 - RMA Dashboard)
```typescript
// NEVER store plain text passwords
import bcrypt from 'bcryptjs'

// Hash password before storing
const hashedPassword = await bcrypt.hash(plainPassword, 10)

// Verify password
const isValid = await bcrypt.compare(plainPassword, hashedPassword)
```

### Session Management (Phase 3)
```typescript
// Use HTTP-only cookies for auth
// Don't store tokens in localStorage
// Set reasonable session expiry (e.g., 24 hours)
```

---

## Component Organization

### Folder Structure
```
/components
  /search           # Search-related components
  /lead-capture     # Lead generation components (NEW)
  /admin           # RMA dashboard components (Phase 3)
```

### Component Naming
- Feature-based organization (not type-based)
- Components named after their purpose, not appearance
- Example: `LeadWidget` not `ChatBubble`

---

## Documentation Standards

### Code Comments
```typescript
// Comment for complex logic only
// Don't comment obvious things

// GOOD: Explains WHY
// Cache country to prevent API rate limiting (1000 requests/day limit)
const cachedCountry = sessionStorage.getItem('user_country')

// BAD: Explains WHAT (obvious from code)
// Set loading to true
setLoading(true)
```

### Component Documentation
```typescript
/**
 * LeadWidget - Chat bubble that captures qualified leads for RMAs
 * 
 * Features:
 * - Always visible in bottom-right corner
 * - Auto-expands after 2 minutes (once per session)
 * - Opens LeadForm when "Yes, Let's Talk" clicked
 * 
 * @param occupationCode - ANZSCO code being researched
 */
export default function LeadWidget({ occupationCode }: Props) {
```

---

## New Patterns for Phase 3 (RMA Dashboard)

### Protected Routes
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if accessing /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Verify session cookie
    const sessionCookie = request.cookies.get('admin_session')
    
    if (!sessionCookie) {
      // Redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return NextResponse.next()
}
```

### Simple Password Auth (MVP)
```typescript
// /app/admin/login/page.tsx
const handleLogin = async (password: string) => {
  // Compare with environment variable
  if (password === process.env.ADMIN_PASSWORD) {
    // Set session cookie
    document.cookie = 'admin_session=true; path=/admin; max-age=86400'
    router.push('/admin/leads')
  } else {
    setError('Invalid password')
  }
}
```

---

Last Updated: February 15, 2026  
Status: Includes Phase 1 & 2 patterns, Phase 3 ready
