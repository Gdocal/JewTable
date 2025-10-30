# Reference Data System (Довідники)

> **Comprehensive Guide to Managing Reference Data in JewTable ERP**

**Version:** 1.0
**Last Updated:** 2025-10-29
**Status:** Planning Phase

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Use Cases](#use-cases)
5. [Configuration Guide](#configuration-guide)
6. [Search Functionality](#search-functionality)
7. [Modal Customization](#modal-customization)
8. [Cache Strategies](#cache-strategies)
9. [API Reference](#api-reference)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)
12. [Examples](#examples)

---

## Overview

### What is the Reference Data System?

The Reference Data System is a **modular, configuration-driven framework** for managing reference lists (довідники) in ERP tables. It handles common patterns like:

- 🔄 **Data fetching** with smart caching
- 🔍 **Search** (client-side and server-side)
- ➕ **Inline creation** of reference items
- 🎨 **Custom layouts** and branding
- 📊 **Large datasets** (1M+ records)
- ⚡ **Performance optimization**

### Why Do We Need This?

In complex ERP systems, you have many types of reference data:

| Type | Size | Change Frequency | Examples |
|------|------|------------------|----------|
| **Static** | 5-10 items | Never | Status, Priority, Type |
| **Small Dynamic** | 50-200 items | Occasionally | Departments, Categories |
| **Large Dynamic** | 1000+ items | Frequently | Goods, Products, Employees |

**Problems without a system:**
- ❌ Inconsistent UX across different reference types
- ❌ Duplicate code (every dropdown needs fetch + cache logic)
- ❌ Poor performance (loading all data upfront)
- ❌ Stale data (cache invalidation issues)
- ❌ Hard to maintain (50+ reference types × 100+ tables)

**With the Reference Data System:**
- ✅ Consistent behavior across all reference types
- ✅ Smart caching per type (static, TTL, always-fresh)
- ✅ Lazy loading (fetch only when needed)
- ✅ Configurable search (client/server)
- ✅ Extensible (plugins, custom components)
- ✅ Type-safe (full TypeScript support)

### Real-World Inspiration

This pattern is used by:
- **Ant Design ProComponents** (Alibaba, Tencent)
- **Airtable** (millions of users)
- **Salesforce Lightning** (Fortune 500)
- **Strapi Admin** (NASA, IBM, Toyota)
- **Retool** (thousands of enterprises)

---

## Architecture

### Layered Design

```
┌─────────────────────────────────────────────────────┐
│  Configuration Layer (Declarative)                  │
│  • referenceRegistry.ts                             │
│  • Define types: statuses, departments, goods       │
│  • Cache strategies, search, creation rules         │
├─────────────────────────────────────────────────────┤
│  Core Layer (Minimal, Required)                     │
│  • useReferenceData hook (fetch + cache)            │
│  • ReferenceCell component (smart dropdown)         │
│  • Default UI components                            │
├─────────────────────────────────────────────────────┤
│  Extension Layer (Opt-in Features)                  │
│  • SearchPlugin (client/server search)              │
│  • CreatePlugin (inline creation)                   │
│  • Custom validation hooks                          │
├─────────────────────────────────────────────────────┤
│  UI Layer (Composable Components)                   │
│  • ReferenceDropdown                                │
│  • ReferenceCreateModal                             │
│  • ReferenceSearch                                  │
└─────────────────────────────────────────────────────┘
```

### Key Principles

1. **Simple by Default** - Minimal config for common cases
2. **Progressive Enhancement** - Add features as needed
3. **Clear Boundaries** - Core vs Extensions
4. **Composable** - Mix and match components
5. **Extensible** - Hooks and plugins
6. **Type-safe** - Full TypeScript support

---

## Quick Start

### 1. Basic Setup

```typescript
// config/references.ts
import { defineReference } from '@/lib/references';

export const referenceRegistry = {
  // Simplest possible - just endpoint
  statuses: defineReference('/api/references/statuses'),

  // With cache strategy
  departments: defineReference('/api/references/departments', {
    cache: { ttl: 10 * 60 * 1000 }, // 10 minutes
  }),

  // With search
  goods: defineReference('/api/references/goods', {
    cache: 'always-fresh',
    search: { enabled: true, serverSide: true },
  }),
};
```

### 2. Use in Table

```typescript
// In column definition
const columns: ColumnDef<Employee>[] = [
  {
    id: 'department',
    header: 'Department',
    accessorKey: 'departmentId',
    cell: (info) => (
      <ReferenceCell
        type="departments" // ⭐ That's it!
        value={info.getValue()}
        onChange={(value) => handleChange(info.row.id, 'departmentId', value)}
      />
    ),
  },
];
```

### 3. Done!

The system automatically handles:
- ✅ Lazy loading (fetches when dropdown opens)
- ✅ Caching (10-minute TTL)
- ✅ Loading states
- ✅ Error handling
- ✅ Dropdown UI

---

## Use Cases

### Use Case 1: Small Static Lists

**Examples:** Status (Active/Inactive), Priority (Low/Medium/High)

**Characteristics:**
- 5-10 items
- Never changes
- Load once, cache forever

**Configuration:**

```typescript
statuses: defineReference('/api/references/statuses', {
  cache: 'static', // Never refetch
}),

priorities: defineReference('/api/references/priorities', {
  cache: 'static',
}),
```

**API Response:**
```json
{
  "items": [
    { "id": 1, "name": "Active", "color": "success" },
    { "id": 2, "name": "Inactive", "color": "secondary" }
  ]
}
```

**Usage:**
```typescript
<ReferenceCell type="statuses" value={status} onChange={setStatus} />
```

**UX:**
- Instant dropdown (data cached forever)
- No loading spinner after first load
- No search (list is tiny)

---

### Use Case 2: Medium Dynamic Lists

**Examples:** Departments, Categories, Positions

**Characteristics:**
- 50-200 items
- Changes occasionally (few times per day)
- Balance freshness and performance

**Configuration:**

```typescript
departments: defineReference('/api/references/departments', {
  cache: {
    ttl: 10 * 60 * 1000, // 10 minutes
    refetchOnFocus: true, // Refresh when user returns to tab
  },
  search: {
    enabled: true,
    type: 'client', // Search in loaded data
    fields: ['name', 'code'],
  },
}),
```

**API Response:**
```json
{
  "items": [
    { "id": 1, "name": "Engineering", "code": "ENG", "managerId": 42 },
    { "id": 2, "name": "Sales", "code": "SAL", "managerId": 15 }
  ],
  "total": 87
}
```

**Usage:**
```typescript
<ReferenceCell
  type="departments"
  value={departmentId}
  onChange={setDepartmentId}
/>
```

**UX:**
- First open: Fetch data (loading spinner)
- Within 10 minutes: Instant (cached)
- After 10 minutes: Refetch in background
- Search box appears (filters in browser)
- Refresh button available

---

### Use Case 3: Large Searchable Lists

**Examples:** Goods/Products, Employees, Customers

**Characteristics:**
- 1000+ items
- Changes frequently
- Cannot load all data upfront
- Requires server-side search

**Configuration:**

```typescript
goods: defineReference('/api/references/goods', {
  cache: {
    ttl: 2 * 60 * 1000, // 2 minutes (short cache)
    refetchOnFocus: true,
  },
  search: {
    enabled: true,
    type: 'server', // ⭐ Server-side search
    minChars: 3, // Start searching after 3 characters
    debounce: 300, // Wait 300ms after user stops typing
    fields: ['name', 'sku', 'description'],
  },
  render: {
    option: (item) => (
      <div>
        <strong>{item.name}</strong>
        <small>{item.sku}</small>
        {item.inStock && <Badge color="success">In Stock</Badge>}
      </div>
    ),
  },
}),
```

**API Endpoints:**

```typescript
// Initial load (first 50 items)
GET /api/references/goods?limit=50

// Search
GET /api/references/goods?search=laptop&limit=50

Response:
{
  "items": [
    { "id": 1, "name": "MacBook Pro", "sku": "MBP-001", "inStock": true },
    { "id": 2, "name": "Dell Laptop", "sku": "DELL-123", "inStock": false }
  ],
  "total": 245 // Total matching items
}
```

**Usage:**
```typescript
<ReferenceCell
  type="goods"
  value={productId}
  onChange={setProductId}
/>
```

**UX:**
- Dropdown opens: Shows first 50 items
- User types "mac": Debounced API call after 300ms
- Results filtered on server
- Custom rendering (name + SKU + badge)
- "Load More" button if > 50 results

---

### Use Case 4: Hierarchical Data

**Examples:** Department → Team → Role, Category → Subcategory

**Configuration:**

```typescript
departments: defineReference('/api/references/departments', {
  cache: { ttl: 10 * 60 * 1000 },
}),

teams: defineReference('/api/references/teams', {
  cache: { ttl: 10 * 60 * 1000 },
  dependsOn: 'departments', // ⭐ Relationship

  // Filter teams by selected department
  filter: (items, { departmentId }) =>
    items.filter(team => team.departmentId === departmentId),
}),
```

**Usage:**

```typescript
function EmployeeForm() {
  const [departmentId, setDepartmentId] = useState(null);
  const [teamId, setTeamId] = useState(null);

  return (
    <>
      <ReferenceCell
        type="departments"
        value={departmentId}
        onChange={(value) => {
          setDepartmentId(value);
          setTeamId(null); // Reset dependent field
        }}
      />

      <ReferenceCell
        type="teams"
        value={teamId}
        onChange={setTeamId}
        filter={{ departmentId }} // ⭐ Pass filter context
        disabled={!departmentId} // Disable until parent selected
      />
    </>
  );
}
```

**UX:**
- Select Department first
- Teams dropdown auto-filters by selected department
- Teams dropdown disabled until department selected
- Changing department resets team selection

---

### Use Case 5: Reference with Inline Creation

**Examples:** Adding new category, creating quick contact

**Configuration:**

```typescript
categories: defineReference('/api/references/categories', {
  cache: { ttl: 5 * 60 * 1000 },

  create: {
    enabled: true,
    permission: 'categories.create', // Check user permission

    form: {
      type: 'inline', // Quick inline creation
      fields: [
        { name: 'name', type: 'text', required: true },
      ],
    },

    // Auto-select newly created item
    autoSelect: true,

    // Optimistic update
    onSuccess: (newItem) => {
      toast.success(`Category "${newItem.name}" created`);
    },
  },
}),
```

**Usage:**
```typescript
<ReferenceCell type="categories" value={categoryId} onChange={setCategoryId} />
```

**UX:**
```
┌─────────────────────────┐
│ Electronics             │
│ Furniture               │
│ Office Supplies         │
├─────────────────────────┤
│ [New: _______] [Add]    │ ⭐ Inline creation
└─────────────────────────┘
```

User flow:
1. Open dropdown
2. Type new category name
3. Click "Add"
4. API call → new item created
5. Auto-select new item
6. Dropdown closes

---

### Use Case 6: Complex Creation with Modal

**Examples:** Creating department (multiple fields), new employee

**Configuration:**

```typescript
departments: defineReference('/api/references/departments', {
  cache: { ttl: 10 * 60 * 1000 },

  create: {
    enabled: true,
    permission: 'departments.create',

    form: {
      type: 'modal', // ⭐ Full modal form

      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Department Name',
          required: true
        },
        {
          name: 'code',
          type: 'text',
          label: 'Code (3 letters)',
          required: true,
          pattern: /^[A-Z]{3}$/,
          hint: 'e.g., ENG, SAL, MKT',
        },
        {
          name: 'managerId',
          type: 'select',
          label: 'Manager',
          referenceType: 'employees', // ⭐ Nested reference
        },
        {
          name: 'budget',
          type: 'number',
          label: 'Annual Budget',
          format: 'currency',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
        },
      ],

      validation: z.object({
        name: z.string().min(3, 'Minimum 3 characters'),
        code: z.string().length(3).regex(/[A-Z]+/, 'Must be 3 uppercase letters'),
        managerId: z.string().optional(),
        budget: z.number().min(0).optional(),
        description: z.string().optional(),
      }),

      // Custom business logic
      hooks: {
        beforeSave: async (data) => {
          // Auto-generate code from name
          if (!data.code) {
            data.code = data.name.substring(0, 3).toUpperCase();
          }
          return data;
        },

        afterSave: async (newItem) => {
          // Notify manager
          if (newItem.managerId) {
            await api.notifyManager(newItem.managerId,
              `You are now managing ${newItem.name}`);
          }
        },
      },
    },
  },
}),
```

**Usage:**
```typescript
<ReferenceCell type="departments" value={deptId} onChange={setDeptId} />
```

**UX:**
```
Dropdown opens:
┌─────────────────────────┐
│ Engineering             │
│ Sales                   │
│ Marketing               │
├─────────────────────────┤
│ [+ Add New Department]  │ ⭐ Triggers modal
└─────────────────────────┘

Modal appears:
┌──────────────────────────────────┐
│ Create New Department            │
│                                  │
│ Name: [_______________]          │
│ Code: [___] (e.g., ENG)         │
│ Manager: [Select employee ▼]    │
│ Budget: [$__________]            │
│ Description: [____________]      │
│                                  │
│ [Cancel] [Save]                  │
└──────────────────────────────────┘
```

---

### Use Case 7: Completely Custom Modal

**Examples:** Multi-step employee onboarding, complex product setup

**Configuration:**

```typescript
employees: defineReference('/api/references/employees', {
  cache: { ttl: 5 * 60 * 1000 },

  create: {
    enabled: true,
    permission: 'employees.create',

    // ⭐ Custom component - full control
    component: CreateEmployeeWizard,
  },
}),
```

**Custom Component:**

```typescript
function CreateEmployeeWizard({ isOpen, onClose, onSave, config }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  return (
    <YourCustomModal isOpen={isOpen} size="xl">
      <ModalHeader>
        <Logo />
        <h2>New Employee Onboarding</h2>
      </ModalHeader>

      <WizardSteps current={step} total={4} />

      <ModalBody>
        {step === 1 && <PersonalInfoForm data={formData} onChange={setFormData} />}
        {step === 2 && <JobDetailsForm data={formData} onChange={setFormData} />}
        {step === 3 && <DocumentsUpload data={formData} onChange={setFormData} />}
        {step === 4 && <ReviewAndConfirm data={formData} />}
      </ModalBody>

      <ModalFooter>
        <ProgressBar current={step} total={4} />

        {step > 1 && (
          <Button onClick={() => setStep(step - 1)}>
            ← Previous
          </Button>
        )}

        {step < 4 ? (
          <Button onClick={() => setStep(step + 1)}>
            Next →
          </Button>
        ) : (
          <Button
            onClick={async () => {
              const newEmployee = await onSave(formData);
              toast.success('Employee created!');
              onClose();
            }}
          >
            Complete Onboarding
          </Button>
        )}
      </ModalFooter>
    </YourCustomModal>
  );
}
```

**UX:**
- Multi-step wizard (4 steps)
- Custom branding and layout
- File uploads
- Progress indicator
- Review before save
- Full control over UI/UX

---

## Configuration Guide

### Core Configuration

```typescript
interface ReferenceConfig {
  type: string;              // Required: 'departments'
  endpoint: string;          // Required: '/api/references/departments'

  // Display fields
  label?: string;            // Default: 'name'
  value?: string;            // Default: 'id'

  // Cache strategy
  cache?: CacheStrategy;

  // Search configuration
  search?: SearchConfig;

  // Creation configuration
  create?: CreateConfig;

  // Custom rendering
  render?: RenderConfig;

  // Relationships
  dependsOn?: string;
  filter?: (items: any[], context: any) => any[];
}
```

### Cache Strategies

```typescript
type CacheStrategy =
  | 'static'                          // Cache forever
  | 'ttl'                             // Default 5 min TTL
  | { ttl: number }                   // Custom TTL
  | { ttl: number, refetchOnFocus: boolean }
  | 'always-fresh';                   // Short TTL + refetch on focus

// Examples:

// Static - never refetch
cache: 'static'

// TTL - 10 minutes
cache: { ttl: 10 * 60 * 1000 }

// Always fresh
cache: { ttl: 2 * 60 * 1000, refetchOnFocus: true }
```

### Search Configuration

```typescript
interface SearchConfig {
  enabled: boolean;
  type: 'client' | 'server';

  // Server-side options
  minChars?: number;        // Default: 3
  debounce?: number;        // Default: 300ms
  limit?: number;           // Default: 50

  // Which fields to search
  fields?: string[];

  // UI options
  highlightMatches?: boolean;
  placeholder?: string;
}

// Examples:

// Client-side search (small lists)
search: {
  enabled: true,
  type: 'client',
  fields: ['name', 'code'],
  highlightMatches: true,
}

// Server-side search (large lists)
search: {
  enabled: true,
  type: 'server',
  minChars: 3,
  debounce: 300,
  fields: ['name', 'sku', 'description'],
}
```

### Creation Configuration

```typescript
interface CreateConfig {
  enabled: boolean;
  permission?: string;      // Check user permission

  form: {
    type: 'inline' | 'modal' | 'external';

    // For inline/modal
    fields?: FormField[];
    validation?: ZodSchema;
    layout?: 'vertical' | 'grid' | 'horizontal';
    columns?: number;

    // Lifecycle hooks
    hooks?: {
      beforeSave?: (data: any) => Promise<any>;
      afterSave?: (item: any) => Promise<void>;
    };
  };

  // OR custom component
  component?: React.ComponentType<CreateModalProps>;

  // Post-creation
  autoSelect?: boolean;     // Auto-select created item
  onSuccess?: (item: any) => void;
}
```

### Render Configuration

```typescript
interface RenderConfig {
  // Custom option rendering
  option?: (item: any, searchQuery?: string) => ReactNode;

  // Custom value display (when dropdown closed)
  value?: (item: any) => ReactNode;

  // Empty state
  empty?: () => ReactNode;

  // Loading state
  loading?: () => ReactNode;
}

// Example:

render: {
  option: (item, searchQuery) => (
    <div className="product-option">
      <img src={item.image} alt={item.name} />
      <div>
        <strong>
          <HighlightText text={item.name} highlight={searchQuery} />
        </strong>
        <small>{item.sku}</small>
      </div>
      {item.inStock && <Badge color="success">In Stock</Badge>}
    </div>
  ),

  value: (item) => (
    <div className="selected-product">
      <img src={item.image} />
      <span>{item.name}</span>
    </div>
  ),
}
```

---

## Search Functionality

### Client-Side Search

**When to use:**
- List has < 200 items
- Can load all data upfront
- Want instant search results

**Configuration:**

```typescript
departments: defineReference('/api/references/departments', {
  search: {
    enabled: true,
    type: 'client',
    fields: ['name', 'code', 'description'],

    // Optional: fuzzy matching
    fuzzy: true,
    threshold: 0.3, // 0 = exact, 1 = very fuzzy

    highlightMatches: true,
  },
}),
```

**How it works:**

```typescript
// Component filters in browser
const filteredOptions = options.filter(item => {
  const searchLower = searchQuery.toLowerCase();
  return config.search.fields.some(field =>
    item[field]?.toLowerCase().includes(searchLower)
  );
});
```

**Performance:** O(n) filtering, instant results

---

### Server-Side Search

**When to use:**
- List has 1000+ items
- Cannot load all data
- Need complex search logic

**Configuration:**

```typescript
goods: defineReference('/api/references/goods', {
  search: {
    enabled: true,
    type: 'server',
    minChars: 3,      // Don't search until 3 chars
    debounce: 300,    // Wait 300ms after typing stops
    limit: 50,        // Max results per request
    fields: ['name', 'sku', 'description', 'tags'],
  },
}),
```

**API Contract:**

```typescript
// Request
GET /api/references/goods?search=laptop&limit=50

// Response
{
  "items": [
    { "id": 1, "name": "MacBook Pro", "sku": "MBP-001" },
    { "id": 2, "name": "Dell Laptop", "sku": "DELL-123" }
  ],
  "total": 245,      // Total matches (for pagination)
  "hasMore": true    // More results available
}
```

**How it works:**

```typescript
// Hook debounces and fetches
const debouncedSearch = useDebounce(searchQuery, 300);

const { data } = useQuery({
  queryKey: ['reference', type, 'search', debouncedSearch],
  queryFn: () => fetch(`${endpoint}?search=${debouncedSearch}&limit=50`),
  enabled: debouncedSearch.length >= 3,
  staleTime: 30 * 1000, // Cache results 30 sec
});
```

---

### Advanced Search Features

#### Highlight Matches

```typescript
search: {
  highlightMatches: true,
},

render: {
  option: (item, searchQuery) => (
    <div>
      <HighlightText text={item.name} highlight={searchQuery} />
    </div>
  ),
}
```

**Result:**
```
Search: "mac"
→ **Mac**Book Pro
→ i**Mac** 27"
```

#### Search History

```typescript
search: {
  enabled: true,
  saveHistory: true,
  maxHistory: 5,
}
```

**UX:** Show recent searches when dropdown opens

#### Multi-Field Advanced Search

```typescript
search: {
  type: 'server',
  mode: 'advanced',

  filters: [
    {
      name: 'query',
      type: 'text',
      label: 'Search'
    },
    {
      name: 'categoryId',
      type: 'select',
      label: 'Category',
      referenceType: 'categories'
    },
    {
      name: 'inStock',
      type: 'boolean',
      label: 'In Stock'
    },
    {
      name: 'priceRange',
      type: 'range',
      label: 'Price',
      min: 0,
      max: 10000,
    },
  ],
}
```

**UX:** Full search form with multiple filters

---

## Modal Customization

### Level 1: Use Default Modal

**Simplest** - zero custom code

```typescript
categories: defineReference('/api/references/categories', {
  create: {
    enabled: true,
    fields: [
      { name: 'name', type: 'text', required: true },
    ],
  },
}),
```

**Result:** Standard modal with form

---

### Level 2: Customize Layout

**Keep default modal shell, change form layout**

```typescript
departments: defineReference('/api/references/departments', {
  create: {
    enabled: true,
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'code', type: 'text', required: true },
      { name: 'managerId', type: 'select', referenceType: 'employees' },
      { name: 'budget', type: 'number' },
    ],
    layout: 'grid',  // 'vertical' | 'grid' | 'horizontal'
    columns: 2,      // For grid layout
  },
}),
```

**Result:** Two-column grid layout

---

### Level 3: Custom Form Renderer

**Custom form, default modal shell**

```typescript
departments: defineReference('/api/references/departments', {
  create: {
    enabled: true,

    renderForm: ({ formState, onSubmit, onCancel }) => (
      <form onSubmit={onSubmit}>
        <div className="custom-layout">
          <section className="left">
            <Input {...formState.register('name')} />
            <Input {...formState.register('code')} />
          </section>

          <section className="right">
            <Select {...formState.register('managerId')} />
            <NumberInput {...formState.register('budget')} />
          </section>
        </div>

        <div className="custom-footer">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    ),
  },
}),
```

**Result:** Your form layout, our modal shell

---

### Level 4: Completely Custom Component

**Full control** - bring your own modal

```typescript
employees: defineReference('/api/references/employees', {
  create: {
    enabled: true,
    component: CustomEmployeeModal,
  },
}),

function CustomEmployeeModal({ isOpen, onClose, onSave, config }) {
  return (
    <YourModal isOpen={isOpen}>
      {/* Your complete custom UI */}
      <YourHeader />
      <YourWizard />
      <YourFooter onSave={onSave} onCancel={onClose} />
    </YourModal>
  );
}
```

**Props provided to your component:**

```typescript
interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  config: ReferenceConfig;
  user: User;
  api: {
    create: (data: any) => Promise<any>;
    validate: (data: any) => Promise<ValidationResult>;
  };
  defaultFormState?: UseFormReturn; // Optional: pre-configured form
}
```

**Result:** 100% your design

---

### Level 5: External Page

**Very complex creation** - redirect to admin page

```typescript
goods: defineReference('/api/references/goods', {
  create: {
    enabled: true,
    type: 'external',
    url: '/admin/goods/new',
    // OR
    onClick: () => window.open('/admin/goods/new', '_blank'),
  },
}),
```

**Result:** Opens separate page for complex setup

---

## Cache Strategies

### Strategy 1: Static (Never Refetch)

**Use for:** Data that never changes

```typescript
cache: 'static'

// Behavior:
// - Fetch once on first use
// - Cache forever
// - Never refetch
// - Persists across page refreshes (localStorage)
```

**Example:** Status types, priority levels

---

### Strategy 2: TTL (Time-To-Live)

**Use for:** Data that changes occasionally

```typescript
cache: { ttl: 10 * 60 * 1000 } // 10 minutes

// Behavior:
// - Fetch on first use
// - Serve from cache for 10 minutes
// - After 10 minutes, refetch in background
// - User never sees loading spinner (stale-while-revalidate)
```

**Example:** Departments, categories

---

### Strategy 3: Always Fresh

**Use for:** Frequently changing data

```typescript
cache: 'always-fresh'
// Equivalent to:
cache: {
  ttl: 2 * 60 * 1000,       // 2 minutes
  refetchOnFocus: true,      // Refetch when user returns to tab
  refetchOnMount: true,      // Check on every mount
}

// Behavior:
// - Short cache (2 min)
// - Refetch when window regains focus
// - Always check for updates
```

**Example:** Goods/products, inventory, live data

---

### Strategy 4: Custom

**Full control over caching**

```typescript
cache: {
  ttl: 5 * 60 * 1000,           // 5 minutes
  refetchOnFocus: false,         // Don't refetch on focus
  refetchOnMount: false,         // Don't refetch on mount
  refetchInterval: 60 * 1000,    // Poll every minute
  retry: 3,                      // Retry failed requests 3 times
  retryDelay: 1000,              // Wait 1 second between retries
}
```

---

### Cache Invalidation

**Automatic invalidation** after mutations:

```typescript
const createDepartment = useMutation({
  mutationFn: api.createDepartment,
  onSuccess: () => {
    // Automatic cache invalidation
    queryClient.invalidateQueries(['reference', 'departments']);
  },
});
```

**Manual invalidation:**

```typescript
// Invalidate specific type
queryClient.invalidateQueries(['reference', 'departments']);

// Invalidate all reference data
queryClient.invalidateQueries(['reference']);

// Refetch immediately
queryClient.refetchQueries(['reference', 'departments']);
```

---

## API Reference

### Core Components

#### `<ReferenceCell>`

Main component for reference dropdowns in tables.

```typescript
interface ReferenceCellProps {
  // Reference type from registry
  type: string;

  // Current value
  value: any;

  // Change handler
  onChange: (value: any) => void;

  // Optional overrides
  config?: Partial<ReferenceConfig>;
  filter?: Record<string, any>;
  disabled?: boolean;
  placeholder?: string;

  // Callbacks
  onCreateSuccess?: (item: any) => void;
  onSearchChange?: (query: string) => void;
}

// Usage
<ReferenceCell
  type="departments"
  value={departmentId}
  onChange={setDepartmentId}
  disabled={isReadOnly}
  onCreateSuccess={(dept) => console.log('Created:', dept)}
/>
```

---

#### `useReferenceData`

Hook for fetching and caching reference data.

```typescript
function useReferenceData(
  config: ReferenceConfig,
  options?: {
    enabled?: boolean;
    filter?: Record<string, any>;
  }
): {
  data: any[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Usage
const { data: departments, isLoading } = useReferenceData(
  referenceRegistry.departments,
  { enabled: isDropdownOpen }
);
```

---

#### `defineReference`

Helper for defining reference configurations with type safety.

```typescript
function defineReference<T = any>(
  endpoint: string,
  config?: Partial<ReferenceConfig<T>>
): ReferenceConfig<T>

// Usage
const departments = defineReference<Department>(
  '/api/references/departments',
  {
    cache: { ttl: 10 * 60 * 1000 },
    label: 'name', // ✓ Typed! Autocomplete works
    search: { enabled: true },
  }
);
```

---

### Utility Components

#### `<ReferenceDropdown>`

Lower-level dropdown component for custom implementations.

```typescript
<ReferenceDropdown config={config}>
  {({ options, isLoading, searchQuery, setSearchQuery }) => (
    <>
      <SearchInput value={searchQuery} onChange={setSearchQuery} />
      <OptionsList options={options} />
    </>
  )}
</ReferenceDropdown>
```

---

#### `<HighlightText>`

Utility for highlighting search matches.

```typescript
<HighlightText
  text="MacBook Pro"
  highlight="mac"
  className="highlight"
/>
// Result: <span><mark>Mac</mark>Book Pro</span>
```

---

### Extension Points

#### Custom Validation

```typescript
create: {
  fields: [...],
  hooks: {
    beforeSave: async (data) => {
      // Custom validation
      if (data.budget > 1000000) {
        throw new Error('Budget requires CFO approval');
      }

      // Transform data
      data.code = data.name.substring(0, 3).toUpperCase();

      return data;
    },
  },
}
```

---

#### Custom API Calls

```typescript
// Override default fetch function
fetchFn: async (config) => {
  const response = await customApiClient.get(config.endpoint);
  return response.data.items;
},

// Override create function
createFn: async (config, data) => {
  const response = await customApiClient.post(config.endpoint, data);
  return response.data;
},
```

---

#### Custom Components

```typescript
components: {
  Option: CustomOptionComponent,
  CreateForm: CustomFormComponent,
  EmptyState: CustomEmptyState,
  LoadingState: CustomLoadingState,
}
```

---

## Best Practices

### 1. Choose the Right Cache Strategy

```typescript
// ✅ Good
statuses: { cache: 'static' }          // Never changes
departments: { cache: { ttl: 10 * 60 * 1000 } }  // Changes occasionally
goods: { cache: 'always-fresh' }       // Frequently updated

// ❌ Bad
statuses: { cache: 'always-fresh' }    // Wasteful - never changes
goods: { cache: 'static' }             // Stale data problem
```

---

### 2. Use Server Search for Large Lists

```typescript
// ✅ Good - 1000+ items
goods: {
  search: {
    type: 'server',
    minChars: 3,
  }
}

// ❌ Bad - loads all 10k items
goods: {
  search: {
    type: 'client', // Loads 10k items into browser!
  }
}
```

---

### 3. Lazy Load Reference Data

```typescript
// ✅ Good - load when needed
const { data } = useReferenceData(config, {
  enabled: isDropdownOpen,  // Only fetch when dropdown opens
});

// ❌ Bad - load on page load
const { data } = useReferenceData(config, {
  enabled: true, // Fetches even if never used
});
```

---

### 4. Use Registry for DRY

```typescript
// ✅ Good - configure once
// config/references.ts
export const referenceRegistry = {
  departments: defineReference('/api/references/departments', {...}),
};

// Use everywhere
<ReferenceCell type="departments" />

// ❌ Bad - repeat config
<ReferenceCell
  config={{
    endpoint: '/api/references/departments',
    cache: {...},
    // ... repeat 50 times
  }}
/>
```

---

### 5. Handle Permissions Properly

```typescript
// ✅ Good - check permissions
create: {
  enabled: true,
  permission: 'departments.create',  // System checks
}

// Component handles gracefully
{canCreate && <CreateButton />}

// ❌ Bad - no permission check
create: {
  enabled: true, // Everyone can create!
}
```

---

### 6. Provide Good UX for Large Lists

```typescript
// ✅ Good
goods: {
  search: {
    type: 'server',
    minChars: 3,        // Don't search until meaningful input
    debounce: 300,      // Don't spam server
    placeholder: 'Search by name or SKU...',
  },
  render: {
    option: (item) => (
      <div>
        <strong>{item.name}</strong>
        <small>{item.sku}</small>
        {item.inStock && <Badge>In Stock</Badge>}
      </div>
    ),
  },
}

// ❌ Bad
goods: {
  search: {
    type: 'server',
    minChars: 1,        // Searches on every keystroke
    debounce: 0,        // Spams server
  },
  // No custom rendering - hard to identify items
}
```

---

### 7. Use Type Safety

```typescript
// ✅ Good - full type safety
interface Department {
  id: string;
  name: string;
  code: string;
  managerId?: string;
}

const departments = defineReference<Department>(
  '/api/references/departments',
  {
    label: 'name',     // ✓ Typed! Autocomplete works
    value: 'id',       // ✓ Typed!
  }
);

// ❌ Bad - no types
const departments = defineReference('/api/references/departments', {
  label: 'namee',      // ✗ Typo not caught
});
```

---

### 8. Handle Dependencies Properly

```typescript
// ✅ Good - clear dependencies
<ReferenceCell
  type="teams"
  value={teamId}
  onChange={setTeamId}
  filter={{ departmentId }}    // Pass context
  disabled={!departmentId}     // Disable until parent selected
/>

// ❌ Bad - no dependency handling
<ReferenceCell
  type="teams"
  value={teamId}
  onChange={setTeamId}
  // Shows all teams from all departments - confusing!
/>
```

---

## Troubleshooting

### Problem: Data Not Loading

**Symptoms:** Dropdown opens but shows "Loading..." forever

**Causes:**
1. Wrong endpoint
2. API returns wrong format
3. CORS issues
4. Network error

**Debug:**
```typescript
// Add logging
const { data, error, isLoading } = useReferenceData(config);

console.log('Data:', data);
console.log('Error:', error);
console.log('Loading:', isLoading);

// Check network tab
// Expected response:
{
  "items": [...],
  "total": 100
}
```

**Solutions:**
- Check endpoint in config
- Verify API response format
- Check CORS headers
- Add error boundaries

---

### Problem: Stale Data

**Symptoms:** Dropdown shows old data, even after changes

**Causes:**
1. Cache TTL too long
2. No invalidation after mutation
3. Wrong cache key

**Solutions:**

```typescript
// 1. Shorten TTL
cache: { ttl: 2 * 60 * 1000 } // 2 minutes instead of 10

// 2. Add invalidation
const createDept = useMutation({
  mutationFn: api.createDepartment,
  onSuccess: () => {
    queryClient.invalidateQueries(['reference', 'departments']);
  },
});

// 3. Manual refresh
<button onClick={() => refetch()}>🔄 Refresh</button>
```

---

### Problem: Search Not Working

**Symptoms:** Typing in search doesn't filter results

**Causes:**
1. Search not enabled
2. Wrong search type (client vs server)
3. Search fields not configured

**Debug:**

```typescript
// Check config
console.log('Search config:', config.search);

// Client search: check fields
search: {
  type: 'client',
  fields: ['name', 'code'], // Must match data structure
}

// Server search: check API
GET /api/references/departments?search=eng
```

**Solutions:**
- Enable search in config
- Verify search fields match data
- Check server endpoint supports ?search= param

---

### Problem: Performance Issues

**Symptoms:** Dropdown slow to open, UI freezes

**Causes:**
1. Loading too much data (10k+ items)
2. Client-side search on large list
3. Complex rendering without memoization

**Solutions:**

```typescript
// 1. Use server-side search
search: {
  type: 'server', // Don't load all data
  minChars: 3,
}

// 2. Limit results
endpoint: '/api/references/goods?limit=50'

// 3. Memoize rendering
render: {
  option: React.memo((item) => <CustomOption item={item} />)
}

// 4. Virtualize large lists (if needed)
// Use react-window or react-virtual
```

---

### Problem: Create Modal Not Appearing

**Symptoms:** Click "+ Add New" but nothing happens

**Causes:**
1. Creation not enabled
2. User lacks permission
3. Modal component error

**Debug:**

```typescript
// Check config
console.log('Create config:', config.create);
console.log('User permissions:', user.permissions);

// Check console for errors
// Look for React error boundaries

// Test with minimal config
create: {
  enabled: true,
  // No permission check
  fields: [{ name: 'name', type: 'text' }],
}
```

---

### Problem: Custom Modal Not Receiving Props

**Symptoms:** Custom modal component crashes or shows wrong data

**Cause:** Props not correctly passed

**Solution:**

```typescript
// Your component must accept these props
function CustomModal({
  isOpen,      // Required
  onClose,     // Required
  onSave,      // Required
  config,      // Optional
  user,        // Optional
}: CustomModalProps) {
  // Check props are defined
  console.log('Props:', { isOpen, onClose, onSave });

  return (
    <Modal isOpen={isOpen}>
      {/* Your UI */}
    </Modal>
  );
}
```

---

## Examples

### Example 1: Complete ERP Setup

```typescript
// config/references.ts
import { defineReference } from '@/lib/references';

export const referenceRegistry = {
  // Static lists
  statuses: defineReference('/api/references/statuses', {
    cache: 'static',
  }),

  priorities: defineReference('/api/references/priorities', {
    cache: 'static',
  }),

  // Medium lists
  departments: defineReference<Department>('/api/references/departments', {
    cache: { ttl: 10 * 60 * 1000, refetchOnFocus: true },
    search: {
      enabled: true,
      type: 'client',
      fields: ['name', 'code'],
      highlightMatches: true,
    },
    create: {
      enabled: true,
      permission: 'departments.create',
      form: {
        type: 'modal',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'code', type: 'text', required: true, pattern: /^[A-Z]{3}$/ },
          { name: 'managerId', type: 'select', referenceType: 'employees' },
        ],
      },
    },
  }),

  teams: defineReference<Team>('/api/references/teams', {
    cache: { ttl: 10 * 60 * 1000 },
    dependsOn: 'departments',
    filter: (items, { departmentId }) =>
      items.filter(team => team.departmentId === departmentId),
  }),

  // Large lists
  goods: defineReference<Product>('/api/references/goods', {
    cache: 'always-fresh',
    search: {
      enabled: true,
      type: 'server',
      minChars: 3,
      debounce: 300,
      fields: ['name', 'sku', 'description'],
    },
    render: {
      option: (item, searchQuery) => (
        <div className="product-option">
          <img src={item.thumbnail} alt={item.name} />
          <div>
            <strong>
              <HighlightText text={item.name} highlight={searchQuery} />
            </strong>
            <small>{item.sku}</small>
          </div>
          {item.inStock && <Badge color="success">In Stock</Badge>}
        </div>
      ),
    },
  }),

  employees: defineReference<Employee>('/api/references/employees', {
    cache: 'always-fresh',
    search: {
      enabled: true,
      type: 'server',
      minChars: 2,
      fields: ['name', 'email', 'position'],
    },
    render: {
      option: (item) => (
        <div className="employee-option">
          <Avatar src={item.avatar} name={item.name} />
          <div>
            <div>{item.name}</div>
            <small>{item.position} • {item.department}</small>
          </div>
        </div>
      ),
    },
  }),
};
```

---

### Example 2: Using in Table

```typescript
// tables/EmployeeTable.tsx
import { referenceRegistry } from '@/config/references';

const columns: ColumnDef<Employee>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    cell: (info) => <TextCell value={info.getValue()} />,
  },

  {
    id: 'department',
    header: 'Department',
    accessorKey: 'departmentId',
    cell: (info) => (
      <ReferenceCell
        type="departments"
        value={info.getValue()}
        onChange={(value) =>
          handleChange(info.row.id, 'departmentId', value)
        }
      />
    ),
  },

  {
    id: 'team',
    header: 'Team',
    accessorKey: 'teamId',
    cell: (info) => (
      <ReferenceCell
        type="teams"
        value={info.getValue()}
        onChange={(value) =>
          handleChange(info.row.id, 'teamId', value)
        }
        filter={{
          departmentId: info.row.original.departmentId
        }}
        disabled={!info.row.original.departmentId}
      />
    ),
  },

  {
    id: 'status',
    header: 'Status',
    accessorKey: 'statusId',
    cell: (info) => (
      <ReferenceCell
        type="statuses"
        value={info.getValue()}
        onChange={(value) =>
          handleChange(info.row.id, 'statusId', value)
        }
      />
    ),
  },
];
```

---

### Example 3: Custom Modal

```typescript
// components/CreateDepartmentModal.tsx
import { CustomModalProps } from '@/lib/references';

export function CreateDepartmentModal({
  isOpen,
  onClose,
  onSave,
  config,
  user,
}: CustomModalProps) {
  const [step, setStep] = useState(1);
  const form = useForm<DepartmentFormData>();

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      // Use system's onSave (handles cache invalidation)
      await onSave(data);

      toast.success('Department created successfully!');
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader>
        <h2>Create New Department</h2>
        <ProgressSteps current={step} total={3} />
      </ModalHeader>

      <ModalBody>
        {step === 1 && (
          <div>
            <h3>Basic Information</h3>
            <Input
              label="Department Name"
              {...form.register('name', { required: true })}
            />
            <Input
              label="Code"
              {...form.register('code', {
                required: true,
                pattern: /^[A-Z]{3}$/,
              })}
              hint="3 uppercase letters (e.g., ENG, SAL)"
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <h3>Management</h3>
            <ReferenceCell
              type="employees"
              value={form.watch('managerId')}
              onChange={(value) => form.setValue('managerId', value)}
            />
            <NumberInput
              label="Annual Budget"
              {...form.register('budget')}
              format="currency"
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <h3>Review</h3>
            <ReviewPanel data={form.watch()} />
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        {step > 1 && (
          <Button onClick={() => setStep(step - 1)}>
            Previous
          </Button>
        )}

        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={form.formState.isSubmitting}>
            Create Department
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

// Use in config
departments: defineReference('/api/references/departments', {
  create: {
    enabled: true,
    component: CreateDepartmentModal,
  },
}),
```

---

## Implementation Roadmap

### Phase A: Core (Week 1)
- [ ] `useReferenceData` hook
- [ ] Basic cache strategies (static, ttl)
- [ ] `ReferenceCell` component
- [ ] Registry pattern
- [ ] Loading/error states
- [ ] **Deliverable:** Can use simple reference dropdowns

### Phase B: Features (Week 2)
- [ ] Client-side search
- [ ] Server-side search
- [ ] Inline creation (simple)
- [ ] Modal creation (complex)
- [ ] Custom rendering
- [ ] **Deliverable:** Full-featured reference system

### Phase C: Advanced (Week 3)
- [ ] Advanced search (multi-field)
- [ ] Hierarchical references
- [ ] Custom modal components
- [ ] Fuzzy search
- [ ] Search history
- [ ] **Deliverable:** Production-ready with all features

### Phase D: Polish (Week 4)
- [ ] TypeScript helpers
- [ ] Storybook examples
- [ ] Unit tests
- [ ] Performance optimization
- [ ] DevTools
- [ ] **Deliverable:** Enterprise-grade system

---

## Migration Guide

### From Manual Dropdowns

**Before:**
```typescript
function DepartmentSelect({ value, onChange }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        setOptions(data);
        setLoading(false);
      });
  }, []);

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      loading={loading}
    />
  );
}
```

**After:**
```typescript
// config/references.ts
departments: defineReference('/api/references/departments'),

// Usage
<ReferenceCell type="departments" value={value} onChange={onChange} />
```

**Benefits:**
- 95% less code
- Automatic caching
- Consistent UX
- Type-safe

---

## Conclusion

The Reference Data System provides a **flexible, scalable solution** for managing reference lists in complex ERP applications. By following the patterns and best practices in this guide, you can:

✅ Handle any reference type (small to large)
✅ Provide consistent UX across your app
✅ Optimize performance with smart caching
✅ Enable powerful search capabilities
✅ Allow inline creation with custom forms
✅ Maintain clean, DRY code

**Start simple, add complexity as needed!**

---

## Additional Resources

- [React Query Documentation](https://tanstack.com/query)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Ant Design ProComponents](https://procomponents.ant.design/)

---

**Questions? Feedback?**
Create an issue in the GitHub repository or contact the development team.
