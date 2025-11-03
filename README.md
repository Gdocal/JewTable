# JewTable

[![GitHub](https://img.shields.io/badge/GitHub-Gdocal%2FJewTable-blue?logo=github)](https://github.com/Gdocal/JewTable)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Gdocal/JewTable/pulls)

A production-ready, feature-rich React data table component with full backend integration. Built with TanStack Table, TypeScript, and PostgreSQL for complex data management needs.

**🔗 Repository:** https://github.com/Gdocal/JewTable

**⭐ If you find this useful, please star the repo!**

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

### 🎉 100% PRODUCTION READY!

All phases completed. Project is production-ready and shipped to GitHub!

### Completed Phases

- [x] **Phase 0**: Preparation ✅
- [x] **Phase 1**: Basic Table ✅
- [x] **Phase 2**: Sorting ✅
- [x] **Phase 3**: Filtering ✅
- [x] **Phase 4**: Inline Editing ✅
- [x] **Phase 5**: Row Creation ✅
- [x] **Phase 6**: Drag & Drop (rows + columns) ✅
- [x] **Phase 7**: Virtualization ✅
- [x] **Phase 8**: Server Integration ✅
- [x] **Phase 10**: Additional Features (10/10 complete) ✅
  - Row selection & batch editing
  - Horizontal scroll with sticky columns
  - Column resizing
  - Badge columns (8 variants)
  - Row expanding
  - Column reordering (drag & drop)
  - Column visibility toggle
  - Modal window for row details
  - Import/Export CSV
  - Progress bars
- [x] **Phase 11**: ERP Integration (Reference Data System) ✅
- [x] **Phase 12**: Production Backend + Complete Documentation ✅

### Skipped Phases

- **Phase 9**: Mobile Adaptation (not needed for ERP desktop app)

**Progress**: 12/12 phases complete (100%) 🎊

## Monorepo Structure

This project uses **npm workspaces** for professional monorepo management:

- **packages/jewtable** - NPM package `@gdocal/jewtable` (component library)
- **packages/demo** - Demo application for development and testing
- **backend** - REST API backend with PostgreSQL

**Benefits:**
- ✅ Single source of truth - no code duplication
- ✅ Automatic symlinking - changes immediately visible
- ✅ Easy NPM publishing - one command to build and publish
- ✅ Professional structure - industry standard approach

[→ Complete Monorepo Guide](./docs/MONOREPO_GUIDE.md) | [→ Migration Guide](./docs/MONOREPO_MIGRATION.md)

## Reference Data System (ERP Integration)

Complete reference data management for enterprise applications:

- **Smart Dropdowns** - Lazy loading with configurable cache strategies
- **Inline Creation** - Quick item creation directly in dropdowns
- **Modal Forms** - Full validation with React Hook Form + Zod
- **Search** - Client-side with highlighting or server-side with debouncing
- **Flexible Configuration** - Registry pattern with type-safe configs
- **Multiple Layouts** - Inline, modal, grid, or vertical forms

[→ Quick Start Guide](./docs/REFERENCE_QUICK_START.md) | [→ Full Documentation](./docs/REFERENCE_DATA_SYSTEM.md) | [→ Testing Guide](./docs/REFERENCE_TESTING_GUIDE.md)

## 🚀 Getting Started for End Users

### Option 1: Use as Template (Recommended)

Create your own project based on JewTable:

1. Click the **"Use this template"** button at the top of the repository
2. Clone your new repository:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_PROJECT_NAME.git
cd YOUR_PROJECT_NAME
```

3. Install dependencies:
```bash
npm install
cd backend && npm install && cd ..
```

4. Setup database:
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npx prisma migrate dev
npx prisma db seed
cd ..
```

5. Start development servers:
```bash
# Terminal 1 - Frontend (http://localhost:5173)
npm run dev

# Terminal 2 - Backend (http://localhost:3001)
cd backend && npm run dev
```

### Option 2: Docker Deployment (Fastest)

Deploy the entire stack with one command:

```bash
git clone https://github.com/Gdocal/JewTable.git
cd JewTable
cp .env.docker .env
# Edit .env with secure passwords
docker-compose up -d
```

Access at: http://localhost

### Option 3: Clone and Customize

```bash
git clone https://github.com/Gdocal/JewTable.git
cd JewTable
npm install
cd backend && npm install && cd ..
# Follow setup steps from Option 1
```

## 📖 Complete Documentation

- **[Quick Start Tutorial](./docs/TUTORIALS/01-quick-start.md)** - Get started in 5 minutes
- **[Advanced Filtering](./docs/TUTORIALS/02-advanced-filtering.md)** - Master all 15+ filter operators
- **[Reference Data Guide](./docs/TUTORIALS/05-reference-data.md)** - API-backed dropdowns
- **[Backend API Docs](./backend/README.md)** - Complete REST API documentation
- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to production
- **[Distribution Guide](./docs/DISTRIBUTION.md)** - Package and ship to users

## 🎮 Try the Demos

After starting development servers:
- 📊 **DataTable Demo** - http://localhost:5173
- Full table features: sorting, filtering, editing, virtualization
- Reference data management with API integration

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
