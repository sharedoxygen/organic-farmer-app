# ⚠️ **DEPRECATED GUIDE** ⚠️

**This guide has been deprecated in favor of the streamlined `OFMS_ESSENTIALS.md`.**

**Reason**: This document became overly prescriptive and bureaucratic (626 lines), making it impractical for daily development. The essential technical knowledge has been extracted into a focused, practical guide.

**→ Use Instead**: [`OFMS_ESSENTIALS.md`](./OFMS_ESSENTIALS.md)

**Deprecation Date**: January 2025

---

## **What Was Extracted:**
- Database safety protocols → **OFMS_ESSENTIALS.md**
- Multi-tenant architecture rules → **OFMS_ESSENTIALS.md**  
- CSS Modules standards → **OFMS_ESSENTIALS.md**
- Core quality commands → **OFMS_ESSENTIALS.md**
- Standard UI patterns → **OFMS_ESSENTIALS.md**

## **What Was Removed:**
- Bureaucratic workflows and response formats
- References to non-existent npm scripts
- Excessive ceremony that constrained productivity
- Overly rigid standards (CSS syntax as "CRITICAL")

---

**This file is preserved for historical reference but should not be used for active development.**

**Use [`OFMS_ESSENTIALS.md`](./OFMS_ESSENTIALS.md) instead.**

---

# AI Development Guide & Standards

## 🎯 **Master Guidance for AI Assistants & Developers**

**You are working on the Organic Farm Management System (OFMS) - a Next.js 14 enterprise application with strict quality standards, comprehensive testing, and production-ready deployment practices.**

**MANDATORY: Read this entire guide before beginning any task. This document contains all guidance needed for strict adherence to project standards.**

**DESIGN PHILOSOPHY: We prioritize business-modern, visually intuitive presentations with industry-standard compliance. Focus on clean, professional aesthetics that build trust and enhance business communication.**

---

## 📋 **CORE PROJECT DNA (Commit to Memory)**

### **Technology Stack**
- **Frontend**: Next.js 14 + TypeScript + CSS Modules + NextAuth
- **Database**: PostgreSQL + Prisma ORM with strict safety protocols
- **Testing**: Jest (unit/integration) + Playwright (E2E) + MSW (API mocking)
- **Styling**: CSS Modules ONLY + Design System + Theme Support
- **Quality**: ESLint + Prettier + Husky + Automated Testing

### **Architecture Patterns**
- **Multi-Role System**: Users can have multiple roles simultaneously (ADMIN, MANAGER, TEAM_LEAD, SPECIALIST_LEAD, TEAM_MEMBER, SPECIALIST) with highest authorization applying
- **Role Priority**: ADMIN > MANAGER > TEAM_LEAD/SPECIALIST_LEAD > TEAM_MEMBER/SPECIALIST
- **API Layer**: Centralized service pattern with event-driven updates
- **Data Integrity**: Comprehensive validation and consistency enforcement
- **Multi-Environment**: Development → Test → Staging → Production

---

## 🚨 **CRITICAL SAFETY PROTOCOLS**

### **🔴 ABSOLUTE PROHIBITIONS**

**NEVER execute these without explicit user permission and backup:**

```bash
# DATABASE DESTRUCTION COMMANDS - NEVER RUN WITHOUT PERMISSION
npx prisma migrate reset
npx prisma migrate reset --force
npx prisma db push --force-reset
DROP DATABASE
TRUNCATE TABLE
DELETE FROM [table] WHERE [affects multiple records]
```

### **🟡 RESTRICTED OPERATIONS**

**ALWAYS ask permission before executing:**

```bash
# ASK PERMISSION FIRST
npx prisma migrate dev
npx prisma db push
npm run db:reset
npm run db:migrate
```

### **🔵 MANDATORY DATA INTEGRITY VERIFICATION**

**CRITICAL: Every development task MUST include data integrity analysis and verification:**

#### **Pre-Development Integrity Assessment**
Before ANY database-related changes:

