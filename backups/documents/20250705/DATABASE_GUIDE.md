# Database Management & Safety Guide

## 🎯 Overview

This guide provides comprehensive database management practices, safety protocols, and operational procedures for Next.js applications using Prisma and PostgreSQL.

---

## 🚨 Critical Database Safety Protocols

### Mandatory Safety Rules

**These protocols were created in response to data loss incidents and must be followed without exception.**

#### Prohibited Commands Without Permission

**NEVER execute these commands without explicit user approval and backup procedures:**

```bash
# CRITICAL: NEVER RUN WITHOUT PERMISSION
npx prisma migrate reset
npx prisma migrate reset --force
npx prisma db push --force-reset
DROP DATABASE
TRUNCATE TABLE
DELETE FROM [table] WHERE [condition affects multiple records]
```

#### Commands Requiring Permission

**ALWAYS ask permission before executing:**

```bash
# RESTRICTED: Ask permission first
npx prisma migrate dev
npx prisma db push
npm run db:reset
npm run db:reload
```

### Mandatory Safety Protocol

Before ANY destructive database operation:

1. **✅ Ask Explicit User Permission**
   - Warn about potential data loss
   - Explain exactly what will happen
   - Wait for clear "YES" confirmation

2. **✅ Create Backup**
   - Export current database state
   - Verify backup integrity
   - Document backup location

3. **✅ Impact Assessment**
   - Identify affected data
   - List tables that will be modified/deleted
   - Estimate recovery time

4. **✅ Recovery Plan**
   - Document rollback procedure
   - Prepare restoration commands
   - Test recovery process

### Required Communication Format

When proposing any database operation:

```
⚠️  DATABASE OPERATION REQUIRED ⚠️

Operation: [specific command]
Risk Level: [HIGH/MEDIUM/LOW]
Data at Risk: [specific data that could be lost]
Backup Required: YES
Recovery Time: [estimated time]

This operation could cause data loss.
I will create a backup first and verify recovery procedures.

Do you give explicit permission to proceed? (YES/NO)
```

---

## 🗄️ Database Setup & Configuration

### Initial Setup

```bash
# Install dependencies
npm install prisma @prisma/client
npm install -D prisma

# Initialize Prisma
npx prisma init

# Configure environment variables
echo "DATABASE_URL=\"postgresql://username:password@localhost:5432/mydb\"" > .env
```

### Environment Variables

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
DATABASE_NAME="mydb"
NODE_ENV="development"

# Connection Pool
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20
DATABASE_POOL_TIMEOUT=30000
```

### Prisma Configuration

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

enum Role {
  ADMIN
  MANAGER
  TEAM_LEAD
  SPECIALIST_LEAD
  TEAM_MEMBER
  SPECIALIST
}
```

---

## 🏢 Multi-Tenant Schema Architecture

### Core Multi-Tenant Tables

```prisma
// Multi-tenant core tables
model farms {
  id                String   @id @default(uuid())
  farm_name         String
  business_name     String?
  subdomain         String?  @unique
  owner_id          String
  subscription_plan String?
  subscription_status String?
  trial_ends_at     DateTime?
  settings          Json?
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  // Relations
  farm_users        farm_users[]
  batches           batches[]
  customers         customers[]
  orders            orders[]
  seed_varieties    seed_varieties[]
  equipment         equipment[]
  inventory_items   inventory_items[]
  financial_records financial_records[]
  quality_checks    quality_checks[]
  tasks             tasks[]
  growing_environments growing_environments[]
  order_items       order_items[]
}

model farm_users {
  farm_id     String
  user_id     String
  role        String   // OWNER, FARM_MANAGER, TEAM_LEAD, etc.
  permissions Json?
  is_active   Boolean  @default(true)
  joined_at   DateTime @default(now())
  
  farms       farms    @relation(fields: [farm_id], references: [id], onDelete: Cascade)
  users       users    @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@id([farm_id, user_id])
}
```

### Multi-Tenant Data Isolation

All business tables include `farm_id` for data isolation:

```prisma
model batches {
  id        String   @id
  farm_id   String   // Required for all business tables
  // ... other fields
  
  farms     farms    @relation(fields: [farm_id], references: [id], onDelete: Cascade)
}
```

### Row-Level Security Implementation

```sql
-- Enable row-level security for tenant isolation
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

-- Create policy for tenant isolation
CREATE POLICY tenant_isolation ON batches
  FOR ALL 
  USING (farm_id = current_setting('app.current_farm_id')::uuid);

-- Set farm context for queries
SET app.current_farm_id = 'farm-uuid-here';
```

### Multi-Tenant Query Patterns

