# @gdocal/jewtable

[![npm version](https://img.shields.io/npm/v/@gdocal/jewtable.svg)](https://www.npmjs.com/package/@gdocal/jewtable)
[![GitHub](https://img.shields.io/badge/GitHub-Gdocal%2FJewTable-blue?logo=github)](https://github.com/Gdocal/JewTable)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/Gdocal/JewTable/blob/main/LICENSE)

A production-ready, feature-rich React data table component with full backend integration. Built with TanStack Table, TypeScript, and PostgreSQL.

## Features

- ✅ **12 Cell Types** - TEXT, NUMBER, CURRENCY, DATE, BOOLEAN, REFERENCE, and more
- ✅ **15+ Filter Operators** - Advanced filtering with AND/OR logic
- ✅ **Multi-Column Sorting** - Client and server-side sorting
- ✅ **Virtualization** - Handle millions of rows efficiently
- ✅ **Inline Editing** - Edit cells directly with validation
- ✅ **Reference Data** - API-backed dropdowns with caching
- ✅ **Drag & Drop** - Column and row reordering
- ✅ **Column Resizing** - Adjustable column widths
- ✅ **Import/Export CSV** - Data import/export functionality
- ✅ **Production Backend** - Full REST API with PostgreSQL

## Installation

```bash
npm install @gdocal/jewtable
```

## Peer Dependencies

```bash
npm install react react-dom @tanstack/react-table @tanstack/react-query @tanstack/react-virtual
```

## Quick Start

```tsx
import { DataTable, CellType } from '@gdocal/jewtable';
import '@gdocal/jewtable/styles.css';

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cellType: CellType.TEXT,
    enableSorting: true,
    enableFiltering: true,
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
    accessorKey: 'startDate',
    header: 'Start Date',
    cellType: CellType.DATE,
    cellOptions: {
      format: 'MM/DD/YYYY',
    },
  },
];

function MyTable() {
  return (
    <DataTable
      mode="client"
      data={employees}
      columns={columns}
      enableSorting
      enableFiltering
      enableGlobalFilter
    />
  );
}
```

## Server-Side Integration

```tsx
import { useQuery } from '@tanstack/react-query';

function ServerTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ filters: [], logicOperator: 'AND' });

  const { data } = useQuery({
    queryKey: ['employees', page, filters],
    queryFn: () => fetchEmployees(page, filters),
  });

  return (
    <DataTable
      mode="server"
      data={data?.data || []}
      columns={columns}
      totalCount={data?.totalCount || 0}
      page={page}
      pageSize={25}
      onPageChange={setPage}
      onFilterChange={setFilters}
    />
  );
}
```

## Available Cell Types

- `TEXT` - Basic text input
- `NUMBER` - Numeric input with formatting
- `CURRENCY` - Money with currency symbol
- `PERCENT` - Percentage display
- `DATE` - Date picker
- `DATETIME` - Date and time picker
- `BOOLEAN` - Checkbox
- `SELECT` - Dropdown with options
- `BADGE` - Colored status badges
- `PROGRESS` - Progress bars
- `REFERENCE` - API-backed dropdown
- `EMAIL` - Email with validation

## Filter Operators

**Text:** contains, equals, startsWith, endsWith, notContains, regex

**Number:** eq, ne, gt, gte, lt, lte, between, in, notIn

**Date:** before, after, onOrBefore, onOrAfter, dateEquals, dateBetween

**Boolean:** isTrue, isFalse

**Null:** isEmpty, isNotEmpty

## Full Documentation

- **[Complete Documentation](https://github.com/Gdocal/JewTable/blob/main/docs/README.md)**
- **[Quick Start Tutorial](https://github.com/Gdocal/JewTable/blob/main/docs/TUTORIALS/01-quick-start.md)**
- **[Advanced Filtering](https://github.com/Gdocal/JewTable/blob/main/docs/TUTORIALS/02-advanced-filtering.md)**
- **[Reference Data Guide](https://github.com/Gdocal/JewTable/blob/main/docs/TUTORIALS/05-reference-data.md)**
- **[Backend API](https://github.com/Gdocal/JewTable/blob/main/backend/README.md)**
- **[All Cell Types](https://github.com/Gdocal/JewTable/blob/main/docs/CELLS.md)**
- **[All Filters](https://github.com/Gdocal/JewTable/blob/main/docs/FILTERS.md)**

## Backend Setup

JewTable includes a production-ready REST API:

```bash
git clone https://github.com/Gdocal/JewTable.git
cd JewTable/backend
npm install
cp .env.example .env
# Edit .env with database credentials
npx prisma migrate dev
npm start
```

Or use Docker:

```bash
git clone https://github.com/Gdocal/JewTable.git
cd JewTable
docker-compose up -d
```

## Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `mode` | `'client' \| 'server'` | Data handling mode |
| `data` | `T[]` | Table data |
| `columns` | `ColumnDef<T>[]` | Column definitions |
| `enableSorting` | `boolean` | Enable sorting |
| `enableFiltering` | `boolean` | Enable filtering |
| `enablePagination` | `boolean` | Enable pagination |
| `enableVirtualization` | `boolean` | Enable virtual scrolling |
| `editable` | `boolean` | Enable inline editing |
| `onRowUpdate` | `function` | Row update callback |
| `onRowCreate` | `function` | Row create callback |
| `onRowDelete` | `function` | Row delete callback |

See [complete API documentation](https://github.com/Gdocal/JewTable/blob/main/docs/COMPONENTS.md) for all 91 props.

## Examples

### Editable Table

```tsx
<DataTable
  mode="server"
  data={data}
  columns={columns}
  editable
  enableRowCreation
  enableRowDeletion
  onRowUpdate={handleUpdate}
  onRowCreate={handleCreate}
  onRowDelete={handleDelete}
/>
```

### With Virtualization

```tsx
<DataTable
  mode="server"
  data={data}
  columns={columns}
  enableVirtualization
  totalCount={1000000}
/>
```

### With Reference Data

```tsx
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

## TypeScript Support

Fully typed with TypeScript. All types are exported:

```tsx
import type {
  ColumnDef,
  FilterState,
  SortingState,
  DataTableProps,
} from '@gdocal/jewtable';
```

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 14+

## License

MIT © [Gdocal](https://github.com/Gdocal)

## Repository

**GitHub:** https://github.com/Gdocal/JewTable

**⭐ Star the repo if you find it useful!**

## Contributing

Contributions are welcome! Please open an issue or pull request.

## Support

- [GitHub Issues](https://github.com/Gdocal/JewTable/issues)
- [Documentation](https://github.com/Gdocal/JewTable/blob/main/docs/README.md)
