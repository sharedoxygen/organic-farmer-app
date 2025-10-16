# OFMS Implementation Patterns

**Practical guide for developers implementing features in OFMS. Contains working code templates and patterns.**

*Consolidates: CRUD_IMPLEMENTATION_GUIDE.md + DEVELOPMENT_GUIDE.md patterns + NOTEPAD implementation content*

---

## 🔨 **CRUD Implementation Templates**

### **1. Complete CRUD Hook Pattern**

```typescript
// hooks/useEntityCRUD.ts
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/api/apiService';
import { dataRefreshEmitter, DATA_EVENTS } from '@/lib/events/dataEvents';
import { useTenant } from '@/components/TenantProvider';

interface CRUDHookOptions {
  autoFetch?: boolean;
  enableRealTimeUpdates?: boolean;
}

export function useEntityCRUD<T extends { id: string }>(
  entityType: string,
  options: CRUDHookOptions = {}
) {
  const [entities, setEntities] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentFarmId } = useTenant();

  // Fetch entities with farm scoping
  const fetchEntities = useCallback(async () => {
    if (!currentFarmId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getEntities<T>(entityType, {
        farm_id: currentFarmId
      });
      setEntities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entities');
      console.error(`Failed to fetch ${entityType}:`, err);
    } finally {
      setLoading(false);
    }
  }, [entityType, currentFarmId]);

  // Create entity
  const create = useCallback(async (data: Omit<T, 'id'>) => {
    if (!currentFarmId) throw new Error('No farm context');
    
    try {
      const newEntity = await apiService.createEntity<T>(entityType, {
        ...data,
        farm_id: currentFarmId
      });
      
      setEntities(prev => [...prev, newEntity]);
      dataRefreshEmitter.emit(`${entityType.toUpperCase()}_CREATED`, newEntity);
      
      return newEntity;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create entity';
      setError(errorMessage);
      throw err;
    }
  }, [entityType, currentFarmId]);

  // Update entity
  const update = useCallback(async (id: string, data: Partial<T>) => {
    try {
      const updatedEntity = await apiService.updateEntity<T>(entityType, id, data);
      
      setEntities(prev => prev.map(e => e.id === id ? updatedEntity : e));
      dataRefreshEmitter.emit(`${entityType.toUpperCase()}_UPDATED`, updatedEntity);
      
      return updatedEntity;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update entity';
      setError(errorMessage);
      throw err;
    }
  }, [entityType]);

  // Delete entity
  const remove = useCallback(async (id: string) => {
    try {
      await apiService.deleteEntity(entityType, id);
      
      setEntities(prev => prev.filter(e => e.id !== id));
      dataRefreshEmitter.emit(`${entityType.toUpperCase()}_DELETED`, { id });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete entity';
      setError(errorMessage);
      throw err;
    }
  }, [entityType]);

  // Auto-fetch on mount and farm change
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchEntities();
    }
  }, [fetchEntities, options.autoFetch]);

  // Real-time updates via events
  useEffect(() => {
    if (!options.enableRealTimeUpdates) return;

    const handleExternalUpdate = () => {
      fetchEntities();
    };

    const eventType = `${entityType.toUpperCase()}_EXTERNAL_UPDATE`;
    dataRefreshEmitter.addEventListener(eventType, handleExternalUpdate);

    return () => {
      dataRefreshEmitter.removeEventListener(eventType, handleExternalUpdate);
    };
  }, [entityType, fetchEntities, options.enableRealTimeUpdates]);

  return {
    entities,
    loading,
    error,
    create,
    update,
    remove,
    refresh: fetchEntities,
    setEntities
  };
}
```

### **2. Standard Entity Management Component**

