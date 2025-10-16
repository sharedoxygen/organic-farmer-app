# OFMS Essentials Guide

**Essential technical knowledge for Organic Farm Management System (OFMS) development without bureaucracy.**

*Updated to remove all hardcoded farm/farmer data (January 2025) - Focused on practical standards and safety.*

---

## 🏗️ **Core Architecture**

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL + Prisma ORM with strict safety protocols
- **Styling**: CSS Modules ONLY + Design System  
- **Testing**: Jest + Playwright + MSW
- **Multi-tenant**: Farm-isolated data with role-based access
- **Authentication**: Database-driven with bcrypt hashing

---

## 🚨 **CRITICAL SAFETY PROTOCOLS**

### **🔴 NEVER RUN WITHOUT PERMISSION**

```bash
# DESTRUCTIVE - ASK PERMISSION FIRST
npx prisma migrate reset
npx prisma db push --force-reset
npm run db:reset
DROP DATABASE
TRUNCATE TABLE
DELETE FROM [table] WHERE [affects multiple records]
```

### **🟡 ASK PERMISSION BEFORE RUNNING**

```bash
# POTENTIALLY DESTRUCTIVE
npx prisma migrate dev
npx prisma db push
npm run db:migrate
```

### **📢 REQUIRED COMMUNICATION FOR DATABASE OPERATIONS**

When database operations are needed:

```
⚠️  DATABASE OPERATION REQUIRED ⚠️

Operation: [specific command]
Risk Level: [HIGH/MEDIUM/LOW]
Data at Risk: [what could be lost]
Backup Required: YES

Do you give explicit permission to proceed? (YES/NO)
```

### **🤔 PERMISSION DECISION TREE**

```
Need to run a database command?
├─ Does it modify schema? → ASK PERMISSION
├─ Does it delete data? → ASK PERMISSION
├─ Does it reset/drop anything? → ASK PERMISSION
├─ Is it a migration? → ASK PERMISSION
└─ Is it read-only? → Safe to proceed
```

---

## 🔐 **MULTI-TENANT FARM ISOLATION** 

### **CRITICAL: All operations MUST respect farm boundaries**

```typescript
// ❌ NEVER: Unscoped queries
const batches = await prisma.batches.findMany();

// ✅ ALWAYS: Farm-scoped queries
const batches = await prisma.batches.findMany({
  where: { farm_id: currentFarmId }
});

// ✅ ALWAYS: Include farm context in API calls
headers: {
  'X-Farm-ID': currentFarmId,
  'Content-Type': 'application/json'
}

// ✅ ALWAYS: Verify farm access before operations
const farmUser = await prisma.farm_users.findFirst({
  where: { 
    user_id: session.user.id,
    farm_id: requestedFarmId,
    is_active: true
  }
});

if (!farmUser) {
  throw new Error('Access denied to this farm');
}
```

### **⚠️ COMMON MULTI-TENANT PITFALLS**

```typescript
// ❌ PITFALL 1: Forgetting farm scope in nested queries
const batch = await prisma.batches.findFirst({
  where: { id: batchId },
  include: { 
    zones: true  // ❌ This might include zones from other farms!
  }
});

// ✅ CORRECT: Always scope nested queries
const batch = await prisma.batches.findFirst({
  where: { 
    id: batchId,
    farm_id: currentFarmId  // ✅ Scope the main query
  },
  include: { 
    zones: {
      where: { farm_id: currentFarmId }  // ✅ Scope nested query too
    }
  }
});

// ❌ PITFALL 2: Using counts without farm scope
const totalBatches = await prisma.batches.count();  // ❌ Counts ALL farms!

// ✅ CORRECT: Scoped counts
const totalBatches = await prisma.batches.count({
  where: { farm_id: currentFarmId }
});

// ❌ PITFALL 3: Aggregate functions without scope
const stats = await prisma.batches.aggregate({
  _sum: { quantity: true }  // ❌ Sums across ALL farms!
});

// ✅ CORRECT: Scoped aggregates
const stats = await prisma.batches.aggregate({
  where: { farm_id: currentFarmId },
  _sum: { quantity: true }
});

// ❌ PITFALL 4: Creating records without farm assignment
const newBatch = await prisma.batches.create({
  data: {
    crop_id: cropId,
    quantity: 100
    // ❌ Missing farm_id!
  }
});

// ✅ CORRECT: Always include farm_id
const newBatch = await prisma.batches.create({
  data: {
    crop_id: cropId,
    quantity: 100,
    farm_id: currentFarmId  // ✅ Essential!
  }
});
```

