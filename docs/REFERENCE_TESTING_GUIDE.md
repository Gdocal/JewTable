# Reference Data System - Testing Guide

## Quick Start

The development server is now running! Here's how to test the Reference Data System (Phase 11B).

---

## Access the Demo

1. **Open your browser** and navigate to: `http://localhost:5173`

2. **Click on "📑 Reference System Demo"** in the top navigation bar

You should see a demo page with 3 test cards, each containing 4 reference dropdowns.

---

## Features to Test

### 1. **Statuses (Inline Creation)** ✨

**Configuration:** Simple inline creation with validation

**How to test:**
1. Click on any "Status" dropdown
2. Click the **"+ Add New"** button at the bottom
3. An inline form appears - type a new status name (e.g., "Completed")
4. Press **Enter** or click **"Create"**
5. ✅ The new status is created and automatically selected
6. Open the dropdown again - your new status is now in the list

**Validation:**
- Try submitting empty name - should show error
- Must be at least 2 characters

**Features demonstrated:**
- Inline creation (no modal)
- Form validation with Zod
- Auto-selection after creation
- Cache invalidation
- Loading state

---

### 2. **Departments (Modal Creation + Search)** 🔍

**Configuration:** Modal form with validation, client-side search with highlighting

**How to test search:**
1. Click on "Department" dropdown
2. Type **"eng"** in the search box
3. ✅ See results filtered to "Engineering" with "eng" highlighted in yellow
4. Try typing **"sal"** - should highlight "Sales"
5. Clear search to see all departments

**How to test creation:**
1. Click **"+ Add New"** button
2. ✅ A modal dialog appears with form fields:
   - Department Name (required)
   - Department Code (required, 2-10 chars)
   - Manager ID (optional)
3. Try submitting empty form - ✅ see validation errors
4. Fill in valid data:
   - Name: "Quality Assurance"
   - Code: "QA"
   - Manager ID: 999
5. Click **"Create"**
6. ✅ Modal closes, new department is selected
7. ✅ Alert shows "Department created successfully!"

**Validation to test:**
- Name: minimum 3 characters
- Code: 2-10 characters
- Form shows red borders on invalid fields
- Error messages appear below fields

**Features demonstrated:**
- Modal creation with full form
- Multi-field form with validation
- Client-side search
- Search term highlighting
- Grid/vertical layout
- Lifecycle hooks (afterSave shows alert)
- Cache TTL (10 minutes)
- Refetch on window focus

---

### 3. **Products (Server-side Search + Grid Layout)** 🔎

**Configuration:** Large list, server-side search, modal with grid layout

**How to test search:**
1. Click on "Product" dropdown
2. Type just **"1"** - notice: "Type 2+ characters to search"
3. Type **"SKU-0001"** - see server search in action (with delay)
4. Try **"Product 5"** - see matches
5. ✅ Server only returns matching results (network efficient)

**How to test creation:**
1. Click **"+ Add New"** button
2. ✅ Modal opens with **grid layout** (2 columns):
   - Product Name | SKU
   - Price | In Stock checkbox
3. Fill in the form:
   - Name: "Wireless Mouse"
   - SKU: "MOUSE-001"
   - Price: 29.99
   - In Stock: ✓ (checked)
4. Click **"Create"**
5. ✅ Shows "Creating..." state (simulated 1s delay)
6. ✅ New product is created and selected

**Validation to test:**
- Name: minimum 3 characters
- SKU: minimum 3 characters
- Price: must be positive number
- Grid layout adapts on small screens

**Features demonstrated:**
- Server-side search (minChars: 2)
- Debouncing (300ms)
- Grid layout (2 columns)
- Number input with min/step
- Boolean checkbox
- Always-fresh cache strategy
- Loading states

---

### 4. **Categories (Simple Dropdown)** 📋

**Configuration:** Basic dropdown, no creation enabled

**How to test:**
1. Click on "Category" dropdown
2. ✅ See 4 categories: Electronics, Furniture, Office Supplies, Software
3. No search box (simple list)
4. No "+ Add New" button (creation disabled)

**Features demonstrated:**
- Simple dropdown without extra features
- Default TTL cache (5 minutes)
- Minimal configuration

---

## Advanced Testing

### Test Cache Behavior

1. **Static Cache (Statuses):**
   - Create a new status
   - Refresh the page - ✅ status persists (static cache)

2. **TTL Cache (Departments):**
   - Create a new department
   - Wait 10 minutes - should refetch
   - Switch browser tabs - refetches when you return

3. **Always-Fresh (Products):**
   - Create a new product
   - Switch tabs - refetches immediately
   - Short TTL means frequent updates

### Test Form Validation

