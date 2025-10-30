/**
 * Development App component
 * Phase 8: Server Integration
 */

import { useMemo, useState, useEffect } from 'react';
import { DataTable, TableMode, PaginationType } from './components/DataTable';
import { employeeColumns, generateLargeDataset } from './data/sampleData';
import { useInfiniteData } from './hooks/useInfiniteData';
import { useData } from './hooks/useData';
import { useTotalCount } from './hooks/useTotalCount';
import type { Employee } from './data/sampleData';
import { ReferenceCell, setReferenceRegistry } from './components/DataTable/cells/ReferenceCell';
import { referenceRegistry } from './config/references';
import { setupMockReferenceApi } from './utils/mockReferenceApi';
import { CellType } from './components/DataTable/types/cell.types';
import type { DataTableColumnDef } from './components/DataTable/types/column.types';
import styles from './App.module.css';

// Initialize mock reference API and registry (Phase 11)
setupMockReferenceApi();
setReferenceRegistry(referenceRegistry);

function App() {
  // Mode toggle - Phase 8.2: Switch between client and server mode
  const [mode, setMode] = useState<'client' | 'server'>('server'); // Start with server mode

  // Pagination type toggle - Phase 8.3: Switch between infinite and traditional
  const [paginationType, setPaginationType] = useState<'infinite' | 'traditional'>('traditional'); // Start with traditional

  // Pagination state for traditional mode
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Available page size options
  const pageSizeOptions = [10, 25, 50, 100, 200];

  // Generate large dataset for client mode testing (Phase 7)
  const datasetSize = 5000;
  const largeDataset = useMemo(() => generateLargeDataset(datasetSize), []);

  // Reset to page 1 when mode, pagination type, or page size changes
  useEffect(() => {
    setPage(1);
  }, [mode, paginationType, pageSize]);

  // Phase 8.2: Server-side infinite query
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingInfinite,
    isError: isErrorInfinite,
    error: errorInfinite,
  } = useInfiniteData<Employee>({
    resource: 'employees',
    pageSize: pageSize,
    enabled: mode === 'server' && paginationType === 'infinite',
  });

  // Flatten infinite query pages into single array
  const infiniteServerData = useMemo(() => {
    if (!infiniteData) return [];
    return infiniteData.pages.flatMap((page) => page.data);
  }, [infiniteData]);

  // Phase 8.3: Traditional pagination query
  const {
    data: traditionalData,
    isLoading: isLoadingTraditional,
    isFetching: isFetchingTraditional,
    isError: isErrorTraditional,
    error: errorTraditional,
  } = useData<Employee>({
    resource: 'employees',
    page,
    pageSize,
    enabled: mode === 'server' && paginationType === 'traditional',
  });

  // Get total count from API (Phase 8.3)
  const { data: totalCountFromAPI } = useTotalCount({
    resource: 'employees',
    enabled: mode === 'server' && paginationType === 'traditional',
  });

  // Extract traditional pagination data
  const traditionalServerData = traditionalData?.data ?? [];

  // Calculate total rows and pages
  // json-server 1.0 doesn't return total count in headers (unlike json-server 0.x)
  // In production, this would typically come from:
  //   - X-Total-Count header (REST API standard)
  //   - response body field (e.g., { data: [...], total: 5000 })
  //   - dedicated /count endpoint
  // For demo, we fetch total count from API in separate query
  const totalRows = mode === 'server' && paginationType === 'traditional'
    ? (totalCountFromAPI ?? largeDataset.length) // Fallback to dataset length if API not loaded yet
    : largeDataset.length;
  const totalPages = Math.ceil(totalRows / pageSize);

  // Select data based on mode and pagination type
  const tableData = useMemo(() => {
    if (mode === 'server') {
      return paginationType === 'infinite' ? infiniteServerData : traditionalServerData;
    } else {
      // Client mode
      if (paginationType === 'traditional') {
        // Client-side pagination: slice the data
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return largeDataset.slice(startIndex, endIndex);
      } else {
        // Infinite/virtualized scroll: return all data
        return largeDataset;
      }
    }
  }, [mode, paginationType, infiniteServerData, traditionalServerData, largeDataset, page, pageSize]);

  // Select loading state
  const isLoading = mode === 'server'
    ? (paginationType === 'infinite' ? isLoadingInfinite : isLoadingTraditional)
    : false;

  const handleRowReorder = (newOrder: string[]) => {
    console.log('Row order changed:', newOrder);
  };

  const handlePaginationChange = (pagination: { pageIndex: number; pageSize: number }) => {
    // Update page state when pagination changes (pageIndex is 0-based, page is 1-based)
    // Note: Buttons are disabled during fetch to prevent double-active state
    setPage(pagination.pageIndex + 1);

    // Update page size if changed
    if (pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  // Phase 11: Add ReferenceCell column for testing cache behavior across rows
  const columnsWithReference: DataTableColumnDef<Employee>[] = useMemo(() => {
    // Insert reference column after position column (index 1)
    const columns = [...employeeColumns];
    columns.splice(2, 0, {
      id: 'departmentRef',
      header: 'Department (Ref)',
      accessorKey: 'departmentId',
      cellType: CellType.REFERENCE,
      cell: (info: any) => (
        <ReferenceCell
          type="departments"
          value={info.getValue()}
          onChange={(newValue) => {
            console.log(`Row ${info.row.id}: Department changed to ${newValue}`);
            // In real app: update data here
          }}
          onCreateSuccess={(newItem) => {
            console.log('New department created:', newItem);
          }}
        />
      ),
    });
    return columns;
  }, []);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>JewTable Development</h1>
        <p>Phase 8: Server Integration</p>
      </header>

      <main className={styles.main}>
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <h2>Employee Directory - Server Integration Test</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setMode(mode === 'client' ? 'server' : 'client')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  {mode === 'client' ? '🌐 Server' : '💾 Client'} Mode
                </button>
                <button
                  onClick={() => setPaginationType(paginationType === 'infinite' ? 'traditional' : 'infinite')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid #0d6efd',
                    background: '#0d6efd',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  {paginationType === 'infinite' ? '📄 Pagination' : '∞ Scroll'}
                </button>
              </div>
            </div>
            <p className={styles.subtitle}>
              {mode === 'server' && paginationType === 'infinite' &&
                `Server Mode • Infinite Scroll • Loaded ${infiniteServerData.length} rows • ${hasNextPage ? 'More available' : 'All loaded'}`
              }
              {mode === 'server' && paginationType === 'traditional' &&
                `Server Mode • Traditional Pagination • Showing ${traditionalServerData.length} of ${totalRows} rows • Page ${page}/${totalPages}`
              }
              {mode === 'client' && paginationType === 'infinite' &&
                `Client Mode • Virtualized Scroll • ${largeDataset.length.toLocaleString()} rows • All data in memory`
              }
              {mode === 'client' && paginationType === 'traditional' &&
                `Client Mode • Traditional Pagination • Showing ${tableData.length} of ${largeDataset.length.toLocaleString()} rows • Page ${page}/${totalPages}`
              }
            </p>
          </div>

          <DataTable
            tableId="employees"
            columns={columnsWithReference}
            data={tableData}
            mode={mode as TableMode}
            paginationType={paginationType as PaginationType}
            // Infinite pagination props
            onFetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            // Traditional pagination props
            totalRows={totalRows}
            pageCount={totalPages}
            pageSizeOptions={pageSizeOptions}
            onPaginationChange={handlePaginationChange}
            // Common props
            isLoading={isLoading}
            isFetching={paginationType === 'traditional' ? isFetchingTraditional : false}
            enableRowReordering={false}
            enableVirtualization={true}
            rowHeight={53}
            onRowReorder={handleRowReorder}
          />
        </div>

        <div className={styles.infoCard}>
          <h3>Phase 1 Features ✅</h3>
          <ul>
            <li>✅ TanStack Table integration</li>
            <li>✅ Text cells (name, position, department)</li>
            <li>✅ Number cells with currency formatting (salary)</li>
            <li>✅ Number cells with percent formatting (commission)</li>
            <li>✅ Date cells with formatting (start date)</li>
            <li>✅ Checkbox cells (active status)</li>
            <li>✅ CSS Modules styling</li>
            <li>✅ Responsive design</li>
          </ul>

          <h3 className={styles.phaseNext}>Phase 2 Features ✅</h3>
          <ul>
            <li>✅ Column sorting (click any header to sort)</li>
            <li>✅ Ascending/Descending/None states (click 3x)</li>
            <li>✅ Sort indicators with up/down arrows</li>
            <li>✅ Visual feedback for sorted columns</li>
            <li>✅ Hover effect on sortable headers</li>
            <li>✅ Works with all data types</li>
          </ul>

          <h3 className={styles.phaseNext}>Phase 3 Features ✅</h3>
          <ul>
            <li>✅ Global search across all columns</li>
            <li>✅ Column-specific filtering (click filter icon)</li>
            <li>✅ Text filters (contains, equals, starts with, ends with)</li>
            <li>✅ Number filters (equals, between, greater/less than)</li>
            <li>✅ Date filters (equals, before, after, between)</li>
            <li>✅ Select filters (multi-select with checkboxes)</li>
            <li>✅ Active filter chips with individual remove</li>
            <li>✅ Clear all filters button</li>
            <li>✅ Debounced search (300ms)</li>
          </ul>

          <h3 className={styles.phaseNext}>Phase 4 Features ✅</h3>
          <ul>
            <li>✅ Inline cell editing (click any cell)</li>
            <li>✅ EditableTextCell with keyboard shortcuts</li>
            <li>✅ EditableNumberCell with number formatting</li>
            <li>✅ EditableDateCell with date picker</li>
            <li>✅ EditableSelectCell with dropdown</li>
            <li>✅ Enter/Tab to save, Escape to cancel</li>
            <li>✅ Unsaved changes tracking with Map</li>
            <li>✅ Visual feedback (hover, focus, errors)</li>
          </ul>

          <h3 className={styles.phaseNext}>Phase 5 Features ✅</h3>
          <ul>
            <li>✅ Add new rows with "Add Your First Row" button</li>
            <li>✅ Copy existing rows (⎘ icon)</li>
            <li>✅ Insert blank rows (+ icon)</li>
            <li>✅ Delete rows with confirmation (🗑 icon)</li>
            <li>✅ Temporary IDs for new rows (temp_xxx)</li>
            <li>✅ Green highlight animation for new rows</li>
            <li>✅ TableToolbar with read-only indicator</li>
            <li>✅ Enhanced EmptyState with CTA</li>
          </ul>

          <h3 className={styles.phaseNext}>Phase 6 Features ✅</h3>
          <ul>
            <li>✅ Drag & drop row reordering (≡≡ handle)</li>
            <li>✅ DndKit integration with sensors</li>
            <li>✅ Visual feedback during drag (opacity, shadow)</li>
            <li>✅ Smooth animations with SortableContext</li>
            <li>✅ Disabled when sorting/filtering active</li>
            <li>✅ onRowReorder callback for persistence</li>
            <li>✅ Mobile responsive with horizontal scroll</li>
            <li>✅ Drag disabled on mobile to prevent conflicts</li>
          </ul>

          <h3 className={styles.phaseNext}>Phase 7 Features ✅</h3>
          <ul>
            <li>✅ Virtualization for 5000+ rows</li>
            <li>✅ TanStack Virtual integration</li>
            <li>✅ Only ~20 visible rows rendered</li>
            <li>✅ Smooth 60fps scrolling</li>
            <li>✅ Sticky header</li>
          </ul>

          <h3 className={styles.phaseNext}>Phase 8 Features ✅</h3>
          <ul>
            <li>✅ Mock API server with json-server</li>
            <li>✅ API client with retry logic</li>
            <li>✅ TanStack Query integration</li>
            <li>✅ Infinite scroll with useInfiniteQuery</li>
            <li>✅ Traditional pagination with Previous/Next</li>
            <li>✅ Manual pagination with TanStack Table</li>
            <li>✅ Page number buttons (1, 2, 3...)</li>
            <li>✅ Client/Server mode toggle</li>
            <li>✅ Infinite/Traditional pagination toggle</li>
            <li>✅ Loading indicators</li>
            <li>⏳ Server-side sorting/filtering (future)</li>
          </ul>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>JewTable - Feature-Rich Data Table Component</p>
      </footer>
    </div>
  );
}

export default App;
