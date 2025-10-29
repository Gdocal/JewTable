# JewTable Architecture Document

## Overview
A feature-rich, performant React table component built with TanStack Table for complex data management needs.

## Core Technology Stack

### Frontend Framework
- **React 18+** - Latest features including concurrent rendering
- **TypeScript** - Full type safety across the codebase

### Table Core
- **@tanstack/react-table** - Headless table logic and state management
- **@tanstack/react-virtual** - Virtual scrolling for large datasets (>1000 rows)

### State Management
- **Zustand** - Lightweight state management for table-wide state
  - User preferences (column visibility, widths, filters, sorting)
  - Unsaved changes tracking
  - Server sync state
  - Reasons: Minimal boilerplate, excellent performance, small bundle size (~1KB)

### Styling
- **CSS Modules** - Scoped component styles
  - File naming: `ComponentName.module.css`
  - Co-located with components
  - BEM methodology for class names within modules
  - Reasons: No runtime overhead, familiar CSS, good IDE support

### Drag & Drop
- **@dnd-kit/core** + **@dnd-kit/sortable** - Row reordering
  - Accessibility built-in
  - Touch support for mobile
  - Performant animations

### Form & Validation
- **react-hook-form** - Form state for inline editing
- **zod** - Schema validation for cells and rows
- **date-fns** - Date manipulation and formatting

### API Communication
- **REST API** with fetch wrapper
- **SWR** or **TanStack Query** for data fetching, caching, and optimistic updates
  - Decision needed: Which one? (Recommendation: TanStack Query for better integration with TanStack Table)

## Architecture Patterns

### 1. Hybrid Data Strategy

```typescript
// Auto-detect mode based on dataset size
const tableMode = rowCount > 300 ? 'server' : 'client';

// Client mode: All operations in-browser, periodic sync
// Server mode: Pagination, filtering, sorting via API
```

**Client Mode (≤300 rows):**
- All data loaded upfront
- Client-side filtering, sorting, search
- Debounced server sync (3-5s) for user state
- Optimistic updates for edits

**Server Mode (>300 rows):**
- Pagination (50-100 rows per page)
- Server-side filtering, sorting, search
- Virtual scrolling for loaded pages
- Lazy loading on scroll

### 2. Component Architecture

```
src/
├── components/
│   └── DataTable/
│       ├── index.tsx                    # Main export & orchestration
│       ├── DataTable.tsx                # Core table component
│       ├── DataTable.module.css
│       │
│       ├── components/                  # Sub-components
│       │   ├── TableHeader/
│       │   │   ├── TableHeader.tsx
│       │   │   ├── TableHeader.module.css
│       │   │   ├── SortIndicator.tsx
│       │   │   └── FilterButton.tsx
│       │   │
│       │   ├── TableBody/
│       │   │   ├── TableBody.tsx
│       │   │   ├── VirtualizedTableBody.tsx
│       │   │   └── TableBody.module.css
│       │   │
│       │   ├── TableRow/
│       │   │   ├── TableRow.tsx
│       │   │   ├── DraggableRow.tsx
│       │   │   ├── TableRow.module.css
│       │   │   └── RowActions.tsx
│       │   │
│       │   ├── EditableCell/
│       │   │   ├── EditableCell.tsx
│       │   │   ├── EditableCell.module.css
│       │   │   └── CellError.tsx
│       │   │
│       │   ├── FilterPopover/
│       │   │   ├── FilterPopover.tsx
│       │   │   ├── FilterPopover.module.css
│       │   │   └── FilterChips.tsx
│       │   │
│       │   ├── GlobalSearch/
│       │   │   ├── GlobalSearch.tsx
│       │   │   └── GlobalSearch.module.css
│       │   │
│       │   └── Mobile/
│       │       ├── MobileCard.tsx
│       │       ├── MobileCard.module.css
│       │       └── MobileFiltersDrawer.tsx
│       │
│       ├── cells/                       # Cell type implementations
│       │   ├── CellRenderer.tsx         # Cell factory
│       │   ├── TextCell/
│       │   │   ├── TextCell.tsx
│       │   │   ├── EditableTextCell.tsx
│       │   │   └── TextCell.module.css
│       │   ├── NumberCell/
│       │   │   ├── NumberCell.tsx
│       │   │   ├── EditableNumberCell.tsx
│       │   │   └── NumberCell.module.css
│       │   ├── DateCell/
│       │   │   ├── DateCell.tsx
│       │   │   ├── EditableDateCell.tsx
│       │   │   ├── DatePicker.tsx
│       │   │   └── DateCell.module.css
│       │   ├── DateRangeCell/
│       │   │   ├── DateRangeCell.tsx
│       │   │   ├── EditableDateRangeCell.tsx
│       │   │   └── DateRangeCell.module.css
│       │   ├── SelectCell/
│       │   │   ├── SelectCell.tsx
│       │   │   ├── EditableSelectCell.tsx
│       │   │   └── SelectCell.module.css
│       │   ├── CheckboxCell/
│       │   │   ├── CheckboxCell.tsx
│       │   │   └── CheckboxCell.module.css
│       │   └── CustomCell/
│       │       └── CustomCell.tsx        # For user-provided renderers
│       │
│       ├── hooks/                       # Business logic hooks
│       │   ├── useTableState.ts         # Master state orchestration
│       │   ├── useTableData.ts          # Data fetching & caching
│       │   ├── useTableFilters.ts       # Filter state & logic
│       │   ├── useTableSort.ts          # Sort state & logic
│       │   ├── useRowDragDrop.ts        # D&D logic
│       │   ├── useInlineEdit.ts         # Edit mode state
│       │   ├── useUnsavedChanges.ts     # Change tracking
│       │   ├── useServerSync.ts         # Debounced server sync
│       │   ├── useBreakpoint.ts         # Responsive breakpoints
│       │   └── useKeyboardNavigation.ts # Arrow key navigation
│       │
│       ├── filters/                     # Filter UI components
│       │   ├── TextFilter.tsx
│       │   ├── NumberFilter.tsx
│       │   ├── DateFilter.tsx
│       │   ├── DateRangeFilter.tsx
│       │   └── SelectFilter.tsx
│       │
│       ├── store/                       # Zustand stores
│       │   ├── tableStore.ts            # Global table state
│       │   └── userPreferencesStore.ts  # User-specific preferences
│       │
│       ├── utils/                       # Utilities
│       │   ├── api.ts                   # API client wrapper
│       │   ├── validation.ts            # Validation helpers
│       │   ├── formatters.ts            # Data formatting (numbers, dates)
│       │   ├── filterUtils.ts           # Filter matching logic
│       │   ├── sortUtils.ts             # Custom sort comparators
│       │   └── constants.ts             # Constants & enums
│       │
│       └── types/                       # TypeScript types
│           ├── index.ts                 # Main exports
│           ├── table.types.ts           # Table-related types
│           ├── column.types.ts          # Column definition types
│           ├── filter.types.ts          # Filter types
│           ├── cell.types.ts            # Cell types
│           └── api.types.ts             # API request/response types
│
└── __tests__/                          # Tests (mirrors structure)
    └── DataTable/
        ├── hooks/
        ├── components/
        └── utils/
```