### **🔄 FARM SWITCHING IMPLEMENTATION**

```typescript
// ✅ CORRECT: Farm switching pattern
async function switchFarm(newFarmId: string) {
  // 1. Verify access
  const hasAccess = await prisma.farm_users.findFirst({
    where: {
      user_id: session.user.id,
      farm_id: newFarmId,
      is_active: true
    }
  });
  
  if (!hasAccess) {
    throw new Error('Access denied to this farm');
  }

  // 2. Clear current farm state
  clearFarmCache();
  cancelPendingRequests();
  
  // 3. Update context
  setCurrentFarmId(newFarmId);
  updateAPIServiceHeaders({ 'X-Farm-ID': newFarmId });
  
  // 4. Refresh all data
  await Promise.all([
    refreshDashboardData(),
    refreshNavigationPermissions(),
    refreshUserPreferences()
  ]);
  
  // 5. Emit event for components
  dataRefreshEmitter.emit(DATA_EVENTS.FARM_SWITCHED, newFarmId);
}
```

### **Role Hierarchy at Farm Level**
```
OWNER > FARM_MANAGER > TEAM_LEAD > SPECIALIST_LEAD > TEAM_MEMBER > SPECIALIST
```

---

## 🚫 **NO HARDCODED FARM/FARMER DATA**

### **🚨 CRITICAL: Zero tolerance for hardcoded farm data**

```typescript
// ❌ NEVER: Hardcoded farm names or IDs
const DEFAULT_FARM = 'Curry Island Microgreens';
const FALLBACK_FARM_ID = '00000000-0000-0000-0000-000000000010';
const demoUsers = [
  { email: 'kinkead@specificfarm.com', name: 'Christian Kinkead' }
];

// ❌ NEVER: Farm-specific email domains
if (!email.endsWith('@curryislandmicrogreens.com')) {
  throw new Error('Invalid domain');
}

// ❌ NEVER: Hardcoded farm references in code
if (farmName === 'Shared Oxygen Farms') {
  // Special logic for specific farm
}

// ✅ ALWAYS: Dynamic, database-driven approach
const farms = await prisma.farms.findMany({
  where: { subscription_status: 'active' }
});

// ✅ ALWAYS: Generic validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error('Invalid email format');
}

// ✅ ALWAYS: Generic business logic
if (farm.subscription_status === 'inactive') {
  // Handle inactive farms generically
}
```

### **🔄 Dynamic Farm Creation**

```typescript
// ✅ CORRECT: Generic farm setup
async function createFarm(farmData: {
  name: string;
  businessName: string;
  ownerId: string;
  settings?: any;
}) {
  const farm = await prisma.farms.create({
    data: {
      id: uuidv4(),
      farm_name: farmData.name,
      business_name: farmData.businessName,
      owner_id: farmData.ownerId,
      subscription_plan: 'basic',
      subscription_status: 'active',
      settings: farmData.settings || {},
      created_at: new Date(),
      updated_at: new Date()
    }
  });

  // Link owner to farm
  await prisma.farm_users.create({
    data: {
      farm_id: farm.id,
      user_id: farmData.ownerId,
      role: 'OWNER',
      is_active: true
    }
  });

  return farm;
}
```

### **⚠️ Authentication Without Hardcoding**

```typescript
// ✅ CORRECT: Database-driven authentication
async function authenticateUser(email: string, password: string) {
  const user = await prisma.users.findUnique({
    where: { 
      email: email.toLowerCase().trim(),
      isActive: true 
    }
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    role: JSON.parse(user.roles)[0]
  };
}
```