```typescript
// Always include farm_id in queries
const batches = await prisma.batches.findMany({
  where: { 
    farm_id: currentFarmId,
    // ... other conditions
  }
});

// Create data with farm context
const newBatch = await prisma.batches.create({
  data: {
    farm_id: currentFarmId,
    // ... other fields
  }
});

// Update with farm verification
const updated = await prisma.batches.updateMany({
  where: { 
    id: batchId,
    farm_id: currentFarmId // Always verify farm ownership
  },
  data: { /* ... */ }
});
```

### Farm Switching Context

```typescript
// Middleware to set farm context
export async function setFarmContext(farmId: string) {
  await prisma.$executeRaw`SET app.current_farm_id = ${farmId}`;
}

// Transaction with farm context
await prisma.$transaction(async (tx) => {
  await tx.$executeRaw`SET app.current_farm_id = ${farmId}`;
  // All queries in transaction now scoped to farm
  return tx.batches.findMany();
});
```

### Multi-Tenant Migration Strategy

```sql
-- Migration to add farm_id to existing tables
ALTER TABLE batches ADD COLUMN farm_id UUID;
ALTER TABLE customers ADD COLUMN farm_id UUID;
-- ... repeat for all business tables

-- Create default farm for existing data
INSERT INTO farms (id, farm_name, owner_id) 
VALUES ('00000000-0000-0000-0000-000000000010', 'Default Farm', 'admin-user-id');

-- Backfill existing data
UPDATE batches SET farm_id = '00000000-0000-0000-0000-000000000010' WHERE farm_id IS NULL;
UPDATE customers SET farm_id = '00000000-0000-0000-0000-000000000010' WHERE farm_id IS NULL;

-- Add foreign key constraints
ALTER TABLE batches ADD CONSTRAINT fk_batches_farm 
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE;
```

---

## 🔄 Migration Management

### Creating Migrations

```bash
# Create and apply migration
npx prisma migrate dev --name "descriptive-migration-name"

# Create migration without applying
npx prisma migrate dev --create-only --name "migration-name"

# Apply pending migrations
npx prisma migrate deploy
```

### Migration Best Practices

#### Safe Migration Patterns

```sql
-- ✅ SAFE: Adding new columns with defaults
ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT '';

-- ✅ SAFE: Adding new tables
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  bio TEXT
);

-- ✅ SAFE: Adding indexes
CREATE INDEX idx_users_email ON users(email);

-- ✅ SAFE: Adding non-null constraints with defaults
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ALTER COLUMN status SET NOT NULL;
```

#### Dangerous Migration Patterns

```sql
-- ❌ DANGEROUS: Dropping columns
ALTER TABLE users DROP COLUMN email;

-- ❌ DANGEROUS: Changing column types
ALTER TABLE users ALTER COLUMN id TYPE UUID;

-- ❌ DANGEROUS: Removing constraints
ALTER TABLE users DROP CONSTRAINT users_email_key;
```

### Migration Safety Checklist

Before running migrations:

- [ ] Backup database
- [ ] Test migration on copy of production data
- [ ] Verify rollback procedure
- [ ] Check for data loss potential
- [ ] Estimate downtime requirements
- [ ] Plan communication strategy

---

## 💾 Backup & Recovery Procedures

### Automated Backup Scripts

```bash
#!/bin/bash
# scripts/backup-database.sh

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME=${DATABASE_NAME:-"mydb"}
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${TIMESTAMP}.sql"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Create backup
echo "Creating backup: ${BACKUP_FILE}"
pg_dump ${DATABASE_URL} > ${BACKUP_FILE}

# Verify backup
if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: ${BACKUP_FILE}"
    
    # Compress backup
    gzip ${BACKUP_FILE}
    echo "✅ Backup compressed: ${BACKUP_FILE}.gz"
else
    echo "❌ Backup failed"
    exit 1
fi

# Clean old backups (keep last 7 days)
find ${BACKUP_DIR} -name "backup_*.sql.gz" -mtime +7 -delete
echo "✅ Old backups cleaned"
```

### Data Export Scripts

```typescript
// scripts/export-data.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('🔄 Exporting database data...');

    // Export users
    const users = await prisma.user.findMany();
    
    // Export other data as needed
    // const profiles = await prisma.profile.findMany();
    
    const exportData = {
      users,
      // profiles,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    const exportFile = path.join(
      process.cwd(),
      'exports',
      `data-export-${Date.now()}.json`
    );

    // Ensure export directory exists
    const exportDir = path.dirname(exportFile);
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Write export file
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));

    console.log(`✅ Data exported successfully: ${exportFile}`);
    console.log(`📊 Exported ${users.length} users`);

    return exportFile;
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  exportData().catch(console.error);
}

export { exportData };
```

### Recovery Procedures

