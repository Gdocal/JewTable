# Quick Start Guide

Get started with JewTable in 5 minutes. This guide covers installation, basic setup, and your first table.

## Installation

```bash
npm install @tanstack/react-table @tanstack/react-query
```

JewTable is built on top of TanStack Table and TanStack Query.

## Basic Client-Side Table

Create a simple table with client-side data:

```typescript
import React from 'react';
import { DataTable } from '@/components/DataTable';
import { CellType } from '@/components/DataTable/types/cell.types';

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  salary: number;
  active: boolean;
}

const data: Employee[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', position: 'Engineer', salary: 75000, active: true },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', position: 'Designer', salary: 70000, active: true },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', position: 'Manager', salary: 90000, active: true },
];

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cellType: CellType.TEXT,
    enableSorting: true,
    enableFiltering: true,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cellType: CellType.EMAIL,
  },
  {
    accessorKey: 'position',
    header: 'Position',
    cellType: CellType.TEXT,
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    cellType: CellType.CURRENCY,
    cellOptions: {
      currency: 'USD',
      symbol: '$',
      decimals: 2,
    },
  },
  {
    accessorKey: 'active',
    header: 'Active',
    cellType: CellType.BOOLEAN,
  },
];

export function EmployeeTable() {
  return (
    <DataTable
      mode="client"
      data={data}
      columns={columns}
      enableSorting
      enableFiltering
      enableGlobalFilter
      showRowIndex
    />
  );
}
```

That's it! You now have a fully functional table with:
- Sorting
- Filtering
- Global search
- Formatted currency
- Boolean display

## Server-Side Table with Pagination

For large datasets, use server-side mode:

```typescript
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/DataTable';
import { FilterState, SortingState } from '@/components/DataTable/types';

export function ServerEmployeeTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState<FilterState>({ filters: [], logicOperator: 'AND' });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', page, pageSize, filters, sorting],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        filters: JSON.stringify(filters),
        sorting: JSON.stringify(sorting),
      });

      const response = await fetch(`/api/tables/employees/data?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      return response.json();
    },
  });

  return (
    <DataTable
      mode="server"
      data={data?.data?.data || []}
      columns={columns}
      totalCount={data?.data?.totalCount || 0}
      page={page}
      pageSize={pageSize}
      enableSorting
      enableFiltering
      enablePagination
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onFilterChange={setFilters}
      onSortChange={setSorting}
      isLoading={isLoading}
    />
  );
}
```

## Editable Table

Enable inline editing with callbacks:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function EditableTable() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/tables/employees/rows/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ data, version: data.version }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/tables/employees/rows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ data }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/tables/employees/rows/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  return (
    <DataTable
      mode="server"
      data={data?.data?.data || []}
      columns={columns}
      editable
      enableRowCreation
      enableRowDeletion
      onRowUpdate={(id, data) => updateMutation.mutate({ id, data })}
      onRowCreate={(data) => createMutation.mutate(data)}
      onRowDelete={(id) => deleteMutation.mutate(id)}
    />
  );
}
```

## Column Configuration

### Text Column
```typescript
{
  accessorKey: 'name',
  header: 'Name',
  cellType: CellType.TEXT,
  editable: true,
  required: true,
  enableSorting: true,
  enableFiltering: true,
  cellOptions: {
    maxLength: 100,
    minLength: 2,
    placeholder: 'Enter name...',
  },
}
```

### Currency Column
```typescript
{
  accessorKey: 'salary',
  header: 'Salary',
  cellType: CellType.CURRENCY,
  cellOptions: {
    currency: 'USD',
    symbol: '$',
    decimals: 2,
  },
}
```

### Date Column
```typescript
{
  accessorKey: 'startDate',
  header: 'Start Date',
  cellType: CellType.DATE,
  cellOptions: {
    format: 'MM/DD/YYYY',
    min: '2020-01-01',
    max: '2030-12-31',
  },
}
```

### Select Column
```typescript
{
  accessorKey: 'role',
  header: 'Role',
  cellType: CellType.SELECT,
  cellOptions: {
    options: [
      { value: 'admin', label: 'Administrator' },
      { value: 'user', label: 'User' },
      { value: 'guest', label: 'Guest' },
    ],
  },
}
```

### Reference Column (Dropdown with API)
```typescript
{
  accessorKey: 'departmentId',
  header: 'Department',
  cellType: CellType.REFERENCE,
  cellOptions: {
    referenceType: 'department',
    labelField: 'name',
    valueField: 'id',
    searchable: true,
    allowCreate: true,
  },
}
```

