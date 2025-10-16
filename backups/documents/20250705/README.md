# Next.js Project Starter

**Enterprise-Grade Next.js 14 Application Template**

A comprehensive Next.js 14 application foundation with TypeScript, role-based access control, comprehensive testing, and production-ready deployment configurations.

---

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [🔧 Development Setup](#-development-setup)
- [🌍 Environments](#-environments)
- [👥 Role System](#-role-system)
- [🔐 Authentication](#-authentication)
- [📊 Features](#-features)
- [🎨 Styling System](#-styling-system)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [📚 Documentation](#-documentation)
- [🛠️ Troubleshooting](#️-troubleshooting)

---

## 🎯 Project Overview

### Purpose
This Next.js starter provides a comprehensive foundation for building enterprise-grade web applications with modern development practices, robust architecture patterns, and production-ready configurations.

### Key Benefits
- **Role-Based Architecture**: Flexible user hierarchy with customized interfaces
- **Data Integrity**: Comprehensive validation and consistency systems
- **Performance Analytics**: Real-time tracking and monitoring
- **Multi-Environment**: Development, test, staging, and production ready
- **Enterprise Security**: Authentication, authorization, and audit trails
- **Developer Experience**: Comprehensive tooling and automation

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | Next.js | 14.1.0 | React framework with SSR/SSG |
| **Language** | TypeScript | 5.3.3 | Type-safe development |
| **Database** | PostgreSQL | Latest | Primary data store |
| **ORM** | Prisma | 6.8.2 | Database access and migrations |
| **Authentication** | NextAuth | 4.24.5 | Session management |
| **Styling** | CSS Modules | Built-in | Component-scoped styling |
| **Icons** | FontAwesome | 6.5.1 | UI iconography |
| **Charts** | Chart.js | 4.4.9 | Data visualization |
| **Testing** | Jest + Playwright | Latest | Unit and E2E testing |

### Multi-Role Authorization System

**Users can be assigned multiple roles simultaneously. Authorization is determined by the highest-priority role.**

**Role Priority (Highest to Lowest):**
```
ADMIN (Highest Priority)
├── MANAGER  
├── TEAM_LEAD / SPECIALIST_LEAD
└── TEAM_MEMBER / SPECIALIST (Lowest Priority)
```

**Examples:**
- User with `[TEAM_LEAD, MANAGER]` → **MANAGER** permissions apply
- User with `[SPECIALIST_LEAD, SPECIALIST]` → **SPECIALIST_LEAD** permissions apply  
- When **MANAGER** role is removed → Falls back to **TEAM_LEAD** permissions

### Multi-Environment Setup

| Environment | Port | Purpose | URL Pattern |
|-------------|------|---------|-------------|
| **Development** | 3005 | Local development | `localhost:3005` |
| **Test** | 7035 | Testing/QA | `localhost:7035` |
| **Staging** | 3007 | Pre-production | `staging.domain.com` |
| **Production** | 3005 | Live application | `app.domain.com` |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20.x or later
- **npm**: 10.x or later
- **PostgreSQL**: 14.x or later
- **Git**: Latest

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nextjs-starter

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your database and authentication settings

# Initialize database
npm run db:setup

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/app_db"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3005"

# Environment
NODE_ENV="development"
NEXT_PUBLIC_APP_ENV="development"
```

---

## 🔧 Development Setup

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Seed database with test data
npm run db:seed

# View database (optional)
npx prisma studio
```

### Development Workflow

```bash
# Start development server with hot reload
npm run dev

# Alternative: Start with Turbo for faster builds
npm run dev:watch

# Run linting and fixes
npm run lint:fix

# Check CSS Modules compliance
npm run style:check

# Run tests
npm run test
npm run test:e2e
```

### Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run lint:fix` | Fix linting issues |
| `npm run db:seed` | Seed database |
| `npm run db:reload` | Reload database with fresh data |
| `npm run style:check` | Verify CSS Modules compliance |

---

## 🌍 Environments

### Development Environment
- **Port**: 3005
- **Database**: Local PostgreSQL
- **Features**: Hot reload, debug tools, test data

### Test Environment
- **Port**: 7035
- **Database**: Test PostgreSQL instance
- **Features**: Production build, test data
- **Deploy**: `npm run test:deploy`

### Staging Environment
- **Port**: 3007
- **Database**: Staging PostgreSQL
- **Features**: Production-like, limited test data

### Production Environment
- **Port**: 3005
- **Database**: Production PostgreSQL
- **Features**: Full security, real data, monitoring

---

## 👥 Multi-Role System

### System Overview

**This application uses a flexible multi-role authorization system where:**
- ✅ Users can be assigned **multiple roles simultaneously**
- ✅ **Highest-priority role** determines access permissions
- ✅ **Temporary role elevation** supported (e.g., TEAM_LEAD → MANAGER)
- ✅ **Automatic fallback** when higher roles are removed
- ✅ **Database stores array of roles** per user

### Role Definitions & Priority

#### 🔴 ADMIN (Priority: 1 - Highest)
- **Access**: Full system access, all environments
- **Features**: User management, system configuration, all reports, role assignments
- **Navigation**: All application areas without restrictions
- **Authority**: Can assign/remove any role to/from any user

#### 🟠 MANAGER (Priority: 2)
- **Access**: Organization-wide oversight, cross-team visibility
- **Features**: User management, reports, team management, performance analytics
- **Navigation**: Management activities, analytics, team oversight
- **Authority**: Can manage users with TEAM_LEAD and below roles

#### 🟡 TEAM_LEAD / SPECIALIST_LEAD (Priority: 3)
- **Access**: Team-specific management within their domain
- **Features**: Team performance, coaching tools, team-scoped reports, task assignments
- **Navigation**: Team activities, analytics, task management
- **Authority**: Can manage TEAM_MEMBER/SPECIALIST roles within their team

#### 🟢 TEAM_MEMBER / SPECIALIST (Priority: 4 - Lowest)
- **Access**: Personal workflow and assigned tasks
- **Features**: Activity tracking, personal analytics, task management, profile management
- **Navigation**: Daily activities, personal performance, assigned tasks
- **Authority**: Self-service profile and task management only

### Permission Matrix

**Permissions are determined by the highest-priority role in user's role array.**

| Feature | ADMIN | MANAGER | TEAM_LEAD | SPECIALIST_LEAD | TEAM_MEMBER | SPECIALIST |
|---------|-------|---------|-----------|-----------------|-------------|------------|
| **System Administration** |
| User Role Management | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Environment Configuration | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Team Management** |
| Team Reports | ✅ | ✅ | ✅* | ✅* | ❌ | ❌ |
| Performance Analytics | ✅ | ✅ | ✅* | ✅* | ❌ | ❌ |
| Task Assignment | ✅ | ✅ | ✅* | ✅* | ❌ | ❌ |
| **Personal Access** |
| Personal Analytics | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Activity Tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Profile Management | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

*Team scope only

### Multi-Role Examples

**User with multiple roles - highest priority applies:**

```typescript
// User roles: [TEAM_LEAD, MANAGER, SPECIALIST]
// Effective permissions: MANAGER (highest priority)
// Can access: All MANAGER features + inherent lower-level access

// User roles: [SPECIALIST_LEAD, TEAM_MEMBER]  
// Effective permissions: SPECIALIST_LEAD (highest priority)
// Can access: Team management + personal features

// User roles: [SPECIALIST]
// Effective permissions: SPECIALIST (only role)
// Can access: Personal features only
```

### Temporary Role Elevation

**Common use cases:**
- **Project Leadership**: Temporarily assign MANAGER role to TEAM_LEAD for cross-team projects
- **Coverage**: Temporarily elevate SPECIALIST_LEAD to MANAGER during manager absence
- **Training**: Temporarily assign TEAM_LEAD role to TEAM_MEMBER for leadership development
- **Seasonal Authority**: Temporarily assign higher roles during peak periods

---

## 🔐 Authentication

### NextAuth Configuration
- **Provider**: Credentials-based (configurable)
- **Session**: JWT with **multi-role array** and **effective role** information
- **Security**: Encrypted sessions, secure cookies
- **Role Resolution**: Automatic highest-priority role calculation

### Default Test Credentials

| Role | Username | Password | Purpose |
|------|----------|----------|---------|
| Admin | `admin` | `adminpass` | Full system access |
| Manager | `manager` | `managerpass` | Management access |
| Team Lead | `teamlead` | `leadpass` | Team leadership |
| Team Member | `member` | `memberpass` | Standard user |

### Security Features
- **Route Protection**: Role-based access control
- **Session Management**: Automatic session refresh
- **CSRF Protection**: Built-in token validation
- **Password Security**: Bcrypt hashing

---

## 📊 Features

### Dashboard System
- **Role-Based Views**: Customized dashboards per role
- **KPI Tracking**: Real-time performance metrics
- **Activity Feeds**: Recent activities and updates
- **Quick Actions**: Fast access to common tasks

### User Management
- **Complete Lifecycle**: Create, read, update, delete users
- **Multi-Role Assignment**: Assign/remove multiple roles per user with priority-based access
- **Temporary Elevation**: Grant temporary higher-level roles with automatic expiration
- **Profile Management**: User profile and preferences with role-based customization
- **Activity Tracking**: User activity logging with role-context information

### Analytics & Reporting
- **Performance Analytics**: Detailed analytics with forecasting
- **Comparison Tools**: Performance benchmarking
- **Trend Analysis**: Historical patterns
- **Role-Based Reports**: Filtered data based on access level

### Task Management
- **Personal Tasks**: Create and track personal activities
- **Team Tasks**: Assign and track team activities
- **Follow-ups**: Schedule and manage follow-up activities
- **Integration**: Tasks generated from activities

### Help & Support
- **Context-Aware Help**: Role-specific guidance
- **Interactive Tutorials**: Step-by-step onboarding
- **Documentation**: Comprehensive user guides
- **Keyboard Shortcuts**: Efficiency tools

### Administrative Tools
- **User Management**: Complete user lifecycle management
- **Feedback System**: User feedback collection and management
- **System Health**: Monitoring and diagnostics
- **Configuration**: System settings and preferences

---

## 🎨 Styling System

### CSS Modules Architecture
- **Component Scoping**: Isolated styles per component
- **Variable Safety**: Prevents styling conflicts
- **Theme Support**: Light/dark mode compatibility
- **Responsive Design**: Mobile-first approach

### Design Tokens

```css
/* Core Variables */
--primary-color: #0d6efd;
--secondary-color: #6c757d;
--success-color: #198754;
--warning-color: #ffc107;
--danger-color: #dc3545;

/* Typography */
--font-family-base: 'Open Sans', sans-serif;
--font-size-base: 1rem;
--line-height-base: 1.5;

/* Spacing */
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 3rem;
```

### Component Library
- **Buttons**: Primary, secondary, danger variants
- **Forms**: Input fields, selects, textareas
- **Cards**: Content containers with consistent styling
- **Navigation**: Sidebar, header, breadcrumbs
- **Tables**: Data display with sorting and filtering
- **Modals**: Overlay content with accessibility

---

## 🧪 Testing

### Testing Strategy

#### Unit Tests (Jest)
```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

#### E2E Tests (Playwright)
```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific test
npx playwright test access-control
```

### Test Structure
```
tests/
├── unit/              # Unit tests
│   ├── components/    # Component tests
│   ├── services/      # Service layer tests
│   └── utils/         # Utility function tests
├── e2e/               # End-to-end tests
│   ├── auth/          # Authentication tests
│   ├── navigation/    # Navigation tests
│   └── workflows/     # User workflow tests
└── fixtures/          # Test data and fixtures
```

### Test Data Management
- **Seeded Data**: Consistent test data across environments
- **Factory Functions**: Dynamic test data generation
- **Mock Services**: API mocking with MSW
- **Database Isolation**: Test-specific database instances

---

## 🚀 Deployment

### Build Process

```bash
# Production build
npm run build

# Clean build (recommended)
npm run build:clean

# Test environment build
npm run build:test
```

### Environment Deployment

#### Development
```bash
# Start development server
npm run dev
```

#### Test Environment
```bash
# Deploy to test environment (port 7035)
npm run test:deploy
```

#### Production
```bash
# Build and start production server
npm run build
npm run start
```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3005
CMD ["npm", "start"]
```

### Database Migrations

```bash
# Apply migrations
npx prisma db push

# Generate migration
npx prisma migrate dev --name "migration-name"

# Deploy migrations (production)
npx prisma migrate deploy
```

---

## 📚 Documentation

### Core Documentation
- **[PROJECT_STANDARDS.md](./PROJECT_STANDARDS.md)**: Project standards and quality gates
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)**: Development workflows and best practices
- **[DATABASE_GUIDE.md](./DATABASE_GUIDE.md)**: Database operations and safety protocols
- **[STYLING_GUIDE.md](./STYLING_GUIDE.md)**: UI/UX design system and CSS standards
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**: Testing strategies and implementation

### API Documentation
- **Authentication Endpoints**: `/api/auth/*`
- **User Management**: `/api/users/*`
- **Activity Tracking**: `/api/activities/*`
- **Performance Data**: `/api/analytics/*`
- **System Health**: `/api/health/*`

### Database Schema
- **Users**: Authentication and role management
- **Activities**: Activity tracking and logging
- **Analytics**: Performance and metrics data
- **Tasks**: Task management system
- **Feedback**: User feedback collection

---

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check database connection
npx prisma db pull

# Reset database
npx prisma migrate reset
```

#### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Clean build
npm run build:clean
```

#### Authentication Issues
```bash
# Check environment variables
cat .env.local

# Verify NextAuth configuration
npm run auth:check
```

#### Styling Issues
```bash
# Check CSS Modules compliance
npm run style:check

# Verify CSS variables
npm run css:validate
```

### Performance Issues
```bash
# Analyze bundle size
npm run analyze

# Check performance metrics
npm run perf:check
```

### Testing Issues
```bash
# Clear test cache
npm run test:clear

# Run tests with verbose output
npm run test:verbose
```

---

## 🔧 Development Tools

### Code Quality
- **ESLint**: Code linting and quality checks
- **Prettier**: Code formatting
- **TypeScript**: Type checking and validation
- **Husky**: Git hooks for quality gates

### Database Tools
- **Prisma Studio**: Database GUI
- **Migration Tools**: Schema management
- **Seed Scripts**: Test data generation
- **Backup Tools**: Data safety protocols

### Performance Tools
- **Bundle Analyzer**: Build optimization
- **Lighthouse**: Performance auditing
- **Web Vitals**: User experience metrics
- **Monitoring**: Real-time performance tracking

---

## 🚀 Production Considerations

### Security
- **Environment Variables**: Secure configuration management
- **Authentication**: Robust session management
- **Authorization**: Role-based access control
- **Data Protection**: Encryption and safety protocols

### Performance
- **Caching**: Multi-layer caching strategy
- **Optimization**: Bundle and asset optimization
- **CDN**: Content delivery network setup
- **Monitoring**: Performance tracking and alerting

### Scalability
- **Database**: Connection pooling and optimization
- **Infrastructure**: Horizontal scaling patterns
- **Caching**: Redis and application-level caching
- **Load Balancing**: Traffic distribution strategies

---

## 📈 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run quality checks
5. Submit a pull request

### Quality Gates
- All tests must pass
- Code coverage requirements met
- Linting and formatting checks pass
- Security scans complete
- Documentation updated

### Code Review
- Peer review required
- Security review for sensitive changes
- Performance impact assessment
- Accessibility compliance check

---

This Next.js starter provides a solid foundation for building modern, scalable web applications with enterprise-grade features and development practices. Use this as a starting point for your projects and customize according to your specific needs.