1. **Schema Relationship Analysis**
   - Map all foreign key relationships
   - Identify missing `onDelete`/`onUpdate` constraints
   - Document potential orphan record scenarios
   - Verify referential integrity chains

2. **Business Logic Integrity Review**
   - Identify critical business rules requiring database constraints
   - Map transaction boundaries for atomic operations
   - Document data consistency requirements
   - Plan rollback scenarios for failed operations

3. **Data Flow Impact Analysis**
   - Trace data dependencies across all models
   - Identify cascade effects of proposed changes
   - Document potential data loss scenarios
   - Plan migration strategies for existing data

#### **Mandatory Data Integrity Checklist**

**EVERY database operation must pass ALL checks:**

- [ ] **Referential Integrity**: All foreign keys have proper cascade rules
- [ ] **Business Constraints**: Critical business rules enforced at database level
- [ ] **Transaction Safety**: Multi-step operations wrapped in transactions
- [ ] **Audit Trail**: All data modifications logged with user attribution
- [ ] **Validation Layer**: Input validation prevents invalid data entry
- [ ] **Backup Strategy**: Recovery plan documented and tested
- [ ] **Rollback Plan**: Clear rollback procedure for failed operations
- [ ] **Data Consistency**: No orphaned records or invalid references
- [ ] **Performance Impact**: Operations don't degrade system performance
- [ ] **Security Compliance**: Data access follows role-based permissions

### **📢 REQUIRED COMMUNICATION FORMAT**

When ANY database operation is needed:

```
⚠️  DATABASE OPERATION REQUIRED ⚠️

Operation: [specific command]
Risk Level: [HIGH/MEDIUM/LOW]
Data at Risk: [specific data that could be lost]
Backup Required: YES
Recovery Time: [estimated time]
Integrity Impact: [referential integrity analysis]
Business Impact: [business process effects]

INTEGRITY VERIFICATION COMPLETED:
□ Referential integrity analyzed
□ Business constraints verified  
□ Transaction boundaries defined
□ Audit trail confirmed
□ Rollback plan documented

This operation could cause data loss.
I will create a backup first and verify recovery procedures.

Do you give explicit permission to proceed? (YES/NO)
```

---

## ✅ **MANDATORY PRE-TASK PROCESS**

**For EVERY task, follow this exact sequence:**

### **1. Understand & Clarify**
- Ensure you fully understand the user's request
- If ambiguous, ask clarifying questions BEFORE generating code
- Identify the scope and impact of changes

### **2. Consult Documentation (in order)**
- **`dev-docs/PROJECT_STANDARDS.md`** - Quality standards and enforcement
- **`dev-docs/DEVELOPMENT_GUIDE.md`** - Architectural patterns and workflows
- **`dev-docs/DATABASE_GUIDE.md`** - Database operations and safety
- **`dev-docs/STYLING_GUIDE.md`** - CSS Modules and design system
- **`dev-docs/TESTING_GUIDE.md`** - Testing requirements and patterns
- **Task-specific docs** as needed

### **3. Apply Standards**
- All code must follow established standards
- Use provided patterns and examples
- Implement required safety checks

### **4. Verify Compliance**
- Run quality checks before concluding
- Test implementations thoroughly
- Document any assumptions or limitations

---

## 🛡️ **NON-NEGOTIABLE STANDARDS**

### **CSS & Styling**
```typescript
// ❌ NEVER: Inline styles or JSX styling
<div style={{ backgroundColor: 'blue' }}>Content</div>
<style jsx>{`.class { color: red; }`}</style>

// ✅ ALWAYS: CSS Modules with design tokens
import styles from './Component.module.css';
<div className={styles.container}>Content</div>
```

```css
/* ✅ ALWAYS: Use CSS variables from design system */
.container {
  background-color: var(--bg-primary);
  color: var(--text-medium);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-lg);
}
```

### **🚨 CRITICAL CSS MODULES SYNTAX RULES**

**NEVER use these in `.module.css` files:**

