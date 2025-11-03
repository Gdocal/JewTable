# Distribution Guide

How to ship JewTable to end users - multiple distribution strategies.

## Distribution Options

### Option 1: NPM Package (Recommended for Library)
### Option 2: Template Repository (Recommended for Full Stack)
### Option 3: Docker Deployment (Recommended for Self-Hosted)
### Option 4: SaaS Deployment (Recommended for Service)

---

## Option 1: NPM Package 📦

**Best for:** Developers who want to integrate JewTable into their existing React apps

### Setup

1. **Prepare Package Structure**

```bash
# Create package directory
mkdir jewtable-react
cd jewtable-react

# Copy only component files
cp -r ../src/components/DataTable ./src/
cp -r ../src/hooks ./src/
cp -r ../src/utils ./src/
cp -r ../src/api ./src/
```

2. **Create package.json**

```json
{
  "name": "@yourorg/jewtable",
  "version": "1.0.0",
  "description": "A powerful, production-ready data table component for React",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md"
  ],
  "keywords": [
    "react",
    "table",
    "datagrid",
    "tanstack-table",
    "typescript"
  ],
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-table": "^8.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-virtual": "^3.0.0"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.0.0",
    "@dnd-kit/sortable": "^7.0.0",
    "zod": "^3.22.0"
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "prepublishOnly": "npm run build"
  }
}
```

3. **Create src/index.ts (Entry Point)**

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
```

4. **Build Configuration (tsup.config.ts)**

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@tanstack/react-table',
    '@tanstack/react-query',
    '@tanstack/react-virtual',
  ],
});
```

5. **Publish to NPM**

```bash
# Login to NPM
npm login

# Publish
npm publish --access public
```

### Installation for Users

```bash
npm install @yourorg/jewtable
```

### Usage

```typescript
import { DataTable, CellType } from '@yourorg/jewtable';
import '@yourorg/jewtable/dist/index.css';

function App() {
  return (
    <DataTable
      mode="client"
      data={data}
      columns={columns}
      enableSorting
    />
  );
}
```

---

## Option 2: Template Repository 🎨

**Best for:** Developers who want the complete full-stack solution

### Setup GitHub Template

1. **Clean Up Repository**

```bash
# Remove sensitive files
rm -f .env
rm -rf node_modules backend/node_modules
rm -rf dist backend/dist

# Add .env.example files
cp .env .env.example
cd backend && cp .env .env.example && cd ..
```

2. **Update README with Quick Start**

Already done! See main README.md

3. **Mark as Template on GitHub**

```bash
# On GitHub:
# 1. Go to repository Settings
# 2. Check "Template repository"
# 3. Save
```

### Usage for Users

1. Click "Use this template" on GitHub
2. Clone their new repository
3. Follow README installation steps

```bash
git clone https://github.com/user/their-jewtable-project.git
cd their-jewtable-project

# Install dependencies
npm install
cd backend && npm install && cd ..

# Setup database
cd backend
cp .env.example .env
# Edit .env with database credentials
npx prisma migrate dev
npx prisma db seed

# Run
npm run dev
cd backend && npm run dev
```

---

## Option 3: Docker Deployment 🐳

**Best for:** Self-hosted deployments, enterprise installations

### 1. Create Dockerfiles

**Frontend Dockerfile:**

```dockerfile
# /Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production image
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Backend Dockerfile:**

```dockerfile
# /backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

**nginx.conf:**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: jewtable
      POSTGRES_USER: jewtable
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U jewtable"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://jewtable:${POSTGRES_PASSWORD}@postgres:5432/jewtable
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      NODE_ENV: production
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    command: >
      sh -c "npx prisma migrate deploy &&
             npm start"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 3. Create .env.docker

```bash
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-jwt-refresh-secret-min-32-chars
```

### 4. Deployment Commands

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Full reset
docker-compose down -v
```

### Distribution

**Option A: Docker Hub**

```bash
# Build and tag
docker build -t yourorg/jewtable-frontend:latest .
docker build -t yourorg/jewtable-backend:latest ./backend

