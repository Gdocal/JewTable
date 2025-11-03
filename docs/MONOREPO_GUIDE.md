# Monorepo Guide

Complete guide to JewTable's monorepo architecture using npm workspaces.

## Table of Contents

- [Why Monorepo?](#why-monorepo)
- [Architecture Overview](#architecture-overview)
- [How npm Workspaces Work](#how-npm-workspaces-work)
- [Directory Structure](#directory-structure)
- [Development Workflow](#development-workflow)
- [Publishing to NPM](#publishing-to-npm)
- [Troubleshooting](#troubleshooting)

---

## Why Monorepo?

### The Problem We're Solving

Previously, we considered copying component code to a separate directory for NPM packaging:

```
JewTable/                    # Development repository
├── src/                     # Component source code
└── ...

jewtable-npm/                # Separate NPM package repository
├── src/                     # DUPLICATE component code
└── package.json
```

**Problems with this approach:**
- ❌ Duplicate code in two places
- ❌ Manual copying required after each change
- ❌ Easy to forget to sync changes
- ❌ Two repositories to manage
- ❌ Risk of version drift

### The Monorepo Solution

With monorepo + npm workspaces:

```
JewTable/                    # ONE repository
├── packages/
│   ├── jewtable/            # NPM package (source of truth)
│   │   └── src/
│   └── demo/                # Demo app (uses jewtable automatically)
│       └── src/
└── backend/
```

**Benefits:**
- ✅ Single source of truth
- ✅ No manual copying
- ✅ Changes automatically reflected everywhere
- ✅ One commit, one push
- ✅ Easy to test before publishing
- ✅ Professional industry standard

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    JewTable Monorepo                     │
│                 (One Git Repository)                     │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼──────┐
│ packages/      │  │ packages/      │  │  backend/   │
│ jewtable       │  │ demo           │  │             │
│                │  │                │  │  Express    │
│ NPM Package    │  │ Dev App        │  │  PostgreSQL │
│ @gdocal/       │  │ (for testing)  │  │  Prisma     │
│ jewtable       │  │                │  │             │
└───────┬────────┘  └───────┬────────┘  └─────────────┘
        │                   │
        │    npm workspaces │
        │    creates symlink│
        │                   │
        └──────────►────────┘
          package used here automatically
```

### Key Concepts

1. **Workspace Root** (`/JewTable/package.json`)
   - Defines all workspaces
   - Central configuration
   - Shared scripts

2. **Package: jewtable** (`/packages/jewtable/`)
   - Component source code
   - Published to NPM as `@gdocal/jewtable`
   - Source of truth

3. **Package: demo** (`/packages/demo/`)
   - Development application
   - Uses `@gdocal/jewtable` via symlink
   - For testing before publishing

4. **Backend** (`/backend/`)
   - REST API
   - Not part of NPM package
   - Shared across all packages

---

## How npm Workspaces Work

### The Magic: Automatic Symlinks

When you install dependencies in a monorepo with workspaces:

```bash
npm install
```

npm automatically creates **symlinks** (symbolic links):

```
node_modules/
└── @gdocal/
    └── jewtable -> ../../packages/jewtable/   # Symlink!
```

**What this means:**

```typescript
// In packages/demo/src/App.tsx
import { DataTable } from '@gdocal/jewtable';
//                         ↑
//                         This resolves to ../../packages/jewtable/src
//                         Changes in jewtable are IMMEDIATELY visible here!
```

### No Build Step Needed (During Development)

Because of symlinks:
1. You edit code in `packages/jewtable/src/components/DataTable.tsx`
2. Demo app imports from `@gdocal/jewtable`
3. npm resolves symlink → points to local `packages/jewtable/`
4. Vite's HMR (Hot Module Replacement) picks up changes
5. Browser updates automatically

**No copying. No manual syncing. Just works.**

### Before Publishing: Build Step

When publishing to NPM:
1. Build creates `packages/jewtable/dist/` directory
2. NPM publishes the `dist/` folder (configured in package.json)
3. End users get compiled JavaScript + TypeScript types
4. But YOU work with source code during development

---

## Directory Structure

### Complete Structure

```
JewTable/
├── package.json                      # Root workspace config
├── packages/
│   ├── jewtable/                     # @gdocal/jewtable (NPM package)
│   │   ├── package.json              # Package metadata
│   │   ├── tsconfig.json             # TypeScript config
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── DataTable/
│   │   │   │   │   ├── DataTable.tsx
│   │   │   │   │   ├── DataTable.module.css
│   │   │   │   │   └── types/
│   │   │   │   └── Cells/
│   │   │   ├── hooks/
│   │   │   │   ├── useReferenceData.ts
│   │   │   │   └── useTableSettings.ts
│   │   │   ├── utils/
│   │   │   ├── api/
│   │   │   └── index.ts              # Public API exports
│   │   ├── dist/                     # Build output (generated)
│   │   │   ├── index.js              # CommonJS bundle
│   │   │   ├── index.esm.js          # ES Module bundle
│   │   │   ├── index.d.ts            # TypeScript types
│   │   │   └── index.css             # Bundled styles
│   │   └── README.md                 # NPM README
│   │
│   └── demo/                         # Demo application
│       ├── package.json              # Depends on @gdocal/jewtable
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── src/
│       │   ├── App.tsx               # Demo app
│       │   ├── main.tsx
│       │   └── examples/
│       ├── public/
│       └── index.html
│
├── backend/                          # Backend API (not in packages)
│   ├── package.json
│   ├── prisma/
│   ├── src/
│   └── ...
│
├── docs/                             # Documentation
│   ├── MONOREPO_GUIDE.md             # This file
│   ├── TUTORIALS/
│   └── ...
│
└── README.md                         # Main README
```

### Key Files

#### Root `package.json`

```json
{
  "name": "jewtable-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspace=packages/demo",
    "dev:backend": "npm run dev --workspace=backend",
    "build": "npm run build --workspaces --if-present",
    "build:jewtable": "npm run build --workspace=packages/jewtable",
    "publish:npm": "npm run build --workspace=packages/jewtable && npm publish --workspace=packages/jewtable --access public",
    "test": "npm run test --workspaces --if-present"
  }
}
```

**Why `private: true`?**
- Root package is NOT published to NPM
- Only `packages/jewtable` is published

**Why `workspaces: ["packages/*"]`?**
- Tells npm: "These directories are workspaces"
- npm will create symlinks for dependencies between them

#### `packages/jewtable/package.json`

```json
{
  "name": "@gdocal/jewtable",
  "version": "1.0.0",
  "description": "A powerful, production-ready data table component for React",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/index.css"
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --sourcemap --external react --external react-dom --external @tanstack/react-table --external @tanstack/react-query --external @tanstack/react-virtual",
    "prepublishOnly": "npm run build"
  },
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
    "zod": "^3.22.4"
  }
}
```

**Key fields:**
- `files: ["dist"]` - Only `dist/` folder is published
- `exports` - Modern package exports (supports ESM + CommonJS)
- `peerDependencies` - User must install React, TanStack libs
- `prepublishOnly` - Automatically builds before publishing

#### `packages/demo/package.json`

```json
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
    "@tanstack/react-virtual": "^3.0.1"
  }
}
```

**Key fields:**
- `"@gdocal/jewtable": "*"` - Uses local workspace version
- `private: true` - Not published to NPM
- Includes peer dependencies (React, TanStack libs)

#### `packages/jewtable/src/index.ts` (Public API)

```typescript
// Main component
export { DataTable } from './components/DataTable/DataTable';

// Types
export type {
  ColumnDef,
  FilterState,
  Filter,
  SortingState,
  DataTableProps,
} from './components/DataTable/types';

export { CellType } from './components/DataTable/types/cell.types';

// Hooks
export { useReferenceData } from './hooks/useReferenceData';
export { useTableSettings } from './hooks/useTableSettings';

// Utils (if needed)
export { formatCurrency } from './utils/formatters';
```

**This defines what users can import:**

```typescript
import { DataTable, CellType, useReferenceData } from '@gdocal/jewtable';
```

---

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone https://github.com/Gdocal/JewTable.git
cd JewTable

# Install all dependencies
npm install

# This installs:
# 1. Root dependencies
# 2. packages/jewtable dependencies
# 3. packages/demo dependencies
# 4. backend dependencies
# AND creates symlinks automatically!
```

### Daily Development

```bash
# Start demo app (http://localhost:5173)
npm run dev

# Start backend (http://localhost:3001)
npm run dev:backend

# Or both in separate terminals:
# Terminal 1:
npm run dev

# Terminal 2:
cd backend && npm run dev
```

### Editing Component Code

**Scenario:** Add a new feature to DataTable

1. **Edit source code:**
   ```bash
   # Edit component
   packages/jewtable/src/components/DataTable/DataTable.tsx
   ```

2. **See changes immediately:**
   - Demo app hot-reloads
   - No build step needed
   - No copying required

3. **Test in demo app:**
   ```typescript
   // packages/demo/src/App.tsx
   import { DataTable } from '@gdocal/jewtable';

   function App() {
     return <DataTable {...props} />;
   }
   ```

4. **Commit when ready:**
   ```bash
   git add packages/jewtable/src/components/DataTable/DataTable.tsx
   git commit -m "feat: Add new DataTable feature"
   git push
   ```

### Testing Before Publishing

```bash
# Build the package
npm run build:jewtable

# Check dist/ output
ls packages/jewtable/dist/
# Should see:
# - index.js (CommonJS)
# - index.esm.js (ES Module)
# - index.d.ts (TypeScript types)
# - index.css (styles)

# Test in demo with built version
npm run dev
```

### Adding a New Cell Type

**Example: Adding `IMAGE` cell type**

1. **Create cell component:**
   ```typescript
   // packages/jewtable/src/components/Cells/ImageCell.tsx
   export const ImageCell = ({ value }: { value: string }) => {
     return <img src={value} alt="" className={styles.image} />;
   };
   ```

2. **Update CellType enum:**
   ```typescript
   // packages/jewtable/src/components/DataTable/types/cell.types.ts
   export enum CellType {
     TEXT = 'TEXT',
     NUMBER = 'NUMBER',
     IMAGE = 'IMAGE', // Add new type
     // ...
   }
   ```

3. **Add to cell renderer:**
   ```typescript
   // packages/jewtable/src/components/DataTable/cells/CellRenderer.tsx
   case CellType.IMAGE:
     return <ImageCell value={value} />;
   ```

4. **Export from index.ts (if needed):**
   ```typescript
   // packages/jewtable/src/index.ts
   export { ImageCell } from './components/Cells/ImageCell';
   ```

5. **Test in demo app:**
   ```typescript
   // packages/demo/src/App.tsx
   import { DataTable, CellType } from '@gdocal/jewtable';

   const columns = [
     {
       accessorKey: 'avatar',
       header: 'Avatar',
       cellType: CellType.IMAGE,
     },
   ];
   ```

6. **Commit and publish:**
   ```bash
   git add packages/jewtable/
   git commit -m "feat: Add IMAGE cell type"
   git push

   # Publish to NPM
   npm run publish:npm
   ```

---

## Publishing to NPM

### First-Time Setup

```bash
# Login to NPM
npm login

# Enter credentials:
# Username: gdocal
# Password: ****
# Email: Gdocal@gmail.com
```

### Publishing New Version

#### Step 1: Update Version

```bash
# Bump version in packages/jewtable/package.json
cd packages/jewtable

# Patch version (1.0.0 → 1.0.1)
npm version patch

# Minor version (1.0.0 → 1.1.0)
npm version minor

# Major version (1.0.0 → 2.0.0)
npm version major
```

#### Step 2: Build and Publish

```bash
# From root directory
npm run publish:npm

# This runs:
# 1. npm run build --workspace=packages/jewtable
# 2. npm publish --workspace=packages/jewtable --access public
```

**What happens:**
1. `prepublishOnly` script runs automatically
2. Builds `dist/` directory
3. Publishes only files listed in `files: ["dist"]`
4. Package appears on npmjs.com as `@gdocal/jewtable`

#### Step 3: Commit Version Bump

```bash
git add packages/jewtable/package.json
git commit -m "chore: Release v1.0.1"
git tag v1.0.1
git push
git push --tags
```

### Publishing Checklist

Before publishing:

- [ ] All tests pass: `npm run test`
- [ ] Build succeeds: `npm run build:jewtable`
- [ ] Demo app works: `npm run dev`
- [ ] CHANGELOG updated
- [ ] Version bumped
- [ ] README up to date
- [ ] No sensitive data in code

### Publish Strategies

**Stable Releases:**
```bash
npm version patch  # Bug fixes
npm version minor  # New features (backwards compatible)
npm version major  # Breaking changes
```

**Pre-releases (for testing):**
```bash
npm version prerelease --preid=alpha
# 1.0.0 → 1.0.1-alpha.0

npm version prerelease --preid=beta
# 1.0.0 → 1.0.1-beta.0
```

**Manual version:**
```json
{
  "version": "1.2.3"
}
```

---

## Working with Multiple Packages

### Adding Dependencies

**To jewtable package:**
```bash
npm install lodash --workspace=packages/jewtable
```

**To demo app:**
```bash
npm install axios --workspace=packages/demo
```

**To all workspaces:**
```bash
npm install typescript --workspaces
```

### Running Scripts

**In specific workspace:**
```bash
npm run build --workspace=packages/jewtable
npm run dev --workspace=packages/demo
```

**In all workspaces:**
```bash
npm run test --workspaces
npm run build --workspaces --if-present
```

### Updating Dependencies

**Update all workspaces:**
```bash
npm update --workspaces
```

**Check outdated:**
```bash
npm outdated --workspaces
```

---

## Troubleshooting

### Problem: Demo doesn't see changes in jewtable

**Symptoms:**
- Edit `packages/jewtable/src/components/DataTable.tsx`
- Changes don't appear in demo app

**Solution:**
```bash
# 1. Check symlink exists
ls -la node_modules/@gdocal/
# Should show: jewtable -> ../../packages/jewtable

# 2. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Restart dev server
npm run dev
```

### Problem: TypeScript errors in demo

**Symptoms:**
```
Cannot find module '@gdocal/jewtable' or its corresponding type declarations
```

**Solution:**
```bash
# 1. Check jewtable has index.ts
ls packages/jewtable/src/index.ts

# 2. Check exports in package.json
cat packages/jewtable/package.json | grep exports

# 3. Rebuild TypeScript
npm run build:jewtable

# 4. Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "Restart TS Server"
```

### Problem: npm publish fails

**Symptoms:**
```
npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/@gdocal/jewtable
npm ERR! 403 You do not have permission to publish "@gdocal/jewtable"
```

**Solutions:**

**1. Not logged in:**
```bash
npm whoami  # Check if logged in
npm login   # Login if not
```

**2. Organization doesn't exist:**
- Create organization on npmjs.com
- Or remove `@gdocal/` scope:
  ```json
  {
    "name": "jewtable"
  }
  ```

**3. Package name taken:**
- Choose different name
- Add suffix: `@gdocal/jewtable-react`

**4. Wrong access level:**
```bash
npm publish --access public
```

### Problem: Styles not loading

**Symptoms:**
- Components render but have no styles

**Solution:**

**1. Import styles in demo:**
```typescript
// packages/demo/src/main.tsx
import '@gdocal/jewtable/styles.css';
```

**2. Check build output:**
```bash
ls packages/jewtable/dist/
# Should include index.css
```

**3. Check package.json exports:**
```json
{
  "exports": {
    "./styles.css": "./dist/index.css"
  }
}
```

### Problem: Build fails

**Symptoms:**
```bash
npm run build:jewtable
# Error: Cannot find module 'tsup'
```

**Solutions:**

**1. Install build dependencies:**
```bash
npm install tsup typescript --workspace=packages/jewtable --save-dev
```

**2. Check tsconfig.json:**
```bash
cat packages/jewtable/tsconfig.json
```

**3. Clear dist and rebuild:**
```bash
rm -rf packages/jewtable/dist
npm run build:jewtable
```

---

## Best Practices

### 1. Keep jewtable Pure

**Do:**
- Only component code in `packages/jewtable/`
- Generic, reusable functionality
- Well-typed TypeScript
- Comprehensive JSDoc comments

**Don't:**
- Backend-specific code
- Demo-specific code
- Hardcoded API URLs
- Environment-specific config

### 2. Use Demo for Testing

**Do:**
- Test all features in demo before publishing
- Add examples for each cell type
- Document edge cases
- Test with real backend

**Don't:**
- Publish untested code
- Skip demo testing

### 3. Semantic Versioning

Follow [semver.org](https://semver.org):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
  - Remove prop
  - Change prop type
  - Change behavior significantly

- **MINOR** (1.0.0 → 1.1.0): New features
  - Add new prop (with default)
  - Add new cell type
  - Add new export

- **PATCH** (1.0.0 → 1.0.1): Bug fixes
  - Fix sorting bug
  - Fix styling issue
  - Fix TypeScript types

### 4. Maintain CHANGELOG

**packages/jewtable/CHANGELOG.md:**
```markdown
# Changelog

## [1.1.0] - 2025-01-15

### Added
- IMAGE cell type for displaying avatars
- `onImageError` prop for handling image load failures

### Fixed
- Column resizing conflict with drag-drop
- Header checkbox click area

## [1.0.0] - 2025-01-10

Initial release
```

### 5. Test Locally Before Publishing

```bash
# 1. Build
npm run build:jewtable

# 2. Check dist size
du -sh packages/jewtable/dist/

# 3. Test imports
npm run dev

# 4. Run tests
npm run test

# 5. Publish
npm run publish:npm
```

### 6. Git Workflow

```bash
# 1. Create feature branch
git checkout -b feat/image-cell-type

# 2. Make changes in packages/jewtable/
# 3. Test in packages/demo/

# 4. Commit
git add packages/jewtable/
git commit -m "feat: Add IMAGE cell type"

# 5. Push
git push origin feat/image-cell-type

# 6. Create PR on GitHub
# 7. Merge to main
# 8. Publish from main branch
```

---

## Comparison: Before vs After

### Before (Without Monorepo)

```bash
# Edit component
vim src/components/DataTable.tsx

# Copy to NPM package directory
cp -r src/ ../jewtable-npm/src/

# Test in demo
npm run dev

# Commit demo changes
git add src/
git commit -m "feat: Add feature"
git push

# Switch to NPM package repo
cd ../jewtable-npm

# Commit NPM package
git add src/
git commit -m "feat: Add feature"
git push

# Build and publish
npm run build
npm publish

# Switch back to demo
cd ../JewTable
```

**Problems:**
- 8 manual steps
- Easy to forget copying
- Two repositories to manage
- Risk of version drift

### After (With Monorepo)

```bash
# Edit component
vim packages/jewtable/src/components/DataTable.tsx

# Test in demo (changes visible immediately)
npm run dev

# Commit everything
git add packages/jewtable/
git commit -m "feat: Add feature"
git push

# Publish to NPM
npm run publish:npm
```

**Benefits:**
- 4 steps (50% reduction)
- No manual copying
- One repository
- Always in sync
- Professional workflow

---

## Summary

### Key Takeaways

1. **Single Source of Truth**
   - Component code lives in `packages/jewtable/`
   - Demo uses it via npm workspace symlinks
   - No duplication

2. **Automatic Linking**
   - `npm install` creates symlinks
   - Changes immediately visible
   - No manual syncing

3. **Easy Publishing**
   - One command: `npm run publish:npm`
   - Builds automatically
   - Version management built-in

4. **Professional Workflow**
   - Industry standard approach
   - Used by React, Vue, Angular, TanStack
   - Scales to any number of packages

### Your Workflow

```bash
# Daily development:
1. Edit packages/jewtable/src/**/*.tsx
2. Test in demo (auto-reloads)
3. git commit && git push

# When ready to release:
4. npm version patch
5. npm run publish:npm
6. git push --tags
```

**That's it! Simple, professional, maintainable.**

---

## Next Steps

1. Read [Migration Guide](./MONOREPO_MIGRATION.md) for step-by-step restructuring
2. Review [Publishing Checklist](./PUBLISHING_CHECKLIST.md)
3. Check [Troubleshooting](./TROUBLESHOOTING.md) for common issues

---

**Questions?**

- GitHub Issues: https://github.com/Gdocal/JewTable/issues
- Documentation: https://github.com/Gdocal/JewTable/blob/main/docs/README.md
