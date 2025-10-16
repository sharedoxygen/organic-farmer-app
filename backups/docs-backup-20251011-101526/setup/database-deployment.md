# OFMS Database & Deployment

**Operations guide for database management, deployment procedures, and environment configuration.**

*Consolidates: DATABASE_GUIDE.md + deployment sections + environment management*

---

## 🗄️ **Database Operations**

### **🚨 CRITICAL SAFETY PROTOCOLS**

#### **Database Protection Rules**

1. **NEVER run without explicit permission:**
```bash
npx prisma migrate reset
npx prisma db push --force-reset
DROP DATABASE
TRUNCATE TABLE
DELETE FROM [table] WHERE [affects multiple records]
```

2. **ALWAYS create backups before:**
```bash
# Before any destructive operation
npm run db:backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

3. **ALWAYS verify multi-tenant isolation:**
```sql
-- Verify farm_id exists in ALL user data tables
SELECT table_name 
FROM information_schema.columns 
WHERE column_name = 'farm_id' 
AND table_schema = 'public';
```

### **Database Schema Management**

#### **Prisma Schema Best Practices**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Core multi-tenant structure
model Farms {
  id             String @id @default(uuid())
  name           String
  subscription   String @default("active")
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt
  
  // Relationships with cascade rules
  farm_users     FarmUsers[]
  batches        Batches[]
  environments   Environments[]
  
  @@map("farms")
}

model FarmUsers {
  id         String  @id @default(uuid())
  farm_id    String
  user_id    String
  role       String
  is_active  Boolean @default(true)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  // Foreign key constraints
  farm       Farms @relation(fields: [farm_id], references: [id], onDelete: Cascade)
  user       Users @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@unique([farm_id, user_id])
  @@map("farm_users")
}

model Users {
  id            String @id @default(uuid())
  email         String @unique
  name          String
  password_hash String
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  
  // Multi-tenant relationships
  farm_users    FarmUsers[]
  
  @@map("users")
}

model Batches {
  id           String   @id @default(uuid())
  farm_id      String   // ✅ CRITICAL: All user data must be farm-scoped
  crop_id      String
  quantity     Int
  status       String
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
  
  // Farm isolation constraint
  farm         Farms @relation(fields: [farm_id], references: [id], onDelete: Cascade)
  
  @@map("batches")
}

model Environments {
  id              String @id @default(uuid())
  farm_id         String // ✅ CRITICAL: Farm isolation
  name            String
  temperature_min Float
  temperature_max Float
  humidity_min    Float
  humidity_max    Float
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  
  farm            Farms @relation(fields: [farm_id], references: [id], onDelete: Cascade)
  
  @@unique([farm_id, name]) // Unique per farm
  @@map("environments")
}
```

#### **Migration Management**

```bash
# Development migrations
npx prisma migrate dev --name "add_environments_table"

# Production migrations
npx prisma migrate deploy

# Reset (DANGEROUS - ask permission)
npx prisma migrate reset

# Generate client after schema changes
npx prisma generate
```

### **Database Integrity Monitoring**

#### **Health Check Scripts**