### 3. State Management Strategy

**Zustand Store Structure:**

```typescript
// store/tableStore.ts
interface TableStore {
  // Data
  data: Map<string, RowData[]>;           // Keyed by tableId

  // UI State
  editingCell: CellId | null;
  selectedRows: Set<string>;
  expandedRows: Set<string>;              // For mobile cards

  // Filters & Sorting
  filters: Map<string, FilterState>;       // Per table
  sorting: Map<string, SortState>;
  globalSearch: Map<string, string>;

  // Unsaved changes
  pendingChanges: Map<string, RowChanges>;

  // Actions
  setData: (tableId: string, data: RowData[]) => void;
  updateRow: (tableId: string, rowId: string, data: Partial<RowData>) => void;
  // ... other actions
}

// store/userPreferencesStore.ts
interface UserPreferencesStore {
  // Per table, per user preferences
  columnVisibility: Map<string, Record<string, boolean>>;
  columnWidths: Map<string, Record<string, number>>;
  columnOrder: Map<string, string[]>;

  // Persisted to server
  savePreferences: (tableId: string, userId: string) => Promise<void>;
  loadPreferences: (tableId: string, userId: string) => Promise<void>;
}
```

### 4. API Integration

**REST API Endpoints:**

```typescript
// GET /api/tables/:tableId/data
interface GetTableDataRequest {
  page?: number;           // For pagination
  pageSize?: number;
  filters?: FilterParams;  // Serialized filters
  sort?: SortParams;
  search?: string;
}

interface GetTableDataResponse {
  data: RowData[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// PUT /api/tables/:tableId/rows/:rowId
interface UpdateRowRequest {
  data: Partial<RowData>;
  version?: number;        // For optimistic locking
}

// POST /api/tables/:tableId/rows
interface CreateRowRequest {
  data: RowData;
}

// DELETE /api/tables/:tableId/rows/:rowId

// PUT /api/tables/:tableId/rows/reorder
interface ReorderRowsRequest {
  rowIds: string[];        // New order
}

// GET/PUT /api/tables/:tableId/preferences/:userId
interface UserPreferences {
  filters?: FilterState;
  sorting?: SortState;
  columnVisibility?: Record<string, boolean>;
  columnWidths?: Record<string, number>;
}
```

### 5. Mobile-First Responsive Strategy

