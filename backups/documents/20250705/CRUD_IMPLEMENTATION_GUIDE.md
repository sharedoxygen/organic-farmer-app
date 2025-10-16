# CRUD Implementation Guide

## Overview

This guide documents the standardized CRUD (Create, Read, Update, Delete) implementation patterns used throughout the OFMS application. These patterns ensure consistency, maintainability, and reliability across all modules.

## Core Components

### 1. CrudModal Component

A reusable modal component that handles view, edit, and create operations.

```typescript
import { CrudModal, CrudField } from '@/components/ui';

// Define fields for your entity
const fields: CrudField[] = [
    {
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Enter name'
    },
    {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
        ]
    },
    // ... more fields
];

// Use in component
<CrudModal
    isOpen={modalOpen}
    onClose={() => setModalOpen(false)}
    title={mode === 'create' ? 'Create Item' : 'Item Details'}
    mode={mode} // 'view' | 'edit' | 'create'
    data={selectedItem}
    fields={fields}
    onSave={handleSave}
    onDelete={handleDelete}
    sections={[
        { title: 'Basic Info', fields: ['name', 'status'] },
        { title: 'Details', fields: ['description', 'notes'] }
    ]}
/>
```

### 2. CrudApiService

A generic API service for consistent data operations.

```typescript
import { createCrudService } from '@/lib/api/crudService';

// Create service instance
const itemService = createCrudService('items', {
    farmScoped: true, // Automatically adds farm context
    transformForApi: (data) => ({
        ...data,
        // Transform data before sending to API
    }),
    transformFromApi: (data) => ({
        ...data,
        // Transform data after receiving from API
    })
});

// Usage
const items = await itemService.list({ status: 'active' });
const item = await itemService.get(itemId);
const newItem = await itemService.create(itemData);
const updatedItem = await itemService.update(itemId, itemData);
await itemService.delete(itemId);
```

## Implementation Pattern

### 1. Module Structure

```typescript
// Define your data interface
interface Item {
    id: string;
    name: string;
    status: string;
    // ... other fields
}

// Define CRUD fields
const itemFields: CrudField[] = [
    // ... field definitions
];

// Create API service
const itemService = createCrudService('items');
```

### 2. State Management

```typescript
const [items, setItems] = useState<Item[]>([]);
const [selectedItem, setSelectedItem] = useState<Item | null>(null);
const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
const [modalOpen, setModalOpen] = useState(false);
const [loading, setLoading] = useState(true);
```

### 3. CRUD Operations

```typescript
// Load items
const loadItems = useCallback(async () => {
    setLoading(true);
    try {
        const data = await itemService.list();
        setItems(data);
    } catch (error) {
        console.error('Failed to load items:', error);
    } finally {
        setLoading(false);
    }
}, []);

// Handle view
const handleView = (item: Item) => {
    setSelectedItem(item);
    setModalMode('view');
    setModalOpen(true);
};

// Handle edit
const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setModalMode('edit');
    setModalOpen(true);
};

// Handle create
const handleCreate = () => {
    setSelectedItem(null);
    setModalMode('create');
    setModalOpen(true);
};

// Handle save (create/update)
const handleSave = async (data: any) => {
    try {
        if (modalMode === 'create') {
            await itemService.create(data);
        } else {
            await itemService.update(selectedItem!.id, data);
        }
        await loadItems();
        setModalOpen(false);
    } catch (error) {
        console.error('Failed to save:', error);
        throw error; // Let modal handle error display
    }
};

// Handle delete
const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
        await itemService.delete(selectedItem.id);
        await loadItems();
        setModalOpen(false);
    } catch (error) {
        console.error('Failed to delete:', error);
        throw error;
    }
};
```

### 4. Field Configuration

