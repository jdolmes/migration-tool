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

---

## Naming Conventions

### Files
- **Components:** PascalCase with `.tsx` extension
  - `OccupationCard.tsx`
  - `SearchBar.tsx`
  
- **Hooks:** camelCase with `use` prefix and `.ts` extension
  - `useOccupationSearch.ts`
  
- **Utilities:** camelCase with `.ts` extension
  - `supabase.ts`
  
- **Pages:** lowercase with `.tsx` extension (Next.js convention)
  - `page.tsx`
  - `[code]/page.tsx` (dynamic routes use brackets)

### Variables & Functions
- **Components:** PascalCase
  - `OccupationCard`
  
- **Functions:** camelCase
  - `getCatalogueBadgeColor()`
  
- **Variables:** camelCase
  - `allVisaOptions`
  - `isLoading`
  
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

### Search Pattern
```typescript
.or(`column1.ilike.%${term}%,column2.eq.${term}`)
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

### Manual Test Checklist
- [ ] Search for occupation by name
- [ ] Search for occupation by code
- [ ] Click occupation card → detail page loads
- [ ] Visa table displays correctly
- [ ] List indicators (✓/✗/—) show correctly
- [ ] LIN links open correct legislation
- [ ] Info buttons show modals
- [ ] Mobile responsive (test on small screen)

---

## Performance Guidelines

- Use `useState` for local state only
- Use `useEffect` with proper dependencies
- Debounce search input (300ms)
- Limit search results (20-40 items)
- Avoid unnecessary re-renders
- Use `React.memo()` for expensive components (if needed)

---

## Accessibility

- Use semantic HTML (`<button>`, `<a>`, `<table>`)
- Add `aria-label` for icon-only buttons
- Ensure color contrast meets WCAG AA
- Keyboard navigation works
- Screen reader friendly text
