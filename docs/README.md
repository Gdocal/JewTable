# JewTable Documentation

Complete documentation for JewTable - A powerful, feature-rich data table component built with React, TanStack Table, and TypeScript.

## Quick Links

- **[Quick Start Tutorial](./TUTORIALS/01-quick-start.md)** - Get started in 5 minutes
- **[Backend API Documentation](../backend/README.md)** - Production REST API guide
- **[Component API Reference](./COMPONENTS.md)** - All DataTable props
- **[Cell Types Reference](./CELLS.md)** - All 12 cell types
- **[Filter Types Reference](./FILTERS.md)** - All 15+ filter operators

## Documentation Structure

### Tutorials

Step-by-step guides to learn JewTable:

1. **[Quick Start](./TUTORIALS/01-quick-start.md)**
   - Installation
   - Basic client-side table
   - Server-side table with pagination
   - Editable table
   - Column configuration
   - Common patterns

2. **[Advanced Filtering](./TUTORIALS/02-advanced-filtering.md)**
   - All filter operators
   - Text, number, date, boolean filters
   - Combining filters with AND/OR logic
   - Global search
   - Programmatic filtering
   - Performance tips

3. **[Reference Data](./TUTORIALS/05-reference-data.md)**
   - REFERENCE cell type
   - API integration
   - Caching with TanStack Query
   - Searchable dropdowns
   - Inline creation
   - Multi-tenancy

### API Reference

Complete reference documentation:

- **[DataTable Component](./COMPONENTS.md)**
  - All 91 props organized by category
  - Data props, feature flags, callbacks
  - Pagination, virtualization, customization
  - Usage examples

- **[Cell Types](./CELLS.md)**
  - TEXT - Basic text input
  - NUMBER - Numeric input with formatting
  - CURRENCY - Money with symbol
  - PERCENT - Percentage display
  - DATE / DATETIME - Date pickers
  - BOOLEAN - Checkboxes
  - SELECT - Dropdowns
  - BADGE - Status badges
  - PROGRESS - Progress bars
  - REFERENCE - API-backed dropdowns
  - EMAIL - Email validation

- **[Filter Types](./FILTERS.md)**
  - Text: contains, equals, startsWith, endsWith, notContains, regex
  - Number: eq, ne, gt, gte, lt, lte, between, in, notIn
  - Date: before, after, onOrBefore, onOrAfter, dateEquals, dateBetween
  - Boolean: isTrue, isFalse
  - Null: isEmpty, isNotEmpty

### Backend Documentation

Production-ready REST API:

- **[Backend README](../backend/README.md)**
  - Architecture overview
  - API endpoints
  - Advanced filtering
  - Authentication & security
  - Deployment guide
  - Migration from json-server

### Specialized Guides

Deep-dive documentation:

- **[Reference Data System](./REFERENCE_DATA_SYSTEM.md)**
  - Complete system architecture
  - Cache behavior
  - Multi-tenancy
  - Performance optimization

- **[Reference Cache Behavior](./REFERENCE_CACHE_BEHAVIOR.md)**
  - TanStack Query caching
  - Cache invalidation strategies
  - Memory optimization

- **[Reference Quick Start](./REFERENCE_QUICK_START.md)**
  - Quick reference for common tasks
  - Code snippets

- **[Reference Testing Guide](./REFERENCE_TESTING_GUIDE.md)**
  - Testing reference data features
  - Mock data strategies

## Features

### Core Features

- **Multiple Modes**
  - Client-side: All data in browser
  - Server-side: Pagination, filtering, sorting on backend
  - Virtualization: Infinite scroll for large datasets

- **Cell Types**
  - 12 specialized cell types
  - Built-in validation
  - Custom formatting
  - Inline editing

- **Filtering**
  - 15+ filter operators
  - AND/OR logic
  - Global search
  - Client and server support

- **Sorting**
  - Multi-column sorting
  - Custom sort functions
  - Server-side sorting

- **Pagination**
  - Traditional pagination
  - Cursor-based pagination
  - Custom page sizes

- **Editing**
  - Inline cell editing
  - Row creation/deletion
  - Batch operations
  - Optimistic updates
  - Validation

### Advanced Features

- **Reference Data**
  - API-backed dropdowns
  - Lazy loading
  - Caching
  - Inline creation
  - Multi-tenancy

- **Performance**
  - Virtual scrolling
  - Memoization
  - Lazy loading
  - Debouncing

- **User Preferences**
  - Column visibility
  - Column width
  - Column order
  - Filter state
  - Sort state
  - Server persistence

- **UI/UX**
  - Drag & drop column reordering
  - Column resizing
  - Row selection
  - Row expansion
  - Custom renderers
  - Loading states

## Getting Started

### Installation

```bash
npm install @tanstack/react-table @tanstack/react-query
```

### Basic Example

```typescript
import { DataTable } from '@/components/DataTable';
import { CellType } from '@/components/DataTable/types/cell.types';

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
    cellOptions: { currency: 'USD', symbol: '$' },
  },
];

export function MyTable() {
  return (
    <DataTable
      mode="client"
      data={data}
      columns={columns}
      enableSorting
      enableFiltering
    />
  );
}
```

See [Quick Start Tutorial](./TUTORIALS/01-quick-start.md) for complete guide.

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **TanStack Table v8** - Table state management
- **TanStack Query v5** - Server state & caching
- **TanStack Virtual** - Virtual scrolling
- **@dnd-kit** - Drag and drop
- **Zod** - Validation
- **CSS Modules** - Styling

