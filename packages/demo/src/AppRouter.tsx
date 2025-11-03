/**
 * Simple App Router
 * Toggle between demos
 */

import { useState } from 'react';
import App from './App';
import { ReferenceDemo } from './pages/ReferenceDemo';
import './AppRouter.css';

export function AppRouter() {
  const [currentPage, setCurrentPage] = useState<'table' | 'reference'>('table');

  return (
    <div className="app-router">
      <nav className="app-nav">
        <div className="nav-container">
          <h1 className="nav-logo">JewTable</h1>
          <div className="nav-links">
            <button
              className={`nav-link ${currentPage === 'table' ? 'active' : ''}`}
              onClick={() => setCurrentPage('table')}
            >
              📊 DataTable Demo
            </button>
            <button
              className={`nav-link ${currentPage === 'reference' ? 'active' : ''}`}
              onClick={() => setCurrentPage('reference')}
            >
              📑 Reference System Demo
            </button>
          </div>
        </div>
      </nav>

      <main className="app-content">
        {currentPage === 'table' && <App />}
        {currentPage === 'reference' && <ReferenceDemo />}
      </main>
    </div>
  );
}
