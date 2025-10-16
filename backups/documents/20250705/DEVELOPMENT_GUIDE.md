# Development Guide & Best Practices

## 🎯 Overview

This guide provides comprehensive development workflows, architectural patterns, and best practices for Next.js projects. It covers everything from local development setup to production deployment.

---

## 🏗️ Architecture Patterns

### Centralized Service Layer

All API interactions should go through a centralized service layer to ensure consistency, error handling, and data synchronization.

#### API Service Structure

```typescript
// lib/api/apiService.ts
class APIService {
  private baseURL: string;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // User operations
  async getUsers() {
    return this.request<User[]>('/users');
  }

  async createUser(userData: CreateUserData) {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: UpdateUserData) {
    return this.request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new APIService();
```

#### Event-Based Data Refresh System

Implement a global event system to notify components when data changes:

```typescript
// lib/events/dataEvents.ts
class DataRefreshEmitter extends EventTarget {
  emit(eventType: string, detail?: any) {
    this.dispatchEvent(new CustomEvent(eventType, { detail }));
  }
}

export const dataRefreshEmitter = new DataRefreshEmitter();

// Event types
export const DATA_EVENTS = {
  USER_UPDATED: 'USER_UPDATED',
  USER_CREATED: 'USER_CREATED',
  USER_DELETED: 'USER_DELETED',
  DATA_REFRESH_NEEDED: 'DATA_REFRESH_NEEDED',
} as const;
```

#### Component Data Integration

```typescript
// components/UserList.tsx
import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api/apiService';
import { dataRefreshEmitter, DATA_EVENTS } from '@/lib/events/dataEvents';

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await apiService.getUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Listen for data refresh events
    const handleDataRefresh = () => {
      fetchUsers();
    };

    dataRefreshEmitter.addEventListener(DATA_EVENTS.USER_UPDATED, handleDataRefresh);
    dataRefreshEmitter.addEventListener(DATA_EVENTS.USER_CREATED, handleDataRefresh);
    dataRefreshEmitter.addEventListener(DATA_EVENTS.USER_DELETED, handleDataRefresh);

    return () => {
      dataRefreshEmitter.removeEventListener(DATA_EVENTS.USER_UPDATED, handleDataRefresh);
      dataRefreshEmitter.removeEventListener(DATA_EVENTS.USER_CREATED, handleDataRefresh);
      dataRefreshEmitter.removeEventListener(DATA_EVENTS.USER_DELETED, handleDataRefresh);
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

---

## 🔧 Development Workflow

### Local Development Setup

#### Environment Configuration

```bash
# Clone repository
git clone <repository-url>
cd project-name

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Initialize database
npm run db:setup

# Start development server
npm run dev
```

#### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:watch": "next dev --turbo",
    "dev:monitor": "concurrently \"npm run dev\" \"npm run monitor:logs\"",
    "build": "next build",
    "build:clean": "rm -rf .next && npm run build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### Multi-Environment Management

#### Environment-Specific Development

```bash
# Development environment (port 3005)
npm run dev

# Test environment (port 7035)
npm run test:deploy

# Production build testing
npm run build && npm run start
```

#### Environment Configuration

```typescript
// lib/config/environment.ts
const environments = {
  development: {
    port: 3005,
    database: 'app_dev',
    debug: true,
    hotReload: true,
  },
  test: {
    port: 7035,
    database: 'app_test',
    debug: false,
    hotReload: false,
  },
  staging: {
    port: 3007,
    database: 'app_staging',
    debug: false,
    hotReload: false,
  },
  production: {
    port: 3005,
    database: 'app_prod',
    debug: false,
    hotReload: false,
  },
};

export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return environments[env as keyof typeof environments];
};
```

---

## 🎨 Component Development Standards

### Component Structure

```typescript
// components/UserProfile/UserProfile.tsx
import { useState, useEffect } from 'react';
import styles from './UserProfile.module.css';
import { User } from '@/types/user';
import { apiService } from '@/lib/api/apiService';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
  className?: string;
}

