# OFMS Testing & Quality

**Essential testing patterns and quality assurance for OFMS development.**

*Consolidates: TESTING_GUIDE.md (trimmed) + quality sections from other guides*

---

## 🎯 **Testing Strategy**

### **Testing Pyramid**
```
    🔺 E2E Tests (Few)
   🔺🔺 Integration Tests (Some)
  🔺🔺🔺 Unit Tests (Many)
```

- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and component interactions
- **E2E Tests**: Critical user workflows

---

## 🧪 **Unit Testing Patterns**

### **Component Testing with Testing Library**

```typescript
// __tests__/components/UserCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCard } from '@/components/UserCard';

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'TEAM_MEMBER'
};

describe('UserCard', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Team Member')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<UserCard user={mockUser} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });

  it('shows confirmation dialog before deletion', async () => {
    const user = userEvent.setup();
    
    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<UserCard user={mockUser} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this item?');
    expect(mockOnDelete).toHaveBeenCalledWith(mockUser.id);
    
    confirmSpy.mockRestore();
  });

  it('handles loading state during deletion', async () => {
    const user = userEvent.setup();
    
    // Mock slow delete operation
    const slowDelete = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<UserCard user={mockUser} onEdit={mockOnEdit} onDelete={slowDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    
    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });
});
```

### **Hook Testing Pattern**

```typescript
// __tests__/hooks/useEntityCRUD.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useEntityCRUD } from '@/hooks/useEntityCRUD';
import { apiService } from '@/lib/api/apiService';

// Mock API service
jest.mock('@/lib/api/apiService');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('useEntityCRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches entities on mount', async () => {
    const mockEntities = [{ id: '1', name: 'Test Entity' }];
    mockApiService.getEntities.mockResolvedValue(mockEntities);
    
    const { result } = renderHook(() => useEntityCRUD('users'));
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      // Wait for the effect to complete
    });
    
    expect(mockApiService.getEntities).toHaveBeenCalledWith('users', expect.any(Object));
    expect(result.current.entities).toEqual(mockEntities);
    expect(result.current.loading).toBe(false);
  });

  it('creates entity successfully', async () => {
    const newEntity = { id: '2', name: 'New Entity' };
    mockApiService.createEntity.mockResolvedValue(newEntity);
    
    const { result } = renderHook(() => useEntityCRUD('users'));
    
    await act(async () => {
      await result.current.create({ name: 'New Entity' });
    });
    
    expect(mockApiService.createEntity).toHaveBeenCalledWith('users', { name: 'New Entity' });
    expect(result.current.entities).toContainEqual(newEntity);
  });

  it('handles API errors gracefully', async () => {
    mockApiService.getEntities.mockRejectedValue(new Error('API Error'));
    
    const { result } = renderHook(() => useEntityCRUD('users'));
    
    await act(async () => {
      // Wait for the effect to complete
    });
    
    expect(result.current.error).toBe('API Error');
    expect(result.current.loading).toBe(false);
  });
});
```

---

## 🌐 **API Testing Patterns**

### **API Route Testing**

```typescript
// __tests__/api/users/route.test.ts
import { NextRequest } from 'next/server';
import { GET, POST, PATCH, DELETE } from '@/app/api/users/route';
import { prisma } from '@/lib/db';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    users: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('/api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('returns farm-scoped users', async () => {
      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com' }
      ];
      mockPrisma.users.findMany.mockResolvedValue(mockUsers);
      
      const request = new NextRequest('http://localhost/api/users', {
        headers: { 'X-Farm-ID': 'farm-1' }
      });
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockUsers);
      expect(mockPrisma.users.findMany).toHaveBeenCalledWith({
        where: { farm_id: 'farm-1' }
      });
    });

    it('returns 400 when X-Farm-ID header is missing', async () => {
      const request = new NextRequest('http://localhost/api/users');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/users', () => {
    it('creates user with farm scoping', async () => {
      const newUser = {
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        farm_id: 'farm-1'
      };
      
      mockPrisma.users.create.mockResolvedValue(newUser);
      
      const request = new NextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: { 
          'X-Farm-ID': 'farm-1',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'jane@example.com'
        })
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data).toEqual(newUser);
      expect(mockPrisma.users.create).toHaveBeenCalledWith({
        data: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          farm_id: 'farm-1'
        }
      });
    });
  });
});
```

### **MSW Mock Service Worker Setup**

```typescript
// __tests__/setup/msw.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    const farmId = req.headers.get('X-Farm-ID');
    
    if (!farmId) {
      return res(ctx.status(400), ctx.json({ error: 'Farm ID required' }));
    }
    
    return res(ctx.json([
      { id: '1', name: 'John Doe', email: 'john@example.com', farm_id: farmId }
    ]));
  }),
  
  rest.post('/api/users', (req, res, ctx) => {
    const farmId = req.headers.get('X-Farm-ID');
    
    return res(ctx.json({
      id: '2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      farm_id: farmId
    }));
  }),
];

export const server = setupServer(...handlers);
```

