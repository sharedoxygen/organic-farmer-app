# 🔐 User Management System Implementation Notepad

**Enterprise-grade User Management with Role-Based Hierarchy for Next.js Projects**

> 📋 **Use Case**: Implement a complete user management system with hierarchical roles, organizational charts, and admin interfaces.

---

## 📊 System Overview

This notepad provides a complete implementation guide for an enterprise user management system with:
- **6-Level Role Hierarchy**: ADMIN → OFFICE_MANAGER → SALES_LEAD/SERVICE_LEAD → SALES/SERVICE
- **Full CRUD Operations**: Create, read, update, delete users
- **Organizational Chart View**: Visual hierarchy representation
- **Role-Based Permissions**: Granular access control
- **Manager Relationships**: Hierarchical reporting structure

---

## 🗄️ Database Schema (Prisma)

### Core User Model
```prisma
model User {
  id                Int      @id @default(autoincrement())
  username          String   @unique
  password          String
  name              String
  email             String?  @unique
  role              Role     @default(SALES)
  managerId         Int?
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime
  
  // Self-referencing relationship for manager hierarchy
  manager           User?    @relation("UserToUser", fields: [managerId], references: [id])
  directReports     User[]   @relation("UserToUser")
  
  @@index([isActive])
  @@index([managerId])
  @@index([role])
}

enum Role {
  ADMIN
  OFFICE_MANAGER
  SALES_LEAD
  SERVICE_LEAD
  SALES
  SERVICE
}
```

---

## 🔧 API Implementation

### User API Routes

#### `/api/users/route.ts` - List/Create Users
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth/authOptions';

