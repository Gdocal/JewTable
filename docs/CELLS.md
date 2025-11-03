# Cell Types Documentation

Complete guide to all cell types supported by JewTable.

## Overview

JewTable supports 12 specialized cell types with built-in rendering, editing, validation, and formatting.

```typescript
import { CellType } from '@/components/DataTable/types/cell.types';
```

## Cell Types

### 1. TEXT - Text Cell

Basic text input with validation.

```typescript
{
  accessorKey: 'name',
  header: 'Name',
  cellType: CellType.TEXT,
  editable: true,
  required: true,
  cellOptions: {
    maxLength: 100,
    minLength: 2,
    placeholder: 'Enter name...',
  },
}
```

**Options:**
- `maxLength` - Maximum characters
- `minLength` - Minimum characters
- `placeholder` - Input placeholder
- `multiline` - Enable textarea (boolean)

**Validation:**
- Required field check
- Length validation

---

### 2. NUMBER - Numeric Cell

Numbers with formatting and validation.

```typescript
{
  accessorKey: 'age',
  header: 'Age',
  cellType: CellType.NUMBER,
  cellOptions: {
    min: 18,
    max: 100,
    step: 1,
    decimals: 0,
    thousandsSeparator: true,
  },
}
```

**Options:**
- `min` - Minimum value
- `max` - Maximum value
- `step` - Increment step
- `decimals` - Decimal places (0-6)
- `thousandsSeparator` - Format with commas (1,000)

**Display:** `1,234` or `1,234.56`

---

### 3. CURRENCY - Money Cell

Currency with symbol and formatting.

```typescript
{
  accessorKey: 'salary',
  header: 'Salary',
  cellType: CellType.CURRENCY,
  cellOptions: {
    currency: 'USD',
    symbol: '$',
    decimals: 2,
  },
}
```

**Options:**
- `currency` - Currency code (USD, EUR, GBP, etc.)
- `symbol` - Currency symbol ($, €, £)
- `decimals` - Decimal places (default: 2)

**Display:** `$75,000.00`

**Validation:**
- Must be a valid number
- Minimum 0 (if specified)

---

### 4. PERCENT - Percentage Cell

Percentage with formatting.

```typescript
{
  accessorKey: 'commission',
  header: 'Commission',
  cellType: CellType.PERCENT,
  cellOptions: {
    decimals: 2,
    multiplier: 100, // Store as 0.15, display as 15%
  },
}
```

**Options:**
- `decimals` - Decimal places
- `multiplier` - Multiply by 100 for display

**Display:** `15.50%`

**Storage:** Store as decimal (0.155), display as percent (15.5%)

---

### 5. DATE - Date Cell

Date picker with formatting.

```typescript
{
  accessorKey: 'startDate',
  header: 'Start Date',
  cellType: CellType.DATE,
  cellOptions: {
    format: 'MM/DD/YYYY',
    min: '2020-01-01',
    max: '2030-12-31',
  },
}
```

**Options:**
- `format` - Display format (MM/DD/YYYY, DD-MM-YYYY, YYYY-MM-DD)
- `min` - Minimum date
- `max` - Maximum date

**Display:** `01/15/2024`

**Storage:** ISO 8601 string (`2024-01-15T00:00:00.000Z`)

---

### 6. DATETIME - DateTime Cell

Date and time picker.

```typescript
{
  accessorKey: 'createdAt',
  header: 'Created',
  cellType: CellType.DATETIME,
  cellOptions: {
    format: 'MM/DD/YYYY HH:mm',
    showSeconds: false,
  },
}
```

**Options:**
- `format` - Display format
- `showSeconds` - Include seconds

**Display:** `01/15/2024 14:30`

---

### 7. BOOLEAN - Checkbox Cell

Checkbox for true/false values.

```typescript
{
  accessorKey: 'active',
  header: 'Active',
  cellType: CellType.BOOLEAN,
  cellOptions: {
    trueLabel: 'Yes',
    falseLabel: 'No',
    trueColor: '#28a745',
    falseColor: '#dc3545',
  },
}
```

**Options:**
- `trueLabel` - Label for true
- `falseLabel` - Label for false
- `trueColor` - Color when true
- `falseColor` - Color when false

**Display:** Checkbox (editable) or Yes/No label (read-only)

---

### 8. SELECT - Dropdown Cell

Dropdown with predefined options.

```typescript
{
  accessorKey: 'role',
  header: 'Role',
  cellType: CellType.SELECT,
  cellOptions: {
    options: [
      { value: 'admin', label: 'Administrator' },
      { value: 'user', label: 'User' },
      { value: 'guest', label: 'Guest' },
    ],
    allowClear: true,
  },
}
```

