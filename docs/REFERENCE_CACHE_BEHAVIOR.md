# Reference Data System - Cache Behavior Explained

## The Critical Question

**Q: When we have a reference column in a DataTable with 5000 rows, does it load the same reference list 5000 times?**

**A: NO! It loads ONCE and shares the cached data across ALL rows.** ✅

---

## How Cache Sharing Works

### Cache Key Structure

React Query (TanStack Query) caches data by **query key**:

```typescript
const queryKey = ['reference', config.type, searchQuery || null, filter || null];
```

**Example:**
```typescript
// Row 1 dropdown
queryKey = ['reference', 'departments', null, null]

// Row 2 dropdown
queryKey = ['reference', 'departments', null, null]  // ← SAME KEY!

// Row 5000 dropdown
queryKey = ['reference', 'departments', null, null]  // ← SAME KEY!
```

**Result:** All rows share the **same cache entry** because they have the **same query key**.

---

## Visual Flow Diagram

```
DataTable with 5000 rows:

Row 1: [Name] [Position] [Department ▼] ← User opens dropdown
  ↓
  → ReferenceCell calls useReferenceData('departments')
  → Query key: ['reference', 'departments', null, null]
  → Cache miss! Fetch from API → Store in cache
  ✅ Dropdown shows 8 departments

Row 2: [Name] [Position] [Department ▼] ← User opens dropdown
  ↓
  → ReferenceCell calls useReferenceData('departments')
  → Query key: ['reference', 'departments', null, null]
  → Cache HIT! Return cached data (no API call)
  ✅ Dropdown shows 8 departments (instant!)

Row 3-5000: Same cache HIT for all! 🚀
```

---

## Testing Cache Behavior

### Test 1: Verify Single API Call

**Steps:**
1. Open http://localhost:5173
2. Navigate to **"📊 DataTable Demo"** tab
3. Open DevTools (F12) → **Network** tab
4. Filter by "departments"
5. Open "Department (Ref)" dropdown on **Row 1**
6. **Check Network:** 1 request to `/api/references/departments`
7. Open "Department (Ref)" dropdown on **Row 2**
8. **Check Network:** 0 new requests (uses cache!)
9. Open dropdowns on **Rows 3, 4, 5... 100...**
10. **Check Network:** Still 0 new requests

**Expected Result:** Only **1 API call** regardless of how many rows you interact with.

---

### Test 2: Cache Persists Across Component Unmount

With virtualization enabled, row components mount/unmount as you scroll:

**Steps:**
1. Open "Department (Ref)" dropdown on **Row 1** (visible)
2. Scroll down to **Row 500** (Row 1 is now unmounted)
3. Open "Department (Ref)" dropdown on **Row 500**
4. **Check Network:** 0 new requests (cache still active!)
5. Scroll back to **Row 1** (remounted)
6. Open "Department (Ref)" dropdown again
7. **Check Network:** 0 new requests (cache persists!)

**Expected Result:** Cache survives component mount/unmount cycles.

---

### Test 3: Search Creates New Cache Keys

When searching, a new cache key is created per search query:

**Steps:**
1. Open "Department (Ref)" dropdown on Row 1
2. Type "eng" in search box
3. **Check Network:** For server-side search, new request with `?search=eng`
4. Open dropdown on Row 2, type "eng"
5. **Check Network:** 0 new requests (cache hit for "eng" query)

**Cache Keys:**
```typescript
// No search
['reference', 'departments', null, null]

// Search "eng" (server-side)
['reference', 'departments', 'eng', null]  // ← Different key!

// Search "sal" (server-side)
['reference', 'departments', 'sal', null]  // ← Different key!
```

**Expected Result:** Each search query has its own cache, but still shared across all rows.

---

## Cache Invalidation

When you create a new department, the cache is invalidated for ALL rows:

```typescript
// After creating new department:
queryClient.invalidateQueries({ queryKey: ['reference', 'departments'] });
```

**Result:**
- Next time ANY row opens the departments dropdown → Fresh data fetched
- All rows see the newly created department
- No manual refresh needed

---

## Performance Comparison

### Without Caching (Naive Approach)
```
5000 rows × 1 API call per dropdown open = 5000 API calls
Assume 200ms per call = 1000 seconds (16 minutes!) 🐌
```