```typescript
// scripts/db-health-check.ts
import { prisma } from '../src/lib/db';

async function runHealthCheck() {
  console.log('🔍 OFMS Database Health Check');
  console.log('==============================');
  
  try {
    // 1. Basic connectivity
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connectivity: OK');
    
    // 2. Check critical tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log(`✅ Tables found: ${tables.length}`);
    
    // 3. Verify multi-tenant isolation
    const farmScopedTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.columns 
      WHERE column_name = 'farm_id' 
      AND table_schema = 'public'
    `;
    console.log(`✅ Farm-scoped tables: ${farmScopedTables.length}`);
    
    // 4. Check referential integrity
    const orphanedRecords = await checkOrphanedRecords();
    if (orphanedRecords.length === 0) {
      console.log('✅ Referential integrity: OK');
    } else {
      console.log(`⚠️  Orphaned records found: ${orphanedRecords.length}`);
    }
    
    // 5. Data consistency checks
    const inconsistencies = await checkDataConsistency();
    if (inconsistencies.length === 0) {
      console.log('✅ Data consistency: OK');
    } else {
      console.log(`⚠️  Data inconsistencies: ${inconsistencies.length}`);
    }
    
    console.log('\n🎯 Database health check completed');
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function checkOrphanedRecords() {
  const orphaned = [];
  
  // Check batches without valid farms
  const orphanedBatches = await prisma.$queryRaw`
    SELECT id FROM batches b 
    WHERE NOT EXISTS (SELECT 1 FROM farms f WHERE f.id = b.farm_id)
  `;
  
  if (orphanedBatches.length > 0) {
    orphaned.push({ table: 'batches', count: orphanedBatches.length });
  }
  
  // Check environments without valid farms
  const orphanedEnvironments = await prisma.$queryRaw`
    SELECT id FROM environments e 
    WHERE NOT EXISTS (SELECT 1 FROM farms f WHERE f.id = e.farm_id)
  `;
  
  if (orphanedEnvironments.length > 0) {
    orphaned.push({ table: 'environments', count: orphanedEnvironments.length });
  }
  
  return orphaned;
}

async function checkDataConsistency() {
  const issues = [];
  
  // Check for duplicate farm-user associations
  const duplicateFarmUsers = await prisma.$queryRaw`
    SELECT farm_id, user_id, COUNT(*) as count
    FROM farm_users 
    GROUP BY farm_id, user_id 
    HAVING COUNT(*) > 1
  `;
  
  if (duplicateFarmUsers.length > 0) {
    issues.push({ issue: 'duplicate_farm_users', count: duplicateFarmUsers.length });
  }
  
  return issues;
}

if (require.main === module) {
  runHealthCheck();
}
```

#### **Backup Procedures**

```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="ofms_backup_${TIMESTAMP}.sql"

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

echo "🔄 Creating database backup..."

# Create backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

echo "✅ Backup created: $BACKUP_DIR/${BACKUP_FILE}.gz"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "🧹 Old backups cleaned up"
```

---

## 🚀 **Deployment Procedures**

### **Environment Configuration**

#### **Environment Variables**

```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/ofms_prod
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://yourdomain.com

# Feature flags
ENABLE_AI_FEATURES=true
ENABLE_CANNABIS_MODULE=true

# External services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info
```

#### **Multi-Environment Setup**

```typescript
// lib/config/environment.ts
const environments = {
  development: {
    port: 3005,
    database: process.env.DATABASE_URL,
    debug: true,
    logLevel: 'debug'
  },
  test: {
    port: 7035,
    database: process.env.TEST_DATABASE_URL,
    debug: false,
    logLevel: 'error'
  },
  staging: {
    port: 3007,
    database: process.env.STAGING_DATABASE_URL,
    debug: false,
    logLevel: 'warn'
  },
  production: {
    port: 3005,
    database: process.env.DATABASE_URL,
    debug: false,
    logLevel: 'info'
  }
};

export function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  return environments[env as keyof typeof environments];
}
```

### **Docker Deployment**

#### **Production Dockerfile**

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma/ ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3005

ENV NODE_ENV=production

CMD ["npm", "start"]
```

#### **Docker Compose for Production**

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3005:3005"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/ofms
    depends_on:
      - db
    restart: unless-stopped
    volumes:
      - ./backups:/app/backups

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=ofms
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    ports:
      - "5432:5432"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### **CI/CD Pipeline**

#### **GitHub Actions Workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: ofms_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup test database
        run: |
          npx prisma migrate deploy
          npx prisma generate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ofms_test
      
      - name: Run tests
        run: |
          npm run lint
          npm run type-check
          npm run test:coverage
          npm run build
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ofms_test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/ofms
            git pull origin main
            npm ci --only=production
            npx prisma migrate deploy
            npx prisma generate
            npm run build
            pm2 restart ofms
```

---

## 🛠️ **Environment Management**

### **Local Development Setup**

```bash
# Development setup script
#!/bin/bash

echo "🚀 Setting up OFMS development environment"