**Options:**
- `options` - Array of `{ value, label }` objects
- `allowClear` - Allow clearing selection
- `multiple` - Enable multi-select

**Display:** Selected label

---

### 9. BADGE - Status Badge Cell

Colored badge for status values.

```typescript
{
  accessorKey: 'status',
  header: 'Status',
  cellType: CellType.BADGE,
  cellOptions: {
    options: [
      { value: 'active', label: 'Active', variant: 'success' },
      { value: 'pending', label: 'Pending', variant: 'warning' },
      { value: 'inactive', label: 'Inactive', variant: 'danger' },
    ],
  },
}
```

**Options:**
- `options` - Array with `{ value, label, variant }` objects
- `variant` - `success`, `warning`, `danger`, `info`, `primary`, `secondary`

**Display:** Colored badge with label

---

### 10. PROGRESS - Progress Bar Cell

Progress bar for percentage values.

```typescript
{
  accessorKey: 'progress',
  header: 'Progress',
  cellType: CellType.PROGRESS,
  cellOptions: {
    min: 0,
    max: 100,
    showLabel: true,
    color: '#0d6efd',
    height: 20,
  },
}
```

**Options:**
- `min` - Minimum value (default: 0)
- `max` - Maximum value (default: 100)
- `showLabel` - Show percentage label
- `color` - Progress bar color
- `height` - Bar height in pixels

**Display:** Progress bar with percentage

---

### 11. REFERENCE - Reference Data Cell

Dropdown with async data loading from API.

```typescript
{
  accessorKey: 'departmentId',
  header: 'Department',
  cellType: CellType.REFERENCE,
  cellOptions: {
    referenceType: 'department',
    labelField: 'name',
    valueField: 'id',
    searchable: true,
    allowCreate: true,
  },
}
```

**Options:**
- `referenceType` - Type of reference data (department, status, etc.)
- `labelField` - Field to display (name, label)
- `valueField` - Field to store (id)
- `searchable` - Enable search
- `allowCreate` - Allow creating new items inline

**Features:**
- Lazy loading from API
- Search with debouncing
- Caching with TanStack Query
- Inline creation
- Multi-tenancy support

**Display:** Referenced item label (fetched from API)

**Storage:** ID value

---

### 12. EMAIL - Email Cell

Email input with validation.

```typescript
{
  accessorKey: 'email',
  header: 'Email',
  cellType: CellType.EMAIL,
  required: true,
  cellOptions: {
    placeholder: 'user@example.com',
  },
}
```

**Options:**
- `placeholder` - Input placeholder

**Validation:**
- Email format validation (RFC 5322)
- Required field check

**Display:** Email address with mailto link

---

## Custom Cell Renderer

Create custom cell renderers for specialized use cases:

```typescript
{
  accessorKey: 'customField',
  header: 'Custom',
  cell: ({ getValue, row }) => {
    const value = getValue();
    return (
      <div className="custom-cell">
        <img src={row.original.avatar} alt="" />
        <span>{value}</span>
      </div>
    );
  },
  // No cellType needed for custom renderer
}
```

## Cell Validation

All editable cells support validation:

```typescript
{
  accessorKey: 'salary',
  header: 'Salary',
  cellType: CellType.CURRENCY,
  required: true, // Field is required
  editable: true, // Enable editing
  cellOptions: {
    min: 0,
    max: 1000000,
  },
  // Custom validation
  validate: (value: any) => {
    if (value < 30000) {
      return 'Salary must be at least $30,000';
    }
    return true;
  },
}
```

## Cell Props Summary

| Prop | Type | Description |
|------|------|-------------|
| `accessorKey` | string | Data field key |
| `header` | string | Column header text |
| `cellType` | CellType | Cell type enum |
| `editable` | boolean | Enable editing (default: true) |
| `required` | boolean | Required field |
| `cellOptions` | object | Type-specific options |
| `validate` | function | Custom validation function |
| `enableSorting` | boolean | Enable column sorting |
| `enableFiltering` | boolean | Enable column filtering |

## Best Practices

1. **Choose the Right Type:** Use specialized types (CURRENCY, DATE) instead of TEXT for better UX
2. **Validation:** Always validate required fields and data constraints
3. **Performance:** Use REFERENCE cells with caching for large datasets
4. **User Experience:** Provide clear labels and placeholders
5. **Consistency:** Use the same cell type for similar data across tables

## See Also

- [Filter Types Documentation](./FILTERS.md)
- [Component Documentation](./COMPONENTS.md)
- [Reference Data Guide](./TUTORIALS/05-reference-data.md)