export default function UserProfile({ 
  userId, 
  onUpdate, 
  className 
}: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await apiService.getUser(userId);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleUpdate = async (updatedData: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = await apiService.updateUser(user.id, updatedData);
      setUser(updatedUser);
      onUpdate?.(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading user profile...</div>;
  }

  if (!user) {
    return <div className={styles.error}>User not found</div>;
  }

  return (
    <Card className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>{user.name}</h2>
        <Button 
          variant="secondary" 
          onClick={() => setEditing(!editing)}
        >
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </div>
      
      {editing ? (
        <UserEditForm 
          user={user} 
          onSave={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <UserDetails user={user} />
      )}
    </Card>
  );
}
```

#### Component CSS Module

```css
/* components/UserProfile/UserProfile.module.css */
.container {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.title {
  color: var(--text-dark);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.loading, .error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--text-medium);
  font-size: var(--font-size-lg);
}

.error {
  color: var(--danger-color);
}

/* Responsive design */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: stretch;
  }

  .title {
    font-size: var(--font-size-lg);
    text-align: center;
  }
}
```

---

## 🗄️ Data Management Patterns

### Data Integrity Service

```typescript
// lib/services/dataIntegrityService.ts
class DataIntegrityService {
  async createUserWithIntegrity(userData: CreateUserData): Promise<User> {
    // Validate data before creation
    this.validateUserData(userData);
    
    // Check for duplicates
    await this.checkForDuplicateUser(userData.email);
    
    // Create user with proper relationships
    const user = await apiService.createUser(userData);
    
    // Emit data refresh event
    dataRefreshEmitter.emit(DATA_EVENTS.USER_CREATED, { user });
    
    return user;
  }

  async updateUserWithIntegrity(
    userId: string, 
    updateData: UpdateUserData
  ): Promise<User> {
    // Validate update data
    this.validateUpdateData(updateData);
    
    // Check business rules
    await this.validateBusinessRules(userId, updateData);
    
    // Update user
    const user = await apiService.updateUser(userId, updateData);
    
    // Emit data refresh event
    dataRefreshEmitter.emit(DATA_EVENTS.USER_UPDATED, { user });
    
    return user;
  }

  private validateUserData(userData: CreateUserData): void {
    if (!userData.email || !userData.name) {
      throw new Error('Email and name are required');
    }
    
    if (!this.isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }
  }

