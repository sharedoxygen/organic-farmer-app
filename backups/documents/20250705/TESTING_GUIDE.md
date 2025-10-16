# Testing Guide & Best Practices

## 🎯 Purpose of Testing

Testing is a critical part of our development process for Next.js applications. It ensures:

- **Quality & Reliability**: That the application functions as expected for users
- **Regression Prevention**: That new changes do not break existing functionality
- **Maintainability**: That code can be refactored and updated with confidence
- **Documentation**: Tests often serve as a form of executable documentation for how components and functions are intended to behave
- **Developer Confidence**: Enables safe refactoring and feature development

All new features and significant bug fixes should be accompanied by appropriate tests.

---

## 🧪 Types of Tests Used

We employ a multi-layered testing strategy:

### 1. Unit Tests

- **Tool**: Jest
- **Purpose**: To test the smallest individual units of code (e.g., functions, hooks, utility classes, or individual React components in isolation) to verify they behave correctly given a set of inputs.
- **Focus**: Isolate the unit under test, often mocking its dependencies.

### 2. Integration Tests

- **Tools**: Jest with React Testing Library (RTL)
- **Purpose**: To test the interaction between several units or components. For frontend, this often means testing how multiple React components render and interact together to fulfill a piece of functionality (e.g., a form submission, a modal dialog).
- **Focus**: Test components from the user's perspective (how they find elements, interact with them) without testing deep implementation details.

### 3. End-to-End (E2E) Tests

- **Tool**: Playwright
- **Purpose**: To test complete user flows through the application from start to finish, simulating real user scenarios in a browser environment.
- **Focus**: Validate that entire features work as expected across different parts of the system (frontend, backend APIs, database interactions at a high level).

---

## 🛠️ Tools & Technologies

- **Jest**: JavaScript testing framework used for unit and integration tests.
- **React Testing Library (RTL)**: Utilities for testing React components in a user-centric way, used with Jest.
- **Playwright**: Framework for reliable end-to-end testing across modern browsers.

---

## 📁 Test File Location & Naming Conventions

- **Unit & Integration Tests (Jest/RTL)**:
  - Located in `__tests__` directories alongside the code they are testing (e.g., `src/components/MyComponent/__tests__/MyComponent.test.tsx`).
  - Files are named `*.test.ts` or `*.test.tsx`.
- **End-to-End Tests (Playwright)**:
  - Located in the root `e2e/` directory or `tests/e2e/`
  - Files are named `*.spec.ts` (e.g., `e2e/auth.spec.ts`, `e2e/user-workflows.spec.ts`)

---

## ✍️ Writing Tests - General Guidelines

- **Clarity & Readability**: Tests should be easy to understand. Use descriptive names for `describe` and `it` blocks.
- **Behavior, Not Implementation**: Test _what_ the code does from an external perspective, not _how_ it does it internally. This makes tests less brittle to refactoring.
- **Independence**: Each test case (`it` block) should be independent and not rely on the state or outcome of other tests. They should be runnable in any order.
- **AAA Pattern (Arrange, Act, Assert)**: Structure your tests clearly:
  - **Arrange**: Set up the necessary preconditions and inputs.
  - **Act**: Execute the function/component/interaction you are testing.
  - **Assert**: Verify that the outcome is as expected.
- **Mocking**: For unit/integration tests, mock external dependencies (e.g., API calls, browser APIs not available in Node) to isolate the unit under test and make tests deterministic and fast. Jest provides powerful mocking capabilities.
- **Avoid Over-Mocking**: For integration tests, try to use real component instances where possible to test their actual integration.

---

## ⏱️ When to Write Tests

- **New Features**: All new features must include:
  - Unit tests for new helper functions, complex logic, or specific component states.
  - Integration tests for new components and their interactions.
  - E2E tests for critical user flows introduced by the feature.
- **Bug Fixes**: Any bug fix should be accompanied by a regression test that specifically covers the scenario of the bug to ensure it doesn't reappear.
- **Refactoring**: When refactoring code, existing tests should still pass. If the refactor changes public APIs or user-visible behavior, tests may need to be updated accordingly.

---

## 🚀 Running Tests

Tests can be run using npm scripts defined in `package.json`:

- **`npm run test`**: Runs all Jest unit and integration tests.
- **`npm run test:watch`**: Runs Jest tests in watch mode, re-running tests related to changed files.
- **`npm run test:coverage`**: Runs Jest tests and generates a code coverage report (viewable in `coverage/lcov-report/index.html`).
- **`npm run test:e2e`**: Runs all Playwright end-to-end tests.

Automated tests are also a key part of our pre-commit hooks (potentially a subset for speed) and the CI/CD pipeline, where all tests must pass before code can be merged or deployed.

---

## 📊 Test Coverage

