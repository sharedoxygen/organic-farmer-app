# 🏢 Multi-Tenant Implementation Requirements

**Organic Farm Management System (OFMS)**

## 📋 **EXECUTIVE SUMMARY**

Transform OFMS from single-farm to multi-farm SaaS platform supporting unlimited independent farm operations.

---

## 🗄️ **1. DATABASE ARCHITECTURE**

### **Core Schema Changes**

#### **New Tables Required**
```sql
-- Farms/Tenants table
CREATE TABLE farms (
  id UUID PRIMARY KEY,
  farm_name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  subdomain VARCHAR(100) UNIQUE,
  owner_id UUID REFERENCES users(id),
  subscription_plan VARCHAR(50),
  subscription_status VARCHAR(50),
  trial_ends_at TIMESTAMP,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Farm-User associations
CREATE TABLE farm_users (
  farm_id UUID REFERENCES farms(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR(50),
  permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (farm_id, user_id)
);
```

#### **Existing Table Modifications**
Add `farm_id` to ALL business tables:
- batches
- customers  
- orders
- seed_varieties
- equipment
- inventory_items
- financial_records
- quality_checks
- tasks
- growing_environments

#### **Row-Level Security (RLS)**
```sql
-- Example for batches table
ALTER TABLE batches ADD COLUMN farm_id UUID REFERENCES farms(id);
CREATE POLICY tenant_isolation ON batches 
  FOR ALL USING (farm_id = current_setting('app.current_farm_id')::uuid);
```

---

## 🔐 **2. AUTHENTICATION & AUTHORIZATION**

### **Multi-Farm User Management**
- **Single User, Multiple Farms**: Users can belong to multiple farms
- **Farm Switching**: UI/API to switch active farm context
- **Invitation System**: Farm owners invite users via email
- **Role Hierarchy**: Farm-specific roles (Owner → Manager → Member)

### **Authentication Flow**
```typescript
// Enhanced auth payload
interface AuthContext {
  userId: string;
  activeFarmId: string;
  availableFarms: Farm[];
  farmRole: FarmRole;
  permissions: Permission[];
}
```

### **API Changes**
```typescript
// All API routes need farm context
GET /api/v1/farms/:farmId/batches
POST /api/v1/farms/:farmId/orders
// OR header-based
GET /api/v1/batches (with X-Farm-ID header)
```

---

## 🏗️ **3. APPLICATION LAYER**

### **Tenant Context Management**
```typescript
// Middleware for tenant isolation
export async function tenantMiddleware(req: Request) {
  const farmId = getFarmId(req); // From subdomain, header, or session
  
  // Set context for all queries
  await prisma.$executeRaw`SET app.current_farm_id = ${farmId}`;
  
  // Add to request context
  req.farmContext = {
    farmId,
    farm: await getFarmDetails(farmId)
  };
}
```

### **Query Scoping**
```typescript
// Before (single-tenant)
const batches = await prisma.batches.findMany();

// After (multi-tenant)
const batches = await prisma.batches.findMany({
  where: { farmId: req.farmContext.farmId }
});
```

### **Farm-Specific Features**
- Custom branding per farm
- Farm-specific settings/preferences
- Isolated file storage (S3 buckets/folders)
- Custom domains support

---

## 🌐 **4. INFRASTRUCTURE**

### **URL Strategy Options**

#### **Option 1: Subdomain-based**
```
kinkead.ofms.com
smithfarm.ofms.com
greenacres.ofms.com
```

#### **Option 2: Path-based**
```
ofms.com/farms/kinkead
ofms.com/farms/smithfarm
```

#### **Option 3: Custom Domains**
```
app.kinkeadfarm.com (CNAME to ofms.com)
portal.smithorganics.com
```

### **Session Management**
- Separate sessions per farm
- Farm context in JWT tokens
- Redis for session storage with farm prefixes

### **Data Isolation Strategy**
- **Shared Database, Shared Schema** (Row-level security) ✅ Recommended
- **Shared Database, Separate Schemas** (PostgreSQL schemas)
- **Separate Databases** (Complete isolation)

---

## 💰 **5. BILLING & SUBSCRIPTIONS**