```css
/* ❌ NEVER: Global selectors in CSS Modules */
:global(.className) { ... }
html.theme-dark { ... }
body { ... }
* { ... }

/* ❌ NEVER: Global pseudo-selectors */
:global(*) { ... }
:global(body) { ... }
:global(html) { ... }

/* ❌ NEVER: Complex global selectors */
:global(.theme-transitioning) * { ... }
:global(.some-class) .nested { ... }
```

**✅ ALWAYS use in `globals.css` for global styles:**

```css
/* ✅ CORRECT: Global styles in globals.css */
.theme-transitioning * {
  transition: all var(--transition-fast);
}

html.theme-dark {
  --primary-color: #60a5fa;
}

body {
  font-family: var(--font-family-base);
}
```

### **CSS FILE PURPOSE RULES**

| File Type | Purpose | Allowed Syntax |
|-----------|---------|----------------|
| `globals.css` | Global styles, theme definitions, base elements | All CSS syntax, theme classes, global selectors |
| `Component.module.css` | Component-specific scoped styles | Local class names only, CSS variables allowed |
| `utilities.css` | Utility classes | Global utility classes only |

### **CRITICAL VERIFICATION CHECKPOINT**

**Before any CSS changes, verify:**

- [ ] **File Purpose Check**: Is this style global or component-specific?
- [ ] **Syntax Check**: No `:global()` syntax in `.module.css` files
- [ ] **Scope Check**: Component styles in modules, global styles in globals
- [ ] **Build Check**: CSS compiles without syntax errors

### **API & Data Layer**
```typescript
// ✅ ALWAYS: Centralized API service
import { apiService } from '@/lib/api/apiService';

// ✅ ALWAYS: Data integrity for user operations
import { dataIntegrityService } from '@/lib/services/dataIntegrityService';

// ✅ ALWAYS: Event-driven updates
import { dataRefreshEmitter, DATA_EVENTS } from '@/lib/events/dataEvents';
```

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

### **Testing Requirements**
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

## 🔧 **CURRENT VERIFICATION WORKFLOW**

**Run these commands for EVERY contribution:**

```bash
# 1. Fix code quality issues
npm run lint:fix

# 2. Run type checking
npm run type-check

# 3. CRITICAL: Verify CSS Modules compliance and syntax
npm run css:modules:validate

# 4. CRITICAL: CSS compilation test (catches CSS Modules syntax errors)
npm run build:css

# 5. IMPLEMENTED: Verify data integrity
npm run db:integrity:check

# 6. IMPLEMENTED: Detect orphaned records
npm run db:orphans:detect

# 7. Run all tests
npm run test

# 8. Run E2E tests (if UI changes)
npm run test:e2e

# 9. Verify build success
npm run build

# 10. COMPREHENSIVE: Final health check
npm run db:health:comprehensive
```

### **🚧 IMPLEMENTATION STATUS**

**✅ IMPLEMENTED COMMANDS:**
- `npm run lint:fix` - ESLint with auto-fix
- `npm run type-check` - TypeScript compilation check
- `npm run css:modules:validate` - CSS Modules syntax validation
- `npm run build:css` - CSS compilation test
- `npm run db:integrity:check` - Basic integrity verification
- `npm run db:orphans:detect` - Orphaned record detection
- `npm run test` - Jest test suite
- `npm run test:e2e` - Playwright E2E tests
- `npm run build` - Production build verification

**🚧 PARTIALLY IMPLEMENTED:**
- `npm run db:health:comprehensive` - Runs available integrity checks

**⚠️ PLACEHOLDER COMMANDS (Need Implementation):**
- `npm run db:constraints:validate` - Business constraints validation
- `npm run db:consistency:verify` - Data consistency verification
- `npm run db:audit:validate` - Audit trail validation
- `npm run db:transaction:test` - Transaction boundary testing
- `npm run db:rollback:verify` - Rollback procedure verification

---

## 📝 **REQUIRED RESPONSE FORMAT**

### **ALWAYS begin every task response with:**

