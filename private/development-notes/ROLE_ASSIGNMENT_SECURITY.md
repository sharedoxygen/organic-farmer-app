# Role Assignment Security & Best Practices

## 🔒 Security Question: Can Farm Owners Assign Owner/Admin Roles?

**Answer: NO (with controlled exceptions)**

---

## 🎯 **Role Assignment Rules**

### **Owner Role**
- ❌ **Cannot be assigned** by farm owners to others
- ✅ **Can only be assigned** by:
  - System administrators (OFMS admins)
  - During farm creation
  - Through ownership transfer process
- **Restriction**: Only ONE owner per farm
- **Reason**: Legal ownership, billing responsibility, ultimate authority

### **Administrator Role**
- ⚠️ **Can be assigned** by farm owners
- ✅ **Owners can promote** trusted users to Admin
- ⚠️ **Recommended limit**: 2-3 admins per farm
- **Reason**: Admins have significant power but owner retains ultimate control

### **Management Roles**
- ✅ **Can be freely assigned** by owners and admins
- Includes:
  - Farm Manager
  - Operations Manager
  - Production Lead
  - Quality Lead
  - Team Lead
  - Team Member
  - Specialist

---

## 🏗️ **Role Hierarchy**

```
┌─────────────────────────────────────┐
│  SYSTEM ADMIN (OFMS Level)          │  ← Platform-wide access
│  - Manages all farms                │
│  - Can assign any role              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  OWNER (Farm Level)                 │  ← Legal owner
│  - Ultimate authority               │
│  - Can assign Admin & below         │
│  - Cannot assign another Owner      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  ADMINISTRATOR (Farm Level)         │  ← Trusted deputy
│  - Can manage most farm operations  │
│  - Can assign Manager & below       │
│  - Cannot assign Owner or Admin     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  FARM MANAGER (Operational)         │  ← Day-to-day management
│  - Can assign Lead & below          │
│  - Cannot assign Owner/Admin/Manager│
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  TEAM LEAD (Supervisory)            │  ← Team supervision
│  - Can assign Team Member           │
│  - Cannot assign Lead or above      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  TEAM MEMBER (Worker)               │  ← Standard worker
│  - Cannot assign any roles          │
└─────────────────────────────────────┘
```

---

## ✅ **Implementation Details**

### **Current Implementation**

The edit user modal now enforces these rules:

1. **For Farm Owners:**
   - ✅ Can see and assign Administrator role
   - ❌ Cannot assign Owner role (disabled option)
   - ✅ Can assign all management and worker roles

2. **For Administrators:**
   - ✅ Can see Admin role (for existing admins)
   - ❌ Cannot promote others to Admin
   - ❌ Cannot see Owner role
   - ✅ Can assign all management and worker roles

3. **For Farm Managers:**
   - ❌ Cannot see Owner or Admin roles
   - ✅ Can assign Lead and Member roles
   - ℹ️ See info message: "Owner and Administrator roles can only be assigned by farm owners"

4. **For Team Leads:**
   - ❌ Cannot see Owner, Admin, or Manager roles
   - ✅ Can assign Team Member role

---

## 🔐 **Security Rationale**

### Why Restrict Owner Role?
1. **Legal Clarity**: One person legally owns the farm
2. **Billing**: Owner is responsible for subscription/payments
3. **Accountability**: Clear chain of command
4. **Security**: Prevents unauthorized ownership claims
5. **Audit Trail**: Clear ownership history

### Why Allow Admin Assignment?
1. **Delegation**: Owners need trusted deputies
2. **Flexibility**: Owners may travel or be unavailable
3. **Growth**: Larger farms need multiple administrators
4. **Succession**: Prepares for ownership transfer

### Why Restrict Admin Assignment by Admins?
1. **Control**: Owner maintains ultimate authority
2. **Security**: Prevents admin power creep
3. **Accountability**: Owner approves all admin appointments
4. **Trust**: Admin role requires owner's explicit trust

---

## 📊 **Permission Matrix**

