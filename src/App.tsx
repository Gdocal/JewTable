/**
 * Development App component
 * This will be used for testing and development
 */

import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>JewTable Development</h1>
        <p>Phase 0: Setup Complete</p>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <h2>Project Structure Ready</h2>
          <p>
            The foundation for JewTable has been set up. The following components are in place:
          </p>
          <ul>
            <li>TypeScript configuration</li>
            <li>Vite build setup</li>
            <li>CSS Modules configuration</li>
            <li>Complete type definitions</li>
            <li>Zustand stores (table state & user preferences)</li>
            <li>Utility functions (formatters, validators, filters, sorting)</li>
            <li>API client wrapper</li>
          </ul>
          <p className={styles.nextSteps}>
            <strong>Next Steps:</strong> Begin Phase 1 - Basic Table Implementation
          </p>
        </div>

        <div className={styles.card}>
          <h3>Architecture Highlights</h3>
          <div className={styles.features}>
            <div className={styles.feature}>
              <h4>State Management</h4>
              <p>Zustand for performance and simplicity</p>
            </div>
            <div className={styles.feature}>
              <h4>Styling</h4>
              <p>CSS Modules for scoped styles</p>
            </div>
            <div className={styles.feature}>
              <h4>API</h4>
              <p>REST with retry & conflict handling</p>
            </div>
            <div className={styles.feature}>
              <h4>Validation</h4>
              <p>Zod schemas for type-safe validation</p>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>JewTable - Feature-Rich Data Table Component</p>
      </footer>
    </div>
  );
}

export default App;