```
Understood. I will implement this following the OFMS project standards. Key considerations for this task:

- [Standard 1: e.g., CSS Modules compliance]
- [Standard 2: e.g., Database safety protocols]
- [Standard 3: e.g., Testing requirements]

I will verify with linting, testing, and build checks before concluding.
```

### **ALWAYS end with verification confirmation:**

```
✅ Verification completed:
- ESLint/Prettier: PASSED
- CSS Modules compliance: PASSED
- TypeScript compilation: PASSED
- Tests: PASSED
- Build: PASSED

🔒 Data Integrity Verification:
- Referential integrity: VERIFIED
- Orphan detection: CLEAN
- Basic health check: PASSED

🎯 STATUS: READY FOR PRODUCTION ✅
```

---

## 🏢 **MULTI-TENANT CONSIDERATIONS**

### **🔐 Farm Isolation Requirements**

**CRITICAL: All operations MUST respect farm boundaries:**

1. **Query Scope Enforcement**
   ```typescript
   // ❌ NEVER: Unscoped queries
   const batches = await prisma.batches.findMany();
   
   // ✅ ALWAYS: Farm-scoped queries
   const batches = await prisma.batches.findMany({
     where: { farm_id: currentFarmId }
   });
   ```

2. **API Context Requirements**
   ```typescript
   // ✅ ALWAYS: Include farm context in API calls
   headers: {
     'X-Farm-ID': currentFarmId,
     'Content-Type': 'application/json'
   }
   ```

