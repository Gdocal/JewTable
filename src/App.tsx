/**
 * Development App component
 * Phase 2: Column Sorting
 */

import { DataTable } from './components/DataTable';
import { employeeColumns, employeeData } from './data/sampleData';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>JewTable Development</h1>
        <p>Phase 2: Column Sorting</p>
      </header>

      <main className={styles.main}>
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2>Employee Directory</h2>
            <p className={styles.subtitle}>
              Click any column header to sort • {employeeData.length} employees
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

          <h3 className={styles.phaseNext}>Coming in Phase 3</h3>
          <ul>
            <li>⏳ Advanced filtering (ag-Grid style)</li>
            <li>⏳ Quick search across all columns</li>
            <li>⏳ Filter chips and clear all</li>
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
