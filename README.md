# JewTable

A feature-rich, performant React table component built with TanStack Table for complex data management needs.

## Features

- **Sorting** - Multi-column sorting with custom comparators
- **Filtering** - Advanced filters (text, number, date, select) with AND/OR logic
- **Quick Search** - Global search across all columns
- **Inline Editing** - Edit cells directly with validation
- **Row Management** - Create, update, delete, and reorder rows
- **Drag & Drop** - Reorder rows with visual feedback
- **Virtualization** - Handle thousands of rows efficiently
- **Server Integration** - Client/server mode with hybrid pagination
- **Reference Data** - Smart dropdowns with lazy loading, caching, and inline creation (ERP-ready)
- **Mobile Responsive** - Adaptive card layout for mobile devices
- **Type Safe** - Full TypeScript support
- **Accessible** - WCAG AA compliant

## Tech Stack

- **React 18+** with TypeScript
- **TanStack Table** - Headless table logic
- **TanStack Query** - Data fetching and caching
- **TanStack Virtual** - Virtual scrolling
- **Zustand** - State management
- **React Hook Form** - Form state management
- **@dnd-kit** - Drag and drop
- **Zod** - Schema validation
- **CSS Modules** - Scoped styling
- **Vite** - Build tool

## Project Status

### Completed Phases

- [x] **Phase 0**: Preparation ✅
- [x] **Phase 1**: Basic Table ✅
- [x] **Phase 2**: Sorting ✅
- [x] **Phase 3**: Filtering ✅
- [x] **Phase 4**: Inline Editing ✅
- [x] **Phase 5**: Row Creation ✅
- [x] **Phase 6**: Drag & Drop ✅
- [x] **Phase 7**: Virtualization ✅
- [x] **Phase 8**: Server Integration ✅
- [x] **Phase 11**: ERP Integration (Reference Data System) ✅

### In Progress

- [~] **Phase 10**: Additional Features (5/10 features complete)

### Upcoming Phases

- **Phase 9**: Mobile Adaptation (4-5h)
- **Phase 12**: Testing & Documentation (2-3h)

**Progress**: 9/13 phases complete (69%)

## Reference Data System (ERP Integration)

Complete reference data management for enterprise applications:

- **Smart Dropdowns** - Lazy loading with configurable cache strategies
- **Inline Creation** - Quick item creation directly in dropdowns
- **Modal Forms** - Full validation with React Hook Form + Zod
- **Search** - Client-side with highlighting or server-side with debouncing
- **Flexible Configuration** - Registry pattern with type-safe configs
- **Multiple Layouts** - Inline, modal, grid, or vertical forms

[→ Quick Start Guide](./docs/REFERENCE_QUICK_START.md) | [→ Full Documentation](./docs/REFERENCE_DATA_SYSTEM.md) | [→ Testing Guide](./docs/REFERENCE_TESTING_GUIDE.md)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the development app.

**Try the demos:**
- 📊 **DataTable Demo** - Full table features (sorting, filtering, editing, virtualization)
- 📑 **Reference System Demo** - ERP reference data management (NEW!)

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Development Progress

See [PROGRESS.md](./PROGRESS.md) for detailed development progress tracking.

## Documentation

### 📚 Complete Documentation Hub
- **[Documentation Index](./docs/README.md)** - Complete documentation overview

### 🎓 Tutorials (NEW!)
- **[Quick Start](./docs/TUTORIALS/01-quick-start.md)** - Get started in 5 minutes
- **[Advanced Filtering](./docs/TUTORIALS/02-advanced-filtering.md)** - Master all 15+ filter operators
- **[Reference Data](./docs/TUTORIALS/05-reference-data.md)** - API-backed dropdowns guide

### 📖 API Reference (NEW!)
- **[Component API](./docs/COMPONENTS.md)** - All 91 DataTable props documented
- **[Cell Types](./docs/CELLS.md)** - Complete guide to all 12 cell types
- **[Filter Types](./docs/FILTERS.md)** - All 15+ filter operators with examples

### 🔧 Backend (NEW!)
- **[Backend API Documentation](./backend/README.md)** - Production REST API complete guide
- **[Advanced Query Builder](./backend/src/utils/queryBuilder.ts)** - Supports all filter operators

### Reference Data System
- [Quick Start Guide](./docs/REFERENCE_QUICK_START.md) - Get started in 5 minutes
- [Complete Documentation](./docs/REFERENCE_DATA_SYSTEM.md) - Comprehensive guide (900+ lines)
- [Cache Behavior](./docs/REFERENCE_CACHE_BEHAVIOR.md) - TanStack Query caching deep dive
- [Testing Guide](./docs/REFERENCE_TESTING_GUIDE.md) - Step-by-step testing instructions

### Architecture
- [Architecture Documentation](./ARCHITECTURE.md) - System design and patterns
- [Progress Tracking](./PROGRESS.md) - Detailed development progress

## License

MIT

## Contributing

This is currently under active development. Contribution guidelines will be published soon.