1. **Empty fields:** Try submitting empty required fields
2. **Invalid formats:** Try invalid hex color for status
3. **Length validation:** Try department code > 10 chars
4. **Number validation:** Try negative price for product
5. **Real-time errors:** Errors appear as you type/blur

### Test Search

1. **Client-side (Departments):**
   - Type "eng" - instant filtering
   - Highlighting shows matched text
   - No network requests

2. **Server-side (Products):**
   - Type 1 char - "Type 2+ characters" message
   - Type 2+ chars - network request after 300ms debounce
   - Fast typing - only last query executes
   - Check DevTools Network tab - see API calls

### Test States

1. **Loading:** Watch spinner when opening dropdown first time
2. **Error:** Modify mock API to return errors
3. **Empty:** Search for "zzzzzz" - "No results found"
4. **Creating:** Watch "Creating..." button state

### Test Keyboard Navigation

1. **Inline creation:** Press ESC to cancel
2. **Modal:** Press ESC or click outside to close
3. **Search:** Type to filter, use dropdown naturally

---

## Check DevTools Console

Open browser DevTools (F12) → Console tab:

```
✅ Mock Reference API initialized
Updated item 1, statusId = 4
Department created: { id: 9, name: "Quality Assurance", code: "QA" }
```

You'll see:
- API initialization message
- State updates when selections change
- Creation success logs
- Network timing

---

## Mock Data Management

**Reset all data:**
Click the **"🔄 Reset Mock Data"** button at the top to restore original mock data.

**Current mock data:**
- 3 statuses
- 8 departments
- 100 products (SKU-0001 to SKU-0100)
- 4 categories

---

## Testing Checklist

- [ ] Statuses: inline creation works
- [ ] Departments: modal creation works
- [ ] Departments: search highlights matches
- [ ] Departments: validation prevents invalid data
- [ ] Products: server search works (2+ chars)
- [ ] Products: grid layout displays correctly
- [ ] Products: number/boolean inputs work
- [ ] Categories: simple dropdown works
- [ ] All: newly created items auto-select
- [ ] All: cache invalidation works
- [ ] All: loading states show properly
- [ ] All: error states handle gracefully
- [ ] Console: logs show state changes
- [ ] DevTools Network: API calls are correct
- [ ] Responsive: works on mobile screens

---

## Integration with Your App

To use this in your actual application:

### 1. Configure your registry:

```typescript
// src/config/references.ts
export const referenceRegistry = createReferenceRegistry({
  statuses: defineReference('/api/statuses', {
    cache: 'static',
    create: { enabled: true, form: { type: 'inline' } }
  }),
  // ... more configs
});
```

### 2. Initialize in your app:

```typescript
// src/App.tsx or main.tsx
import { setReferenceRegistry } from './components/DataTable/cells/ReferenceCell';
import { referenceRegistry } from './config/references';

setReferenceRegistry(referenceRegistry);
```

### 3. Use in your columns:

```typescript
const columns: ColumnDef<Employee>[] = [
  {
    id: 'department',
    header: 'Department',
    accessorKey: 'departmentId',
    cell: (info) => (
      <ReferenceCell
        type="departments"
        value={info.getValue()}
        onChange={(value) => handleChange(info.row.id, 'departmentId', value)}
      />
    ),
  },
];
```

---

## Known Behaviors

1. **First open slow:** First dropdown open fetches data (lazy loading)
2. **Subsequent opens fast:** Data is cached
3. **Network delays:** Mock API simulates real delays (200-1000ms)
4. **Auto-select:** Created items automatically become selected
5. **Cache invalidation:** Creating new items refreshes the list

---

## Troubleshooting

**Dropdown doesn't open:**
- Check that registry is initialized with `setReferenceRegistry()`
- Check browser console for errors

**"Reference type not found":**
- Verify the type name matches your registry config
- Check spelling (case-sensitive)

**Data not loading:**
- Check DevTools Network tab for API calls
- Verify mock API is initialized (console message)
- Check endpoint paths match

**Validation not working:**
- Ensure Zod schema is provided in config
- Check browser console for validation errors

**Search not highlighting:**
- Set `highlightMatches: true` in search config
- Only works for client-side search

---

## Next Steps

After testing the demo:

1. **Replace mock API** with your real backend endpoints
2. **Customize validation** with your business rules
3. **Add more reference types** as needed
4. **Customize rendering** with custom components
5. **Add permissions** with `canCreate` function
6. **Implement dependent references** (Phase C)

---

**Questions?** Check the full documentation:
- [REFERENCE_DATA_SYSTEM.md](./REFERENCE_DATA_SYSTEM.md) - Complete guide
- [REFERENCE_QUICK_START.md](./REFERENCE_QUICK_START.md) - Quick setup

**Ready for production?** See Phase C for advanced features (hierarchical refs, fuzzy search, etc.)
