# Filter Types Documentation

Complete guide to filtering system in JewTable with all supported operators.

## Overview

JewTable supports 15+ filter operators across different data types, both client-side and server-side.

## Filter Architecture

```typescript
interface FilterState {
  filters: Filter[];           // Array of column filters
  globalSearch?: string;       // Global text search
  logicOperator: 'AND' | 'OR'; // Combine filters with AND/OR
}
```

## Text Filters

### contains
Case-insensitive substring match.

```typescript
{
  columnId: 'name',
  operator: 'contains',
  value: 'john',
  caseSensitive: false,
  enabled: true,
}
```

**Example:** `"John Doe"` matches `"john"`
**Server Support:** ✅ Full support
**SQL:** `WHERE LOWER(name) LIKE '%john%'`

---

### equals
Exact match (optional case-sensitive).

```typescript
{
  columnId: 'email',
  operator: 'equals',
  value: 'user@example.com',
  caseSensitive: false,
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE LOWER(email) = LOWER('user@example.com')`

---

### startsWith
Prefix match.

```typescript
{
  columnId: 'name',
  operator: 'startsWith',
  value: 'John',
  enabled: true,
}
```

**Example:** `"John Doe"` matches `"John"`
**Server Support:** ✅ Full support
**SQL:** `WHERE name LIKE 'John%'`

---

### endsWith
Suffix match.

```typescript
{
  columnId: 'email',
  operator: 'endsWith',
  value: '@example.com',
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE email LIKE '%@example.com'`

---

### notContains
Negative substring match.

```typescript
{
  columnId: 'name',
  operator: 'notContains',
  value: 'test',
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE name NOT LIKE '%test%'`

---

### regex
Regular expression match (limited server support).

```typescript
{
  columnId: 'phone',
  operator: 'regex',
  value: '^\\d{3}-\\d{4}$',
  enabled: true,
}
```

**Server Support:** ⚠️ Fallback to contains
**Client Support:** ✅ Full RegExp support

---

## Number Filters

### eq (equals)
Exact numeric match.

```typescript
{
  columnId: 'salary',
  operator: 'eq',
  value: 75000,
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE salary = 75000`

---

### ne (not equals)
Not equal to value.

```typescript
{
  columnId: 'age',
  operator: 'ne',
  value: 0,
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE age != 0`

---

### gt (greater than)
Value greater than threshold.

```typescript
{
  columnId: 'salary',
  operator: 'gt',
  value: 50000,
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE salary > 50000`

---

### gte (greater than or equal)
Value greater than or equal to threshold.

```typescript
{
  columnId: 'age',
  operator: 'gte',
  value: 18,
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE age >= 18`

---

### lt (less than)
Value less than threshold.

```typescript
{
  columnId: 'commission',
  operator: 'lt',
  value: 0.10,
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE commission < 0.10`

---

### lte (less than or equal)
Value less than or equal to threshold.

```typescript
{
  columnId: 'age',
  operator: 'lte',
  value: 65,
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE age <= 65`

---

### between
Value in range (inclusive).

```typescript
{
  columnId: 'salary',
  operator: 'between',
  value: 50000,
  valueTo: 100000,
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE salary BETWEEN 50000 AND 100000`

---

### in
Value in list.

```typescript
{
  columnId: 'departmentId',
  operator: 'in',
  values: ['dept-1', 'dept-2', 'dept-3'],
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE departmentId IN ('dept-1', 'dept-2', 'dept-3')`

---

### notIn
Value not in list.

```typescript
{
  columnId: 'statusId',
  operator: 'notIn',
  values: ['archived', 'deleted'],
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE statusId NOT IN ('archived', 'deleted')`

---

## Date Filters

### before
Date before specified date (exclusive).

```typescript
{
  columnId: 'startDate',
  operator: 'before',
  value: '2024-01-01',
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE startDate < '2024-01-01'`

---

### after
Date after specified date (exclusive).

```typescript
{
  columnId: 'endDate',
  operator: 'after',
  value: '2024-12-31',
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE endDate > '2024-12-31'`

---

### onOrBefore
Date on or before specified date (inclusive).

```typescript
{
  columnId: 'startDate',
  operator: 'onOrBefore',
  value: '2024-01-01',
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE startDate <= '2024-01-01'`

---

### onOrAfter
Date on or after specified date (inclusive).

```typescript
{
  columnId: 'startDate',
  operator: 'onOrAfter',
  value: '2024-01-01',
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE startDate >= '2024-01-01'`

---

### dateEquals
Same date (ignores time).

```typescript
{
  columnId: 'createdAt',
  operator: 'dateEquals',
  value: '2024-01-15',
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE DATE(createdAt) = '2024-01-15'`

---

### dateBetween
Date in range (inclusive).

```typescript
{
  columnId: 'startDate',
  operator: 'dateBetween',
  value: '2024-01-01',
  valueTo: '2024-12-31',
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE startDate BETWEEN '2024-01-01' AND '2024-12-31'`