# Check dependencies
command -v node >/dev/null 2>&1 || { echo "Node.js required"; exit 1; }
command -v pg_ctl >/dev/null 2>&1 || { echo "PostgreSQL required"; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database
echo "🗄️ Setting up database..."
createdb ofms_dev 2>/dev/null || echo "Database already exists"

# Copy environment file
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "📝 Created .env.local - please update with your settings"
fi

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev

# Generate Prisma client
echo "⚙️ Generating Prisma client..."
npx prisma generate

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Development environment ready!"
echo "🚀 Start development server: npm run dev"
```

### **Production Environment**

#### **Server Configuration**

```bash
# Production server setup
#!/bin/bash

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install PM2 for process management
npm install -g pm2

# Setup application user
useradd -m -s /bin/bash ofms
usermod -aG sudo ofms

# Setup application directory
mkdir -p /var/www/ofms
chown ofms:ofms /var/www/ofms

# Configure PostgreSQL
sudo -u postgres psql -c "CREATE USER ofms WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "CREATE DATABASE ofms OWNER ofms;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ofms TO ofms;"

# Setup Nginx
apt install -y nginx
systemctl enable nginx
systemctl start nginx

echo "✅ Production server configured"
```

#### **PM2 Process Configuration**

```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ofms',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/ofms',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3005
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3005
    },
    error_file: '/var/log/pm2/ofms-error.log',
    out_file: '/var/log/pm2/ofms-out.log',
    log_file: '/var/log/pm2/ofms.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=4096'
  }]
};
```

---

## 📊 **Monitoring & Health Checks**

### **Application Health Endpoint**

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Database connectivity check
    await prisma.$queryRaw`SELECT 1`;
    
    // Check critical services
    const checks = {
      database: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || 'unknown'
    };
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      checks
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
```

### **Database Monitoring**

```sql
-- Database performance queries
-- Check connection count
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';

-- Check database size
SELECT 
  pg_database.datname as database_name,
  pg_size_pretty(pg_database_size(pg_database.datname)) as size
FROM pg_database
WHERE datname = 'ofms';

-- Check slow queries
SELECT 
  query,
  mean_time,
  calls,
  total_time
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;
```

---

## 🚨 **Troubleshooting Guide**

### **Common Database Issues**

#### **Migration Failures**

```bash
# Check migration status
npx prisma migrate status

# Reset to last working state (DANGEROUS)
npx prisma migrate reset

# Fix migration conflicts
npx prisma migrate resolve --applied "migration_name"

# Manual migration rollback
npx prisma migrate resolve --rolled-back "migration_name"
```

#### **Connection Issues**

```typescript
// Database connection debugging
import { prisma } from '@/lib/db';

async function debugConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT version(), current_database(), current_user`;
    console.log('Database info:', result);
    
    const connectionCount = await prisma.$queryRaw`
      SELECT count(*) as connections 
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `;
    console.log('Active connections:', connectionCount);
    
  } catch (error) {
    console.error('Connection error:', error);
  }
}
```

### **Performance Issues**

#### **Query Optimization**

```typescript
// Add query logging
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});

// Optimize common queries
const optimizedQuery = await prisma.batches.findMany({
  where: { farm_id: farmId },
  select: {
    id: true,
    crop_id: true,
    quantity: true,
    status: true
  },
  orderBy: { created_at: 'desc' },
  take: 50
});
```

---

## 📋 **Operations Checklist**

### **Daily Operations**
- [ ] Check application health endpoints
- [ ] Monitor database connections
- [ ] Review error logs
- [ ] Verify backup completion
- [ ] Check disk space usage

### **Weekly Operations**
- [ ] Run database integrity checks
- [ ] Review performance metrics
- [ ] Update dependencies (security patches)
- [ ] Clean up old log files
- [ ] Test backup restoration

### **Monthly Operations**
- [ ] Full database backup verification
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Disaster recovery testing
- [ ] Documentation updates

---

**This database and deployment guide ensures reliable, secure, and maintainable operations for OFMS in all environments.**

**Focus**: Database safety, multi-tenant integrity, production deployment, monitoring  
**Coverage**: Complete operations lifecycle from development to production  
**Status**: Active Operations Guide (January 2025) 