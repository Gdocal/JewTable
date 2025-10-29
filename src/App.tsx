/**
 * Development App component
 * Phase 8: Server Integration
 */

import { useMemo, useState } from 'react';
import { DataTable, TableMode } from './components/DataTable';
import { employeeColumns, generateLargeDataset } from './data/sampleData';
import { useInfiniteData } from './hooks/useInfiniteData';
import type { Employee } from './data/sampleData';
import styles from './App.module.css';

function App() {
  // Mode toggle - Phase 8.2: Switch between client and server mode
  const [mode, setMode] = useState<'client' | 'server'>('server'); // Start with server mode

  // Generate large dataset for client mode testing (Phase 7)
  const largeDataset = useMemo(() => generateLargeDataset(5000), []);

  // Phase 8.2: Server-side infinite query
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteData<Employee>({
    resource: 'employees',
    pageSize: 100,
    enabled: mode === 'server', // Only enabled in server mode
  });

  // Flatten infinite query pages into single array
  const serverData = useMemo(() => {
    if (!infiniteData) return [];
    return infiniteData.pages.flatMap((page) => page.data);
  }, [infiniteData]);

  // Select data based on mode
  const tableData = mode === 'server' ? serverData : largeDataset;

  const handleRowReorder = (newOrder: string[]) => {
    console.log('Row order changed:', newOrder);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>JewTable Development</h1>
        <p>Phase 8: Server Integration</p>
      </header>

      <main className={styles.main}>
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2>Employee Directory - Server Integration Test</h2>
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
                Switch to {mode === 'client' ? 'Server' : 'Client'} Mode
              </button>
            </div>
            <p className={styles.subtitle}>
              {mode === 'server'
                ? `Server Mode • Loaded ${serverData.length} rows • Infinite scroll enabled • ${hasNextPage ? 'More available' : 'All loaded'}`
                : `Client Mode • ${largeDataset.length.toLocaleString()} rows • All data in memory`
              }
            </p>
          </div>

          <DataTable
            tableId="employees"
            columns={employeeColumns}
            data={tableData}
            mode={mode as TableMode}
            onFetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isLoading={isLoading}
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
            <li>✅ Server mode with automatic pagination</li>
            <li>✅ Client/Server mode toggle</li>
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
