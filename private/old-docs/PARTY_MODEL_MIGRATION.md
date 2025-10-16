# Party Model Migration Guide

## Overview

This guide documents the migration from the legacy `customers` table to the proper **Party Model** architecture. This migration preserves all data integrity, user relationships, and entitlements while modernizing the data structure.

## Why Migrate?

### Problems with Legacy Model
- **Duplicate UI**: Separate B2B and B2C customer pages querying the same table
- **Inflexible**: Hard to add new customer types or roles
- **Data Redundancy**: Contact information embedded in customer records
- **Limited Relationships**: Can't easily model complex party relationships

### Benefits of Party Model
- **Unified Architecture**: Single source of truth for all parties (people & organizations)
- **Flexible Roles**: Parties can have multiple roles (customer, supplier, employee, etc.)
- **Normalized Contacts**: Separate contact management with multiple contact points
- **Relationship Tracking**: Model complex business relationships
- **Future-Proof**: Easy to extend with new party types and roles

## Data Model

### Core Tables

#### `parties`
- **id**: UUID primary key
- **displayName**: Name shown in UI
- **legalName**: Official legal name (for organizations)
- **partyType**: PERSON | ORGANIZATION
- **createdAt**, **updatedAt**: Timestamps

#### `party_roles`
- **id**: UUID primary key
- **partyId**: Reference to party
- **roleType**: CUSTOMER_B2B | CUSTOMER_B2C | SUPPLIER | EMPLOYEE | etc.
- **farm_id**: Tenant isolation
- **metadata**: JSON for role-specific data
- **createdAt**: Timestamp

#### `party_contacts`
- **id**: UUID primary key
- **partyId**: Reference to party
- **type**: EMAIL | PHONE | MOBILE | ADDRESS | etc.
- **label**: Contact label (e.g., "Primary Email", "Mobile")
- **value**: Contact value
- **isPrimary**: Boolean flag
- **createdAt**, **updatedAt**: Timestamps

## Migration Steps

### Step 1: Run Migration SQL

```bash
# Backup database first!
npm run db:backup

# Run migration script
psql $DATABASE_URL < prisma/migrations/migrate-customers-to-parties.sql
```

### Step 2: Verify Migration

```sql
-- Check all customers have party references
SELECT COUNT(*) as total_customers FROM customers;
SELECT COUNT(*) as customers_with_party FROM customers WHERE "partyId" IS NOT NULL;

-- Verify party roles created
SELECT COUNT(*) as customer_roles 
FROM party_roles 
WHERE "roleType" IN ('CUSTOMER_B2B', 'CUSTOMER_B2C');

-- Check contacts created
SELECT COUNT(*) as total_contacts FROM party_contacts;

-- Verify orders linked to parties
SELECT COUNT(*) as orders_with_party 
FROM orders 
WHERE "customerPartyId" IS NOT NULL;
```

### Step 3: Seed New Data (Optional)

For new environments or testing:

```bash
# Get farm ID and user ID from database
psql $DATABASE_URL -c "SELECT id, farm_name FROM farms LIMIT 1;"
psql $DATABASE_URL -c "SELECT id, email FROM users WHERE roles LIKE '%ADMIN%' LIMIT 1;"

# Run party seeder
node scripts/ofms-party-seeder.js \
  --farm-id="<FARM_ID>" \
  --user-id="<USER_ID>" \
  --verbose

# Or with dry-run to preview
node scripts/ofms-party-seeder.js \
  --farm-id="<FARM_ID>" \
  --user-id="<USER_ID>" \
  --dry-run \
  --verbose
```

### Step 4: Update Application Code

See implementation sections below for:
- API endpoint updates
- UI component updates
- Order management updates

## Backward Compatibility

The migration maintains **full backward compatibility**:

1. **customers table preserved**: Legacy table remains with `partyId` link
2. **Existing APIs work**: Orders still reference `customerId`
3. **Gradual migration**: Can update code incrementally
4. **Data sync**: Both models stay in sync during transition

## Rollback Plan

If issues arise, rollback is straightforward:

```sql
BEGIN;

-- Remove party contacts
DELETE FROM party_contacts 
WHERE "partyId" IN (
  SELECT "partyId" FROM customers WHERE "partyId" IS NOT NULL
);

-- Remove party roles
DELETE FROM party_roles 
WHERE "partyId" IN (
  SELECT "partyId" FROM customers WHERE "partyId" IS NOT NULL
);

-- Clear party references
UPDATE customers SET "partyId" = NULL;
UPDATE orders SET "customerPartyId" = NULL;

-- Optionally remove parties (if no other roles exist)
DELETE FROM parties 
WHERE "partyType" IN ('PERSON', 'ORGANIZATION') 
AND id NOT IN (
  SELECT "partyId" FROM customers WHERE "partyId" IS NOT NULL
);

COMMIT;
```

## API Updates

### New Party Endpoints

```typescript
// GET /api/parties - List all parties
// GET /api/parties/:id - Get party details
// POST /api/parties - Create new party
// PUT /api/parties/:id - Update party
// DELETE /api/parties/:id - Delete party

// GET /api/parties/:id/contacts - Get party contacts
// POST /api/parties/:id/contacts - Add contact
// PUT /api/parties/:id/contacts/:contactId - Update contact
// DELETE /api/parties/:id/contacts/:contactId - Delete contact

// GET /api/parties/:id/roles - Get party roles
// POST /api/parties/:id/roles - Add role
// DELETE /api/parties/:id/roles/:roleId - Remove role
```

