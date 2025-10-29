/**
 * Development App component
 * Phase 3: Filtering
 */

import { DataTable } from './components/DataTable';
import { employeeColumns, employeeData } from './data/sampleData';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>JewTable Development</h1>
        <p>Phase 3: Filtering</p>
      </header>

      <main className={styles.main}>
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2>Employee Directory</h2>
            <p className={styles.subtitle}>
              Search globally or filter by column • {employeeData.length} employees
            </p>
          </div>

          <DataTable
            tableId="employees"
            columns={employeeColumns}
            data={employeeData}
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

          <h3 className={styles.phaseNext}>Coming in Phase 4</h3>
          <ul>
            <li>⏳ Inline cell editing</li>
            <li>⏳ Cell-level validation</li>
            <li>⏳ Unsaved changes tracking</li>
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