### **Subscription Plans**
```typescript
enum SubscriptionPlan {
  STARTER = 'starter',      // 1-5 users, basic features
  PROFESSIONAL = 'pro',     // 6-20 users, full features
  ENTERPRISE = 'enterprise' // Unlimited users, API access
}
```

### **Billing Integration**
- Stripe/Paddle integration
- Per-farm billing
- Usage-based pricing options
- Trial period management

### **Feature Flags**
```typescript
// Farm-specific feature access
const features = {
  maxUsers: plan === 'starter' ? 5 : unlimited,
  apiAccess: plan === 'enterprise',
  customReports: plan !== 'starter',
  aiInsights: plan === 'professional' || plan === 'enterprise'
};
```

---

## 🔄 **6. MIGRATION STRATEGY**

### **Phase 1: Schema Updates** (2-3 weeks)
1. Add farms table
2. Add farm_id to all tables
3. Create migration scripts
4. Update Prisma schema

### **Phase 2: Application Updates** (3-4 weeks)
1. Add tenant middleware
2. Update all queries
3. Implement farm switching UI
4. Update authentication

### **Phase 3: Infrastructure** (2-3 weeks)
1. Subdomain routing
2. Session management
3. Deployment updates
4. Testing & validation

### **Phase 4: Billing & Admin** (2-3 weeks)
1. Subscription management
2. Admin dashboard
3. Billing integration
4. Usage analytics

---

## 🚀 **7. DEPLOYMENT CONSIDERATIONS**

### **Environment Variables**
```env
# Per-farm configurations
MULTI_TENANT_MODE=true
DEFAULT_FARM_DOMAIN=ofms.com
ENABLE_CUSTOM_DOMAINS=true
STRIPE_API_KEY=sk_live_xxx
```

### **Database Performance**
- Add composite indexes: `(farm_id, created_at)`
- Partition large tables by farm_id
- Connection pooling per tenant
- Query optimization for tenant filtering

### **Monitoring & Analytics**
- Per-farm metrics
- Cross-farm admin dashboard
- Usage tracking
- Performance monitoring by tenant

---

## 📊 **8. ADMIN PLATFORM**

### **Super Admin Features**
- View all farms
- Impersonate farm users (support)
- Platform-wide analytics
- Subscription management
- System health monitoring

### **Farm Owner Features**
- User management
- Billing & invoices
- Usage statistics
- Farm settings
- Data export

---

## ⚡ **9. PERFORMANCE IMPACT**

### **Expected Changes**
- +10-15% query overhead (tenant filtering)
- Increased index storage
- More complex caching strategy
- Higher session storage needs

### **Optimization Strategies**
- Tenant-aware caching
- Query result caching
- Database read replicas
- CDN for static assets

---

## 🔒 **10. SECURITY CONSIDERATIONS**

### **Data Isolation**
- Enforce RLS policies
- Validate tenant context
- Audit cross-tenant access
- Regular security testing

### **Compliance**
- Data residency options
- Tenant-specific backups
- Audit trails per farm
- GDPR compliance tools

---

## 📈 **ESTIMATED TIMELINE**

**Total Duration**: 10-12 weeks

1. **Planning & Design**: 1-2 weeks
2. **Database Migration**: 2-3 weeks
3. **Application Updates**: 3-4 weeks
4. **Infrastructure**: 2-3 weeks
5. **Testing & Deployment**: 2 weeks

---

## 💡 **RECOMMENDATIONS**

1. **Start Small**: Begin with 2-3 pilot farms
2. **Feature Flags**: Roll out gradually
3. **Backwards Compatible**: Maintain single-tenant mode
4. **Automated Testing**: Comprehensive multi-tenant tests
5. **Documentation**: Update all docs for multi-tenant

---

## 🎯 **SUCCESS CRITERIA**

- ✅ Complete data isolation between farms
- ✅ <100ms overhead for tenant filtering
- ✅ Seamless farm switching
- ✅ Zero cross-tenant data leaks
- ✅ Scalable to 1000+ farms
- ✅ Automated billing per farm
- ✅ Farm-specific customization

---

**Next Steps**: 
1. Approve architectural approach
2. Create detailed technical specifications
3. Set up development environment
4. Begin Phase 1 implementation 