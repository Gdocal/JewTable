# Advanced Filtering Tutorial

Master JewTable's powerful filtering system with 15+ operators, AND/OR logic, and complex filter combinations.

## Table of Contents

1. [Basic Filtering Setup](#basic-filtering-setup)
2. [Text Filters](#text-filters)
3. [Number Filters](#number-filters)
4. [Date Filters](#date-filters)
5. [Boolean and Null Filters](#boolean-and-null-filters)
6. [Combining Filters (AND/OR)](#combining-filters-andor)
7. [Global Search](#global-search)
8. [Programmatic Filtering](#programmatic-filtering)
9. [Custom Filter UI](#custom-filter-ui)
10. [Performance Tips](#performance-tips)

## Basic Filtering Setup

### Client-Side Filtering

```typescript
import React, { useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { FilterState } from '@/components/DataTable/types';

export function ClientFilterTable() {
  const [filters, setFilters] = useState<FilterState>({
    filters: [],
    logicOperator: 'AND',
  });

  return (
    <DataTable
      mode="client"
      data={data}
      columns={columns}
      enableFiltering
      filters={filters}
      onFilterChange={setFilters}
    />
  );
}
```

### Server-Side Filtering

```typescript
import { useQuery } from '@tanstack/react-query';

export function ServerFilterTable() {
  const [filters, setFilters] = useState<FilterState>({
    filters: [],
    logicOperator: 'AND',
  });

  const { data } = useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        filters: JSON.stringify(filters),
      });

      const response = await fetch(`/api/tables/employees/data?${params}`);
      return response.json();
    },
  });

  return (
    <DataTable
      mode="server"
      data={data?.data?.data || []}
      columns={columns}
      enableFiltering
      filters={filters}
      onFilterChange={setFilters}
    />
  );
}
```

## Text Filters

Text filters work on string columns and support 6 operators.

### Contains (Case-Insensitive)

Most common text filter - matches substring:

```typescript
const filter = {
  columnId: 'name',
  operator: 'contains',
  value: 'john',
  caseSensitive: false,
  enabled: true,
};

// Matches: "John Doe", "Johnny", "john smith"
// SQL: WHERE LOWER(name) LIKE '%john%'
```

### Equals (Exact Match)

```typescript
const filter = {
  columnId: 'email',
  operator: 'equals',
  value: 'user@example.com',
  caseSensitive: false,
  enabled: true,
};

// Matches only: "user@example.com"
// SQL: WHERE LOWER(email) = LOWER('user@example.com')
```

### Starts With (Prefix)

```typescript
const filter = {
  columnId: 'name',
  operator: 'startsWith',
  value: 'John',
  enabled: true,
};

// Matches: "John Doe", "Johnny"
// Doesn't match: "Mike Johnson"
// SQL: WHERE name LIKE 'John%'
```

### Ends With (Suffix)

```typescript
const filter = {
  columnId: 'email',
  operator: 'endsWith',
  value: '@example.com',
  enabled: true,
};

// Matches: "user@example.com", "admin@example.com"
// SQL: WHERE email LIKE '%@example.com'
```

### Not Contains (Negative Match)

```typescript
const filter = {
  columnId: 'name',
  operator: 'notContains',
  value: 'test',
  enabled: true,
};

// Matches all rows where name doesn't contain "test"
// SQL: WHERE name NOT LIKE '%test%'
```

### Regex (Advanced Pattern Matching)

```typescript
const filter = {
  columnId: 'phone',
  operator: 'regex',
  value: '^\\d{3}-\\d{4}$', // Format: 555-1234
  enabled: true,
};

// Client-side: Full RegExp support
// Server-side: Falls back to contains
```

**Note:** Regex is only fully supported in client mode. Server mode falls back to `contains`.

## Number Filters

Number filters work on numeric columns (NUMBER, CURRENCY, PERCENT).

### Equals

```typescript
const filter = {
  columnId: 'salary',
  operator: 'eq',
  value: 75000,
  enabled: true,
};

// Matches: salary = 75000
// SQL: WHERE salary = 75000
```

### Not Equals

```typescript
const filter = {
  columnId: 'commission',
  operator: 'ne',
  value: 0,
  enabled: true,
};

// Matches all rows where commission is not 0
// SQL: WHERE commission != 0
```

### Greater Than / Less Than

```typescript
// Greater than
const filter1 = {
  columnId: 'salary',
  operator: 'gt',
  value: 50000,
  enabled: true,
};
// SQL: WHERE salary > 50000

// Greater than or equal
const filter2 = {
  columnId: 'salary',
  operator: 'gte',
  value: 50000,
  enabled: true,
};
// SQL: WHERE salary >= 50000

// Less than
const filter3 = {
  columnId: 'age',
  operator: 'lt',
  value: 65,
  enabled: true,
};
// SQL: WHERE age < 65

// Less than or equal
const filter4 = {
  columnId: 'age',
  operator: 'lte',
  value: 65,
  enabled: true,
};
// SQL: WHERE age <= 65
```

### Between (Range)

Most efficient for range queries:

```typescript
const filter = {
  columnId: 'salary',
  operator: 'between',
  value: 50000,      // Minimum
  valueTo: 100000,   // Maximum
  enabled: true,
};

// Matches: 50000 <= salary <= 100000
// SQL: WHERE salary BETWEEN 50000 AND 100000
```

**Tip:** Use `between` instead of combining `gte` and `lte` filters for better performance.

### In (Multiple Values)

```typescript
const filter = {
  columnId: 'departmentId',
  operator: 'in',
  values: ['dept-1', 'dept-2', 'dept-3'],
  enabled: true,
};

// Matches rows where departmentId is one of the values
// SQL: WHERE departmentId IN ('dept-1', 'dept-2', 'dept-3')
```

### Not In (Exclusion)

```typescript
const filter = {
  columnId: 'statusId',
  operator: 'notIn',
  values: ['archived', 'deleted'],
  enabled: true,
};

// Excludes rows with these statuses
// SQL: WHERE statusId NOT IN ('archived', 'deleted')
```

## Date Filters

Date filters work on DATE and DATETIME columns.

### Before / After

```typescript
// Before (exclusive)
const filter1 = {
  columnId: 'startDate',
  operator: 'before',
  value: '2024-01-01',
  enabled: true,
};
// SQL: WHERE startDate < '2024-01-01'

// After (exclusive)
const filter2 = {
  columnId: 'endDate',
  operator: 'after',
  value: '2024-12-31',
  enabled: true,
};
// SQL: WHERE endDate > '2024-12-31'
```

### On or Before / On or After (Inclusive)

```typescript
// On or before
const filter1 = {
  columnId: 'startDate',
  operator: 'onOrBefore',
  value: '2024-01-01',
  enabled: true,
};
// SQL: WHERE startDate <= '2024-01-01'

// On or after
const filter2 = {
  columnId: 'startDate',
  operator: 'onOrAfter',
  value: '2024-01-01',
  enabled: true,
};
// SQL: WHERE startDate >= '2024-01-01'
```

### Date Equals (Ignores Time)

```typescript
const filter = {
  columnId: 'createdAt',
  operator: 'dateEquals',
  value: '2024-01-15',
  enabled: true,
};

// Matches all rows on 2024-01-15 regardless of time
// SQL: WHERE DATE(createdAt) = '2024-01-15'
```

### Date Between (Range)

```typescript
const filter = {
  columnId: 'startDate',
  operator: 'dateBetween',
  value: '2024-01-01',
  valueTo: '2024-12-31',
  enabled: true,
};

// Matches dates in 2024
// SQL: WHERE startDate BETWEEN '2024-01-01' AND '2024-12-31'
```

## Boolean and Null Filters

### Boolean Filters

```typescript
// Is true
const filter1 = {
  columnId: 'active',
  operator: 'isTrue',
  enabled: true,
};
// SQL: WHERE active = TRUE

// Is false
const filter2 = {
  columnId: 'archived',
  operator: 'isFalse',
  enabled: true,
};
// SQL: WHERE archived = FALSE
```

### Null Filters

```typescript
// Is empty (null or empty string)
const filter1 = {
  columnId: 'middleName',
  operator: 'isEmpty',
  enabled: true,
};
// SQL: WHERE middleName IS NULL

// Is not empty
const filter2 = {
  columnId: 'email',
  operator: 'isNotEmpty',
  enabled: true,
};
// SQL: WHERE email IS NOT NULL
```

## Combining Filters (AND/OR)

### AND Logic (Default)

All filters must match:

```typescript
const filters: FilterState = {
  filters: [
    { columnId: 'salary', operator: 'gte', value: 50000, enabled: true },
    { columnId: 'active', operator: 'isTrue', enabled: true },
    { columnId: 'department', operator: 'in', values: ['Engineering', 'Product'], enabled: true },
  ],
  logicOperator: 'AND',
};

// Result: salary >= 50000 AND active = TRUE AND department IN ('Engineering', 'Product')
```

### OR Logic

Any filter can match:

```typescript
const filters: FilterState = {
  filters: [
    { columnId: 'department', operator: 'equals', value: 'Engineering', enabled: true },
    { columnId: 'department', operator: 'equals', value: 'Product', enabled: true },
    { columnId: 'salary', operator: 'gt', value: 100000, enabled: true },
  ],
  logicOperator: 'OR',
};

// Result: department = 'Engineering' OR department = 'Product' OR salary > 100000
```

**Tip:** For OR with same column, use `in` operator instead:

```typescript
// Better approach
const filter = {
  columnId: 'department',
  operator: 'in',
  values: ['Engineering', 'Product'],
  enabled: true,
};
```

### Complex Example: Salary Range by Department

Find high earners in specific departments:

```typescript
const filters: FilterState = {
  filters: [
    { columnId: 'department', operator: 'in', values: ['Engineering', 'Product'], enabled: true },
    { columnId: 'salary', operator: 'gte', value: 80000, enabled: true },
    { columnId: 'active', operator: 'isTrue', enabled: true },
  ],
  logicOperator: 'AND',
};

// Result: department IN ('Engineering', 'Product')
//         AND salary >= 80000
//         AND active = TRUE
```

## Global Search

Search across multiple columns simultaneously:

```typescript
<DataTable
  mode="client"
  data={data}
  columns={columns}
  enableGlobalFilter
  searchableColumns={['name', 'email', 'position']}
/>
```

Programmatically set global search:

```typescript
const [filters, setFilters] = useState<FilterState>({
  filters: [],
  globalSearch: 'john', // Search term
  logicOperator: 'AND',
});

// Searches in name, email, OR position for "john"
// Combined with AND logic if other filters exist
```

**How it works:**
- Global search uses OR logic across searchable columns
- Combined with column filters using the main logic operator
- Case-insensitive by default

```typescript
// With both global search and filters:
const filters: FilterState = {
  filters: [
    { columnId: 'active', operator: 'isTrue', enabled: true },
  ],
  globalSearch: 'engineer',
  logicOperator: 'AND',
};

// Result: active = TRUE
//         AND (name LIKE '%engineer%' OR email LIKE '%engineer%' OR position LIKE '%engineer%')
```

## Programmatic Filtering

### Set Filters from Code

```typescript
function QuickFilters() {
  const [filters, setFilters] = useState<FilterState>({
    filters: [],
    logicOperator: 'AND',
  });

  const showActiveOnly = () => {
    setFilters({
      filters: [
        { columnId: 'active', operator: 'isTrue', enabled: true },
      ],
      logicOperator: 'AND',
    });
  };

  const showHighEarners = () => {
    setFilters({
      filters: [
        { columnId: 'salary', operator: 'gte', value: 100000, enabled: true },
      ],
      logicOperator: 'AND',
    });
  };

  const showRecentHires = () => {
    setFilters({
      filters: [
        {
          columnId: 'startDate',
          operator: 'onOrAfter',
          value: '2024-01-01',
          enabled: true,
        },
      ],
      logicOperator: 'AND',
    });
  };

  const clearFilters = () => {
    setFilters({
      filters: [],
      logicOperator: 'AND',
    });
  };

  return (
    <div>
      <button onClick={showActiveOnly}>Active Only</button>
      <button onClick={showHighEarners}>High Earners</button>
      <button onClick={showRecentHires}>Recent Hires</button>
      <button onClick={clearFilters}>Clear All</button>

      <DataTable
        mode="server"
        data={data}
        columns={columns}
        enableFiltering
        filters={filters}
        onFilterChange={setFilters}
      />
    </div>
  );
}
```

### Add Filter to Existing Filters

```typescript
const addFilter = (newFilter: Filter) => {
  setFilters((prev) => ({
    ...prev,
    filters: [...prev.filters, newFilter],
  }));
};

// Usage
addFilter({
  columnId: 'department',
  operator: 'equals',
  value: 'Engineering',
  enabled: true,
});
```

### Remove Filter

```typescript
const removeFilter = (columnId: string) => {
  setFilters((prev) => ({
    ...prev,
    filters: prev.filters.filter((f) => f.columnId !== columnId),
  }));
};
```

### Toggle Filter Enabled

```typescript
const toggleFilter = (columnId: string) => {
  setFilters((prev) => ({
    ...prev,
    filters: prev.filters.map((f) =>
      f.columnId === columnId ? { ...f, enabled: !f.enabled } : f
    ),
  }));
};
```

## Custom Filter UI

Create custom filter controls:

```typescript
function CustomFilterBar() {
  const [filters, setFilters] = useState<FilterState>({
    filters: [],
    logicOperator: 'AND',
  });

  const handleSalaryChange = (min: number, max: number) => {
    const newFilter: Filter = {
      columnId: 'salary',
      operator: 'between',
      value: min,
      valueTo: max,
      enabled: true,
    };

    setFilters((prev) => ({
      ...prev,
      filters: [
        ...prev.filters.filter((f) => f.columnId !== 'salary'),
        newFilter,
      ],
    }));
  };

  const handleDepartmentChange = (departments: string[]) => {
    const newFilter: Filter = {
      columnId: 'departmentId',
      operator: 'in',
      values: departments,
      enabled: departments.length > 0,
    };

    setFilters((prev) => ({
      ...prev,
      filters: [
        ...prev.filters.filter((f) => f.columnId !== 'departmentId'),
        ...(departments.length > 0 ? [newFilter] : []),
      ],
    }));
  };

  return (
    <div>
      <div>
        <label>Salary Range:</label>
        <input
          type="number"
          placeholder="Min"
          onChange={(e) => handleSalaryChange(+e.target.value, 200000)}
        />
        <input
          type="number"
          placeholder="Max"
          onChange={(e) => handleSalaryChange(0, +e.target.value)}
        />
      </div>

      <div>
        <label>Departments:</label>
        <select
          multiple
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, (o) => o.value);
            handleDepartmentChange(selected);
          }}
        >
          <option value="dept-1">Engineering</option>
          <option value="dept-2">Product</option>
          <option value="dept-3">Sales</option>
        </select>
      </div>

      <DataTable
        mode="server"
        data={data}
        columns={columns}
        enableFiltering={false} // Disable built-in filter UI
        filters={filters}
        onFilterChange={setFilters}
      />
    </div>
  );
}
```

## Performance Tips

### 1. Debounce Text Inputs

Prevent excessive API calls on text filters:

```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

function FilteredTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300); // 300ms delay

  const filters: FilterState = {
    filters: debouncedSearch
      ? [{ columnId: 'name', operator: 'contains', value: debouncedSearch, enabled: true }]
      : [],
    logicOperator: 'AND',
  };

  return (
    <>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      <DataTable mode="server" data={data} columns={columns} filters={filters} />
    </>
  );
}
```

### 2. Use Appropriate Operators

Choose the most efficient operator:

```typescript
// ❌ Bad: Two separate filters
filters: [
  { columnId: 'salary', operator: 'gte', value: 50000, enabled: true },
  { columnId: 'salary', operator: 'lte', value: 100000, enabled: true },
]

// ✅ Good: Single between filter
filters: [
  { columnId: 'salary', operator: 'between', value: 50000, valueTo: 100000, enabled: true },
]
```

### 3. Server-Side for Large Datasets

Always use server mode for datasets > 1000 rows:

```typescript
// ❌ Bad: Client mode with 10,000 rows
<DataTable mode="client" data={largeDataset} />

// ✅ Good: Server mode with pagination
<DataTable mode="server" data={pageData} totalCount={10000} />
```

### 4. Index Filtered Columns (Backend)

Add database indexes on frequently filtered columns:

```sql
CREATE INDEX idx_employees_salary ON employees(salary);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_active ON employees(active);
CREATE INDEX idx_employees_start_date ON employees(start_date);
```

### 5. Cache Filter Results

Use TanStack Query caching:

```typescript
const { data } = useQuery({
  queryKey: ['employees', filters], // Automatic caching by filters
  queryFn: fetchEmployees,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### 6. Disable Unused Filters

Only enable filtering on columns that need it:

```typescript
const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cellType: CellType.TEXT,
    enableFiltering: true, // Filterable
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cellType: CellType.TEXT,
    enableFiltering: false, // Not filterable
  },
];
```

## Common Use Cases

### Example 1: Active Employees in Specific Departments

```typescript
const filters: FilterState = {
  filters: [
    { columnId: 'active', operator: 'isTrue', enabled: true },
    { columnId: 'departmentId', operator: 'in', values: ['dept-1', 'dept-2'], enabled: true },
  ],
  logicOperator: 'AND',
};
```

### Example 2: High Salary or Commission

```typescript
const filters: FilterState = {
  filters: [
    { columnId: 'salary', operator: 'gte', value: 100000, enabled: true },
    { columnId: 'commission', operator: 'gte', value: 0.15, enabled: true },
  ],
  logicOperator: 'OR',
};
```

### Example 3: Recent Hires Still Active

```typescript
const filters: FilterState = {
  filters: [
    { columnId: 'startDate', operator: 'onOrAfter', value: '2024-01-01', enabled: true },
    { columnId: 'active', operator: 'isTrue', enabled: true },
  ],
  logicOperator: 'AND',
};
```

### Example 4: Exclude Test Data

```typescript
const filters: FilterState = {
  filters: [
    { columnId: 'name', operator: 'notContains', value: 'test', enabled: true },
    { columnId: 'email', operator: 'notContains', value: 'test', enabled: true },
  ],
  logicOperator: 'AND',
};
```

## Next Steps

- [Reference Data Tutorial](./05-reference-data.md) - Set up dropdown filters with API data
- [Performance Optimization](./06-performance.md) - Optimize filtering performance
- [Backend API](../../backend/README.md) - Learn how filters are processed server-side
- [Filter Types Reference](../FILTERS.md) - Complete reference for all operators

## Troubleshooting

**Filters not applied:**
- Check `enabled: true` on filter
- Verify `enableFiltering` on table
- Ensure column has `enableFiltering: true`

**Server filters not working:**
- Implement `onFilterChange` callback
- Send filters to API in correct format
- Check backend QueryBuilder implementation

**Performance issues:**
- Add database indexes
- Debounce text inputs
- Use server mode for large datasets
- Limit number of active filters