While we aim for high test coverage, the quality and relevance of tests are more important than raw percentage numbers. Use `npm run test:coverage` to view current coverage and identify untested areas of the codebase.
Focus on covering critical paths, complex logic, and user-facing functionality.

---

## 🤖 Best Practices for AI Assistants & Testing

- **Suggest Tests**: When generating new components, functions, or features, proactively suggest or include basic unit or integration tests that cover the core functionality.
- **Update Existing Tests**: If modifying existing code that has tests, ensure these tests are updated to reflect the changes. If new behavior is introduced, add new test cases.
- **Targeted Test Generation**: You can be prompted to write tests for specific pieces of logic, components, or user interactions.
- **Follow Patterns**: When generating tests, adhere to the existing testing patterns, tools, and file structure outlined in this guide.
- **Verify Testability**: If generating complex or untestable code, flag it or suggest alternative approaches that are more test-friendly.

---

---

## 🧪 Advanced Testing Patterns

### API Route Testing

```typescript
// __tests__/api/users.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/users';
import { prismaMock } from '@/lib/test/prismaMock';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('/api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET returns users list', async () => {
    const mockUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ];

    prismaMock.user.findMany.mockResolvedValue(mockUsers);

    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockUsers);
  });

  it('POST creates new user', async () => {
    const newUser = {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
    };

    prismaMock.user.create.mockResolvedValue(newUser);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Bob Johnson',
        email: 'bob@example.com',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual(newUser);
  });

  it('handles validation errors', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid: bad email format
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const response = JSON.parse(res._getData());
    expect(response.error).toBeDefined();
  });
});
```

### Component Integration Testing

```typescript
// __tests__/components/UserForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import UserForm from '@/components/UserForm/UserForm';

// Setup MSW server
const server = setupServer(
  rest.post('/api/users', (req, res, ctx) => {
    return res(
      ctx.json({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserForm', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<UserForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<UserForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /save/i });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      });
    });
  });

  it('displays validation errors', async () => {
    const user = userEvent.setup();
    render(<UserForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.post('/api/users', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Internal server error' })
        );
      })
    );

    const user = userEvent.setup();
    render(<UserForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /save/i });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
```

### Custom Hook Testing

```typescript
// __tests__/hooks/useUsers.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { useUsers } from '@/hooks/useUsers';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useUsers', () => {
  it('fetches users successfully', async () => {
    const { result } = renderHook(() => useUsers());

    expect(result.current.loading).toBe(true);
    expect(result.current.users).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toHaveLength(2);
    expect(result.current.users[0].name).toBe('John Doe');
    expect(result.current.error).toBeNull();
  });

  it('handles fetch errors', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.users).toEqual([]);
  });
});
```

### E2E Testing Examples

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can log in and log out', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/signin');

    // Fill in credentials
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Log out
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Verify redirect to login
    await expect(page).toHaveURL('/auth/signin');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    await page.fill('[name="username"]', 'invalid');
    await page.fill('[name="password"]', 'invalid');
    await page.click('button[type="submit"]');

    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Invalid credentials');
  });
});
```

```typescript
// e2e/user-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as admin
    await page.goto('/auth/signin');
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'adminpass');
    await page.click('button[type="submit"]');
    
    // Navigate to user management
    await page.goto('/admin/users');
  });

  test('admin can create new user', async ({ page }) => {
    // Click create user button
    await page.click('[data-testid="create-user-button"]');

    // Fill in user form
    await page.fill('[name="name"]', 'New User');
    await page.fill('[name="email"]', 'newuser@example.com');
    await page.selectOption('[name="role"]', 'USER');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify user appears in list
    await expect(page.locator('[data-testid="user-list"]'))
      .toContainText('New User');
    await expect(page.locator('[data-testid="user-list"]'))
      .toContainText('newuser@example.com');
  });

  test('admin can edit existing user', async ({ page }) => {
    // Click edit button for first user
    await page.click('[data-testid="edit-user-button"]');

    // Update user name
    await page.fill('[name="name"]', 'Updated Name');
    await page.click('button[type="submit"]');

    // Verify update
    await expect(page.locator('[data-testid="user-list"]'))
      .toContainText('Updated Name');
  });
});
```

---

## 🏢 Multi-Tenant Testing Patterns

### Testing Farm Isolation

```typescript
// __tests__/api/multi-tenant/farm-isolation.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/batches';
import { prismaMock } from '@/lib/test/prismaMock';

