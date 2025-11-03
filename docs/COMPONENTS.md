# JewTable Component Documentation

Complete documentation of all props, methods, and usage patterns.

## DataTable Component

Main component for rendering data tables with advanced features.

### Props Overview

The DataTable component accepts 91 props organized into these categories:

#### Data Props
- `data`: Array of row data objects
- `initialData`: Initial data before server load
- `columns`: Column definitions (ColumnDef[])
- `mode`: `'client' | 'server'` - Data mode
- `paginationType`: `'infinite' | 'traditional'` - Pagination type

#### Feature Flags
- `enableSorting`: Enable column sorting (default: true)
- `enableFiltering`: Enable column filtering (default: true)
- `enableGlobalFilter`: Enable global search (default: false)
- `enableRowSelection`: Enable row selection (default: false)
- `enableMultiRowSelection`: Enable multi-select (default: true)
- `enableRowReordering`: Enable drag-drop rows (default: false)
- `enableColumnReordering`: Enable drag-drop columns (default: false)
- `enableColumnResizing`: Enable column resizing (default: false)
- `enableVirtualization`: Enable virtual scrolling (default: false)
- `enableInlineEditing`: Enable cell editing (default: false)
- `enableRowExpanding`: Enable expandable rows (default: false)
- `enableRowDetailsModal`: Enable row details modal (default: false)

#### Callbacks
- `onRowUpdate`: (rowId, updates) => void - Row update handler
- `onRowCreate`: (data) => void - Row create handler
- `onRowDelete`: (rowIds) => void - Row delete handler
- `onRowReorder`: (rows) => void - Row reorder handler
- `onSortChange`: (sorting) => void - Sort change handler (server mode)
- `onFilterChange`: (filters) => void - Filter change handler (server mode)
- `onRowSelectionChange`: (rows) => void - Selection change handler
- `onPaginationChange`: ({page, pageSize}) => void - Pagination handler

#### Pagination Props
- `page`: Current page number
- `pageSize`: Rows per page
- `pageCount`: Total pages
- `totalRows`: Total row count
- `pageSizeOptions`: [10, 25, 50, 100, 500]
- `hasNextPage`: Boolean for infinite scroll
- `isFetchingNextPage`: Loading state
- `onFetchNextPage`: () => void - Fetch next handler

#### UI Customization
- `rowHeight`: 48 - Row height in pixels
- `tableHeight`: 'auto' | number - Table container height
- `enableStickyHeader`: true - Sticky header on scroll
- `enableStickyFirstColumn`: false - Sticky first column
- `showPaginationControls`: true - Show pagination UI
- `showFilterRow`: false - Show filter row under headers

#### Custom Renderers
- `renderExpandedContent`: (row) => ReactNode - Expanded row content
- `renderModal`: (row, onSave, onCancel) => ReactNode - Custom modal
- `renderToolbar`: () => ReactNode - Custom toolbar

#### Loading States
- `isLoading`: Boolean - Initial loading
- `isFetching`: Boolean - Background loading

### Example Usage

#### Basic Client-Side Table

```tsx
import { DataTable, CellType } from '@/components/DataTable';

const columns = [
  {
    accessorKey: 'id',
    header: 'ID',
    cellType: CellType.TEXT,
  },
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
];

function MyTable() {
  const [data, setData] = useState([]);

  return (
    <DataTable
      data={data}
      columns={columns}
      mode="client"
      enableSorting
      enableFiltering
    />
  );
}
```

#### Server-Side Table with Filtering

```tsx
function ServerTable() {
  const [filters, setFilters] = useState({});
  const [sorting, setSorting] = useState([]);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', page, filters, sorting],
    queryFn: () => fetchEmployees({ page, filters, sorting }),
  });

  return (
    <DataTable
      data={data?.data || []}
      columns={columns}
      mode="server"
      page={page}
      pageSize={100}
      totalRows={data?.totalCount}
      pageCount={data?.totalPages}
      onSortChange={setSorting}
      onFilterChange={setFilters}
      onPaginationChange={({ page }) => setPage(page)}
      enableSorting
      enableFiltering
      enableVirtualization
      isLoading={isLoading}
    />
  );
}
```

#### Editable Table

```tsx
function EditableTable() {
  const handleRowUpdate = async (rowId: string, updates: Partial<Employee>) => {
    await api.updateEmployee(rowId, updates);
    refetch();
  };

  const handleRowCreate = async (data: Omit<Employee, 'id'>) => {
    await api.createEmployee(data);
    refetch();
  };

  return (
    <DataTable
      data={employees}
      columns={columns}
      enableInlineEditing
      onRowUpdate={handleRowUpdate}
      onRowCreate={handleRowCreate}
      onRowDelete={handleRowDelete}
    />
  );
}
```

See [CELLS.md](./CELLS.md) for cell type documentation and [FILTERS.md](./FILTERS.md) for filter configuration.