### Backend
- **Node.js 20** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL 15** - Database
- **Prisma ORM** - Database ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Architecture

### Client Architecture

```
DataTable Component
├── Table State (TanStack Table)
│   ├── Column definitions
│   ├── Sorting state
│   ├── Filter state
│   ├── Pagination state
│   └── Selection state
├── Server State (TanStack Query)
│   ├── Data fetching
│   ├── Caching
│   └── Mutations
├── Virtualization (TanStack Virtual)
│   └── Infinite scroll
└── Drag & Drop (@dnd-kit)
    ├── Column reordering
    └── Row reordering
```

### Backend Architecture

```
Express Server
├── Routes
│   ├── Authentication
│   ├── Table CRUD
│   ├── Reference Data
│   └── User Settings
├── Middleware
│   ├── Authentication (JWT)
│   ├── Error Handling
│   └── Rate Limiting
├── Services
│   ├── Auth Service
│   └── Query Builder
└── Database (PostgreSQL + Prisma)
    ├── Organizations
    ├── Users
    ├── Main Tables
    ├── Reference Tables
    └── Settings
```

## Common Use Cases

### 1. Simple Read-Only Table

```typescript
<DataTable
  mode="client"
  data={employees}
  columns={columns}
  enableSorting
  enableFiltering
/>
```

### 2. Editable Table with Server

```typescript
<DataTable
  mode="server"
  data={data}
  columns={columns}
  editable
  enableRowCreation
  onRowUpdate={handleUpdate}
  onRowCreate={handleCreate}
  onRowDelete={handleDelete}
/>
```

### 3. Large Dataset with Virtualization

```typescript
<DataTable
  mode="server"
  data={data}
  columns={columns}
  enableVirtualization
  totalCount={totalCount}
  onLoadMore={loadMore}
/>
```

### 4. Complex Filtering

```typescript
<DataTable
  mode="server"
  data={data}
  columns={columns}
  enableFiltering
  filters={filters}
  onFilterChange={setFilters}
  enableGlobalFilter
  searchableColumns={['name', 'email']}
/>
```

## Performance Tips

1. **Choose the right mode:**
   - Client mode: < 1,000 rows
   - Server mode: > 1,000 rows
   - Virtualization: > 10,000 rows

2. **Enable only what you need:**
   - Don't enable unused features
   - Each feature adds overhead

3. **Use TanStack Query:**
   - Automatic caching
   - Background refetching
   - Optimistic updates

4. **Backend optimization:**
   - Add database indexes
   - Use connection pooling
   - Implement query caching

5. **Frontend optimization:**
   - Debounce filter inputs (300ms)
   - Memoize custom cells
   - Virtual scrolling for large lists

## Best Practices

### 1. Type Safety

Always use TypeScript interfaces:

```typescript
interface Employee {
  id: string;
  name: string;
  email: string;
  salary: number;
  departmentId: string;
}

const columns: ColumnDef<Employee>[] = [
  // Type-safe column definitions
];
```

### 2. Error Handling

Handle loading and error states:

```typescript
const { data, isLoading, error } = useQuery({...});

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

### 3. Validation

Validate user input:

```typescript
{
  accessorKey: 'email',
  header: 'Email',
  cellType: CellType.EMAIL,
  required: true,
  validate: (value) => {
    if (!value) return 'Email is required';
    if (!isValidEmail(value)) return 'Invalid email format';
    return true;
  },
}
```

### 4. Security

- Always authenticate API requests
- Validate user permissions
- Sanitize user input
- Use HTTPS in production
- Implement rate limiting

### 5. Accessibility

- Use semantic HTML
- Add ARIA labels
- Support keyboard navigation
- Test with screen readers

## Troubleshooting

### Common Issues

**Table not rendering:**
- Check `data` is an array
- Verify `columns` have `accessorKey`
- Ensure imports are correct

**Filters not working:**
- Check `enableFiltering` is true
- Verify column has `enableFiltering: true`
- For server mode, implement `onFilterChange`

**Performance issues:**
- Switch to server mode
- Enable virtualization
- Add database indexes
- Profile with React DevTools

**Reference data not loading:**
- Check API endpoint
- Verify authentication
- Check browser console for errors

See individual documentation for detailed troubleshooting.

## Migration Guides

### From json-server

See [Backend README](../backend/README.md#migration-from-json-server) for complete migration guide.

### From TanStack Table v7

Major breaking changes in v8:
- Column definitions syntax changed
- Filter format changed
- Sort format changed

See [Quick Start](./TUTORIALS/01-quick-start.md) for v8 syntax.

## Contributing

### Documentation Improvements

Found an issue or want to improve docs?

1. Check existing documentation
2. Create issue describing improvement
3. Submit pull request with changes

### Code Examples

All examples should:
- Be fully typed with TypeScript
- Include error handling
- Follow project conventions
- Be tested

## Support

### Resources

- [Quick Start Tutorial](./TUTORIALS/01-quick-start.md)
- [API Documentation](./COMPONENTS.md)
- [Backend Documentation](../backend/README.md)
- [GitHub Issues](https://github.com/your-repo/jewtable/issues)

### Getting Help

1. Check documentation first
2. Search existing issues
3. Create new issue with:
   - Clear description
   - Minimal reproduction
   - Expected vs actual behavior
   - Environment details

## License

[Add your license here]

## Changelog

See [CHANGELOG.md](../CHANGELOG.md) for version history.

---

**Last Updated:** 2025-11-03

**Documentation Version:** 1.0.0

**Component Version:** 1.0.0
