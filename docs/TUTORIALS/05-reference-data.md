# Reference Data Tutorial

Learn how to use REFERENCE cell type to create dropdown columns that load data from APIs with caching, searching, and inline creation.

## Table of Contents

1. [What is Reference Data?](#what-is-reference-data)
2. [Basic Reference Column](#basic-reference-column)
3. [Reference Data API](#reference-data-api)
4. [Caching with TanStack Query](#caching-with-tanstack-query)
5. [Searchable Dropdowns](#searchable-dropdowns)
6. [Inline Creation](#inline-creation)
7. [Multi-Tenancy](#multi-tenancy)
8. [Performance Optimization](#performance-optimization)

## What is Reference Data?

Reference data is data stored in separate tables (departments, statuses, categories, etc.) that you reference from your main table via foreign keys.

**Example:**

```
Employees Table:          Departments Table:
+----+------+----------+   +------+-------------+
| id | name | dept_id  |   | id   | name        |
+----+------+----------+   +------+-------------+
| 1  | John | dept-1   |   | dept-1 | Engineering |
| 2  | Jane | dept-2   |   | dept-2 | Product     |
+----+------+----------+   | dept-3 | Sales       |
                            +------+-------------+
```

Instead of storing "Engineering" in every employee row, you store `dept-1` and fetch the label from the departments table.

**Benefits:**
- Consistent data (single source of truth)
- Easy bulk updates (change department name once)
- Smaller main table size
- Referential integrity

## Basic Reference Column

### 1. Define Column

```typescript
import { CellType } from '@/components/DataTable/types/cell.types';

const columns = [
  {
    accessorKey: 'departmentId',
    header: 'Department',
    cellType: CellType.REFERENCE,
    cellOptions: {
      referenceType: 'department',  // API endpoint: /api/references/departments
      labelField: 'name',            // Field to display
      valueField: 'id',              // Field to store
    },
  },
];
```

### 2. Setup API Hook

```typescript
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

export function useReferenceData(referenceType: string, search?: string) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['reference', referenceType, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('active', 'true');

      const response = await fetch(
        `/api/references/${referenceType}?${params}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch reference data');
      const json = await response.json();
      return json.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
```

### 3. Use in Table

```typescript
export function EmployeeTable() {
  return (
    <DataTable
      mode="server"
      data={data}
      columns={columns}
      editable
    />
  );
}
```

The table will automatically:
- Load department options from API
- Display department names in cells
- Show dropdown in edit mode
- Save department IDs to backend

## Reference Data API

### Backend API Structure

Your backend should implement these endpoints:

```typescript
// GET /api/references/departments
// Returns list of departments with pagination and search

app.get('/api/references/departments', authenticate, async (req, res) => {
  const { search, active, page = 1, pageSize = 100 } = req.query;

  const where: any = {
    organizationId: req.user.organizationId,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (active === 'true') {
    where.active = true;
  }

  const [data, totalCount] = await Promise.all([
    prisma.department.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: 'asc' },
    }),
    prisma.department.count({ where }),
  ]);

  res.json({
    success: true,
    data: { data, totalCount, page, pageSize },
  });
});

// POST /api/references/departments - Create new
// PUT /api/references/departments/:id - Update
// DELETE /api/references/departments/:id - Delete
```

### Response Format

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "dept-1",
        "name": "Engineering",
        "code": "ENG",
        "active": true,
        "createdAt": "2024-01-15T10:00:00Z"
      },
      {
        "id": "dept-2",
        "name": "Product",
        "code": "PRD",
        "active": true,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "totalCount": 25,
    "page": 1,
    "pageSize": 100
  }
}
```

## Caching with TanStack Query

TanStack Query automatically caches reference data to minimize API calls.

### Basic Caching

```typescript
export function useReferenceData(referenceType: string) {
  return useQuery({
    queryKey: ['reference', referenceType],
    queryFn: fetchReferenceData,
    staleTime: 5 * 60 * 1000,      // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000,     // Keep in cache for 10 minutes
  });
}
```

### Cache Behavior

**First Load:**
1. User opens table
2. Query fetches departments from API
3. Data cached in memory

**Subsequent Loads:**
1. User edits another row
2. Query returns cached data (no API call)
3. Dropdown shows instantly

**After 5 Minutes:**
1. Data marked as stale
2. Query refetches in background
3. UI updates if data changed

### Invalidate Cache on Mutations

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DepartmentCreate) => {
      const response = await fetch('/api/references/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ data }),
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all department queries
      queryClient.invalidateQueries({ queryKey: ['reference', 'departments'] });
    },
  });
}
```

When a new department is created:
1. POST request creates department
2. Cache is invalidated
3. All tables refetch department list
4. New department appears in dropdowns

## Searchable Dropdowns

Enable search for large reference lists:

```typescript
{
  accessorKey: 'departmentId',
  header: 'Department',
  cellType: CellType.REFERENCE,
  cellOptions: {
    referenceType: 'department',
    labelField: 'name',
    valueField: 'id',
    searchable: true,           // Enable search
    searchPlaceholder: 'Search departments...',
  },
}
```

### Search Implementation

```typescript
import { useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

function DepartmentDropdown() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const { data, isLoading } = useReferenceData('departments', debouncedSearch);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search departments..."
      />

      {isLoading && <div>Loading...</div>}

      <select>
        {data?.data.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

**Debouncing** prevents API calls on every keystroke. Only searches after user stops typing for 300ms.

### Backend Search

```typescript
// API receives: ?search=eng

const where = {
  organizationId: req.user.organizationId,
  OR: [
    { name: { contains: 'eng', mode: 'insensitive' } },
    { code: { contains: 'eng', mode: 'insensitive' } },
  ],
};

// Returns: "Engineering", "Engine Testing", etc.
```

## Inline Creation

Allow users to create reference data without leaving the table:

```typescript
{
  accessorKey: 'departmentId',
  header: 'Department',
  cellType: CellType.REFERENCE,
  cellOptions: {
    referenceType: 'department',
    labelField: 'name',
    valueField: 'id',
    allowCreate: true,          // Enable inline creation
    createLabel: 'Create department',
  },
}
```

### Inline Creation Flow

1. User clicks dropdown in edit mode
2. Types text not in list
3. Clicks "Create Department: Engineering"
4. Modal opens with pre-filled name
5. User adds additional fields (code, budget)
6. Saves
7. New department created via API
8. Cache invalidated
9. New department appears in dropdown
10. Automatically selected in cell

### Create Department Modal

```typescript
function CreateDepartmentModal({ name, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: name,
    code: '',
    budget: 0,
  });

  const createMutation = useCreateDepartment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createMutation.mutateAsync(formData);
    onSuccess();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="text"
        value={formData.code}
        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
        placeholder="Department code (e.g., ENG)"
      />
      <input
        type="number"
        value={formData.budget}
        onChange={(e) => setFormData({ ...formData, budget: +e.target.value })}
        placeholder="Annual budget"
      />
      <button type="submit">Create Department</button>
    </form>
  );
}
```

## Multi-Tenancy

Ensure reference data is organization-specific:

### Backend Security

```typescript
app.get('/api/references/departments', authenticate, async (req, res) => {
  const where = {
    organizationId: req.user.organizationId, // Multi-tenancy filter
    active: true,
  };

  const departments = await prisma.department.findMany({ where });

  res.json({ success: true, data: departments });
});
```

**Security Benefits:**
- Users only see their organization's departments
- Can't access other organizations' data
- Prevents data leakage
- Enforced at database level

### Database Schema

```prisma
model Department {
  id             String   @id @default(uuid())
  organizationId String   @map("organization_id")
  name           String
  code           String?
  active         Boolean  @default(true)

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  employees    Employee[]

  @@unique([organizationId, code])
  @@index([organizationId])
  @@map("departments")
}
```

**Key Points:**
- Every department belongs to an organization
- `organizationId` is indexed for fast queries
- Unique constraint on (organizationId, code)
- Cascade delete when organization deleted

## Performance Optimization

### 1. Lazy Loading

Only load reference data when needed:

```typescript
export function useReferenceData(referenceType: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['reference', referenceType],
    queryFn: fetchReferenceData,
    enabled,                      // Only fetch when enabled
    staleTime: 5 * 60 * 1000,
  });
}

// Usage: only load when dropdown opens
const { data } = useReferenceData('departments', isDropdownOpen);
```

### 2. Prefetch Common Reference Data

Load frequently used reference data on app init:

```typescript
import { useQueryClient } from '@tanstack/react-query';

export function App() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch common reference data
    queryClient.prefetchQuery({
      queryKey: ['reference', 'departments'],
      queryFn: () => fetchReferenceData('departments'),
    });

    queryClient.prefetchQuery({
      queryKey: ['reference', 'statuses'],
      queryFn: () => fetchReferenceData('statuses'),
    });
  }, []);

  return <EmployeeTable />;
}
```

**Benefit:** Dropdowns open instantly because data is already cached.

### 3. Paginate Large Lists

For reference tables with thousands of items:

```typescript
export function useReferenceData(referenceType: string, search: string, page: number = 1) {
  return useQuery({
    queryKey: ['reference', referenceType, search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        pageSize: '50',
      });

      const response = await fetch(`/api/references/${referenceType}?${params}`);
      return response.json();
    },
    keepPreviousData: true,       // Keep old data while loading new page
  });
}
```

### 4. Virtual Scrolling in Dropdowns

For very large lists, use virtual scrolling:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualDropdown({ options }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,     // Each item height
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '300px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const option = options[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <option value={option.id}>{option.name}</option>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Benefit:** Render only visible items. Handles 10,000+ items smoothly.

### 5. Database Indexes

Add indexes on reference tables:

```sql
-- Search optimization
CREATE INDEX idx_departments_name ON departments(name);
CREATE INDEX idx_departments_code ON departments(code);

-- Filter optimization
CREATE INDEX idx_departments_active ON departments(active);
CREATE INDEX idx_departments_org_id ON departments(organization_id);

-- Composite index for common queries
CREATE INDEX idx_departments_org_active ON departments(organization_id, active);
```

## Common Patterns

### Pattern 1: Status Badge with Reference

Combine REFERENCE with BADGE display:

```typescript
{
  accessorKey: 'statusId',
  header: 'Status',
  cellType: CellType.REFERENCE,
  cellOptions: {
    referenceType: 'status',
    labelField: 'label',
    valueField: 'id',
  },
  // Custom display with badge styling
  cell: ({ getValue, row }) => {
    const status = referenceCache.get('status', getValue());
    return (
      <Badge variant={status?.variant}>
        {status?.label}
      </Badge>
    );
  },
}
```

### Pattern 2: Hierarchical Reference (Manager)

Reference to same table (self-referential):

```typescript
// Backend schema
model Employee {
  id        String    @id
  name      String
  managerId String?
  manager   Employee? @relation("EmployeeManager", fields: [managerId], references: [id])
  reports   Employee[] @relation("EmployeeManager")
}

// Column definition
{
  accessorKey: 'managerId',
  header: 'Manager',
  cellType: CellType.REFERENCE,
  cellOptions: {
    referenceType: 'employees',  // Reference to same table
    labelField: 'name',
    valueField: 'id',
    searchable: true,
  },
}
```

### Pattern 3: Dependent Dropdowns

Department depends on business unit:

```typescript
function DepartmentDropdown({ businessUnitId }) {
  const { data } = useQuery({
    queryKey: ['reference', 'departments', businessUnitId],
    queryFn: async () => {
      const params = new URLSearchParams({
        businessUnitId: businessUnitId,
      });
      return fetchDepartments(params);
    },
    enabled: !!businessUnitId,    // Only fetch when business unit selected
  });

  return <select>{/* ... */}</select>;
}
```

## Troubleshooting

**Dropdown shows IDs instead of names:**
- Check `labelField` matches field in API response
- Verify reference data is loading correctly
- Check cache key matches

**Dropdown is empty:**
- Verify API endpoint returns data
- Check authentication token
- Ensure `organizationId` filter is correct
- Check active filter (may hide inactive items)

**Search not working:**
- Implement backend search with LIKE or ILIKE
- Check debouncing is working
- Verify search query parameter is sent

**Performance issues:**
- Add database indexes
- Enable pagination
- Use virtual scrolling
- Reduce cache time if memory constrained

**Inline creation not working:**
- Check `allowCreate: true` is set
- Verify POST endpoint exists
- Ensure cache invalidation after creation

## Next Steps

- [Cell Types Reference](../CELLS.md) - All cell type options
- [Advanced Filtering](./02-advanced-filtering.md) - Filter by reference columns
- [Backend API](../../backend/README.md) - Implement reference endpoints
- [Performance Optimization](./06-performance.md) - Optimize large reference tables

## See Also

- [REFERENCE_DATA_SYSTEM.md](../REFERENCE_DATA_SYSTEM.md) - Detailed system architecture
- [REFERENCE_CACHE_BEHAVIOR.md](../REFERENCE_CACHE_BEHAVIOR.md) - Caching deep dive
- [REFERENCE_QUICK_START.md](../REFERENCE_QUICK_START.md) - Quick reference guide