## Filtering

Add filters to your table:

```typescript
// Client-side filtering
<DataTable
  mode="client"
  data={data}
  columns={columns}
  enableFiltering
  enableGlobalFilter
  searchableColumns={['name', 'email', 'position']}
/>

// Server-side filtering
<DataTable
  mode="server"
  data={data}
  columns={columns}
  enableFiltering
  onFilterChange={(filters) => {
    setFilters(filters);
  }}
/>
```

Users can then apply filters via the UI:
- Text filters: contains, equals, startsWith, endsWith
- Number filters: equals, greater than, less than, between
- Date filters: before, after, between
- Boolean filters: is true, is false

## Sorting

Enable sorting on columns:

```typescript
const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cellType: CellType.TEXT,
    enableSorting: true, // Enable sorting
  },
];

<DataTable
  mode="server"
  data={data}
  columns={columns}
  enableSorting
  onSortChange={(sorting) => {
    setSorting(sorting);
  }}
/>
```

## Pagination

```typescript
<DataTable
  mode="server"
  data={data}
  columns={columns}
  enablePagination
  page={page}
  pageSize={pageSize}
  totalCount={totalCount}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  pageSizeOptions={[10, 25, 50, 100]}
/>
```

## Virtualization (Infinite Scroll)

For optimal performance with large datasets:

```typescript
<DataTable
  mode="server"
  data={data}
  columns={columns}
  enableVirtualization
  totalCount={totalCount}
  onLoadMore={(startIndex, stopIndex) => {
    // Load more data
  }}
/>
```

## Next Steps

Now that you have a basic table running, explore these topics:

1. **[Cell Types](../CELLS.md)** - Learn about all 12 cell types and their options
2. **[Filtering](../FILTERS.md)** - Master the filtering system with 15+ operators
3. **[Reference Data](./05-reference-data.md)** - Set up dropdown columns with API data
4. **[Backend Setup](../../backend/README.md)** - Deploy the production REST API
5. **[Advanced Filtering](./02-advanced-filtering.md)** - Complex filter combinations
6. **[Performance Optimization](./06-performance.md)** - Optimize for large datasets

## Common Patterns

### Loading State
```typescript
<DataTable
  mode="server"
  data={data}
  columns={columns}
  isLoading={isLoading}
/>
```

### Error Handling
```typescript
const { data, error, isLoading } = useQuery({...});

if (error) return <div>Error: {error.message}</div>;
```

### Row Selection
```typescript
const [selectedRows, setSelectedRows] = useState<string[]>([]);

<DataTable
  mode="client"
  data={data}
  columns={columns}
  enableRowSelection
  selectedRowIds={selectedRows}
  onRowSelectionChange={setSelectedRows}
/>
```

### Custom Cell Renderer
```typescript
{
  accessorKey: 'avatar',
  header: 'Avatar',
  cell: ({ getValue, row }) => (
    <img
      src={getValue()}
      alt={row.original.name}
      style={{ width: 32, height: 32, borderRadius: '50%' }}
    />
  ),
}
```

## Tips

1. **Choose the right mode:**
   - Client mode: < 1,000 rows
   - Server mode: > 1,000 rows
   - Virtualization: > 10,000 rows

2. **Enable only what you need:**
   - Don't enable features you don't use
   - Each feature adds overhead

3. **Use TanStack Query:**
   - Automatic caching
   - Background refetching
   - Optimistic updates

4. **Type safety:**
   - Define proper TypeScript interfaces
   - Use type-safe column definitions

5. **Performance:**
   - Use React.memo for custom cells
   - Debounce filter inputs (300ms)
   - Cache reference data

## Troubleshooting

**Table not rendering:**
- Check that `data` is an array
- Verify `columns` have `accessorKey` or `id`
- Ensure cell types are imported correctly

**Filters not working:**
- For server mode, implement `onFilterChange`
- Check that `enableFiltering` is true
- Verify column has `enableFiltering: true`

**Sorting not working:**
- For server mode, implement `onSortChange`
- Check that `enableSorting` is true
- Verify column has `enableSorting: true`

**Performance issues:**
- Switch to server mode for large datasets
- Enable virtualization
- Reduce number of rendered columns
- Use React DevTools Profiler

## Support

- [API Documentation](../COMPONENTS.md)
- [Cell Types](../CELLS.md)
- [Filters](../FILTERS.md)
- [Backend API](../../backend/README.md)