```typescript
// components/EntityManagement/EntityManagement.tsx
import { useState } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { useEntityCRUD } from '@/hooks/useEntityCRUD';
import { EntityCard } from './EntityCard';
import { CreateEntityModal } from './CreateEntityModal';
import { EditEntityModal } from './EditEntityModal';
import styles from './EntityManagement.module.css';

interface EntityManagementProps {
  entityType: string;
  title: string;
  createModalComponent?: React.ComponentType<any>;
  editModalComponent?: React.ComponentType<any>;
  cardComponent?: React.ComponentType<any>;
}

export default function EntityManagement({
  entityType,
  title,
  createModalComponent: CreateModal = CreateEntityModal,
  editModalComponent: EditModal = EditEntityModal,
  cardComponent: CardComponent = EntityCard
}: EntityManagementProps) {
  const { entities, loading, error, create, update, remove } = useEntityCRUD(entityType);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);

  const handleCreate = async (data: any) => {
    try {
      await create(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await update(id, data);
      setEditingEntity(null);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await remove(id);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading {title.toLowerCase()}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error Loading {title}</h3>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>
            {entities.length} {entities.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          + Add New
        </Button>
      </div>

      {/* Entity Grid */}
      <div className={styles.entityGrid}>
        {entities.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No {title.toLowerCase()} found</p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create First {title.slice(0, -1)}
            </Button>
          </div>
        ) : (
          entities.map(entity => (
            <CardComponent
              key={entity.id}
              entity={entity}
              onEdit={setEditingEntity}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateModal
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingEntity && (
        <EditModal
          entity={editingEntity}
          onSave={(data) => handleUpdate(editingEntity.id, data)}
          onClose={() => setEditingEntity(null)}
        />
      )}
    </div>
  );
}
```

### **3. Reusable Entity Card Component**

```typescript
// components/EntityCard/EntityCard.tsx
import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import styles from './EntityCard.module.css';

interface EntityCardProps {
  entity: any;
  onEdit: (entity: any) => void;
  onDelete: (id: string) => void;
  className?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function EntityCard({
  entity,
  onEdit,
  onDelete,
  className,
  actions,
  children
}: EntityCardProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    try {
      await onDelete(entity.id);
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{entity.name || entity.title || 'Unnamed'}</h3>
        <div className={styles.actions}>
          {actions || (
            <>
              <Button
                variant="secondary"
                onClick={() => onEdit(entity)}
                disabled={loading}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className={styles.content}>
        {children || (
          <div className={styles.details}>
            {entity.description && (
              <p className={styles.description}>{entity.description}</p>
            )}
            {entity.created_at && (
              <p className={styles.meta}>
                Created: {new Date(entity.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
```

---

## 🎨 **Modal Implementation Patterns**

### **1. Generic CRUD Modal**

```typescript
// components/ui/CrudModal/CrudModal.tsx
import { useState } from 'react';
import { Modal, Button, FormField } from '@/components/ui';
import styles from './CrudModal.module.css';

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  title: string;
  initialData?: any;
  fields: FormFieldConfig[];
  loading?: boolean;
}

interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'number' | 'date';
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  validation?: (value: any) => string | null;
}

export default function CrudModal({
  isOpen,
  onClose,
  onSave,
  title,
  initialData = {},
  fields,
  loading = false
}: CrudModalProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = formData[field.name];
      
      // Required field validation
      if (field.required && (!value || value.toString().trim() === '')) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }
      
      // Custom validation
      if (field.validation && value) {
        const validationError = field.validation(value);
        if (validationError) {
          newErrors[field.name] = validationError;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fields}>
          {fields.map(field => (
            <FormField
              key={field.name}
              label={field.label}
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(value) => handleFieldChange(field.name, value)}
              error={errors[field.name]}
              required={field.required}
              options={field.options}
            />
          ))}
        </div>
        
        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || loading}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

### **2. Specific Entity Modal Example**

```typescript
// components/UserManagement/UserModal.tsx
import { CrudModal } from '@/components/ui';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  user?: any;
}

const userFields = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text' as const,
    required: true
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email' as const,
    required: true,
    validation: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : 'Please enter a valid email address';
    }
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'TEAM_MEMBER', label: 'Team Member' },
      { value: 'SPECIALIST', label: 'Specialist' },
      { value: 'TEAM_LEAD', label: 'Team Lead' },
      { value: 'SPECIALIST_LEAD', label: 'Specialist Lead' },
      { value: 'FARM_MANAGER', label: 'Farm Manager' }
    ]
  }
];

export default function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
  return (
    <CrudModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title={user ? 'Edit User' : 'Create New User'}
      initialData={user}
      fields={userFields}
    />
  );
}
```

---

## 🔄 **API Service Implementation**

### **1. Enhanced API Service with Multi-tenant Support**

```typescript
// lib/api/apiService.ts
class APIService {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getHeaders(farmId?: string): HeadersInit {
    const headers = { ...this.defaultHeaders };
    
    if (farmId) {
      headers['X-Farm-ID'] = farmId;
    }
    
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    farmId?: string
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(farmId),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Generic CRUD operations
  async getEntities<T>(entityType: string, filters?: any): Promise<T[]> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request<T[]>(`/${entityType}${queryParams}`, {}, filters?.farm_id);
  }