# Push
docker push yourorg/jewtable-frontend:latest
docker push yourorg/jewtable-backend:latest
```

Users can then:

```bash
docker pull yourorg/jewtable-frontend:latest
docker pull yourorg/jewtable-backend:latest
docker-compose up -d
```

**Option B: Release as docker-compose.yml**

Users download your `docker-compose.yml` and `.env.docker` files:

```bash
curl -O https://yoursite.com/jewtable/docker-compose.yml
curl -O https://yoursite.com/jewtable/.env.docker
mv .env.docker .env
# Edit .env with secure passwords
docker-compose up -d
```

---

## Option 4: SaaS Deployment ☁️

**Best for:** Offering JewTable as a hosted service

### Architecture

```
User's Browser
      ↓
   Vercel (Frontend)
      ↓
   Railway/Render (Backend)
      ↓
   PostgreSQL (Managed)
```

### 1. Deploy Frontend to Vercel

**vercel.json:**

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend.railway.app/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Deploy:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. Deploy Backend to Railway

**railway.json:**

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Deploy:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
railway init

# Link to GitHub
railway link

# Add PostgreSQL
railway add --plugin postgresql

# Deploy
railway up
```

### 3. Environment Variables

Set on Railway dashboard:
- `DATABASE_URL` (auto-set by PostgreSQL plugin)
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN=https://your-frontend.vercel.app`
- `NODE_ENV=production`

### 4. Multi-Tenancy for SaaS

Update backend to support multiple organizations:

**User Registration Flow:**

```typescript
// POST /api/auth/register
export async function register(req: Request, res: Response) {
  const { email, password, organizationName } = req.body;

  // Create organization
  const organization = await prisma.organization.create({
    data: { name: organizationName },
  });

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      organizationId: organization.id,
      role: 'admin', // First user is admin
    },
  });

  const tokens = AuthService.generateTokens(user);
  res.json({ success: true, data: { user, tokens } });
}
```

**Pricing Tiers:**

```typescript
model Organization {
  id          String   @id @default(uuid())
  name        String
  plan        String   @default("free") // free, pro, enterprise
  maxRows     Int      @default(1000)
  maxUsers    Int      @default(5)
  createdAt   DateTime @default(now())
}
```

---

## Comparison Matrix

| Feature | NPM Package | Template | Docker | SaaS |
|---------|-------------|----------|--------|------|
| **Ease of Use** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Customization** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Maintenance** | User | User | User | You |
| **Backend Required** | Yes | Yes | Included | Included |
| **Cost to User** | Free | Free | Hosting | Subscription |
| **Best For** | Developers | Full projects | Enterprise | End users |

---

## Recommended Approach

### For Different Audiences

**1. Developers (B2D - Business to Developer)**
→ Use **NPM Package** + **Template Repository**
- Publish component to NPM for easy integration
- Provide template repository for full-stack example
- Offer paid support/consulting

**2. Small Businesses**
→ Use **Docker Deployment**
- Self-hosted on their infrastructure
- One-time purchase or yearly license
- Include deployment scripts and docs

**3. Non-Technical Users**
→ Use **SaaS Deployment**
- Fully hosted service
- Monthly subscription ($10-$100/month based on features)
- No technical knowledge required

---

## Licensing Models

### Open Source (MIT)
```markdown
- Free to use
- Can modify
- Can redistribute
- No warranty
```

### Dual License
```markdown
- MIT for open source projects
- Commercial license for proprietary projects
  - $99 one-time per developer
  - $999 unlimited team license
```

### SaaS Subscription
```markdown
Free Tier:
- 1,000 rows
- 5 users
- Community support

Pro ($29/month):
- 100,000 rows
- Unlimited users
- Priority support
- Custom branding

Enterprise ($299/month):
- Unlimited rows
- Advanced security
- SLA guarantee
- Dedicated support
```

---

## Next Steps

Choose your distribution strategy:

1. **Quick Start** → Template Repository (ready now!)
2. **Developer Library** → NPM Package (1-2 days to prepare)
3. **Self-Hosted** → Docker (1 day to prepare)
4. **SaaS Service** → Cloud deployment (3-5 days to set up)

Need help implementing any of these? Let me know!