```typescript
const fields: CrudField[] = [
    {
        name: 'id',
        label: 'ID',
        type: 'text',
        readOnly: true // Cannot be edited
    },
    {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
        ]
    },
    {
        name: 'date',
        label: 'Date',
        type: 'date',
        required: true,
        defaultValue: new Date().toISOString()
    },
    {
        name: 'amount',
        label: 'Amount',
        type: 'number',
        required: true,
        min: 0,
        step: 0.01
    },
    {
        name: 'notes',
        label: 'Notes',
        type: 'textarea',
        rows: 3,
        fullWidth: true // Spans full width of form
    },
    {
        name: 'yieldAmount',
        label: 'Yield Amount',
        type: 'number',
        showWhen: (data) => data.status === 'completed' // Conditional field
    }
];
```

## API Endpoint Pattern

All CRUD endpoints should follow this pattern:

```typescript
// GET /api/items - List all items
// GET /api/items/[id] - Get single item
// POST /api/items - Create new item
// PUT /api/items/[id] - Update item
// DELETE /api/items/[id] - Delete item

// Example implementation
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const itemId = params.id;
        const farmId = request.headers.get('X-Farm-ID');
        
        // Validate farm ownership
        const existing = await prisma.items.findFirst({
            where: { id: itemId, farm_id: farmId }
        });
        
        if (!existing) {
            return NextResponse.json(
                { error: 'Item not found' },
                { status: 404 }
            );
        }
        
        // Update item
        const updated = await prisma.items.update({
            where: { id: itemId },
            data: { ...body, updatedAt: new Date() }
        });
        
        return NextResponse.json({ success: true, data: updated });
        
    } catch (error) {
        console.error('Error updating item:', error);
        return NextResponse.json(
            { error: 'Failed to update item' },
            { status: 500 }
        );
    }
}
```

## Best Practices

1. **Always validate farm context** - Ensure data isolation in multi-tenant environment
2. **Use proper error handling** - Display user-friendly error messages
3. **Implement loading states** - Show spinners during async operations
4. **Cache bust on updates** - Use cache: 'no-store' for real-time data
5. **Transform data appropriately** - Convert dates, format numbers, etc.
6. **Implement proper validation** - Both client and server side
7. **Use TypeScript interfaces** - Define clear data structures
8. **Follow RESTful conventions** - Consistent API design

## Advanced Features

### Custom View Renderer

For complex view layouts, provide a custom renderer:

```typescript
<CrudModal
    // ... other props
    viewRenderer={(data) => (
        <div className="custom-layout">
            <section>
                <h3>Overview</h3>
                <p>Custom display of {data.name}</p>
            </section>
            // ... custom layout
        </div>
    )}
/>
```

### Field Transformations

Transform data before saving:

```typescript
const fields: CrudField[] = [
    {
        name: 'date',
        label: 'Date',
        type: 'date',
        transform: (value) => new Date(value).toISOString()
    }
];
```

### Bulk Operations

Use the bulk methods for efficiency:

```typescript
// Update multiple items
await itemService.bulkUpdate(
    ['id1', 'id2', 'id3'],
    { status: 'completed' }
);

// Delete multiple items
await itemService.bulkDelete(['id1', 'id2', 'id3']);
```

## Migration Guide

To migrate existing placeholder implementations:

1. Import CrudModal and createCrudService
2. Define fields array for your entity
3. Create service instance
4. Replace placeholder modals with CrudModal
5. Replace API calls with service methods
6. Remove redundant code

Example migration in commit: [Add CRUD functionality to Production Batches]

## Testing

When implementing CRUD functionality:

1. Test all CRUD operations (Create, Read, Update, Delete)
2. Verify farm data isolation
3. Test error scenarios
4. Verify field validations
5. Test conditional fields
6. Check responsive design
7. Test keyboard navigation

## Common Issues

1. **Farm context not sent** - Ensure CrudApiService has farmScoped: true
2. **Date formatting issues** - Use ISO strings for dates
3. **Select options not showing** - Verify options array format
4. **Validation not working** - Check required fields are marked
5. **Modal not closing** - Ensure onClose is properly handled 