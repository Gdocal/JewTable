/**
 * Development App component
 * Phase 1: Testing basic DataTable
 */

import { DataTable } from './components/DataTable';
import { employeeColumns, employeeData } from './data/sampleData';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>JewTable Development</h1>
        <p>Phase 1: Basic Table - Read-Only Cells</p>
      </header>

      <main className={styles.main}>
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2>Employee Directory</h2>
            <p className={styles.subtitle}>
              Testing table with {employeeData.length} employees across 7 column types
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

          <h3 className={styles.phaseNext}>Coming in Phase 2</h3>
          <ul>
            <li>⏳ Column sorting (click headers)</li>
            <li>⏳ Multi-column sorting</li>
            <li>⏳ Sort indicators</li>
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