describe('Multi-Tenant API Isolation', () => {
  it('only returns data for current farm', async () => {
    const farm1Batches = [
      { id: '1', farm_id: 'farm-1', batchNumber: 'B001' },
      { id: '2', farm_id: 'farm-1', batchNumber: 'B002' },
    ];
    
    prismaMock.batches.findMany.mockResolvedValue(farm1Batches);

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        'X-Farm-ID': 'farm-1',
      },
    });

    await handler(req, res);

    expect(prismaMock.batches.findMany).toHaveBeenCalledWith({
      where: { farm_id: 'farm-1' },
    });
    
    expect(res._getStatusCode()).toBe(200);
    const response = JSON.parse(res._getData());
    expect(response).toHaveLength(2);
    expect(response.every(b => b.farm_id === 'farm-1')).toBe(true);
  });

  it('prevents cross-farm data access', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        'X-Farm-ID': 'farm-1',
      },
      query: {
        batchId: 'batch-from-farm-2',
      },
    });

    prismaMock.batches.findFirst.mockResolvedValue(null);

    await handler(req, res);

    expect(prismaMock.batches.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'batch-from-farm-2',
        farm_id: 'farm-1', // Ensures farm isolation
      },
    });
    
    expect(res._getStatusCode()).toBe(404);
  });
});
```

### Testing Farm Context

```typescript
// __tests__/components/FarmContext.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TenantProvider, useTenant } from '@/lib/context/TenantContext';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/user/farms', (req, res, ctx) => {
    return res(ctx.json([
      { id: 'farm-1', farm_name: 'Farm One', role: 'FARM_MANAGER' },
      { id: 'farm-2', farm_name: 'Farm Two', role: 'TEAM_MEMBER' },
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Test component that uses tenant context
function TestComponent() {
  const { currentFarm, availableFarms, switchFarm } = useTenant();
  
  return (
    <div>
      <div data-testid="current-farm">{currentFarm?.farm_name || 'None'}</div>
      <select
        data-testid="farm-selector"
        value={currentFarm?.id || ''}
        onChange={(e) => switchFarm(e.target.value)}
      >
        {availableFarms.map(farm => (
          <option key={farm.id} value={farm.id}>
            {farm.farm_name}
          </option>
        ))}
      </select>
    </div>
  );
}

describe('TenantProvider', () => {
  it('loads and displays available farms', async () => {
    render(
      <TenantProvider>
        <TestComponent />
      </TenantProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-farm')).toHaveTextContent('Farm One');
    });

    const selector = screen.getByTestId('farm-selector');
    expect(selector).toHaveValue('farm-1');
    expect(selector.children).toHaveLength(2);
  });

  it('allows switching between farms', async () => {
    const user = userEvent.setup();
    
    render(
      <TenantProvider>
        <TestComponent />
      </TenantProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-farm')).toHaveTextContent('Farm One');
    });

    const selector = screen.getByTestId('farm-selector');
    await user.selectOptions(selector, 'farm-2');

    await waitFor(() => {
      expect(screen.getByTestId('current-farm')).toHaveTextContent('Farm Two');
    });
  });
});
```

### Testing Farm-Scoped Hooks

```typescript
// __tests__/hooks/useFarmBatches.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { useFarmBatches } from '@/hooks/useFarmBatches';
import { TenantProvider } from '@/lib/context/TenantContext';

const server = setupServer(
  rest.get('/api/farms/:farmId/batches', (req, res, ctx) => {
    const { farmId } = req.params;
    return res(ctx.json([
      { id: '1', farm_id: farmId, batchNumber: 'B001' },
      { id: '2', farm_id: farmId, batchNumber: 'B002' },
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useFarmBatches', () => {
  const wrapper = ({ children }) => (
    <TenantProvider>{children}</TenantProvider>
  );

  it('fetches batches for current farm', async () => {
    const { result } = renderHook(() => useFarmBatches(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.batches).toHaveLength(2);
    expect(result.current.batches[0].batchNumber).toBe('B001');
  });

  it('refetches when farm changes', async () => {
    // Mock farm switch event
    const { result, rerender } = renderHook(() => useFarmBatches(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialBatches = result.current.batches;

    // Simulate farm switch
    server.use(
      rest.get('/api/farms/:farmId/batches', (req, res, ctx) => {
        return res(ctx.json([
          { id: '3', farm_id: 'farm-2', batchNumber: 'B003' },
        ]));
      })
    );

    // Trigger rerender after farm switch
    rerender();

    await waitFor(() => {
      expect(result.current.batches).not.toEqual(initialBatches);
    });

    expect(result.current.batches).toHaveLength(1);
    expect(result.current.batches[0].batchNumber).toBe('B003');
  });
});
```

### E2E Multi-Tenant Tests

```typescript
// e2e/multi-tenant.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Multi-Tenant Features', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as user with multiple farms
    await page.goto('/auth/signin');
    await page.fill('[name="username"]', 'multifarmer');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('user can switch between farms', async ({ page }) => {
    // Verify initial farm
    await expect(page.locator('[data-testid="current-farm"]'))
      .toContainText('Farm One');

    // Open farm selector
    await page.click('[data-testid="farm-selector"]');
    
    // Select different farm
    await page.selectOption('[data-testid="farm-selector"]', 'farm-2');

    // Verify farm switched
    await expect(page.locator('[data-testid="current-farm"]'))
      .toContainText('Farm Two');

    // Verify data updated
    await page.goto('/production/batches');
    await expect(page.locator('[data-testid="batch-list"]'))
      .toContainText('Farm Two Batches');
  });

  test('data isolation between farms', async ({ page }) => {
    // Go to batches page for Farm One
    await page.goto('/production/batches');
    
    // Verify Farm One batches
    await expect(page.locator('[data-testid="batch-B001"]')).toBeVisible();
    await expect(page.locator('[data-testid="batch-B002"]')).toBeVisible();

    // Switch to Farm Two
    await page.selectOption('[data-testid="farm-selector"]', 'farm-2');
    
    // Wait for data refresh
    await page.waitForLoadState('networkidle');

    // Verify Farm One batches not visible
    await expect(page.locator('[data-testid="batch-B001"]')).not.toBeVisible();
    
    // Verify Farm Two batches visible
    await expect(page.locator('[data-testid="batch-B003"]')).toBeVisible();
  });

  test('global admin sees aggregate data', async ({ page }) => {
    // Log out and log in as global admin
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout"]');
    
    await page.fill('[name="username"]', 'admin@curryislandmicrogreens.com');
    await page.fill('[name="password"]', 'adminpass');
    await page.click('button[type="submit"]');

    // Navigate to admin dashboard
    await page.goto('/admin');

    // Verify aggregate metrics
    await expect(page.locator('[data-testid="total-farms"]'))
      .toContainText('2');
    await expect(page.locator('[data-testid="total-users"]'))
      .toContainText('13');
    await expect(page.locator('[data-testid="total-batches"]'))
      .toContainText('123');

    // Click on a farm card
    await page.click('[data-testid="farm-card-farm-1"]');

    // Verify navigation to farm details
    await expect(page).toHaveURL('/admin/farms/farm-1');
    await expect(page.locator('h1')).toContainText('Farm One Details');
  });
});
```

### Testing Farm Permissions

```typescript
// __tests__/permissions/farm-permissions.test.ts
import { canAccessFarm, canManageFarm, canViewFinancials } from '@/lib/permissions/farmPermissions';

describe('Farm Permissions', () => {
  describe('canAccessFarm', () => {
    it('allows farm members to access their farm', () => {
      const farmUser = {
        farm_id: 'farm-1',
        user_id: 'user-1',
        role: 'TEAM_MEMBER',
      };

      expect(canAccessFarm(farmUser, 'farm-1')).toBe(true);
    });

    it('prevents access to other farms', () => {
      const farmUser = {
        farm_id: 'farm-1',
        user_id: 'user-1',
        role: 'TEAM_MEMBER',
      };

      expect(canAccessFarm(farmUser, 'farm-2')).toBe(false);
    });

    it('allows global admin to access any farm', () => {
      const globalAdmin = {
        farm_id: 'global',
        user_id: 'admin-1',
        role: 'ADMIN',
      };

      expect(canAccessFarm(globalAdmin, 'farm-1')).toBe(true);
      expect(canAccessFarm(globalAdmin, 'farm-2')).toBe(true);
    });
  });

  describe('canManageFarm', () => {
    it('allows farm owner to manage farm', () => {
      const owner = {
        farm_id: 'farm-1',
        user_id: 'user-1',
        role: 'OWNER',
      };

      expect(canManageFarm(owner)).toBe(true);
    });

    it('allows farm manager to manage farm', () => {
      const manager = {
        farm_id: 'farm-1',
        user_id: 'user-2',
        role: 'FARM_MANAGER',
      };

      expect(canManageFarm(manager)).toBe(true);
    });

    it('prevents team members from managing farm', () => {
      const member = {
        farm_id: 'farm-1',
        user_id: 'user-3',
        role: 'TEAM_MEMBER',
      };

      expect(canManageFarm(member)).toBe(false);
    });
  });
});
```

---

## 🔧 Test Configuration

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
```

### Jest Setup File

```typescript
// jest.setup.js
import '@testing-library/jest-dom';
import { server } from './src/lib/test/mswServer';

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
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
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3005',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 📊 Testing Metrics & Coverage

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### Quality Gates

- **Unit Test Coverage**: Minimum 80% for utilities and services
- **Integration Test Coverage**: All API routes and critical components
- **E2E Test Coverage**: All critical user flows
- **Performance**: Tests should complete within acceptable time limits

### Continuous Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

Adhering to these comprehensive testing guidelines ensures maintainance of a high-quality, robust, and reliable application with confidence in deployments and feature development.
