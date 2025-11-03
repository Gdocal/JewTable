/**
 * Mock Reference API
 * For testing the reference data system
 */

// Mock data storage
let mockStatuses = [
  { id: 1, name: 'Active', color: '#28a745' },
  { id: 2, name: 'Inactive', color: '#dc3545' },
  { id: 3, name: 'Pending', color: '#ffc107' },
];

let mockDepartments = [
  { id: 1, name: 'Engineering', code: 'ENG', managerId: 101 },
  { id: 2, name: 'Sales', code: 'SAL', managerId: 102 },
  { id: 3, name: 'Marketing', code: 'MKT', managerId: 103 },
  { id: 4, name: 'Human Resources', code: 'HR', managerId: 104 },
  { id: 5, name: 'Finance', code: 'FIN', managerId: 105 },
  { id: 6, name: 'Operations', code: 'OPS', managerId: 106 },
  { id: 7, name: 'Customer Support', code: 'CS', managerId: 107 },
  { id: 8, name: 'Research & Development', code: 'RND', managerId: 108 },
];

let mockProducts = Array.from({ length: 100 }, (_, i) => ({
  id: `prod-${i + 1}`,
  name: `Product ${i + 1}`,
  sku: `SKU-${String(i + 1).padStart(4, '0')}`,
  price: Math.round(Math.random() * 1000 * 100) / 100,
  inStock: Math.random() > 0.3,
}));

let mockCategories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Furniture' },
  { id: 3, name: 'Office Supplies' },
  { id: 4, name: 'Software' },
];

/**
 * Setup mock API endpoints
 */
export function setupMockReferenceApi() {
  // Intercept fetch calls
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    // Statuses
    if (url.includes('/api/references/statuses')) {
      if (init?.method === 'POST') {
        await delay(500);
        const data = JSON.parse(init.body as string);
        const newStatus = {
          id: Math.max(...mockStatuses.map(s => s.id)) + 1,
          name: data.name,
          color: data.color || '#6c757d',
        };
        mockStatuses.push(newStatus);
        return jsonResponse(newStatus);
      }
      await delay(300);
      return jsonResponse(mockStatuses);
    }

    // Departments
    if (url.includes('/api/references/departments')) {
      if (init?.method === 'POST') {
        await delay(800);
        const data = JSON.parse(init.body as string);
        const newDept = {
          id: Math.max(...mockDepartments.map(d => d.id)) + 1,
          name: data.name,
          code: data.code,
          managerId: data.managerId,
        };
        mockDepartments.push(newDept);
        return jsonResponse(newDept);
      }
      await delay(400);
      return jsonResponse(mockDepartments);
    }

    // Products with server-side search
    if (url.includes('/api/references/products')) {
      if (init?.method === 'POST') {
        await delay(1000);
        const data = JSON.parse(init.body as string);
        const newProduct = {
          id: `prod-${Date.now()}`,
          name: data.name,
          sku: data.sku,
          price: data.price,
          inStock: data.inStock || false,
        };
        mockProducts.push(newProduct);
        return jsonResponse(newProduct);
      }

      // Server-side search
      const urlObj = new URL(url, window.location.origin);
      const searchQuery = urlObj.searchParams.get('search');

      await delay(600);

      if (searchQuery) {
        const filtered = mockProducts.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return jsonResponse(filtered.slice(0, 50));
      }

      return jsonResponse(mockProducts.slice(0, 50));
    }

    // Categories
    if (url.includes('/api/references/categories')) {
      await delay(200);
      return jsonResponse(mockCategories);
    }

    // Fallback to original fetch
    return originalFetch(input, init);
  };

  console.log('✅ Mock Reference API initialized');
}

/**
 * Helper to create JSON response
 */
function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Simulate network delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Reset mock data
 */
export function resetMockData() {
  mockStatuses = [
    { id: 1, name: 'Active', color: '#28a745' },
    { id: 2, name: 'Inactive', color: '#dc3545' },
    { id: 3, name: 'Pending', color: '#ffc107' },
  ];

  mockDepartments = [
    { id: 1, name: 'Engineering', code: 'ENG', managerId: 101 },
    { id: 2, name: 'Sales', code: 'SAL', managerId: 102 },
    { id: 3, name: 'Marketing', code: 'MKT', managerId: 103 },
  ];

  mockProducts = Array.from({ length: 100 }, (_, i) => ({
    id: `prod-${i + 1}`,
    name: `Product ${i + 1}`,
    sku: `SKU-${String(i + 1).padStart(4, '0')}`,
    price: Math.round(Math.random() * 1000 * 100) / 100,
    inStock: Math.random() > 0.3,
  }));
}
