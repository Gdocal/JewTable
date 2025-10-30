/**
 * Reference Data System Demo
 * Test page for Phase 11 ERP Integration Features
 */

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReferenceCell, setReferenceRegistry } from '../components/DataTable/cells/ReferenceCell';
import { referenceRegistry } from '../config/references';
import { setupMockReferenceApi, resetMockData } from '../utils/mockReferenceApi';
import './ReferenceDemo.css';

// Initialize mock API
setupMockReferenceApi();

// Initialize registry
setReferenceRegistry(referenceRegistry);

// Create QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface DemoItem {
  id: number;
  name: string;
  statusId: number | null;
  departmentId: number | null;
  productId: string | null;
  categoryId: number | null;
}

function ReferenceDemoInner() {
  const [items, setItems] = useState<DemoItem[]>([
    {
      id: 1,
      name: 'Item 1',
      statusId: 1,
      departmentId: 1,
      productId: 'prod-1',
      categoryId: 1,
    },
    {
      id: 2,
      name: 'Item 2',
      statusId: 2,
      departmentId: 2,
      productId: 'prod-5',
      categoryId: 2,
    },
    {
      id: 3,
      name: 'Item 3',
      statusId: null,
      departmentId: null,
      productId: null,
      categoryId: null,
    },
  ]);

  const handleChange = (itemId: number, field: keyof DemoItem, value: any) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
    console.log(`Updated item ${itemId}, ${field} =`, value);
  };

  const handleReset = () => {
    resetMockData();
    window.location.reload();
  };

  return (
    <div className="reference-demo">
      <header className="demo-header">
        <h1>Reference Data System Demo</h1>
        <p>Phase 11: ERP Integration Features (Phase B)</p>
        <button onClick={handleReset} className="reset-button">
          🔄 Reset Mock Data
        </button>
      </header>

      <div className="demo-info">
        <h2>Features to Test:</h2>
        <ul>
          <li>✅ <strong>Statuses</strong> - Inline creation (click "+ Add New", type name, press Enter)</li>
          <li>✅ <strong>Departments</strong> - Modal creation with validation, client-side search with highlighting</li>
          <li>✅ <strong>Products</strong> - Modal with grid layout, server-side search (type 2+ chars)</li>
          <li>✅ <strong>Categories</strong> - Simple dropdown (no creation)</li>
        </ul>
      </div>

      <div className="demo-grid">
        {items.map((item) => (
          <div key={item.id} className="demo-card">
            <h3>{item.name}</h3>

            <div className="demo-field">
              <label>Status (Inline Creation):</label>
              <ReferenceCell
                type="statuses"
                value={item.statusId}
                onChange={(value) => handleChange(item.id, 'statusId', value)}
                placeholder="Select status..."
              />
              <small className="field-hint">Try clicking "+ Add New" and typing a status name</small>
            </div>

            <div className="demo-field">
              <label>Department (Modal + Search):</label>
              <ReferenceCell
                type="departments"
                value={item.departmentId}
                onChange={(value) => handleChange(item.id, 'departmentId', value)}
                placeholder="Select department..."
                onCreateSuccess={(newItem) => {
                  console.log('Department created:', newItem);
                  alert(`Department "${newItem.name}" created successfully!`);
                }}
              />
              <small className="field-hint">
                Try searching "eng" to see highlighting. Click "+ Add New" for modal form.
              </small>
            </div>

            <div className="demo-field">
              <label>Product (Server Search):</label>
              <ReferenceCell
                type="products"
                value={item.productId}
                onChange={(value) => handleChange(item.id, 'productId', value)}
                placeholder="Select product..."
              />
              <small className="field-hint">
                Type 2+ characters to search. Try "SKU-0001" or "Product 5"
              </small>
            </div>

            <div className="demo-field">
              <label>Category (Simple):</label>
              <ReferenceCell
                type="categories"
                value={item.categoryId}
                onChange={(value) => handleChange(item.id, 'categoryId', value)}
                placeholder="Select category..."
              />
              <small className="field-hint">Basic dropdown, no creation</small>
            </div>
          </div>
        ))}
      </div>

      <div className="demo-state">
        <h3>Current State (Open DevTools Console for logs):</h3>
        <pre>{JSON.stringify(items, null, 2)}</pre>
      </div>
    </div>
  );
}

export function ReferenceDemo() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReferenceDemoInner />
    </QueryClientProvider>
  );
}