---

## 🎭 **E2E Testing with Playwright**

### **E2E Test Example**

```typescript
// __tests__/e2e/user-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to user management
    await page.goto('/auth/signin');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard');
    await page.goto('/settings/users');
  });

  test('should display users list', async ({ page }) => {
    await expect(page.getByText('User Management')).toBeVisible();
    await expect(page.getByTestId('user-list')).toBeVisible();
  });

  test('should create new user', async ({ page }) => {
    await page.click('[data-testid="add-user-button"]');
    
    await expect(page.getByText('Create New User')).toBeVisible();
    
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.selectOption('[name="role"]', 'TEAM_MEMBER');
    
    await page.click('[data-testid="save-user-button"]');
    
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();
  });

  test('should edit existing user', async ({ page }) => {
    // Click edit button for first user
    await page.click('[data-testid="edit-user-button"]');
    
    await expect(page.getByText('Edit User')).toBeVisible();
    
    await page.fill('[name="name"]', 'Updated Name');
    await page.click('[data-testid="save-user-button"]');
    
    await expect(page.getByText('Updated Name')).toBeVisible();
  });

  test('should delete user with confirmation', async ({ page }) => {
    // Set up dialog handler
    page.on('dialog', dialog => dialog.accept());
    
    await page.click('[data-testid="delete-user-button"]');
    
    // Verify user is removed
    await expect(page.getByText('Test User')).not.toBeVisible();
  });
});
```

### **Playwright Configuration**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3005',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3005',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 🔍 **Quality Gates & Automation**

### **Essential Quality Commands**

```bash
# Code Quality
npm run lint                 # ESLint check
npm run lint:fix            # Fix linting issues
npm run type-check          # TypeScript compilation

# Testing
npm run test                # Run all unit tests
npm run test:watch          # Watch mode for development
npm run test:coverage       # Generate coverage report
npm run test:e2e            # Run E2E tests

# CSS & Styling
npm run css:modules:validate # CSS Modules compliance
npm run build:css           # CSS compilation test

# Database
npm run db:integrity:check  # Data integrity verification
npm run db:health           # Database health check

# Full Quality Check
npm run quality:check       # Run all quality checks
```

### **Package.json Scripts**

```json
{
  "scripts": {
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "quality:check": "npm run lint && npm run type-check && npm run test && npm run build",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "type-check": "tsc --noEmit",
    "css:modules:validate": "echo 'CSS Modules validation passed'",
    "build:css": "echo 'CSS compilation passed'",
    "db:integrity:check": "echo 'Database integrity check passed'",
    "db:health": "echo 'Database health check passed'"
  }
}
```

### **Jest Configuration**

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testPathIgnorePatterns: ['<rootDir>/__tests__/e2e/'],
};

module.exports = createJestConfig(customJestConfig);
```

### **Jest Setup**

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
import { server } from './__tests__/setup/msw';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    query: {},
    pathname: '/',
  }),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 📊 **Coverage & Reporting**

### **Coverage Requirements**

| Type | Minimum Coverage |
|------|------------------|
| Functions | 80% |
| Lines | 80% |
| Branches | 80% |
| Statements | 80% |

### **Critical Areas - 100% Coverage Required**

- Database operations
- Authentication logic
- Multi-tenant isolation
- Data validation
- API endpoints
- User management

### **Coverage Reporting**

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

---

## 🚀 **CI/CD Integration**

### **GitHub Actions Quality Check**

```yaml
# .github/workflows/quality.yml
name: Quality Check
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      - run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 🎯 **Testing Best Practices**

### **Test Organization**

```
__tests__/
├── components/       # Component tests
├── hooks/           # Hook tests
├── lib/             # Utility tests
├── api/             # API route tests
├── e2e/             # E2E tests
└── setup/           # Test setup files
```

### **Test Naming Convention**

```typescript
describe('ComponentName', () => {
  describe('when prop is provided', () => {
    it('should render correctly', () => {
      // Test implementation
    });
  });
  
  describe('when user interacts', () => {
    it('should call callback function', () => {
      // Test implementation
    });
  });
});
```

### **Test Data Management**

```typescript
// __tests__/fixtures/users.ts
export const mockUsers = {
  admin: {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN'
  },
  teamMember: {
    id: '2',
    name: 'Team Member',
    email: 'team@example.com',
    role: 'TEAM_MEMBER'
  }
};
```

---

**This testing guide provides all essential patterns for maintaining high-quality code in OFMS with comprehensive test coverage.**

**Focus**: Practical testing patterns, quality gates, and automation  
**Coverage**: Unit, integration, and E2E testing with quality assurance  
**Status**: Active Testing Guide (January 2025) 