---

## 🛡️ **CSS MODULES STANDARDS**

### **🚨 CRITICAL CSS SYNTAX RULES**

```css
/* ❌ NEVER in .module.css files */
:global(.className) { ... }
html.theme-dark { ... }
body { ... }
* { ... }

/* ✅ ALWAYS use in globals.css for global styles */
html.theme-dark {
  --primary-color: #60a5fa;
}
```

### **File Purpose Rules**

| File Type | Purpose | Syntax |
|-----------|---------|---------|
| `globals.css` | Global styles, themes | All CSS syntax allowed |
| `Component.module.css` | Component-specific | Local classes only |

### **Design System Usage**

```css
/* ✅ ALWAYS: Use design system variables */
.container {
  background-color: var(--bg-primary);
  color: var(--text-medium);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-lg);
}
```

---

## 📝 **REQUIRED RESPONSE FORMAT**

### **ALWAYS begin tasks with:**

```
Understood. I will implement this following OFMS standards. Key considerations:

- [Standard 1: e.g., CSS Modules compliance]
- [Standard 2: e.g., Database safety protocols]
- [Standard 3: e.g., Multi-tenant isolation]
- [Standard 4: e.g., No hardcoded farm/farmer data]

I will verify compliance before concluding.
```

### **ALWAYS end with verification:**

```
✅ Verification completed:
- ESLint/Prettier: PASSED
- CSS Modules compliance: PASSED
- TypeScript compilation: PASSED
- Tests: PASSED
- Build: PASSED
- No hardcoded farm/farmer data: VERIFIED

🔒 Data Integrity: VERIFIED
🎯 STATUS: READY FOR PRODUCTION ✅
```

---

## 🔧 **VERIFICATION WORKFLOW**

**Run these commands for EVERY contribution:**

```bash
# 1. Fix code quality
npm run lint:fix

# 2. Verify CSS Modules compliance
npm run css:modules:validate

# 3. Check TypeScript
npm run type-check

# 4. Verify data integrity
npm run db:integrity:check

# 5. Run tests
npm run test

# 6. Verify build
npm run build

# 7. Scan for hardcoded data
npm run scan:hardcoded-data
```

---

## 🎯 **TASK-SPECIFIC CHECKLISTS**

### **UI/Component Development**
- [ ] Create corresponding `.module.css` file
- [ ] Use CSS variables from design system
- [ ] Implement responsive design patterns
- [ ] Add accessibility attributes
- [ ] Include loading and error states
- [ ] Write component tests
- [ ] **Verify no hardcoded farm/farmer references**

### **API Development**
- [ ] Use centralized service layer patterns
- [ ] Implement proper error handling
- [ ] Add request/response type definitions
- [ ] Include authentication/authorization checks
- [ ] Farm-scope all queries
- [ ] Write API tests with MSW mocking
- [ ] **Verify no hardcoded farm/farmer data**

### **Database Changes**
- [ ] **ASK PERMISSION** for destructive operations
- [ ] **MANDATORY**: Complete data integrity analysis
- [ ] **MANDATORY**: Verify referential integrity constraints
- [ ] Create backup before changes
- [ ] Update Prisma schema if needed
- [ ] Test with environment-specific data
- [ ] Verify data integrity post-change
- [ ] **Verify no hardcoded farm/farmer data**

---

## 🚨 **AUTOMATIC REJECTION CRITERIA**

**These violations will result in automatic rejection:**

- 🚨 **Hardcoded farm/farmer data** - Any specific farm names, farmer names, or email domains (CRITICAL)
- 🚨 **Destructive database operations without permission** (CRITICAL)
- 🚨 **Data integrity violations** - Missing referential constraints (CRITICAL)
- 🚨 **Multi-tenant isolation violations** - Unscoped queries (CRITICAL)
- 🚨 **Invalid CSS Modules syntax** - Using `:global()` in `.module.css` files (CRITICAL)
- 🚨 **Inline styles or JSX styling** (violating CSS Modules policy)
- 🚨 **Missing TypeScript types** or excessive `any` usage
- 🚨 **Failing tests** or build errors
- 🚨 **Missing tests** for new functionality