| Current User Role | Can Assign Owner | Can Assign Admin | Can Assign Manager | Can Assign Lead | Can Assign Member |
|-------------------|------------------|------------------|-------------------|-----------------|-------------------|
| System Admin      | ✅ Yes           | ✅ Yes           | ✅ Yes            | ✅ Yes          | ✅ Yes            |
| Owner             | ❌ No            | ✅ Yes           | ✅ Yes            | ✅ Yes          | ✅ Yes            |
| Administrator     | ❌ No            | ❌ No            | ✅ Yes            | ✅ Yes          | ✅ Yes            |
| Farm Manager      | ❌ No            | ❌ No            | ❌ No             | ✅ Yes          | ✅ Yes            |
| Team Lead         | ❌ No            | ❌ No            | ❌ No             | ❌ No           | ✅ Yes            |
| Team Member       | ❌ No            | ❌ No            | ❌ No             | ❌ No           | ❌ No             |

---

## 🎯 **User Experience**

### What Users See

**Farm Owner editing a worker:**
```
Role: [Dropdown]
  - Owner (Restricted)     ← Disabled, greyed out
  - Administrator          ← Can select
  - Farm Manager           ← Can select
  - Operations Manager     ← Can select
  - ...
```

**Farm Manager editing a worker:**
```
Role: [Dropdown]
  - Farm Manager           ← Can select
  - Operations Manager     ← Can select
  - Production Lead        ← Can select
  - Team Lead              ← Can select
  - Team Member            ← Can select

ℹ️ Owner and Administrator roles can only be assigned by farm owners
```

**Administrator editing an existing admin:**
```
Role: [Dropdown]
  - Administrator          ← Can see (for existing admins)
  - Farm Manager           ← Can select
  - ...
```

---

## 🔄 **Ownership Transfer Process**

If a farm needs to change owners:

### Method 1: System Admin Transfer
1. Current owner contacts OFMS support
2. System admin verifies identity
3. System admin changes owner role
4. New owner receives notification

### Method 2: Owner Self-Transfer (Future)
1. Owner initiates transfer request
2. New owner accepts invitation
3. 7-day waiting period
4. Transfer completes automatically
5. Old owner becomes Administrator

---

## 🚨 **Security Warnings**

### Risks of Unrestricted Owner Assignment
- ❌ Multiple owners claiming authority
- ❌ Billing confusion
- ❌ Legal disputes
- ❌ Security breaches
- ❌ Data access conflicts

### Risks of Unrestricted Admin Assignment
- ⚠️ Too many admins dilute accountability
- ⚠️ Admins promoting friends without owner approval
- ⚠️ Power struggles between admins
- ⚠️ Difficult to revoke admin access

---

## ✅ **Best Practices**

### For Farm Owners
1. ✅ Assign 1-2 trusted administrators
2. ✅ Regularly review admin access
3. ✅ Document why each admin was appointed
4. ✅ Remove admin access when no longer needed
5. ✅ Use Farm Manager role for most management tasks

### For Administrators
1. ✅ Respect owner's authority
2. ✅ Don't try to assign admin roles
3. ✅ Use Farm Manager for delegation
4. ✅ Report security concerns to owner
5. ✅ Maintain clear communication with owner

### For System Admins
1. ✅ Only change owner role with verification
2. ✅ Document all ownership changes
3. ✅ Require identity verification
4. ✅ Notify both parties of changes
5. ✅ Maintain audit logs

---

## 📝 **Code Implementation**

### Role Dropdown Logic
```typescript
{/* Owner role - Only visible to owners, disabled for assignment */}
{currentUser?.role === 'OWNER' && (
  <option value="OWNER" disabled>
    Owner (Restricted)
  </option>
)}

{/* Admin role - Only owners can assign */}
{currentUser?.role === 'OWNER' && (
  <option value="ADMIN">Administrator</option>
)}

{/* Standard roles - Available to all managers */}
<option value="FARM_MANAGER">Farm Manager</option>
<option value="TEAM_LEAD">Team Lead</option>
<option value="TEAM_MEMBER">Team Member</option>
```

### Info Message
```typescript
{currentUser?.role !== 'OWNER' && currentUser?.role !== 'ADMIN' && (
  <small>
    ℹ️ Owner and Administrator roles can only be assigned by farm owners
  </small>
)}
```

---

## ✅ **Status: IMPLEMENTED**

**Role assignment security is now enforced:**
- ✅ Owner role cannot be assigned by farm owners
- ✅ Admin role can only be assigned by owners
- ✅ Clear visual indicators (disabled options)
- ✅ Helpful info messages
- ✅ Proper permission checks

**Refresh your browser to see the changes!**

---

**Updated:** 2025-10-11  
**Feature:** Role assignment security  
**Status:** COMPLETE  
**Security Level:** HIGH - Prevents unauthorized privilege escalation
