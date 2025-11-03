# JewTable Backend API

Production-ready REST API backend for JewTable component with advanced filtering, sorting, and pagination.

## 🎯 Features

✅ **Advanced Filtering** - ALL operators that json-server doesn't support:
- Text: `contains`, `startsWith`, `endsWith`, `notContains`, `regex` (case-sensitive/insensitive)
- Number: `gt`, `gte`, `lt`, `lte`, `between`, `notEquals`, `in`, `notIn`
- Date: `before`, `after`, `between`, `today`, `thisWeek`
- Boolean: `isTrue`, `isFalse`
- Null: `isEmpty`, `isNotEmpty`

✅ **Server-side Sorting** - Multiple columns, asc/desc
✅ **Pagination** - Traditional + cursor-based
✅ **Authentication** - JWT with refresh tokens
✅ **Multi-tenancy** - Organization-based data isolation
✅ **Optimistic Locking** - Version-based conflict detection
✅ **Audit Logging** - Complete change history
✅ **Type Safety** - Full TypeScript support

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 9+
- PostgreSQL 15+
- Redis (optional, for caching)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

Create PostgreSQL database:

```bash
createdb jewtable
```

Configure environment:

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Run Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Seed Database (Optional)

Create `prisma/seed.ts` for test data (see example below).

### 5. Start Server

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

Server will run on `http://localhost:3001`

## 📖 API Documentation

### Authentication

#### POST `/api/auth/login`
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900,
    "user": { "id": "...", "name": "...", "email": "..." }
  }
}
```

### Table Data Endpoints

All endpoints require `Authorization: Bearer <token>` header.

#### GET `/api/tables/employees/data`

**Query Parameters:**
- `page` (number) - Page number, default 1
- `pageSize` (number) - Items per page, default 100, max 1000
- `filters` (JSON string) - Complex filter structure
- `sorting` (JSON array) - Sort configuration
- `search` (string) - Global text search

**Filter Structure:**
```json
{
  "filters": [
    {
      "columnId": "salary",
      "operator": "between",
      "enabled": true,
      "value": 50000,
      "valueTo": 100000
    },
    {
      "columnId": "name",
      "operator": "contains",
      "enabled": true,
      "value": "John",
      "caseSensitive": false
    }
  ],
  "logicOperator": "AND",
  "globalSearch": "engineer"
}
```

**Sorting Structure:**
```json
[
  { "id": "name", "desc": false },
  { "id": "salary", "desc": true }
]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [ /* employee objects */ ],
    "totalCount": 5000,
    "page": 1,
    "pageSize": 100,
    "totalPages": 50,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### POST `/api/tables/employees/rows`

Create new employee:

```json
Request:
{
  "data": {
    "name": "John Doe",
    "position": "Engineer",
    "departmentId": "uuid",
    "salary": 75000,
    "startDate": "2024-01-15",
    "active": true
  }
}

Response:
{
  "success": true,
  "data": { /* created employee with id, version, timestamps */ }
}
```

#### PUT `/api/tables/employees/rows/:id`

Update employee with optimistic locking:

```json
Request:
{
  "data": {
    "salary": 80000,
    "position": "Senior Engineer"
  },
  "version": 1
}

Response (success):
{
  "success": true,
  "data": { /* updated employee with version incremented */ }
}

Response (conflict):
{
  "success": false,
  "error": {
    "message": "Version conflict. Record was modified by another user."
  }
}
```

#### DELETE `/api/tables/employees/rows/:id`

```json
Response:
{
  "success": true
}
```

## 🔧 Advanced Features

### All Supported Filter Operators

**Text Filters:**
- `contains` - Case-insensitive substring match
- `equals` - Exact match
- `startsWith` - Prefix match
- `endsWith` - Suffix match
- `notContains` - Negative substring match
- `regex` - Regular expression (limited support)

**Number Filters:**
- `eq` - Equals
- `ne` - Not equals
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal
- `between` - Range (inclusive)
- `in` - Value in list
- `notIn` - Value not in list

**Date Filters:**
- `before` - Before date (exclusive)
- `after` - After date (exclusive)
- `onOrBefore` - On or before date
- `onOrAfter` - On or after date
- `dateEquals` - Same date (ignores time)
- `dateBetween` - Date range

**Boolean Filters:**
- `isTrue` - Value is true
- `isFalse` - Value is false

**Null Filters:**
- `isEmpty` - Value is null
- `isNotEmpty` - Value is not null

### Multi-Tenancy

All data is automatically filtered by `organizationId` from the JWT token. Users can only access their organization's data.

### Optimistic Locking

Every record has a `version` field that increments on each update. When updating, pass the current version:

```typescript
// Frontend
const handleUpdate = async () => {
  const response = await api.put(`/api/tables/employees/rows/${id}`, {
    data: { salary: 85000 },
    version: currentRow.version, // Include current version
  });

  if (!response.success) {
    // Handle conflict - show user that data changed
    alert('Data was modified by another user. Refreshing...');
    refreshData();
  }
};
```

## 🏗️ Architecture

```
src/
├── config/           # Configuration (env, database)
├── controllers/      # Request handlers
├── services/         # Business logic
├── middleware/       # Auth, validation, errors
├── utils/            # Query builder, helpers
├── types/            # TypeScript definitions
└── app.ts            # Express app setup

prisma/
├── schema.prisma     # Database schema
└── migrations/       # Database migrations
```

### Query Builder

The `QueryBuilder` class (`src/utils/queryBuilder.ts`) translates frontend filter structures into Prisma WHERE clauses, supporting ALL filter operators.

**Example:**
```typescript
const filters: FilterState = {
  filters: [
    { columnId: 'salary', operator: 'between', value: 50000, valueTo: 100000, enabled: true },
    { columnId: 'name', operator: 'contains', value: 'John', enabled: true },
  ],
  logicOperator: 'AND',
};

const where = QueryBuilder.buildWhereClause(filters, ['name', 'position']);
// Generates Prisma WHERE with proper type safety and SQL injection protection
```

## 🔒 Security

- ✅ JWT authentication with secure secret keys
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention (Prisma parameterized queries)
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation with Zod
- ✅ Multi-tenancy data isolation

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 📦 Deployment

### Using Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "start"]
```

### Using PM2

```bash
npm install -g pm2
npm run build
pm2 start dist/app.js --name jewtable-api
```

### Environment Variables

Required for production:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<generate-secure-32-char-secret>
JWT_REFRESH_SECRET=<generate-secure-32-char-secret>
CORS_ORIGIN=https://yourdomain.com
```

## 🔄 Migration from json-server

1. Keep json-server running
2. Deploy new backend
3. Test endpoints match behavior
4. Update frontend API URL
5. Deprecate json-server

**Frontend changes needed:**
```typescript
// OLD: json-server
const data = await fetch(`http://localhost:3001/employees?salary_gte=50000`);

// NEW: JewTable Backend
const data = await fetch(`http://localhost:3001/api/tables/employees/data`, {
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    filters: {
      filters: [
        { columnId: 'salary', operator: 'gte', value: 50000, enabled: true }
      ],
      logicOperator: 'AND'
    }
  })
});
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 🤝 Contributing

This backend is designed to work seamlessly with the JewTable frontend component. For frontend integration, see `/README.md`.

## 📄 License

MIT