### With React Query Caching (Our Approach)
```
5000 rows × 0.2 cache lookups = 1 API call + 4999 instant returns
Total time = 200ms for first call + ~0ms for rest = 200ms 🚀
```

**Performance Gain:** ~5000x faster!

---

## Why This Design Works

### 1. Reference Data is Shared by Nature
- "Departments" list is the same for ALL employees
- "Categories" list is the same for ALL products
- "Statuses" list is the same for ALL orders

### 2. Cache Scope is Global
- React Query's cache is at the **QueryClient** level
- QueryClient is created once in `main.tsx`
- All components in the app share the same QueryClient

### 3. Query Keys are Deterministic
- Same input (type, search, filter) → Same query key
- Same query key → Same cache entry
- Different rows calling useReferenceData('departments') → Same key!

---

## Edge Cases and Gotchas

### ✅ Works With:
- **Virtualization** - Components mount/unmount, cache persists
- **Pagination** - Data changes, but cache is per reference type, not per page
- **Infinite Scroll** - New rows load, they use the same cache
- **Multiple Tables** - All tables on the page share the cache
- **Tab Switching** - Cache survives tab switches (configurable TTL)

### ⚠️ Watch Out For:
- **Different Search Queries** - Each query has its own cache entry
- **Different Filters** - Each filter combination has its own cache entry
- **Stale Data** - Use appropriate cache strategy (static vs ttl vs always-fresh)

---

## Cache Strategies Explained

### Static Cache (Never Expires)
```typescript
defineReference('/api/references/statuses', {
  cache: 'static',
})
```
- **Use case:** Data NEVER changes (e.g., countries, statuses)
- **Behavior:** Fetch once, cache forever
- **API calls:** 1 per session

### TTL Cache (Time-To-Live)
```typescript
defineReference('/api/references/departments', {
  cache: { ttl: 10 * 60 * 1000 }, // 10 minutes
})
```
- **Use case:** Data changes occasionally
- **Behavior:** Fetch once, cache for 10 minutes, then refetch
- **API calls:** 1 per 10 minutes

### Always Fresh Cache
```typescript
defineReference('/api/references/products', {
  cache: 'always-fresh', // 2 minutes + refetch on focus
})
```
- **Use case:** Data changes frequently
- **Behavior:** Short TTL + refetch when tab gains focus
- **API calls:** Every 2 minutes or on tab focus

---

## Console Verification

Open DevTools Console and look for React Query logs:

```
useReferenceData: fetching departments (cache miss)
→ API call to /api/references/departments
→ Cached with key: ['reference', 'departments', null, null]

useReferenceData: returning departments (cache hit)
→ No API call (instant return from cache)
```

You can also use React Query DevTools (optional) to visualize cache:

```bash
npm install @tanstack/react-query-devtools
```

---

## Summary

**Q: Does it load data for every row?**
**A:** No. It loads ONCE per reference type, not per row.

**Q: How many API calls for 5000 rows?**
**A:** 1 API call (first dropdown open), then 4999 cache hits.

**Q: Does virtualization break caching?**
**A:** No. Cache is global, not tied to component lifecycle.

**Q: What if data changes?**
**A:** Use appropriate cache strategy (TTL or always-fresh) or manual refresh button.

**Q: Can I see the cache in action?**
**A:** Yes! Open Network tab and watch for API calls (should be minimal).

---

## Real-World Example

```typescript
// Scenario: Employee table with 10,000 rows
// Each row has a "Department" dropdown

// Traditional approach (without caching):
10,000 rows × 200ms per API call = 2000 seconds = 33 minutes ❌

// Our approach (with React Query caching):
1 API call (200ms) + 9,999 instant cache hits (0ms) = 200ms ✅

// Savings: 99.99% faster! 🚀
```

---

## Further Reading

- [React Query Caching Documentation](https://tanstack.com/query/latest/docs/react/guides/caching)
- [REFERENCE_DATA_SYSTEM.md](./REFERENCE_DATA_SYSTEM.md) - Complete system guide
- [REFERENCE_TESTING_GUIDE.md](./REFERENCE_TESTING_GUIDE.md) - Testing instructions

---

**Last Updated:** 2025-10-30
**Phase:** 11 (ERP Integration Features)
**Status:** Production-ready ✅