---

## Boolean Filters

### isTrue
Value is true.

```typescript
{
  columnId: 'active',
  operator: 'isTrue',
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE active = TRUE`

---

### isFalse
Value is false.

```typescript
{
  columnId: 'archived',
  operator: 'isFalse',
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE archived = FALSE`

---

## Null Filters

### isEmpty
Value is null or empty.

```typescript
{
  columnId: 'middleName',
  operator: 'isEmpty',
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE middleName IS NULL`

---

### isNotEmpty
Value is not null.

```typescript
{
  columnId: 'email',
  operator: 'isNotEmpty',
  enabled: true,
}
```

**Server Support:** ✅ Full support
**SQL:** `WHERE email IS NOT NULL`

---

## Combining Filters

### AND Logic
All filters must match.

```typescript
const filters: FilterState = {
  filters: [
    { columnId: 'salary', operator: 'gte', value: 50000, enabled: true },
    { columnId: 'active', operator: 'isTrue', enabled: true },
  ],
  logicOperator: 'AND',
};
```

**Result:** Rows where `salary >= 50000 AND active = TRUE`

---

### OR Logic
Any filter can match.

```typescript
const filters: FilterState = {
  filters: [
    { columnId: 'department', operator: 'equals', value: 'Engineering', enabled: true },
    { columnId: 'department', operator: 'equals', value: 'Product', enabled: true },
  ],
  logicOperator: 'OR',
};
```

**Result:** Rows where `department = 'Engineering' OR department = 'Product'`

---

## Global Search

Search across multiple columns.

```typescript
const filters: FilterState = {
  filters: [],
  globalSearch: 'john',
  logicOperator: 'AND',
};

// In DataTable
<DataTable
  enableGlobalFilter
  searchableColumns={['name', 'email', 'position']}
  // ...
/>
```

**Result:** Rows where name, email, OR position contains "john"

---

## Client vs Server Filtering

### Client-Side Filtering
All operators supported. Filtering happens in browser.

```typescript
<DataTable
  mode="client"
  data={allData}
  enableFiltering
/>
```

**Pros:**
- All operators work
- Instant filtering
- No network requests

**Cons:**
- Must load all data upfront
- Memory intensive for large datasets

---

### Server-Side Filtering
Filtering happens on backend.

```typescript
<DataTable
  mode="server"
  data={pageData}
  enableFiltering
  onFilterChange={(filters) => {
    // Send to API
    fetchData({ filters });
  }}
/>
```

**Pros:**
- Handles millions of rows
- Efficient for large datasets
- Reduced client memory

**Backend Requirements:**
- Implement filter query builder
- Support all operators (see backend/README.md)

---

## Usage Examples

### Example 1: Salary Range Filter

```typescript
const columns = [
  {
    accessorKey: 'salary',
    header: 'Salary',
    cellType: CellType.CURRENCY,
    enableFiltering: true,
    filterConfig: {
      type: 'number',
      operators: ['between', 'gte', 'lte'],
      defaultOperator: 'between',
    },
  },
];
```

### Example 2: Date Range Filter

```typescript
const columns = [
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cellType: CellType.DATE,
    enableFiltering: true,
    filterConfig: {
      type: 'date',
      operators: ['dateBetween', 'onOrAfter', 'onOrBefore'],
    },
  },
];
```

### Example 3: Multi-Select Filter

```typescript
const columns = [
  {
    accessorKey: 'departmentId',
    header: 'Department',
    cellType: CellType.REFERENCE,
    enableFiltering: true,
    filterConfig: {
      type: 'select',
      operators: ['in', 'notIn'],
      multiple: true,
    },
  },
];
```

## Server Implementation

See [backend/README.md](../backend/README.md) for query builder implementation that supports all operators.

**Query Builder Example:**
```typescript
// Frontend sends
const filters = {
  filters: [
    { columnId: 'salary', operator: 'between', value: 50000, valueTo: 100000 }
  ],
  logicOperator: 'AND'
};

// Backend translates to SQL
WHERE salary BETWEEN 50000 AND 100000
```

## Best Practices

1. **Choose Appropriate Operators:** Use `between` for ranges instead of two separate filters
2. **Enable Global Search:** For better user experience
3. **Server-Side for Large Datasets:** Use server mode for 1000+ rows
4. **Debounce Text Inputs:** Prevent excessive API calls
5. **Cache Filter Results:** Use TanStack Query for caching
6. **Clear Filters:** Provide UI to clear all filters

## Performance Tips

- Use indexes on filtered columns (backend)
- Limit number of active filters
- Use `enabled: false` to disable filters without removing them
- Debounce text filter inputs (300ms recommended)
- Cache reference data for dropdown filters

## See Also

- [Cell Types Documentation](./CELLS.md)
- [Backend Query Builder](../backend/README.md)
- [Component Documentation](./COMPONENTS.md)
