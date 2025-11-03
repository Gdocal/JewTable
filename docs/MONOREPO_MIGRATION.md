# Monorepo Migration Guide

Step-by-step guide to migrate JewTable from current structure to monorepo with npm workspaces.

## Table of Contents

- [Overview](#overview)
- [Pre-Migration Checklist](#pre-migration-checklist)
- [Migration Steps](#migration-steps)
- [Post-Migration Testing](#post-migration-testing)
- [Rollback Plan](#rollback-plan)

---

## Overview

### Current Structure

```
JewTable/
├── src/                    # Demo app + Component code (mixed)
│   ├── components/
│   │   ├── DataTable/      # Component (should be NPM package)
│   │   └── ...
│   ├── hooks/
│   ├── utils/
│   ├── api/
│   ├── App.tsx             # Demo app
│   └── main.tsx
├── backend/                # Backend API
├── package.json            # Demo app config
└── ...
```

**Problem:** Component code is mixed with demo app code.

### Target Structure

```
JewTable/
├── packages/
│   ├── jewtable/           # @gdocal/jewtable (NPM package)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   ├── api/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── demo/               # Demo app
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── examples/
│       ├── package.json
│       ├── vite.config.ts
│       └── index.html
│
├── backend/                # Backend API (unchanged)
├── package.json            # Root workspace config
└── ...
```

**Benefit:** Clear separation, easy NPM publishing, professional structure.

---

## Pre-Migration Checklist

Before starting migration:

- [ ] **Commit all changes:**
  ```bash
  git add .
  git commit -m "chore: Prepare for monorepo migration"
  git push
  ```

- [ ] **Create backup branch:**
  ```bash
  git checkout -b backup-before-monorepo
  git push origin backup-before-monorepo
  git checkout main
  ```

- [ ] **Stop running servers:**
  ```bash
  # Stop frontend dev server (Ctrl+C)
  # Stop backend dev server (Ctrl+C)
  ```

- [ ] **Verify current state works:**
  ```bash
  npm run dev        # Frontend should work
  npm run build      # Build should succeed
  cd backend && npm run dev  # Backend should work
  ```

- [ ] **Read documentation:**
  - [Monorepo Guide](./MONOREPO_GUIDE.md)
  - This migration guide

---

## Migration Steps

### Step 1: Create Directory Structure

```bash
# Create packages directory
mkdir -p packages/jewtable
mkdir -p packages/demo

# Create source directories
mkdir -p packages/jewtable/src
mkdir -p packages/demo/src
mkdir -p packages/demo/public
```

**Verify:**
```bash
tree -L 2 packages/
# Should show:
# packages/
# ├── demo
# │   ├── public
# │   └── src
# └── jewtable
#     └── src
```

---

### Step 2: Move Component Code to packages/jewtable

**Move core component files:**

```bash
# Move DataTable component (core of NPM package)
mv src/components/DataTable packages/jewtable/src/components/

# Move hooks (used by DataTable)
mv src/hooks packages/jewtable/src/

# Move utils (used by DataTable)
mv src/utils packages/jewtable/src/

# Move api client (used by DataTable)
mv src/api packages/jewtable/src/

# Move types (if separate directory)
[ -d src/types ] && mv src/types packages/jewtable/src/
```

**Move cell components:**

```bash
# Move all cell types
mv src/components/Cells packages/jewtable/src/components/
```

**Verify:**
```bash
tree -L 3 packages/jewtable/src/
# Should show:
# packages/jewtable/src/
# ├── api
# ├── components
# │   ├── Cells
# │   └── DataTable
# ├── hooks
# └── utils
```

---

### Step 3: Create jewtable Package Configuration

**Create packages/jewtable/package.json:**

```bash
cat > packages/jewtable/package.json << 'EOF'
{
  "name": "@gdocal/jewtable",
  "version": "1.0.0",
  "description": "A powerful, production-ready data table component for React with advanced filtering, sorting, editing, and virtualization. Built with TanStack Table, TypeScript, and PostgreSQL.",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "react",
    "table",
    "datagrid",
    "datatable",
    "tanstack-table",
    "tanstack-query",
    "typescript",
    "filtering",
    "sorting",
    "pagination",
    "virtualization",
    "editable",
    "reference-data",
    "postgresql",
    "backend",
    "full-stack"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/Gdocal/JewTable.git",
    "directory": "packages/jewtable"
  },
  "homepage": "https://github.com/Gdocal/JewTable#readme",
  "bugs": {
    "url": "https://github.com/Gdocal/JewTable/issues"
  },
  "author": "Gdocal <Gdocal@gmail.com>",
  "license": "MIT",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-table": "^8.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-virtual": "^3.0.0"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "tsup": "^8.0.1",
    "typescript": "^5.3.3"
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --sourcemap --external react --external react-dom --external @tanstack/react-table --external @tanstack/react-query --external @tanstack/react-virtual",
    "prepublishOnly": "npm run build",
    "type-check": "tsc --noEmit"
  },
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/index.css"
  }
}
EOF
```

**Create packages/jewtable/tsconfig.json:**

```bash
cat > packages/jewtable/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

**Create packages/jewtable/src/index.ts (Public API):**

```bash
cat > packages/jewtable/src/index.ts << 'EOF'
// Main component
export { DataTable } from './components/DataTable/DataTable';

// Types
export type {
  ColumnDef,
  FilterState,
  Filter,
  SortingState,
  DataTableProps,
  PaginationState,
  ServerDataResponse,
} from './components/DataTable/types';

export { CellType } from './components/DataTable/types/cell.types';

export type {
  CellOptions,
  ReferenceOptions,
  SelectOptions,
  CurrencyOptions,
  DateOptions,
  BadgeOptions,
  ProgressOptions,
} from './components/DataTable/types/cell.types';

// Hooks
export { useReferenceData } from './hooks/useReferenceData';
export { useTableSettings } from './hooks/useTableSettings';

// Utils (if needed by users)
export { formatCurrency } from './utils/formatters';
export { formatDate } from './utils/date';
EOF
```

**Copy README and LICENSE:**

```bash
# Copy NPM README
cp NPM_README.md packages/jewtable/README.md

# Copy license
cp LICENSE packages/jewtable/LICENSE
```

---

### Step 4: Move Demo App to packages/demo

**Move demo app files:**

```bash
# Move remaining src files (demo app)
mv src/* packages/demo/src/ 2>/dev/null || true

# Move public assets
mv public/* packages/demo/public/ 2>/dev/null || true

# Move config files
mv index.html packages/demo/
mv vite.config.ts packages/demo/
```

**Create packages/demo/package.json:**

```bash
cat > packages/demo/package.json << 'EOF'
{
  "name": "jewtable-demo",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@gdocal/jewtable": "*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-table": "^8.11.2",
    "@tanstack/react-query": "^5.17.9",
    "@tanstack/react-query-devtools": "^5.17.9",
    "@tanstack/react-virtual": "^3.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
EOF
```

**Create packages/demo/tsconfig.json:**

```bash
cat > packages/demo/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
```

**Create packages/demo/tsconfig.node.json:**

```bash
cat > packages/demo/tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF
```

**Update packages/demo/vite.config.ts:**

```bash
cat > packages/demo/vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
EOF
```

---

### Step 5: Update Demo App Imports

**Update packages/demo/src/App.tsx:**

Replace all relative imports from `./components/DataTable` with:

```typescript
// OLD:
import { DataTable } from './components/DataTable/DataTable';
import { CellType } from './components/DataTable/types/cell.types';
import { useReferenceData } from './hooks/useReferenceData';

// NEW:
import { DataTable, CellType, useReferenceData } from '@gdocal/jewtable';
import '@gdocal/jewtable/styles.css';
```

**Update packages/demo/src/main.tsx:**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import '@gdocal/jewtable/styles.css';  // Import styles from package
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

**Automated find/replace (optional):**

```bash
cd packages/demo/src

# Replace component imports
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i \
  "s|from ['\"].*components/DataTable/DataTable['\"]|from '@gdocal/jewtable'|g"

# Replace CellType imports
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i \
  "s|from ['\"].*types/cell.types['\"]|from '@gdocal/jewtable'|g"

# Replace hooks imports
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i \
  "s|from ['\"].*hooks/useReferenceData['\"]|from '@gdocal/jewtable'|g"

cd ../../..
```

---

### Step 6: Create Root Workspace Configuration

**Create root package.json:**

```bash
cat > package.json << 'EOF'
{
  "name": "jewtable-monorepo",
  "version": "1.0.0",
  "description": "JewTable monorepo - Production-ready React data table component",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspace=packages/demo",
    "dev:backend": "npm run dev --workspace=backend",
    "build": "npm run build --workspaces --if-present",
    "build:jewtable": "npm run build --workspace=packages/jewtable",
    "build:demo": "npm run build --workspace=packages/demo",
    "publish:npm": "npm run build:jewtable && npm publish --workspace=packages/jewtable --access public",
    "test": "npm run test --workspaces --if-present",
    "type-check": "npm run type-check --workspaces --if-present",
    "clean": "rm -rf packages/*/node_modules packages/*/dist backend/node_modules backend/dist node_modules",
    "fresh-install": "npm run clean && npm install"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/Gdocal/JewTable.git"
  },
  "author": "Gdocal <Gdocal@gmail.com>",
  "license": "MIT"
}
EOF
```

**Verify workspace configuration:**

```bash
cat package.json | grep -A 3 workspaces
# Should show:
#   "workspaces": [
#     "packages/*"
#   ],
```

---

### Step 7: Clean Up Old Structure

```bash
# Remove old src directory (now empty or has only old files)
rm -rf src/

# Remove old public directory
rm -rf public/

# Remove old config files
rm -f vite.config.ts
rm -f tsconfig.json
rm -f tsconfig.node.json

# Keep backend unchanged
# backend/ directory stays as-is
```

---

### Step 8: Install Dependencies

```bash
# Remove old node_modules and lockfile
rm -rf node_modules package-lock.json

# Install all workspace dependencies
npm install

# This will:
# 1. Install root dependencies
# 2. Install packages/jewtable dependencies
# 3. Install packages/demo dependencies
# 4. Create symlink: node_modules/@gdocal/jewtable -> packages/jewtable
```

**Verify symlink created:**

```bash
ls -la node_modules/@gdocal/
# Should show:
# jewtable -> ../../packages/jewtable
```

---

### Step 9: Update .gitignore

```bash
cat >> .gitignore << 'EOF'

# Monorepo workspace artifacts
packages/*/node_modules
packages/*/dist
packages/*/.turbo

# Build outputs
packages/jewtable/dist/
packages/demo/dist/

# TypeScript cache
*.tsbuildinfo
EOF
```

---

### Step 10: Update Documentation

**Update README.md:**

```bash
# Add monorepo section to main README
cat >> README.md << 'EOF'

## Monorepo Structure

This project uses npm workspaces for monorepo management:

- **packages/jewtable** - NPM package `@gdocal/jewtable`
- **packages/demo** - Demo application for development
- **backend** - REST API backend

See [Monorepo Guide](./docs/MONOREPO_GUIDE.md) for details.

### Development

```bash
# Install dependencies
npm install

# Start demo app
npm run dev

# Start backend
npm run dev:backend

# Build NPM package
npm run build:jewtable

# Publish to NPM
npm run publish:npm
```
EOF
```

---

## Post-Migration Testing

### Test 1: Dependencies Installed

```bash
# Check all workspaces installed
ls packages/jewtable/node_modules/@tanstack/react-table
ls packages/demo/node_modules/react
ls backend/node_modules/express

# Should all exist
```

### Test 2: Symlink Works

```bash
# Verify symlink
ls -la node_modules/@gdocal/jewtable
# Should point to: ../../packages/jewtable

# Check demo can resolve jewtable
cd packages/demo
node -e "console.log(require.resolve('@gdocal/jewtable'))"
# Should print path to packages/jewtable
cd ../..
```

### Test 3: TypeScript Compiles

```bash
# Check jewtable types
npm run type-check --workspace=packages/jewtable

# Check demo types
npm run type-check --workspace=packages/demo

# Both should succeed with no errors
```

### Test 4: Demo App Runs

```bash
# Start demo app
npm run dev

# Open http://localhost:5173
# Verify:
# - Table renders
# - No import errors in console
# - Styles loaded correctly
```

### Test 5: Backend Runs

```bash
# Start backend
npm run dev:backend

# Should start on http://localhost:3001
# Test endpoint:
curl http://localhost:3001/api/health
# Should return: {"status":"ok"}
```

### Test 6: Hot Reload Works

```bash
# With demo app running:
npm run dev

# Edit packages/jewtable/src/components/DataTable/DataTable.tsx
# Add a console.log or change some text

# Check browser console or UI
# Should see changes immediately (no restart needed)
```

### Test 7: Build Works

```bash
# Build jewtable package
npm run build:jewtable

# Verify dist/ created
ls packages/jewtable/dist/
# Should show:
# - index.js (CommonJS)
# - index.esm.js (ES Module)
# - index.d.ts (TypeScript types)
# - index.css (styles)

# Check file sizes
du -sh packages/jewtable/dist/*
```

### Test 8: Demo Build Works

```bash
# Build demo app
npm run build:demo

# Verify dist/ created
ls packages/demo/dist/
# Should show built HTML, JS, CSS files

# Preview production build
npm run preview --workspace=packages/demo
# Open http://localhost:4173
```

---

## Rollback Plan

If migration fails, rollback to previous state:

### Quick Rollback

```bash
# Discard all changes
git reset --hard HEAD

# Switch to backup branch
git checkout backup-before-monorepo
```

### Partial Rollback

If you want to keep some changes:

```bash
# Stash current work
git stash

# Reset to before migration
git reset --hard HEAD~1

# Apply specific changes
git stash pop
git checkout stash -- path/to/file
```

---

## Troubleshooting

### Problem: Symlink not created

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
ls -la node_modules/@gdocal/jewtable
```

### Problem: TypeScript can't find @gdocal/jewtable

**Solution:**
```bash
# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Or rebuild
npm run build:jewtable
```

### Problem: Styles not loading

**Solution:**
```typescript
// In packages/demo/src/main.tsx
import '@gdocal/jewtable/styles.css';
```

### Problem: Demo app import errors

**Solution:**
```bash
# Check all imports changed:
grep -r "from.*components/DataTable" packages/demo/src/
# Should return nothing

# If found, update imports:
# OLD: from './components/DataTable/DataTable'
# NEW: from '@gdocal/jewtable'
```

---

## Verification Checklist

After migration, verify:

- [ ] `npm install` succeeds
- [ ] Symlink created: `node_modules/@gdocal/jewtable -> packages/jewtable`
- [ ] `npm run dev` starts demo app
- [ ] Demo app loads without errors
- [ ] `npm run dev:backend` starts backend
- [ ] `npm run build:jewtable` succeeds
- [ ] `packages/jewtable/dist/` contains files
- [ ] `npm run build:demo` succeeds
- [ ] Hot reload works (edit jewtable, see changes in demo)
- [ ] TypeScript has no errors
- [ ] All tests pass
- [ ] Git status shows expected changes

---

## Next Steps

After successful migration:

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "refactor: Migrate to monorepo structure with npm workspaces"
   git push
   ```

2. **Update CI/CD:**
   - Update build scripts
   - Update deployment scripts
   - Update environment variables

3. **Publish to NPM:**
   ```bash
   npm run publish:npm
   ```

4. **Update documentation:**
   - Link to [Monorepo Guide](./MONOREPO_GUIDE.md)
   - Update installation instructions
   - Update contribution guidelines

5. **Celebrate! 🎉**
   - You now have a professional monorepo setup
   - Easy to develop and publish
   - Industry-standard architecture

---

## Summary

**What we did:**
1. Created `packages/` directory structure
2. Moved component code to `packages/jewtable/`
3. Moved demo app to `packages/demo/`
4. Created workspace configuration
5. Updated imports to use `@gdocal/jewtable`
6. Installed dependencies (with symlinks)

**What you get:**
- Single codebase ✅
- Easy development ✅
- Easy NPM publishing ✅
- Professional structure ✅
- No manual syncing ✅

**Time saved:**
- Before: 8 steps to publish changes
- After: 4 steps to publish changes
- **50% reduction in effort** 🚀

---

**Ready to migrate?** Follow steps 1-10 above!

**Questions?** See [Monorepo Guide](./MONOREPO_GUIDE.md) or [Troubleshooting](#troubleshooting).
