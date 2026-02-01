# Supabase API Reference

## Connection Setup
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## Common Query Patterns

### 1. Search Occupations
**Use Case:** Real-time occupation search by code or name
```typescript
const { data, error } = await supabase
  .from('occupations')
  .select('code, catalogue_version, principal_title, skill_level')
  .or(`principal_title.ilike.%${searchTerm}%,code.eq.${searchTerm}`)
  .neq('catalogue_version', 'OSCA')  // Filter out OSCA
  .order('code')
  .limit(40)
```

**Returns:**
```typescript
[
  {
    code: "261313",
    catalogue_version: "v1.3",
    principal_title: "Software Engineer",
    skill_level: 1
  },
  // ...
]
```

---

### 2. Get Occupation by Code
**Use Case:** Fetch all catalogue versions of an occupation
```typescript
const { data, error } = await supabase
  .from('occupations')
  .select('code, catalogue_version, principal_title, skill_level')
  .eq('code', '261313')
  .order('catalogue_version')
```

**Returns:** Array of occupation records (one per catalogue version)

---

### 3. Fetch Visa Eligibility with Join
**Use Case:** Get all eligible visas for an occupation
```typescript
const { data, error } = await supabase
  .from('visa_eligibility')
  .select(`
    visa_id,
    anzsco_code,
    catalogue_version,
    is_eligible,
    eligibility_reason,
    applicable_lists,
    visa:visas!inner(
      subclass,
      visa_name,
      stream,
      category,
      catalogue_version,
      legislative_instrument
    )
  `)
  .eq('anzsco_code', '261313')
  .eq('catalogue_version', 'v1.3')
  .eq('is_eligible', true)
```

**⚠️ IMPORTANT:** The `visa` field returns as an **array** due to Supabase join behavior!

**Must transform:**
```typescript
const transformedData = data.map(item => ({
  ...item,
  visa: Array.isArray(item.visa) ? item.visa[0] : item.visa
}))
```

**After transformation:**
```typescript
[
  {
    visa_id: 1,
    anzsco_code: "261313",
    catalogue_version: "v1.3",
    is_eligible: true,
    eligibility_reason: "On MLTSSL - eligible for 189",
    applicable_lists: ["MLTSSL"],
    visa: {  // Now a single object, not array
      subclass: "189",
      visa_name: "Skilled Independent",
      stream: null,
      category: "Permanent",
      catalogue_version: "v1.3",
      legislative_instrument: "LIN 19/051"
    }
  },
  // ...
]
```

---

### 4. Check Occupation List Membership
**Use Case:** See which lists an occupation is on
```typescript
const { data, error } = await supabase
  .from('occupation_lists')
  .select('list_name, catalogue_version, date_added, status')
  .eq('anzsco_code', '261313')
  .eq('catalogue_version', 'v1.3')
  .eq('status', 'active')
```

**Returns:**
```typescript
[
  {
    list_name: "MLTSSL",
    catalogue_version: "v1.3",
    date_added: "2019-03-11",
    status: "active"
  },
  {
    list_name: "STSOL",
    catalogue_version: "v1.3",
    date_added: "2019-03-11",
    status: "active"
  }
]
```

**Transform to Boolean Object:**
```typescript
const membership = {
  MLTSSL: false,
  STSOL: false,
  ROL: false,
  CSOL: false
}

data?.forEach(item => {
  membership[item.list_name] = true
})

// Result: { MLTSSL: true, STSOL: true, ROL: false, CSOL: false }
```

---

### 5. Get All Visas
**Use Case:** Fetch visa metadata for dropdown or reference
```typescript
const { data, error } = await supabase
  .from('visas')
  .select('*')
  .order('subclass')
```

---

## Query Operators

### Comparison
```typescript
.eq('column', value)         // Equal
.neq('column', value)        // Not equal
.gt('column', value)         // Greater than
.gte('column', value)        // Greater than or equal
.lt('column', value)         // Less than
.lte('column', value)        // Less than or equal
```

### Pattern Matching
```typescript
.ilike('column', '%value%')  // Case-insensitive LIKE
.like('column', '%value%')   // Case-sensitive LIKE
```

### Logical
```typescript
.or('column1.eq.value1,column2.eq.value2')  // OR condition
.in('column', ['val1', 'val2'])             // IN clause
.is('column', null)                          // IS NULL
```

