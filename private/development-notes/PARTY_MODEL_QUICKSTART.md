# Party Model Migration - Quick Start Guide

## 🚀 Ready to Migrate? Follow These Steps

### Step 1: Backup Your Database
```bash
npm run db:backup
```

### Step 2: Run the Migration
```bash
psql $DATABASE_URL < prisma/migrations/migrate-customers-to-parties.sql
```

### Step 3: Verify the Migration
```sql
-- All customers should have partyId
SELECT COUNT(*) as total, 
       COUNT("partyId") as with_party 
FROM customers;

-- Should match customer count
SELECT COUNT(*) FROM party_roles 
WHERE "roleType" IN ('CUSTOMER_B2B', 'CUSTOMER_B2C');
```

### Step 4: Test the New UI
```bash
npm run dev
```
Navigate to: **http://localhost:3000/sales/customers**

---

## ✅ What Changed?

### Before (Legacy)
- `/sales/b2b-customers` - B2B customers page
- `/sales/b2c-customers` - B2C customers page
- Data in `customers` table only

### After (Party Model)
- `/sales/customers` - **Unified** customers page
- Filter by B2B/B2C/All
- Data in `parties`, `party_roles`, `party_contacts` tables
- `customers` table preserved for backward compatibility

---

## 📝 Quick API Reference

### Get All Customers
```bash
curl -H "X-Farm-ID: <farm-id>" \
     -H "Authorization: Bearer <user-id>" \
     http://localhost:3000/api/parties/customers
```

### Create B2B Customer
```bash
curl -X POST \
  -H "X-Farm-ID: <farm-id>" \
  -H "Authorization: Bearer <user-id>" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Acme Corp",
    "legalName": "Acme Corporation LLC",
    "partyType": "ORGANIZATION",
    "roleType": "CUSTOMER_B2B",
    "contacts": [
      {"type": "EMAIL", "value": "orders@acme.com", "isPrimary": true}
    ],
    "metadata": {
      "status": "ACTIVE",
      "creditLimit": 5000,
      "paymentTerms": "NET_30"
    }
  }' \
  http://localhost:3000/api/parties/customers
```

### Create B2C Customer
```bash
curl -X POST \
  -H "X-Farm-ID: <farm-id>" \
  -H "Authorization: Bearer <user-id>" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Doe",
    "partyType": "PERSON",
    "roleType": "CUSTOMER_B2C",
    "contacts": [
      {"type": "EMAIL", "value": "john@email.com", "isPrimary": true}
    ],
    "metadata": {
      "status": "ACTIVE",
      "paymentTerms": "IMMEDIATE"
    }
  }' \
  http://localhost:3000/api/parties/customers
```

---

## 🔄 Rollback (If Needed)

```sql
BEGIN;
DELETE FROM party_contacts WHERE "partyId" IN (SELECT "partyId" FROM customers);
DELETE FROM party_roles WHERE "partyId" IN (SELECT "partyId" FROM customers);
UPDATE customers SET "partyId" = NULL;
UPDATE orders SET "customerPartyId" = NULL;
COMMIT;
```

---

## 📚 Full Documentation

- **Migration Guide**: `/docs/PARTY_MODEL_MIGRATION.md`
- **Implementation Summary**: `/docs/PARTY_MODEL_IMPLEMENTATION_SUMMARY.md`

---

## ✨ Benefits

✅ **Unified UI** - Single customers page  
✅ **Flexible Data Model** - Parties can have multiple roles  
✅ **Better Contacts** - Separate contact management  
✅ **Future-Proof** - Easy to add suppliers, employees, etc.  
✅ **Backward Compatible** - Legacy code still works  

---

**Questions?** Check the full documentation or contact dev@sharedoxygen.com