---

## ✅ **MANDATORY PRE-TASK PROCESS**

**For EVERY task, follow this sequence:**

1. **Understand & Clarify**
   - Ensure you fully understand the user's request
   - Ask clarifying questions if ambiguous
   - Identify scope and impact of changes

2. **Consult Documentation**
   - Review relevant docs: PROJECT_STANDARDS.md, DEVELOPMENT_GUIDE.md, DATABASE_GUIDE.md
   - Check STYLING_GUIDE.md for CSS requirements
   - Review TESTING_GUIDE.md for test patterns

3. **Apply Standards**
   - Follow established patterns and examples
   - Implement required safety checks
   - Use farm-scoped queries for multi-tenant
   - **Ensure no hardcoded farm/farmer data**

4. **Verify Compliance**
   - Run quality checks before concluding
   - Test implementations thoroughly
   - Document assumptions or limitations
   - **Scan for any hardcoded references**

---

## 🔍 **STANDARD PATTERNS**

### **TypeScript Standards**
```typescript
// ❌ NEVER: Any types without justification
const data: any = fetchData();

// ✅ ALWAYS: Strict typing with interfaces
interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const user: User = await apiService.getUser(id);
```

### **API Service Pattern**
```typescript
// ✅ ALWAYS: Centralized API service
import { apiService } from '@/lib/api/apiService';

// ✅ ALWAYS: Data integrity for user operations
import { dataIntegrityService } from '@/lib/services/dataIntegrityService';

// ✅ ALWAYS: Event-driven updates
import { dataRefreshEmitter, DATA_EVENTS } from '@/lib/events/dataEvents';
```

### **Testing Pattern**
```typescript
// ✅ ALWAYS: Include tests for new functionality
describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    render(<ComponentName />);
    await user.click(screen.getByRole('button'));
    // Assert expected behavior
  });
});
```

---

## 🏢 **MULTI-TENANT TESTING REQUIREMENTS**

**MANDATORY tests for multi-tenant features:**

- [ ] **Isolation Test**: Verify data from one farm never appears in another
- [ ] **Permission Test**: Verify users can only access their assigned farms
- [ ] **Switching Test**: Verify farm switching updates all displayed data
- [ ] **Global Admin Test**: Verify admin can access cross-farm data

---

## 🔗 **QUICK REFERENCE**

### **Essential Commands**
```bash
# Development
npm run dev                    # Start development server (port 3005)
npm run build                  # Production build
npm run lint:fix              # Fix linting issues
npm run test                   # Run all tests

# Database (with permission)
npm run db:backup             # Create backup
npm run db:migrate            # Run migrations
npm run db:health             # Check database health

# Data Integrity (IMPLEMENTED)
npm run db:integrity:check         # Check referential integrity
npm run db:orphans:detect          # Detect orphaned records
npm run db:health:comprehensive    # Comprehensive health check

# Demo Setup (NO HARDCODED DATA)
node scripts/create-demo-setup.js  # Create generic demo farms and users
```

### **Key Documentation**
- **[PROJECT_STANDARDS.md](./PROJECT_STANDARDS.md)**: Quality standards and enforcement
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)**: Architectural patterns and workflows
- **[DATABASE_GUIDE.md](./DATABASE_GUIDE.md)**: Database operations and safety
- **[STYLING_GUIDE.md](./STYLING_GUIDE.md)**: CSS Modules and design system
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**: Testing strategies and patterns

---

**This guide contains all essential knowledge for maintaining OFMS project standards with enterprise-grade quality enforcement and zero hardcoded farm/farmer data.**

**Target**: Practical guidance without bureaucracy or hardcoded data  
**Focus**: Safety, standards, productivity, and dynamic multi-tenant architecture  
**Status**: Active Development Guide (January 2025) - HARDCODE-FREE VERSION 