# Reference Data System - Quick Start Guide

**Get started with reference data (довідники) in 5 minutes!**

---

## Step 1: Create Your Reference Registry

```typescript
// src/config/references.ts
import { createReferenceRegistry, defineReference } from '@/components/DataTable/utils/referenceRegistry';

export const referenceRegistry = createReferenceRegistry({
  // Simple static list
  statuses: defineReference('/api/references/statuses', {
    cache: 'static',
  }),

  // Medium list with search
  departments: defineReference('/api/references/departments', {
    cache: { ttl: 10 * 60 * 1000 },
    search: { enabled: true, type: 'client', fields: ['name', 'code'] },
  }),

  // Large list with server search
  goods: defineReference('/api/references/goods', {
    cache: 'always-fresh',
    search: { enabled: true, type: 'server', minChars: 3 },
  }),
});
```

---

## Step 2: Initialize the Registry

```typescript
// src/App.tsx or main entry point
import { setReferenceRegistry } from '@/components/DataTable/cells/ReferenceCell';
import { referenceRegistry } from '@/config/references';

// Initialize once at app startup
setReferenceRegistry(referenceRegistry);
```

---

## Step 3: Use in Your Table

```typescript
// In your column definitions
import { ReferenceCell } from '@/components/DataTable/cells/ReferenceCell';

const columns: ColumnDef<Employee>[] = [
  {
    id: 'department',
    header: 'Department',
    accessorKey: 'departmentId',
    cell: (info) => (
      <ReferenceCell
        type="departments"  // ⭐ Reference the type from registry
        value={info.getValue()}
        onChange={(value) => handleChange(info.row.id, 'departmentId', value)}
      />
    ),
  },

  {
    id: 'status',
    header: 'Status',
    accessorKey: 'statusId',
    cell: (info) => (
      <ReferenceCell
        type="statuses"
        value={info.getValue()}
        onChange={(value) => handleChange(info.row.id, 'statusId', value)}
      />
    ),
  },
];
```

---

## Step 4: API Response Format

Your API should return data in one of these formats:

### Option A: Direct Array
```json
[
  { "id": 1, "name": "Engineering" },
  { "id": 2, "name": "Sales" }
]
```

### Option B: Object with Items
```json
{
  "items": [
    { "id": 1, "name": "Engineering" },
    { "id": 2, "name": "Sales" }
  ],
  "total": 50
}
```

---

## That's It!

You now have:
- ✅ Smart caching (no unnecessary API calls)
- ✅ Lazy loading (fetches only when dropdown opens)
- ✅ Search functionality (client or server-side)
- ✅ Loading and error states
- ✅ Consistent UX across all reference types

---

## Next Steps

- Read the full documentation: [REFERENCE_DATA_SYSTEM.md](./REFERENCE_DATA_SYSTEM.md)
- Customize cache strategies for your use cases
- Add server-side search for large lists
- Implement creation forms (Phase B - coming soon)

---

## Common Issues

### "Reference type not found in registry"
**Solution:** Make sure you called `setReferenceRegistry()` before using `<ReferenceCell>`

### Data not loading
**Solution:** Check that your API endpoint returns the correct format (array or { items: [] })

### Stale data
**Solution:** Adjust cache TTL or use 'always-fresh' strategy for frequently changing data

---

**Questions?** See [REFERENCE_DATA_SYSTEM.md](./REFERENCE_DATA_SYSTEM.md) for complete documentation.