### Updated Customer Endpoints

```typescript
// Legacy endpoints still work but use party model internally
// GET /api/customers - Now queries parties with customer roles
// POST /api/customers - Creates party + customer role + contacts
```

## UI Updates

### Unified Customers Page

Replace separate B2B/B2C pages with single page:

**Route**: `/sales/customers`

**Features**:
- Filter by customer type (B2B/B2C/All)
- Search by name, email, phone
- View/edit contacts inline
- Manage multiple contact points
- Track customer relationships

### Navigation Update

```typescript
// Before:
{ label: 'B2B Customers', path: '/sales/b2b-customers' }
{ label: 'B2C Customers', path: '/sales/b2c-customers' }

// After:
{ label: 'Customers', path: '/sales/customers' }
```

## Data Integrity Checks

### Pre-Migration Checks

```sql
-- Count customers
SELECT type, COUNT(*) FROM customers GROUP BY type;

-- Check for orphaned orders
SELECT COUNT(*) FROM orders o 
LEFT JOIN customers c ON o."customerId" = c.id 
WHERE c.id IS NULL;

-- Verify email uniqueness
SELECT email, COUNT(*) FROM customers 
GROUP BY email HAVING COUNT(*) > 1;
```

### Post-Migration Checks

```sql
-- Verify all customers migrated
SELECT 
  (SELECT COUNT(*) FROM customers) as total_customers,
  (SELECT COUNT(*) FROM customers WHERE "partyId" IS NOT NULL) as migrated_customers,
  (SELECT COUNT(*) FROM party_roles WHERE "roleType" IN ('CUSTOMER_B2B', 'CUSTOMER_B2C')) as customer_roles;

-- Check contact completeness
SELECT 
  pr."roleType",
  COUNT(DISTINCT pc.id) FILTER (WHERE pc.type = 'EMAIL') as emails,
  COUNT(DISTINCT pc.id) FILTER (WHERE pc.type = 'PHONE') as phones,
  COUNT(DISTINCT pc.id) FILTER (WHERE pc.type = 'ADDRESS') as addresses
FROM party_roles pr
LEFT JOIN party_contacts pc ON pc."partyId" = pr."partyId"
WHERE pr."roleType" IN ('CUSTOMER_B2B', 'CUSTOMER_B2C')
GROUP BY pr."roleType";

-- Verify order linkage
SELECT 
  COUNT(*) as total_orders,
  COUNT("customerPartyId") as orders_with_party,
  COUNT("customerId") as orders_with_customer
FROM orders;
```

## Testing Checklist

- [ ] All existing customers have `partyId`
- [ ] All parties have at least one role
- [ ] All parties have at least one contact (email or phone)
- [ ] Orders maintain both `customerId` and `customerPartyId`
- [ ] Customer search works in new UI
- [ ] Order creation works with party model
- [ ] Reports show correct customer data
- [ ] Exports include all customer information
- [ ] User permissions preserved
- [ ] Tenant isolation maintained

## Performance Considerations

### Indexes

Ensure these indexes exist:

```sql
CREATE INDEX IF NOT EXISTS idx_party_roles_farm_role 
ON party_roles(farm_id, "roleType");

CREATE INDEX IF NOT EXISTS idx_party_contacts_party 
ON party_contacts("partyId");

CREATE INDEX IF NOT EXISTS idx_customers_party 
ON customers("partyId");

CREATE INDEX IF NOT EXISTS idx_orders_customer_party 
ON orders("customerPartyId");
```

### Query Optimization

```typescript
// Efficient party query with contacts
const parties = await prisma.parties.findMany({
  where: {
    roles: {
      some: {
        farm_id: farmId,
        roleType: { in: ['CUSTOMER_B2B', 'CUSTOMER_B2C'] }
      }
    }
  },
  include: {
    roles: {
      where: { farm_id: farmId }
    },
    contacts: {
      where: { isPrimary: true }
    }
  }
});
```

## Support & Troubleshooting

### Common Issues

**Issue**: Migration fails with foreign key constraint
**Solution**: Ensure no orphaned records exist before migration

**Issue**: Duplicate parties created
**Solution**: Check `displayName` and `createdAt` matching logic

**Issue**: Missing contacts after migration
**Solution**: Verify source customer data has email/phone/address fields

### Getting Help

- Check logs: `tail -f logs/migration.log`
- Verify data: Run post-migration checks
- Contact: dev@sharedoxygen.com

## Timeline

1. **Week 1**: Run migration on development database
2. **Week 2**: Update API endpoints and test
3. **Week 3**: Update UI components
4. **Week 4**: User acceptance testing
5. **Week 5**: Production migration (with rollback plan ready)

## Success Criteria

✅ Zero data loss  
✅ All relationships preserved  
✅ Performance maintained or improved  
✅ User workflows unchanged  
✅ Reports accurate  
✅ Rollback tested and documented  

---

**Last Updated**: 2025-10-09  
**Version**: 1.0  
**Author**: OFMS Development Team