// GET /api/users - Get all users
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: { isActive: true },
      include: {
        manager: {
          select: { id: true, name: true, role: true }
        }
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }]
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check admin permissions
    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) }
    });

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { username, password, name, email, role, managerId } = await request.json();

    // Validate required fields
    if (!username || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        password: hashedPassword,
        name,
        email,
        role,
        managerId: managerId || null
      },
      include: {
        manager: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### `/api/users/[id]/route.ts` - User Details/Update/Delete
```typescript
// GET /api/users/[id] - Get single user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        manager: { select: { id: true, name: true, role: true } },
        directReports: { select: { id: true, name: true, role: true } }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // Implementation for user updates with role-based permissions
  // Include password hashing if password is being updated
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Implementation for user deletion with proper authorization checks
}
```

---

## 🎨 Frontend Implementation

### User Management Page Component
```typescript
// pages/admin/users/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';

interface User {
  id: number;
  username: string;
  name: string;
  email?: string;
  role: string;
  managerId?: number;
  manager?: {
    id: number;
    name: string;
    role: string;
  };
  createdAt: string;
  isActive: boolean;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'hierarchy'>('list');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      ADMIN: 'Administrator',
      OFFICE_MANAGER: 'Manager',
      SALES_LEAD: 'Sales Lead',
      SERVICE_LEAD: 'Service Lead',
      SALES: 'Sales Agent',
      SERVICE: 'Service Agent'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  return (
    <div className="user-management-container">
      <div className="header">
        <h1>User Management</h1>
        <div className="header-actions">
          <button 
            className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
          <button 
            className={`view-toggle ${viewMode === 'hierarchy' ? 'active' : ''}`}
            onClick={() => setViewMode('hierarchy')}
          >
            Hierarchy View
          </button>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Add User
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <UserListView users={users} onRefresh={fetchUsers} />
      ) : (
        <UserHierarchyView users={users} />
      )}

      {showCreateForm && (
        <UserCreateModal 
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
```

### Organizational Chart Component
```typescript
// components/admin/OrgChart.tsx
interface OrgChartProps {
  users: User[];
}

export function OrgChart({ users }: OrgChartProps) {
  const buildHierarchy = (usersList: User[]) => {
    const userMap = new Map();
    const children = new Map();
    const roots: User[] = [];

    // Build relationships
    usersList.forEach(user => {
      userMap.set(user.id, user);
      children.set(user.id, []);
    });

    usersList.forEach(user => {
      if (user.managerId && userMap.has(user.managerId)) {
        children.get(user.managerId).push(user);
      } else {
        roots.push(user);
      }
    });

    return { roots, children };
  };

  const { roots, children } = buildHierarchy(users);

  const renderNode = (user: User, level: number = 0) => (
    <div key={user.id} className={`org-node level-${level}`}>
      <div className="user-card">
        <div className="user-info">
          <h4>{user.name}</h4>
          <span className="username">@{user.username}</span>
          <span className={`role-badge ${user.role.toLowerCase()}`}>
            {getRoleDisplayName(user.role)}
          </span>
        </div>
      </div>
      {children.get(user.id)?.length > 0 && (
        <div className="direct-reports">
          {children.get(user.id).map((subordinate: User) => 
            renderNode(subordinate, level + 1)
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="org-chart">
      {roots.map(root => renderNode(root))}
    </div>
  );
}
```

---

## 🔐 Authentication Integration

### NextAuth Configuration
```typescript
// lib/auth/authOptions.ts
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from 'next-auth';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username.toLowerCase() }
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          name: user.name,
          username: user.username,
          role: user.role
        };
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
};
```

---

## 🎯 Role-Based Access Control

### Role Hierarchy Helper
```typescript
// lib/utils/roleHelpers.ts
export const ROLE_HIERARCHY = {
  ADMIN: 6,
  OFFICE_MANAGER: 5,
  SALES_LEAD: 4,
  SERVICE_LEAD: 4,
  SALES: 2,
  SERVICE: 2
};

export const canManageUser = (managerRole: string, targetRole: string): boolean => {
  return ROLE_HIERARCHY[managerRole as keyof typeof ROLE_HIERARCHY] > 
         ROLE_HIERARCHY[targetRole as keyof typeof ROLE_HIERARCHY];
};

export const getPotentialManagers = (users: User[], targetRole: string): User[] => {
  const validManagerRoles = {
    SALES: ['SALES_LEAD'],
    SERVICE: ['SERVICE_LEAD'],
    SALES_LEAD: ['OFFICE_MANAGER', 'ADMIN'],
    SERVICE_LEAD: ['OFFICE_MANAGER', 'ADMIN'],
    OFFICE_MANAGER: ['ADMIN']
  };

  const allowedRoles = validManagerRoles[targetRole as keyof typeof validManagerRoles] || [];
  return users.filter(user => allowedRoles.includes(user.role));
};
```

---

## 📱 Responsive Design & Styling

### CSS Module Example
```css
/* UserManagement.module.css */
.userManagementContainer {
  padding: 1.5rem;
  max-width: 100%;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: 12px;
  color: white;
}

.viewToggle {
  display: flex;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.userGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.userCard {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.userCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.roleBadge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.roleBadge.admin { background: #fee2e2; color: #dc2626; }
.roleBadge.sales_lead { background: #dbeafe; color: #2563eb; }
.roleBadge.service_lead { background: #d1fae5; color: #059669; }
.roleBadge.sales { background: #e0f2fe; color: #0288d1; }
.roleBadge.service { background: #f3e8ff; color: #7c3aed; }
```

---

## 🧪 Testing Strategy

### Unit Tests Example
```typescript
// __tests__/UserApi.test.ts
import { UserApi } from '@/lib/api/apiService';

describe('UserApi', () => {
  it('should fetch users successfully', async () => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, name: 'Test User', role: 'ADMIN' }
        ])
      })
    ) as jest.Mock;

    const users = await UserApi.getUsers();
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('Test User');
  });
});
```

---

## 🚀 Implementation Checklist

### Database Setup
- [ ] Create User model with role hierarchy
- [ ] Add self-referencing manager relationship
- [ ] Create role enum with all hierarchy levels
- [ ] Add proper indexes for performance

### API Routes
- [ ] Implement GET /api/users (list all users)
- [ ] Implement POST /api/users (create user)
- [ ] Implement GET /api/users/[id] (get single user)
- [ ] Implement PATCH /api/users/[id] (update user)
- [ ] Implement DELETE /api/users/[id] (delete user)
- [ ] Add role-based permission checks to all routes

### Frontend Components
- [ ] Create user management page
- [ ] Build user list/grid view
- [ ] Implement organizational chart component
- [ ] Add user creation modal/form
- [ ] Create user edit interface
- [ ] Add search and filtering functionality

### Authentication
- [ ] Configure NextAuth with credentials provider
- [ ] Add role information to JWT tokens
- [ ] Implement role-based route protection
- [ ] Create login/logout functionality

### Styling & UX
- [ ] Create responsive design for all screen sizes
- [ ] Add loading states and error handling
- [ ] Implement smooth transitions and animations
- [ ] Add confirmation dialogs for destructive actions

### Testing
- [ ] Write unit tests for API functions
- [ ] Add integration tests for user flows
- [ ] Test role-based access controls
- [ ] Validate hierarchy relationships

---

## 📚 Additional Resources

- **Role Management**: Consider implementing custom permissions beyond basic roles
- **Audit Logging**: Track user creation, updates, and deletions
- **Bulk Operations**: Add import/export functionality for large user sets  
- **Profile Management**: Allow users to edit their own profiles
- **Password Policies**: Implement password strength requirements
- **Two-Factor Auth**: Add 2FA for enhanced security

---

**💡 Pro Tip**: Start with the basic CRUD operations and role hierarchy, then gradually add advanced features like organizational charts and bulk operations based on your specific needs. 