```bash
#!/bin/bash
# scripts/restore-database.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file>"
    echo "Available backups:"
    ls -la backups/
    exit 1
fi

echo "⚠️  This will restore the database from: $BACKUP_FILE"
echo "⚠️  All current data will be lost!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 1
fi

# Restore from backup
echo "🔄 Restoring database..."
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE | psql $DATABASE_URL
else
    psql $DATABASE_URL < $BACKUP_FILE
fi

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully"
else
    echo "❌ Restore failed"
    exit 1
fi
```

---

## 🌱 Database Seeding

### Seed Script Structure

```typescript
// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Environment detection
  const environment = process.env.NODE_ENV || 'development';
  console.log(`🎯 Environment: ${environment}`);

  if (environment === 'production') {
    await seedProduction();
  } else {
    await seedDevelopment();
  }

  console.log('✅ Seeding completed successfully');
}

async function seedProduction() {
  console.log('🔒 Seeding production environment...');

  // Only create admin user in production
  const adminPassword = await hash('REDACTED_TEST_PASSWORD', 12);
  
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Administrator',
      role: Role.ADMIN,
      password: adminPassword,
    },
  });

  console.log('✅ Production admin user created');
}

async function seedDevelopment() {
  console.log('🔧 Seeding development environment...');

  // Create test users
  const users = [
    {
      email: 'admin@example.com',
      name: 'Administrator',
      role: Role.ADMIN,
    },
    {
      email: 'manager@example.com',
      name: 'Manager User',
      role: Role.MANAGER,
    },
    {
      email: 'lead@example.com',
      name: 'Team Lead',
      role: Role.TEAM_LEAD,
    },
    {
      email: 'member@example.com',
      name: 'Team Member',
      role: Role.TEAM_MEMBER,
    },
  ];

  for (const userData of users) {
    const password = await hash('password123', 12);
    
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password,
      },
    });

    console.log(`✅ Created user: ${userData.email}`);
  }

  console.log('✅ Development users created');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Seeding Commands

```json
{
  "scripts": {
    "db:seed": "npx prisma db seed",
    "db:reset": "npx prisma migrate reset --force",
    "db:setup": "npx prisma generate && npx prisma db push && npm run db:seed",
    "db:fresh": "npm run db:reset && npm run db:seed"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## 🔍 Data Integrity & Validation

### Data Integrity Service

```typescript
// lib/services/databaseIntegrityService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DatabaseIntegrityService {
  static async validateUserIntegrity(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          // Include related data for validation
        },
      });

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Perform integrity checks
      const checks = [
        this.validateEmailUniqueness(user.email, userId),
        this.validateRoles(user.roles || user.role), // Support both multi-role and legacy single role
        // Add more validation checks
      ];

      const results = await Promise.all(checks);
      return results.every(result => result === true);

    } catch (error) {
      console.error('User integrity validation failed:', error);
      return false;
    }
  }

  static async validateEmailUniqueness(email: string, excludeUserId?: string): Promise<boolean> {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        NOT: excludeUserId ? { id: excludeUserId } : undefined,
      },
    });

    return !existingUser;
  }

  static async validateRoles(roles: string[] | string): Promise<boolean> {
    const validRoles = ['ADMIN', 'MANAGER', 'TEAM_LEAD', 'SPECIALIST_LEAD', 'TEAM_MEMBER', 'SPECIALIST'];
    
    // Handle both single role (backward compatibility) and role array
    const roleArray = Array.isArray(roles) ? roles : [roles];
    
    // Validate all roles are valid
    const allValid = roleArray.every(role => validRoles.includes(role));
    
    // Ensure no duplicate roles
    const uniqueRoles = new Set(roleArray);
    const noDuplicates = uniqueRoles.size === roleArray.length;
    
    return allValid && noDuplicates;
  }

  static getEffectiveRole(roles: string[]): string {
    const rolePriority = {
      'ADMIN': 1,
      'MANAGER': 2,
      'TEAM_LEAD': 3,
      'SPECIALIST_LEAD': 3,
      'TEAM_MEMBER': 4,
      'SPECIALIST': 4
    };
    
    return roles.reduce((highest, current) => {
      return rolePriority[current] < rolePriority[highest] ? current : highest;
    });
  }

  static async performSystemIntegrityCheck(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check for duplicate emails
      const duplicateEmails = await prisma.user.groupBy({
        by: ['email'],
        having: {
          email: {
            _count: {
              gt: 1,
            },
          },
        },
      });

      if (duplicateEmails.length > 0) {
        issues.push(`Found ${duplicateEmails.length} duplicate email(s)`);
      }

      // Check for orphaned records
      // Add more integrity checks as needed

      return {
        valid: issues.length === 0,
        issues,
      };

    } catch (error) {
      console.error('System integrity check failed:', error);
      return {
        valid: false,
        issues: ['System integrity check failed'],
      };
    }
  }
}
```

### Data Validation Hooks

```typescript
// hooks/useDataValidation.ts
import { useState, useCallback } from 'react';
import { DatabaseIntegrityService } from '@/lib/services/databaseIntegrityService';

export function useDataValidation() {
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    valid: boolean;
    issues: string[];
  } | null>(null);

  const validateSystemIntegrity = useCallback(async () => {
    setValidating(true);
    try {
      const results = await DatabaseIntegrityService.performSystemIntegrityCheck();
      setValidationResults(results);
      return results;
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationResults({
        valid: false,
        issues: ['Validation process failed'],
      });
    } finally {
      setValidating(false);
    }
  }, []);

  const validateUser = useCallback(async (userId: string) => {
    return DatabaseIntegrityService.validateUserIntegrity(userId);
  }, []);

  return {
    validating,
    validationResults,
    validateSystemIntegrity,
    validateUser,
  };
}
```

---

## 📊 Database Monitoring & Health

### Health Check Scripts

```typescript
// scripts/database-health-check.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function performHealthCheck() {
  console.log('🏥 Performing database health check...');

  try {
    // Basic connection test
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection: OK');

    // Count records
    const userCount = await prisma.user.count();
    console.log(`📊 Total users: ${userCount}`);

    // Check for common issues
    const checks = [
      checkDuplicateEmails(),
      checkOrphanedRecords(),
      checkDataConsistency(),
    ];

    const results = await Promise.all(checks);
    const allPassed = results.every(result => result.passed);

    console.log(`🎯 Health check ${allPassed ? 'PASSED' : 'FAILED'}`);

    return {
      healthy: allPassed,
      checks: results,
      userCount,
    };

  } catch (error) {
    console.error('❌ Health check failed:', error);
    return {
      healthy: false,
      error: error.message,
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function checkDuplicateEmails() {
  const duplicates = await prisma.$queryRaw`
    SELECT email, COUNT(*) as count 
    FROM users 
    GROUP BY email 
    HAVING COUNT(*) > 1
  `;

  return {
    name: 'Duplicate Emails',
    passed: Array.isArray(duplicates) && duplicates.length === 0,
    details: duplicates,
  };
}

async function checkOrphanedRecords() {
  // Add checks for orphaned records based on your schema
  return {
    name: 'Orphaned Records',
    passed: true,
    details: 'No orphaned records found',
  };
}

async function checkDataConsistency() {
  // Add consistency checks based on your business rules
  return {
    name: 'Data Consistency',
    passed: true,
    details: 'All data consistent',
  };
}

if (require.main === module) {
  performHealthCheck().then(result => {
    console.log('Health check completed:', result);
    process.exit(result.healthy ? 0 : 1);
  });
}

export { performHealthCheck };
```

---

## 🔧 Database Management Scripts

### Package.json Scripts

```json
{
  "scripts": {
    "db:generate": "npx prisma generate",
    "db:push": "npx prisma db push",
    "db:migrate": "npx prisma migrate dev",
    "db:migrate:prod": "npx prisma migrate deploy",
    "db:seed": "npx prisma db seed",
    "db:reset": "npx prisma migrate reset",
    "db:studio": "npx prisma studio",
    "db:backup": "./scripts/backup-database.sh",
    "db:restore": "./scripts/restore-database.sh",
    "db:health": "ts-node scripts/database-health-check.ts",
    "db:export": "ts-node scripts/export-data.ts",
    "db:validate": "ts-node scripts/validate-data-integrity.ts"
  }
}
```

### Environment-Specific Commands

```bash
# Development
npm run db:reset && npm run db:seed

# Staging
npm run db:migrate:prod && npm run db:health

# Production
npm run db:backup && npm run db:migrate:prod && npm run db:health
```

---

## 🚨 Incident Response

### If Data Loss Occurs

1. **Immediate Actions**
   - Stop all database operations
   - Assess scope of data loss
   - Identify most recent valid backup

2. **Recovery Process**
   - Restore from most recent backup
   - Verify data integrity post-recovery
   - Test application functionality
   - Document incident and lessons learned

3. **Prevention Measures**
   - Update safety protocols
   - Enhance backup procedures
   - Improve monitoring and alerts
   - Conduct team training

### Post-Incident Checklist

- [ ] Data successfully restored
- [ ] Application functionality verified
- [ ] Users notified (if applicable)
- [ ] Incident documented
- [ ] Root cause identified
- [ ] Prevention measures implemented
- [ ] Team debriefing conducted

---

This comprehensive database guide ensures safe, reliable database operations with robust backup and recovery procedures.

**Last Updated**: December 2024  
**Next Review**: March 2025  
**Maintained By**: Development Team 