  async getEntity<T>(entityType: string, id: string, farmId?: string): Promise<T> {
    return this.request<T>(`/${entityType}/${id}`, {}, farmId);
  }

  async createEntity<T>(entityType: string, data: any): Promise<T> {
    return this.request<T>(`/${entityType}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, data.farm_id);
  }

  async updateEntity<T>(entityType: string, id: string, data: any): Promise<T> {
    return this.request<T>(`/${entityType}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, data.farm_id);
  }

  async deleteEntity(entityType: string, id: string, farmId?: string): Promise<void> {
    return this.request<void>(`/${entityType}/${id}`, {
      method: 'DELETE',
    }, farmId);
  }

  // Specific entity methods
  async getUsers(farmId: string) {
    return this.getEntities<User>('users', { farm_id: farmId });
  }

  async createUser(userData: CreateUserData) {
    return this.createEntity<User>('users', userData);
  }

  async updateUser(id: string, userData: UpdateUserData) {
    return this.updateEntity<User>('users', id, userData);
  }

  async deleteUser(id: string, farmId: string) {
    return this.deleteEntity('users', id, farmId);
  }

  // Batch operations
  async batchCreate<T>(entityType: string, items: any[]): Promise<T[]> {
    return this.request<T[]>(`/${entityType}/batch`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  async batchUpdate<T>(entityType: string, updates: Array<{ id: string; data: any }>): Promise<T[]> {
    return this.request<T[]>(`/${entityType}/batch`, {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    });
  }

  async batchDelete(entityType: string, ids: string[], farmId?: string): Promise<void> {
    return this.request<void>(`/${entityType}/batch`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }, farmId);
  }
}

export const apiService = new APIService();
```

### **2. Data Integrity Service**

```typescript
// lib/services/dataIntegrityService.ts
import { apiService } from '@/lib/api/apiService';
import { dataRefreshEmitter } from '@/lib/events/dataEvents';

class DataIntegrityService {
  private validationRules: Map<string, ValidationRule[]> = new Map();

  constructor() {
    this.setupValidationRules();
  }

  private setupValidationRules() {
    // User validation rules
    this.validationRules.set('users', [
      {
        field: 'email',
        validate: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value) ? null : 'Invalid email format';
        }
      },
      {
        field: 'name',
        validate: (value) => {
          return value && value.trim().length >= 2 ? null : 'Name must be at least 2 characters';
        }
      }
    ]);