**Breakpoints:**
- Mobile: < 768px → Card layout
- Tablet: 768px - 1024px → Compact table
- Desktop: > 1024px → Full table

**Mobile Adaptations:**
- Replace table with expandable cards
- Full-screen modals for filters and editing
- Bottom sheet for row actions
- Touch gestures (swipe, long-press)
- Sticky action buttons

### 6. Performance Optimizations

1. **Memoization:**
   ```typescript
   // Memoize expensive computations
   const filteredData = useMemo(() =>
     applyFilters(data, filters),
     [data, filters]
   );

   // Memoize components
   const MemoizedRow = React.memo(TableRow);
   ```

2. **Virtual Scrolling:**
   - Only for datasets > 300 rows
   - Render only visible rows + overscan
   - Dynamic row heights for content

3. **Debouncing:**
   - Search input: 300ms
   - Filter changes: 300ms
   - Server sync: 3-5s
   - Column resize: 150ms

4. **Code Splitting:**
   ```typescript
   // Lazy load heavy components
   const MobileDatePicker = lazy(() => import('./DatePicker.mobile'));
   ```

### 7. Validation Architecture

**Two-Level Validation:**

```typescript
// Level 1: Cell-level validation
const cellSchema = z.string().email();

// Level 2: Row-level validation (cross-field)
const rowSchema = z.object({
  startDate: z.date(),
  endDate: z.date()
}).refine(data => data.endDate >= data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});
```

**Validation Flow:**
1. On cell blur → cell validation
2. If cell valid → save to local state
3. On row save attempt → row validation
4. If row valid → optimistic update + API call
5. If API error → rollback + show error

### 8. Conflict Resolution

**Optimistic Locking Strategy:**
1. Each row has a `version` or `updatedAt` timestamp
2. Client sends version with update
3. Server compares versions
4. If mismatch → 409 Conflict response
5. Client shows conflict dialog:
   - "Data was modified by another user"
   - Options: Reload / Overwrite / Merge

### 9. Accessibility (a11y)

- Semantic HTML (`<table>`, proper ARIA labels)
- Keyboard navigation (arrow keys, tab, enter, escape)
- Screen reader announcements (live regions for updates)
- Focus management (trap focus in modals)
- Color contrast compliance (WCAG AA)
- Touch targets ≥ 44x44px

### 10. Testing Strategy

```
Tests/
├── unit/                 # Hooks, utils, pure functions
├── integration/          # Component interactions
└── e2e/                  # Full user flows
```

**Key Test Scenarios:**
- CRUD operations (create, read, update, delete rows)
- Filtering (all types, combinations, AND/OR)
- Sorting (all column types, multi-column)
- Drag & drop (reorder, edge cases)
- Validation (cell, row, async)
- Mobile responsiveness
- Keyboard navigation
- Performance (large datasets)

## Key Design Decisions & Rationale

### Why Zustand over Context?
- Better performance for frequent updates
- Less boilerplate than Redux
- Built-in middleware (persist, devtools)
- Small bundle size

### Why CSS Modules over styled-components?
- No runtime overhead
- Familiar CSS syntax
- Better TypeScript integration
- Smaller bundle size
- No FOUC (Flash of Unstyled Content)

### Why TanStack Table?
- Headless (full UI control)
- Excellent TypeScript support
- Built-in features (sorting, filtering, pagination)
- Virtualization ready
- Active maintenance

### Why REST over GraphQL?
- Simpler to implement
- Better caching with standard HTTP
- No additional server complexity
- Table operations map well to CRUD

### Why @dnd-kit over react-beautiful-dnd?
- Better maintained
- Better performance
- Built-in accessibility
- Touch support
- Smaller bundle

## Development Principles

1. **Type Safety First** - Leverage TypeScript strictly
2. **Composition over Inheritance** - Small, composable components
3. **Performance by Default** - Memoize, virtualize, debounce
4. **Mobile Parity** - Mobile is not an afterthought
5. **Accessibility Always** - WCAG AA compliance minimum
6. **Progressive Enhancement** - Core features work, enhancements layer on
7. **Test Coverage** - Unit test utilities, integration test flows

## Future Considerations

### Potential Extensions (Out of MVP Scope)
- Column grouping / pivoting
- Frozen columns (sticky left/right)
- Row grouping / hierarchical data
- Custom aggregations (sum, avg, count)
- CSV/Excel export with formatting
- Print-optimized view
- Collaborative editing (real-time cursors)
- Undo/Redo history
- Audit log for changes
- Saved filter presets
- Advanced search (regex, fuzzy)

### Scalability Paths
- Web Workers for heavy filtering/sorting
- IndexedDB for client-side caching
- WebSocket for real-time updates
- Server-Sent Events for live data
- Edge caching for static config

---

**Document Version:** 1.0
**Last Updated:** 2025-10-29
**Status:** Initial Architecture