### Ordering & Limiting
```typescript
.order('column', { ascending: true })  // Sort
.limit(10)                              // Limit results
.range(0, 9)                            // Pagination (0-indexed)
```

---

## Joins

### Inner Join (Recommended)
Use `!inner` to ensure matching records only:
```typescript
.select('*, visa:visas!inner(*)')
```

### Left Join (Default)
Returns NULL if no match:
```typescript
.select('*, visa:visas(*)')
```

---

## Error Handling

### Basic Pattern
```typescript
const { data, error } = await supabase
  .from('table')
  .select('*')

if (error) {
  console.error('Supabase error:', error)
  throw error
}

// Use data safely
```

### With Try-Catch
```typescript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*')
  
  if (error) throw error
  
  return data
} catch (err: any) {
  console.error('Error:', err.message)
  return null
}
```

---

## Performance Tips

### 1. Select Only Needed Columns
```typescript
// ❌ Bad - fetches everything
.select('*')

// ✅ Good - fetches only what you need
.select('code, principal_title, skill_level')
```

### 2. Use Indexes
Ensure indexed columns in WHERE clauses:
- `code` (indexed)
- `catalogue_version` (indexed)
- `anzsco_code` (indexed)

### 3. Limit Results
```typescript
.limit(20)  // Don't fetch thousands of rows
```

### 4. Use Pagination
```typescript
.range(0, 19)    // First page (0-19)
.range(20, 39)   // Second page (20-39)
```

---

## Real-World Examples

### Example 1: Search with Autocomplete
```typescript
export function useOccupationSearch(searchTerm: string) {
  useEffect(() => {
    if (searchTerm.length < 2) return
    
    const search = async () => {
      const { data } = await supabase
        .from('occupations')
        .select('code, principal_title, skill_level, catalogue_version')
        .or(`principal_title.ilike.%${searchTerm}%,code.eq.${searchTerm}`)
        .neq('catalogue_version', 'OSCA')
        .limit(20)
      
      // Group by code
      const grouped = data.reduce((acc, occ) => {
        if (!acc[occ.code]) {
          acc[occ.code] = {
            ...occ,
            catalogues: [occ.catalogue_version]
          }
        } else {
          acc[occ.code].catalogues.push(occ.catalogue_version)
        }
        return acc
      }, {})
      
      setResults(Object.values(grouped))
    }
    
    const timeoutId = setTimeout(search, 300)  // Debounce
    return () => clearTimeout(timeoutId)
  }, [searchTerm])
}
```

### Example 2: Fetch Occupation Detail
```typescript
async function fetchOccupationDetail(code: string) {
  // Get all catalogue versions
  const { data: occupations } = await supabase
    .from('occupations')
    .select('*')
    .eq('code', code)
  
  // Get visa eligibility for each version
  const eligibilityPromises = occupations.map(occ =>
    supabase
      .from('visa_eligibility')
      .select('*, visa:visas!inner(*)')
      .eq('anzsco_code', code)
      .eq('catalogue_version', occ.catalogue_version)
      .eq('is_eligible', true)
  )
  
  const results = await Promise.all(eligibilityPromises)
  
  // Flatten and transform
  const allVisas = results
    .flatMap(r => r.data || [])
    .map(item => ({
      ...item,
      visa: Array.isArray(item.visa) ? item.visa[0] : item.visa
    }))
  
  return { occupations, visas: allVisas }
}
```

---

## Common Errors & Solutions

### Error 1: "visa is not assignable to type"
**Cause:** Supabase returns visa as array in joins

**Solution:** Transform after query
```typescript
const transformed = data.map(item => ({
  ...item,
  visa: Array.isArray(item.visa) ? item.visa[0] : item.visa
}))
```

### Error 2: "Cannot read properties of undefined"
**Cause:** Data is null/undefined

**Solution:** Add null checks
```typescript
if (!data || data.length === 0) {
  throw new Error('No data found')
}
```

### Error 3: "PGRST116: The result contains 0 rows"
**Cause:** Using `.single()` when no rows exist

**Solution:** Check error code
```typescript
if (error && error.code !== 'PGRST116') {
  throw error
}
```

---

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://eulnvbopvqilqyvyiqux.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** Use `NEXT_PUBLIC_` prefix for client-side access.