    // Environment validation rules
    this.validationRules.set('environments', [
      {
        field: 'name',
        validate: (value) => {
          return value && value.trim().length >= 3 ? null : 'Environment name must be at least 3 characters';
        }
      },
      {
        field: 'temperature_min',
        validate: (value, data) => {
          const min = parseFloat(value);
          const max = parseFloat(data.temperature_max);
          return min < max ? null : 'Minimum temperature must be less than maximum';
        }
      }
    ]);
  }

  async validateData(entityType: string, data: any): Promise<ValidationResult> {
    const rules = this.validationRules.get(entityType) || [];
    const errors: Record<string, string> = {};

    for (const rule of rules) {
      const error = rule.validate(data[rule.field], data);
      if (error) {
        errors[rule.field] = error;
      }
    }

    // Check for duplicates
    const duplicateError = await this.checkDuplicates(entityType, data);
    if (duplicateError) {
      errors.duplicate = duplicateError;
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  async checkDuplicates(entityType: string, data: any): Promise<string | null> {
    try {
      switch (entityType) {
        case 'users':
          return await this.checkUserDuplicates(data);
        case 'environments':
          return await this.checkEnvironmentDuplicates(data);
        default:
          return null;
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return null;
    }
  }

  private async checkUserDuplicates(userData: any): Promise<string | null> {
    const existingUsers = await apiService.getUsers(userData.farm_id);
    const duplicate = existingUsers.find(user => 
      user.email.toLowerCase() === userData.email.toLowerCase() &&
      user.id !== userData.id
    );
    
    return duplicate ? 'A user with this email already exists' : null;
  }

  private async checkEnvironmentDuplicates(envData: any): Promise<string | null> {
    const existingEnvs = await apiService.getEntities('environments', { farm_id: envData.farm_id });
    const duplicate = existingEnvs.find(env => 
      env.name.toLowerCase() === envData.name.toLowerCase() &&
      env.id !== envData.id
    );
    
    return duplicate ? 'An environment with this name already exists' : null;
  }

  async createWithIntegrity<T>(entityType: string, data: any): Promise<T> {
    // Validate data
    const validation = await this.validateData(entityType, data);
    if (!validation.valid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }

    // Create entity
    const entity = await apiService.createEntity<T>(entityType, data);
    
    // Emit creation event
    dataRefreshEmitter.emit(`${entityType.toUpperCase()}_CREATED`, entity);
    
    return entity;
  }

  async updateWithIntegrity<T>(entityType: string, id: string, data: any): Promise<T> {
    // Include ID in data for duplicate checking
    const dataWithId = { ...data, id };
    
    // Validate data
    const validation = await this.validateData(entityType, dataWithId);
    if (!validation.valid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }

    // Update entity
    const entity = await apiService.updateEntity<T>(entityType, id, data);
    
    // Emit update event
    dataRefreshEmitter.emit(`${entityType.toUpperCase()}_UPDATED`, entity);
    
    return entity;
  }
}

interface ValidationRule {
  field: string;
  validate: (value: any, data?: any) => string | null;
}

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export const dataIntegrityService = new DataIntegrityService();
```

---

## 🎯 **Page Implementation Template**

### **Complete Page Pattern**

```typescript
// app/management/[entity]/page.tsx
import { Suspense } from 'react';
import { EntityManagement } from '@/components/EntityManagement';
import { LoadingSpinner } from '@/components/ui';
import { Metadata } from 'next';

interface EntityPageProps {
  params: {
    entity: string;
  };
}

export async function generateMetadata({ params }: EntityPageProps): Promise<Metadata> {
  const entityName = params.entity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    title: `${entityName} Management - OFMS`,
    description: `Manage ${entityName.toLowerCase()} for your organic farm`,
  };
}

export default function EntityPage({ params }: EntityPageProps) {
  const { entity } = params;
  const entityName = entity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="page-container">
      <Suspense fallback={<LoadingSpinner />}>
        <EntityManagement
          entityType={entity}
          title={entityName}
        />
      </Suspense>
    </div>
  );
}
```

### **CSS Module for Pages**

```css
/* app/management/[entity]/page.module.css */
.pageContainer {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: var(--spacing-6);
}

.loadingContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--spacing-4);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.errorContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--spacing-4);
  text-align: center;
}

.errorContainer h3 {
  color: var(--danger-color);
  margin: 0;
}

.errorContainer p {
  color: var(--text-medium);
  margin: 0;
}
```

---

## 🔄 **Event System Implementation**

### **Enhanced Event System**

```typescript
// lib/events/dataEvents.ts
class DataRefreshEmitter extends EventTarget {
  private listeners: Map<string, Set<EventListener>> = new Map();

  emit(eventType: string, detail?: any) {
    const event = new CustomEvent(eventType, { detail });
    this.dispatchEvent(event);
    
    // Also emit to specific listeners
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        listener(event);
      });
    }
  }

  on(eventType: string, listener: EventListener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
    
    // Also add to regular EventTarget
    this.addEventListener(eventType, listener);
  }

  off(eventType: string, listener: EventListener) {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
    
    // Also remove from regular EventTarget
    this.removeEventListener(eventType, listener);
  }

  // Batch emit for multiple related events
  emitBatch(events: Array<{ type: string; detail?: any }>) {
    events.forEach(({ type, detail }) => {
      this.emit(type, detail);
    });
  }
}

export const dataRefreshEmitter = new DataRefreshEmitter();

export const DATA_EVENTS = {
  // User events
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  
  // Environment events
  ENVIRONMENT_CREATED: 'ENVIRONMENT_CREATED',
  ENVIRONMENT_UPDATED: 'ENVIRONMENT_UPDATED',
  ENVIRONMENT_DELETED: 'ENVIRONMENT_DELETED',
  
  // System events
  FARM_SWITCHED: 'FARM_SWITCHED',
  DATA_REFRESH_NEEDED: 'DATA_REFRESH_NEEDED',
  BULK_OPERATION_COMPLETE: 'BULK_OPERATION_COMPLETE',
  
  // Error events
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;
```

---

**This implementation patterns guide provides all the working templates needed for consistent, high-quality OFMS feature development.**

**Focus**: Practical, copy-paste code patterns with full CRUD functionality  
**Target**: Developers who need to implement features quickly while maintaining standards  
**Status**: Active Implementation Guide (January 2025) 