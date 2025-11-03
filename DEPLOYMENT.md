# Deployment Guide

Quick deployment guide for production environments.

## Quick Deploy Options

### 1️⃣ Vercel + Railway (Fastest) ⚡

**Time: ~10 minutes**

**Frontend (Vercel):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Backend (Railway):**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway add --plugin postgresql
railway up
```

Set environment variables on Railway:
- JWT_SECRET
- JWT_REFRESH_SECRET
- CORS_ORIGIN=https://your-frontend.vercel.app

---

### 2️⃣ Docker (Self-Hosted) 🐳

**Time: ~5 minutes**

```bash
# Clone repository
git clone https://github.com/yourorg/jewtable.git
cd jewtable

# Create environment file
cp .env.docker .env
# Edit .env with your passwords and secrets

# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Access app at http://localhost
```

**Requirements:**
- Docker & Docker Compose installed
- 2GB RAM minimum
- PostgreSQL 15

---

### 3️⃣ Traditional VPS (DigitalOcean, AWS, etc.) 💻

**Time: ~30 minutes**

**Prerequisites:**
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL 15
sudo apt install postgresql-15

# Install PM2
sudo npm install -g pm2
```

**Backend Setup:**
```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start npm --name "jewtable-api" -- start
pm2 save
pm2 startup
```

**Frontend Setup:**
```bash
# Build frontend
npm run build

# Serve with nginx
sudo apt install nginx
sudo cp nginx.conf /etc/nginx/sites-available/jewtable
sudo ln -s /etc/nginx/sites-available/jewtable /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=https://api.yourapp.com
```

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/jewtable

# JWT
JWT_SECRET=your-secret-at-least-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-characters-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourapp.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourapp.com -d www.yourapp.com

# Auto-renewal (already setup by certbot)
sudo certbot renew --dry-run
```

---

## Database Backups

### Automated Backups

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="jewtable"

mkdir -p $BACKUP_DIR
pg_dump $DB_NAME | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup.sh") | crontab -
```

---

## Monitoring

### PM2 Monitoring (Backend)

```bash
# View logs
pm2 logs jewtable-api

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart jewtable-api
```

### Health Checks

```bash
# Backend health
curl https://api.yourapp.com/health

# Expected response:
{"status":"ok"}
```

---

## Performance Optimization

### 1. Enable Gzip Compression (nginx)

```nginx
# In /etc/nginx/nginx.conf
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
```

### 2. Database Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_employees_active ON employees(active);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_name ON employees(name);
CREATE INDEX idx_employees_created_at ON employees(created_at);

-- Analyze tables
ANALYZE employees;
ANALYZE departments;
ANALYZE statuses;
```

### 3. Connection Pooling

```typescript
// backend/src/config/database.ts
export const prisma = new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Set connection pool size
// In DATABASE_URL: ?connection_limit=20&pool_timeout=20
```

---

## Scaling

### Horizontal Scaling

**Load Balancer (nginx):**

```nginx
upstream backend {
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

### Database Read Replicas

```typescript
// For read-heavy workloads
const readReplica = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_URL, // Read replica
    },
  },
});

// Use for read operations
export async function getData(req, res) {
  const data = await readReplica.employee.findMany({...});
  res.json(data);
}
```

---

## Troubleshooting

### Backend won't start

```bash
# Check logs
pm2 logs jewtable-api

# Common issues:
# 1. Database connection - verify DATABASE_URL
# 2. Port in use - change PORT in .env
# 3. Missing dependencies - run npm install
```

### Frontend shows API errors

```bash
# Check CORS settings in backend
CORS_ORIGIN=https://your-frontend-domain.com

# Verify API URL in frontend
VITE_API_URL=https://your-backend-domain.com
```

### Database migration failed

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or apply migrations manually
npx prisma migrate deploy
```

### Performance issues

```bash
# Check database indexes
# Check slow query log
# Enable query logging in Prisma:

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

---

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured (not in code)
- [ ] Database passwords strong (20+ characters)
- [ ] JWT secrets random (32+ characters)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Database backups automated
- [ ] Firewall configured (only 80, 443, 22 open)
- [ ] PostgreSQL not exposed publicly
- [ ] PM2 running as non-root user

---

## Update/Rollback

### Update to New Version

```bash
# Backend
cd backend
git pull
npm install
npx prisma migrate deploy
pm2 restart jewtable-api

# Frontend
git pull
npm install
npm run build
# nginx will serve new build automatically
```

### Rollback

```bash
# Rollback code
git checkout <previous-commit>

# Rollback database (if needed)
npx prisma migrate resolve --rolled-back <migration-name>

# Restart
pm2 restart jewtable-api
```

---

## Cost Estimates

### Vercel + Railway (Managed)
- Vercel: Free tier (Pro $20/month for team)
- Railway: $5-20/month (usage-based)
- PostgreSQL: Included with Railway
- **Total: $5-40/month**

### VPS (Self-Hosted)
- DigitalOcean Droplet: $12-24/month (2-4GB RAM)
- Domain: $10-15/year
- SSL: Free (Let's Encrypt)
- **Total: $12-24/month**

### AWS (Enterprise)
- EC2: $20-100/month
- RDS PostgreSQL: $15-50/month
- CloudFront CDN: $10-30/month
- Load Balancer: $16/month
- **Total: $61-196/month**

---

## Next Steps

1. Choose deployment method
2. Set up environment variables
3. Deploy backend first
4. Deploy frontend with correct API URL
5. Test all features
6. Set up monitoring and backups
7. Configure domain and SSL

Need help? See [docs/README.md](./docs/README.md) or open an issue.