  private async checkForDuplicateUser(email: string): Promise<void> {
    const existingUser = await apiService.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const dataIntegrityService = new DataIntegrityService();
```

### Custom Hooks for Data Management

```typescript
// hooks/useUsers.ts
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api/apiService';
import { dataRefreshEmitter, DATA_EVENTS } from '@/lib/events/dataEvents';
import { User } from '@/types/user';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await apiService.getUsers();
      setUsers(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserData) => {
    try {
      const newUser = await dataIntegrityService.createUserWithIntegrity(userData);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    }
  };

  const updateUser = async (userId: string, updateData: UpdateUserData) => {
    try {
      const updatedUser = await dataIntegrityService.updateUserWithIntegrity(
        userId, 
        updateData
      );
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await apiService.deleteUser(userId);
      dataRefreshEmitter.emit(DATA_EVENTS.USER_DELETED, { userId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();

    const handleDataRefresh = () => {
      fetchUsers();
    };

    dataRefreshEmitter.addEventListener(DATA_EVENTS.USER_CREATED, handleDataRefresh);
    dataRefreshEmitter.addEventListener(DATA_EVENTS.USER_UPDATED, handleDataRefresh);
    dataRefreshEmitter.addEventListener(DATA_EVENTS.USER_DELETED, handleDataRefresh);

    return () => {
      dataRefreshEmitter.removeEventListener(DATA_EVENTS.USER_CREATED, handleDataRefresh);
      dataRefreshEmitter.removeEventListener(DATA_EVENTS.USER_UPDATED, handleDataRefresh);
      dataRefreshEmitter.removeEventListener(DATA_EVENTS.USER_DELETED, handleDataRefresh);
    };
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
}
```

---

## 🔐 Authentication & Authorization Patterns

### Multi-Role Helper Functions

```typescript
// lib/auth/roleUtils.ts
export function getEffectiveRole(roles: string[]): string {
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

export function hasRole(userRoles: string[], requiredRole: string): boolean {
  return userRoles.includes(requiredRole);
}

export function hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

export function canManageRole(userRoles: string[], targetRole: string): boolean {
  const effectiveRole = getEffectiveRole(userRoles);
  const rolePriority = {
    'ADMIN': 1,
    'MANAGER': 2,
    'TEAM_LEAD': 3,
    'SPECIALIST_LEAD': 3,
    'TEAM_MEMBER': 4,
    'SPECIALIST': 4
  };
  
  return rolePriority[effectiveRole] < rolePriority[targetRole];
}
```

### NextAuth Configuration

```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import { getEffectiveRole } from '@/lib/auth/roleUtils';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user || !await compare(credentials.password, user.password)) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles || [user.role], // Support multi-role and backward compatibility
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.roles = user.roles;
        token.effectiveRole = getEffectiveRole(user.roles);
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.roles = token.roles;
        session.user.effectiveRole = token.effectiveRole;
        session.user.role = token.effectiveRole; // Backward compatibility
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});
```

### Route Protection Middleware

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isApiRoute = req.nextUrl.pathname.startsWith('/api');
    const isPublicPage = req.nextUrl.pathname === '/' || 
                        req.nextUrl.pathname.startsWith('/public');

    // Redirect authenticated users away from auth pages
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Allow public pages and API routes
    if (isPublicPage || isApiRoute) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users to sign in
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Multi-role-based access control
    const userRoles = token.roles as string[] || [];
    const effectiveRole = token.effectiveRole as string;
    const protectedAdminRoutes = ['/admin', '/users/manage'];
    const protectedManagerRoutes = ['/reports', '/analytics'];

    // Helper function to check if user has required role
    const hasRole = (requiredRole: string) => userRoles.includes(requiredRole);
    const hasAnyRole = (requiredRoles: string[]) => requiredRoles.some(role => userRoles.includes(role));

    if (protectedAdminRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
      if (!hasRole('ADMIN')) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    if (protectedManagerRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
      if (!hasAnyRole(['ADMIN', 'MANAGER'])) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Multi-Role Management Components

```typescript
// components/RoleManager/RoleManager.tsx
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { hasRole, canManageRole } from '@/lib/auth/roleUtils';

interface RoleManagerProps {
  userId: string;
  currentRoles: string[];
  onRoleUpdate: (userId: string, newRoles: string[]) => void;
}

export default function RoleManager({ userId, currentRoles, onRoleUpdate }: RoleManagerProps) {
  const { data: session } = useSession();
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles);
  const [isUpdating, setIsUpdating] = useState(false);

  const availableRoles = ['ADMIN', 'MANAGER', 'TEAM_LEAD', 'SPECIALIST_LEAD', 'TEAM_MEMBER', 'SPECIALIST'];
  const userRoles = session?.user?.roles || [];

  const handleRoleToggle = (role: string) => {
    if (!canManageRole(userRoles, role)) return;

    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await onRoleUpdate(userId, selectedRoles);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="role-manager">
      <h3>Manage User Roles</h3>
      <div className="role-checkboxes">
        {availableRoles.map(role => (
          <label key={role} className="role-checkbox">
            <input
              type="checkbox"
              checked={selectedRoles.includes(role)}
              onChange={() => handleRoleToggle(role)}
              disabled={!canManageRole(userRoles, role) || isUpdating}
            />
            <span className={`role-label role-${role.toLowerCase()}`}>
              {role}
            </span>
            {!canManageRole(userRoles, role) && (
              <span className="permission-note">
                (Insufficient permissions)
              </span>
            )}
          </label>
        ))}
      </div>
      
      {selectedRoles.length > 0 && (
        <div className="effective-role-display">
          <strong>Effective Role: </strong>
          <span className="effective-role">
            {getEffectiveRole(selectedRoles)}
          </span>
        </div>
      )}

      <div className="actions">
        <button 
          onClick={handleSave}
          disabled={isUpdating || JSON.stringify(selectedRoles) === JSON.stringify(currentRoles)}
        >
          {isUpdating ? 'Updating...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
```

### Role-Based Component Access

```typescript
// components/RoleGuard/RoleGuard.tsx
import { useSession } from 'next-auth/react';
import { hasRole, hasAnyRole } from '@/lib/auth/roleUtils';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export default function RoleGuard({ 
  children, 
  requiredRole, 
  requiredRoles, 
  fallback = null 
}: RoleGuardProps) {
  const { data: session } = useSession();
  const userRoles = session?.user?.roles || [];

  const hasPermission = requiredRole 
    ? hasRole(userRoles, requiredRole)
    : requiredRoles 
    ? hasAnyRole(userRoles, requiredRoles)
    : true;

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

### Usage Examples

```typescript
// Example: Dashboard with role-based sections
export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {/* Everyone can see this */}
      <PersonalStats />
      
      {/* Only team leads and above */}
      <RoleGuard requiredRoles={['TEAM_LEAD', 'SPECIALIST_LEAD', 'MANAGER', 'ADMIN']}>
        <TeamManagement />
      </RoleGuard>
      
      {/* Only managers and admins */}
      <RoleGuard requiredRoles={['MANAGER', 'ADMIN']}>
        <OrganizationReports />
      </RoleGuard>
      
      {/* Only admins */}
      <RoleGuard requiredRole="ADMIN">
        <SystemSettings />
      </RoleGuard>
    </div>
  );
}

// Example: User management with multi-role support
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  
  const handleRoleUpdate = async (userId: string, newRoles: string[]) => {
    try {
      const response = await fetch(`/api/users/${userId}/roles`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: newRoles }),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => prev.map(user => 
          user.id === userId ? updatedUser : user
        ));
      }
    } catch (error) {
      console.error('Failed to update user roles:', error);
    }
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>
      {users.map(user => (
        <div key={user.id} className="user-card">
          <div className="user-info">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <div className="current-roles">
              Current Roles: {user.roles.join(', ')}
            </div>
            <div className="effective-role">
              Effective Role: {getEffectiveRole(user.roles)}
            </div>
          </div>
          
          <RoleManager
            userId={user.id}
            currentRoles={user.roles}
            onRoleUpdate={handleRoleUpdate}
          />
        </div>
      ))}
    </div>
  );
}
```

---

## 🏢 Multi-Tenant Development Patterns

### Tenant Context Management

```typescript
// lib/context/TenantContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { Farm, FarmUser } from '@/types';
import { tenantApiService } from '@/lib/api/tenantApiService';

interface TenantContextType {
  currentFarm: Farm | null;
  availableFarms: Farm[];
  switchFarm: (farmId: string) => Promise<void>;
  isGlobalAdmin: boolean;
  farmRole: string | null;
  permissions: string[];
}

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [currentFarm, setCurrentFarm] = useState<Farm | null>(null);
  const [availableFarms, setAvailableFarms] = useState<Farm[]>([]);
  const [farmUser, setFarmUser] = useState<FarmUser | null>(null);

  useEffect(() => {
    const loadFarmContext = async () => {
      try {
        const farms = await tenantApiService.getUserFarms();
        setAvailableFarms(farms);
        
        if (farms.length > 0) {
          const defaultFarm = farms[0];
          setCurrentFarm(defaultFarm);
          const farmUserData = await tenantApiService.getFarmUser(defaultFarm.id);
          setFarmUser(farmUserData);
        }
      } catch (error) {
        console.error('Failed to load farm context:', error);
      }
    };

    loadFarmContext();
  }, []);

  const switchFarm = async (farmId: string) => {
    try {
      const farm = availableFarms.find(f => f.id === farmId);
      if (!farm) throw new Error('Farm not found');
      
      setCurrentFarm(farm);
      const farmUserData = await tenantApiService.getFarmUser(farmId);
      setFarmUser(farmUserData);
      
      // Update API service context
      tenantApiService.setCurrentFarm(farmId);
      
      // Emit farm switch event
      dataRefreshEmitter.emit('FARM_SWITCHED', { farmId });
    } catch (error) {
      console.error('Failed to switch farm:', error);
      throw error;
    }
  };

  const value = {
    currentFarm,
    availableFarms,
    switchFarm,
    isGlobalAdmin: farmUser?.role === 'ADMIN' && currentFarm?.id === 'global',
    farmRole: farmUser?.role || null,
    permissions: farmUser?.permissions || [],
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};
```

### Tenant-Aware API Service

```typescript
// lib/api/tenantApiService.ts
class TenantApiService extends APIService {
  private currentFarmId: string | null = null;

  setCurrentFarm(farmId: string) {
    this.currentFarmId = farmId;
  }

  // Override base request to include farm context
  protected async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.currentFarmId && { 'X-Farm-ID': this.currentFarmId }),
      ...options?.headers,
    };

    return super.request<T>(endpoint, { ...options, headers });
  }

  // Farm-specific operations
  async getBatches() {
    if (!this.currentFarmId) throw new Error('No farm selected');
    return this.request<Batch[]>(`/farms/${this.currentFarmId}/batches`);
  }

  async createBatch(data: CreateBatchData) {
    if (!this.currentFarmId) throw new Error('No farm selected');
    return this.request<Batch>(`/farms/${this.currentFarmId}/batches`, {
      method: 'POST',
      body: JSON.stringify({ ...data, farm_id: this.currentFarmId }),
    });
  }

  // Global admin operations
  async getAllFarms() {
    return this.request<Farm[]>('/admin/farms');
  }

  async getFarmStats(farmId?: string) {
    const endpoint = farmId 
      ? `/admin/farms/${farmId}/stats`
      : '/admin/farms/stats';
    return this.request<FarmStats>(endpoint);
  }
}

export const tenantApiService = new TenantApiService();
```

### Farm-Scoped Components

```typescript
// components/FarmSelector/FarmSelector.tsx
import { useTenant } from '@/lib/context/TenantContext';
import styles from './FarmSelector.module.css';

export default function FarmSelector() {
  const { currentFarm, availableFarms, switchFarm } = useTenant();

  if (availableFarms.length <= 1) return null;

  return (
    <div className={styles.selector}>
      <label className={styles.label}>Current Farm:</label>
      <select
        value={currentFarm?.id || ''}
        onChange={(e) => switchFarm(e.target.value)}
        className={styles.dropdown}
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
```

### Multi-Tenant Data Hooks

```typescript
// hooks/useFarmData.ts
import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { tenantApiService } from '@/lib/api/tenantApiService';
import { dataRefreshEmitter } from '@/lib/events/dataEvents';

export function useFarmBatches() {
  const { currentFarm } = useTenant();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    if (!currentFarm) return;
    
    try {
      setLoading(true);
      const data = await tenantApiService.getBatches();
      setBatches(data);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();

    // Refetch on farm switch
    const handleFarmSwitch = () => fetchBatches();
    dataRefreshEmitter.addEventListener('FARM_SWITCHED', handleFarmSwitch);

    return () => {
      dataRefreshEmitter.removeEventListener('FARM_SWITCHED', handleFarmSwitch);
    };
  }, [currentFarm]);

  return { batches, loading, refetch: fetchBatches };
}
```

### Global Admin Dashboard Pattern

```typescript
// components/admin/GlobalDashboard.tsx
import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { tenantApiService } from '@/lib/api/tenantApiService';

export default function GlobalDashboard() {
  const { isGlobalAdmin } = useTenant();
  const [farmStats, setFarmStats] = useState<FarmStats[]>([]);

  useEffect(() => {
    if (!isGlobalAdmin) return;

    const fetchGlobalStats = async () => {
      try {
        const stats = await tenantApiService.getAllFarmStats();
        setFarmStats(stats);
      } catch (error) {
        console.error('Failed to fetch global stats:', error);
      }
    };

    fetchGlobalStats();
  }, [isGlobalAdmin]);

  if (!isGlobalAdmin) {
    return <div>Access denied. Global admin required.</div>;
  }

  return (
    <div className="global-dashboard">
      <h1>Global Admin Dashboard</h1>
      
      <div className="farm-stats-grid">
        {farmStats.map(farm => (
          <FarmStatCard key={farm.id} farm={farm} />
        ))}
      </div>
      
      <div className="aggregate-metrics">
        <MetricCard
          title="Total Farms"
          value={farmStats.length}
        />
        <MetricCard
          title="Total Users"
          value={farmStats.reduce((sum, f) => sum + f.userCount, 0)}
        />
        <MetricCard
          title="Total Revenue"
          value={farmStats.reduce((sum, f) => sum + f.revenue, 0)}
        />
      </div>
    </div>
  );
}
```

### Multi-Tenant Testing Patterns

```typescript
// __tests__/tenant/farmSwitch.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TenantProvider } from '@/lib/context/TenantContext';
import FarmSelector from '@/components/FarmSelector';

const mockFarms = [
  { id: 'farm1', farm_name: 'Farm One' },
  { id: 'farm2', farm_name: 'Farm Two' },
];

describe('Farm Switching', () => {
  it('allows switching between farms', async () => {
    const user = userEvent.setup();
    
    render(
      <TenantProvider>
        <FarmSelector />
      </TenantProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Farm One')).toBeInTheDocument();
    });

    const selector = screen.getByRole('combobox');
    await user.selectOptions(selector, 'farm2');

    expect(selector).toHaveValue('farm2');
  });
});
```

---

## 🧪 Testing Patterns

### Component Testing

```typescript
// __tests__/components/UserProfile.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import UserProfile from '@/components/UserProfile/UserProfile';

// Mock API responses
const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    }));
  }),
  rest.patch('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({
      id: '1',
      name: 'John Updated',
      email: 'john@example.com',
      role: 'USER',
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserProfile', () => {
  it('renders user profile correctly', async () => {
    render(<UserProfile userId="1" />);

    expect(screen.getByText('Loading user profile...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('allows editing user profile', async () => {
    const user = userEvent.setup();
    const mockOnUpdate = jest.fn();

    render(<UserProfile userId="1" onUpdate={mockOnUpdate} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
```

### API Route Testing

```typescript
// __tests__/api/users.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/users/[id]';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('/api/users/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET returns user when found', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const { req, res } = createMocks({
      method: 'GET',
      query: { id: '1' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockUser);
  });

  it('PATCH updates user successfully', async () => {
    const updatedUser = {
      id: '1',
      name: 'John Updated',
      email: 'john@example.com',
      role: 'USER',
    };

    (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

    const { req, res } = createMocks({
      method: 'PATCH',
      query: { id: '1' },
      body: { name: 'John Updated' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(updatedUser);
  });
});
```

---

## 🚀 Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npm run analyze

# Monitor performance
npm run perf:monitor
```

### Optimization Strategies

```typescript
// lib/utils/performance.ts
import dynamic from 'next/dynamic';
import { lazy } from 'react';

// Dynamic imports for code splitting
export const LazyUserProfile = dynamic(
  () => import('@/components/UserProfile/UserProfile'),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);

// Image optimization
export function OptimizedImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      {...props}
    />
  );
}

// Debounced search
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 📊 Monitoring & Analytics

### Performance Monitoring

```typescript
// lib/monitoring/performance.ts
export function measurePerformance(name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - start;
        
        console.log(`${name} took ${duration.toFixed(2)}ms`);
        
        // Send to analytics service
        if (typeof window !== 'undefined') {
          window.gtag?.('event', 'performance', {
            custom_parameter_name: name,
            value: Math.round(duration),
          });
        }
        
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        console.error(`${name} failed after ${duration.toFixed(2)}ms:`, error);
        throw error;
      }
    };

    return descriptor;
  };
}
```

### Error Tracking

```typescript
// lib/monitoring/errorTracking.ts
export class ErrorTracker {
  static captureException(error: Error, context?: any) {
    console.error('Error captured:', error, context);
    
    // Send to error tracking service (Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined') {
      window.Sentry?.captureException(error, {
        extra: context,
      });
    }
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    console[level](message);
    
    if (typeof window !== 'undefined') {
      window.Sentry?.captureMessage(message, level);
    }
  }
}
```

---

## 🔄 Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Build application
        run: npm run build
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Deployment script here
          echo "Deploying to production"
```

---

This development guide provides a comprehensive foundation for building maintainable, scalable Next.js applications with modern development practices and architectural patterns.

**Last Updated**: December 2024  
**Next Review**: March 2025  
**Maintained By**: Development Team 