3. **Permission Verification**
   ```typescript
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

### **🔄 Farm Switching Protocol**

**When implementing farm switching:**

1. **Clear Current Context**
   - Clear cached farm-specific data
   - Reset UI state
   - Cancel pending farm-specific requests

2. **Establish New Context**
   - Verify user has access to new farm
   - Load farm-specific settings
   - Update API service context
   - Emit FARM_SWITCHED event

3. **Refresh All Data**
   - Re-fetch all displayed data for new farm
   - Update navigation based on farm permissions
   - Apply farm-specific configuration

### **👥 Multi-Farm User Management**

**User-Farm Association Rules:**

1. **Creating Farm Users**
   ```typescript
   // ✅ CORRECT: Always create farm_users entry
   await prisma.farm_users.create({
     data: {
       farm_id: farmId,
       user_id: userId,
       role: 'TEAM_MEMBER',
       is_active: true
     }
   });
   ```

2. **Role Hierarchy at Farm Level**
   ```
   OWNER > FARM_MANAGER > TEAM_LEAD > SPECIALIST_LEAD > TEAM_MEMBER > SPECIALIST
   ```

3. **Global Admin Exception**
   - Global admins (admin@curryislandmicrogreens.com) bypass farm restrictions
   - Can view aggregate data across all farms
   - Can impersonate farm users for support

### **📊 Multi-Tenant Testing Requirements**

**MANDATORY tests for multi-tenant features:**

- [ ] **Isolation Test**: Verify data from one farm never appears in another
- [ ] **Permission Test**: Verify users can only access their assigned farms
- [ ] **Switching Test**: Verify farm switching updates all displayed data
- [ ] **Global Admin Test**: Verify admin can access cross-farm data

---

## 🎯 **TASK-SPECIFIC GUIDANCE**

### **UI/Component Development**
- ✅ Create corresponding `.module.css` file
- ✅ Use CSS variables from design system
- ✅ Implement responsive design patterns
- ✅ Add accessibility attributes
- ✅ Include loading and error states
- ✅ Write component tests

### **API Development**
- ✅ Use centralized service layer patterns
- ✅ Implement proper error handling
- ✅ Add request/response type definitions
- ✅ Include authentication/authorization checks
- ✅ Write API tests with MSW mocking
- ✅ Emit data refresh events

### **Database Changes**
- ✅ **ASK PERMISSION** for any destructive operations
- ✅ **MANDATORY**: Complete data integrity analysis before changes
- ✅ **MANDATORY**: Verify referential integrity constraints
- ✅ **MANDATORY**: Identify and fix orphan record vulnerabilities  
- ✅ **MANDATORY**: Implement transaction boundaries for atomic operations
- ✅ Create backup before changes
- ✅ Update Prisma schema if needed
- ✅ Create appropriate migrations
- ✅ Test with environment-specific data
- ✅ Verify data integrity post-change

---

## 🚨 **AUTOMATIC REJECTION CRITERIA**

**These violations will result in automatic rejection:**

- 🚨 **Destructive database operations without permission** (CRITICAL)
- 🚨 **Data integrity violations** - Missing referential constraints (CRITICAL)
- 🚨 **Orphaned record vulnerabilities** - Operations that create orphans (CRITICAL)
- 🚨 **Invalid CSS Modules syntax** - Using `:global()` or global selectors in `.module.css` files (CRITICAL)
- 🚨 **Inline styles or JSX styling** (violating CSS Modules policy)
- 🚨 **Missing TypeScript types** or excessive `any` usage
- 🚨 **Failing automated tests** in CI pipeline
- 🚨 **Build failures** or compilation errors
- 🚨 **Security vulnerabilities** in dependencies
- 🚨 **Missing tests** for new functionality
- 🚨 **Accessibility violations** in UI components

---

## ⚡ **COMMON TASK WORKFLOWS**

### **Creating a New Component**
1. Create component file: `components/MyComponent/MyComponent.tsx`
2. Create CSS module: `components/MyComponent/MyComponent.module.css`
3. Use design system variables and CSS Modules
4. Add TypeScript interfaces for props
5. Implement accessibility attributes
6. Write component tests
7. Export from appropriate index file

### **Adding API Endpoint**
1. Create API route in `app/api/`
2. Use centralized error handling patterns
3. Add proper TypeScript types
4. Implement authentication/authorization
5. Write API tests with MSW
6. Update API service layer
7. Emit appropriate data events

### **Database Schema Changes**
1. **ASK PERMISSION** if destructive
2. Create backup of current data
3. Update Prisma schema
4. Generate migration: `npx prisma migrate dev --name "description"`
5. Test migration on copy of production data
6. Verify data integrity post-migration
7. Update TypeScript types

---

## 🔍 **QUALITY CHECKPOINTS**

### **Before Every Commit**
- [ ] All linting checks pass
- [ ] CSS Modules compliance verified
- [ ] TypeScript compilation succeeds
- [ ] All tests pass
- [ ] Build completes successfully
- [ ] Documentation updated if needed

### **Before Every Pull Request**
- [ ] All automated checks pass
- [ ] Code coverage requirements met
- [ ] Security review completed (if applicable)
- [ ] Performance impact assessed
- [ ] Accessibility compliance verified

---

## 📚 **QUICK REFERENCE LINKS**

### **Essential Documentation**
- **[PROJECT_STANDARDS.md](./PROJECT_STANDARDS.md)**: Quality standards and enforcement
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)**: Architectural patterns and workflows
- **[DATABASE_GUIDE.md](./DATABASE_GUIDE.md)**: Database operations and safety
- **[STYLING_GUIDE.md](./STYLING_GUIDE.md)**: CSS Modules and design system
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**: Testing strategies and patterns

### **Key Commands**
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

# Quality Assurance
npm run quality:check         # Comprehensive quality check
npm run test:coverage         # Test coverage report
npm run test:e2e              # End-to-end tests
```

### **Key Patterns**
- **Authentication**: NextAuth.js with role-based access control
- **Database**: Prisma with safety protocols and data integrity
- **Styling**: CSS Modules with design system variables
- **Testing**: Jest + Playwright with MSW API mocking
- **API**: Centralized service layer with event-driven updates

---

**This comprehensive guide contains all guidance needed for strict adherence to OFMS project standards with enterprise-grade quality enforcement.**

**Last Updated**: January 2025  
**Project**: Organic Farm Management System (OFMS)  
**Status**: Active Development - Implementing Production Standards  
**Compliance**: Mandatory for all AI assistants and developers 