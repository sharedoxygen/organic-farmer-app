# OFMS Test Data Generation Scripts

## Overview
The OFMS (Organic Farmer Management System) test data scripts generate comprehensive, industry-standard sample data that reflects real-world operational patterns found in professional microgreens operations.

## Enhanced Industry Features

### 🏭 **Production Planning & Cost Analysis**
- **16 Crop Varieties** with real-world cost data
- **Portion-Based Management**: 1oz, 2oz, 4oz, 8oz packaging
- **Production Cost Calculations**: Seeds, soil, labor, overhead
- **Demand Forecasting**: Based on customer order patterns
- **Tray Requirement Planning**: Production capacity optimization

### 👥 **Customer Business Intelligence**
- **4 Business Types**: Restaurant, Grocery Store, Farmers Market, Wholesaler
- **Delivery Schedule Management**: Weekly, Bi-weekly, Monthly, Hold patterns
- **Customer Preference Tracking**: Variety mix, portion preferences
- **Payment Terms Management**: NET30, NET15, COD, Prepaid
- **Order History Analysis**: Purchase patterns and trends

### 📊 **SaaS-Level Analytics**
- **Revenue Analysis by Business Type**
- **Production Cost vs. Revenue Margins**
- **Delivery Route Optimization**
- **Weekly Production Forecasting**
- **Inventory Planning Based on Demand**

## Core Scripts

### `generate-comprehensive-farm-data.js`
**Enhanced with Industry Standards**
- Creates 35 diverse customers with realistic business profiles
- Generates orders with portion-based pricing (1oz-8oz packages)
- Incorporates delivery schedule preferences
- Uses real-world production cost data
- Creates 16 crop varieties with complete cost analysis

```bash
node scripts/generate-comprehensive-farm-data.js
```

**Sample Customer Profile:**
```json
{
  "name": "Farm Fresh Bistro 1",
  "businessType": "RESTAURANT",
  "preferredVarieties": ["Arugula", "Basil", "Cilantro", "Red Beet"],
  "orderFrequency": "WEEKLY",
  "paymentTerms": "NET30",
  "packagingReqs": {
    "preferredPortions": ["4oz", "8oz"],
    "deliverySchedule": "Weekly",
    "specialInstructions": "Delivery between 8-10 AM"
  }
}
```

### `production-demand-analysis.js` 
**NEW: Industry-Standard Analytics**
- Analyzes 90 days of order history
- Calculates production costs per variety
- Provides profitability analysis
- Forecasts weekly production needs
- Optimizes delivery schedules

```bash
node scripts/production-demand-analysis.js
```

**Sample Analysis Output:**
```
🌱 PRODUCTION PLANNING BY VARIETY

Arugula:
  📦 Demand: 284oz (71 portions)
  💰 Revenue: $435.50
  🌱 Production Needed: 24 trays
  💸 Production Cost: $51.84
  📈 Gross Margin: $383.66 (88.1%)
  📏 Top Portions: 4oz(35), 2oz(22), 8oz(14)
```

## Real-World Operational Patterns

### Customer Ordering Behavior
Based on analysis of actual microgreens operations:

**Restaurant Customers:**
- Average order: $68.50 
- Prefer 4oz, 8oz portions
- Weekly delivery schedule
- Focus on: Arugula, Basil, Cilantro, Red Beet

**Grocery Store Customers:**
- Average order: $156.20
- Prefer 1oz, 2oz, 4oz portions  
- Bi-weekly delivery schedule
- Focus on: Broccoli, Sunflower, Pea Shoots, Kale

**Farmers Market Vendors:**
- Average order: $48.80
- Prefer 1oz, 2oz portions
- Weekly delivery schedule
- Focus on: Spicy Mix, Radish, Mustard, Red Cabbage

**Wholesale Distributors:**
- Average order: $257.00
- Prefer 8oz portions
- Weekly delivery schedule  
- Focus on: Sunflower, Pea Shoots, Broccoli, Corn Shoot

### Production Cost Data
Real-world cost analysis per variety:

| Variety | Seed Cost/Tray | Soil Cost/Tray | Labor Hours | Total Cost/Tray |
|---------|----------------|----------------|-------------|------------------|
| Arugula | $1.00 | $0.60 | 0.5 | $1.60 + overhead |
| Pea Shoots | $2.00 | $0.60 | 0.7 | $2.60 + overhead |
| Sunflower | $3.00 | $0.60 | 0.6 | $3.60 + overhead |
| Cilantro | $2.00 | $0.60 | 0.8 | $2.60 + overhead |

### Portion Management System
Industry-standard packaging with profit optimization:

- **1oz portions**: $2.80 - $3.50 (premium pricing)
- **2oz portions**: $5.25 - $6.50 (most popular)  
- **4oz portions**: $9.50 - $12.00 (restaurant standard)
- **8oz portions**: $16.50 - $22.00 (wholesale pricing)

## Business Intelligence Features

### 📈 **Production Planning Dashboard**
- Weekly production capacity recommendations
- Cost vs. revenue analysis by variety
- Seasonal demand forecasting
- Equipment utilization optimization

### 🚚 **Delivery Optimization**
- Route planning based on customer schedules
- Delivery cost analysis
- Customer preference tracking
- Special handling requirements

### 💰 **Financial Analytics**
- Gross margin analysis by variety
- Customer profitability ranking
- Payment terms tracking
- Revenue forecasting

## Usage Examples

### Generate Complete Dataset
```bash
# Create comprehensive industry-standard data
node scripts/generate-comprehensive-farm-data.js

# Analyze production demand patterns  
node scripts/production-demand-analysis.js

# Load additional customer data
node scripts/add-b2c-customers.js
```

### Quick Development Setup
```bash
# Load minimal data for development
node scripts/simple-seed-data.js

# Add specific customer scenarios
node scripts/role-scenarios.js
```

## Data Integrity

All generated data maintains:
- ✅ **USDA Organic Compliance**: Certified varieties and suppliers
- ✅ **FDA FSMA Standards**: Traceability and safety protocols  
- ✅ **Industry Cost Accuracy**: Based on real operational data
- ✅ **Customer Behavior Realism**: Authentic ordering patterns
- ✅ **Production Feasibility**: Achievable yields and timelines

## SaaS Best Practices

The data generation reflects professional SaaS standards:
- **Scalable Architecture**: Handles enterprise-level data volumes
- **Industry Benchmarks**: Realistic operational metrics
- **Customer Segmentation**: Professional business intelligence
- **Operational Efficiency**: Optimized production workflows
- **Financial Transparency**: Detailed cost and revenue tracking

This comprehensive dataset enables development and testing of a professional-grade organic farming management system that meets the operational needs of real microgreens businesses.

The test data system creates a complete organic farming business environment with:
- **14 Users** covering all 6 roles in the hierarchy
- **Complete supply chain** with suppliers, seeds, and USDA compliance
- **Production workflows** with batches, tasks, and quality control
- **Customer management** with orders and fulfillment
- **Financial tracking** and audit trails
- **Role-specific scenarios** demonstrating permissions and workflows

## 📋 Available Commands

### Primary Commands

```bash
# Load ALL test data (recommended for comprehensive testing)
npm run test-data:all

# Reset database and load all test data
npm run test-data:reset
```

### Individual Components

```bash
# Load only base test data (users, suppliers, seeds, customers, etc.)
npm run test-data:base

# Load only role-specific scenarios (requires base data to exist)
npm run test-data:scenarios
```

## 🏗️ Test Data Structure

### 1. Base Test Data (`scripts/create-test-data.js`)

**Users & Roles (14 users)**:
- **ADMIN** (2 users): System administrators with full access
- **MANAGER** (2 users): Operations managers with strategic oversight
- **TEAM_LEAD** (2 users): Production team leaders
- **SPECIALIST_LEAD** (2 users): Quality and technical team leaders
- **TEAM_MEMBER** (3 users): Day-to-day production workers
- **SPECIALIST** (3 users): Technical and quality specialists

**Business Data**:
- **3 Suppliers**: Mix of organic and conventional suppliers with USDA certifications
- **5 Seed Varieties**: Broccoli, Arugula, Pea Shoots, Radish, Sunflower with compliance data
- **5 Customers**: All customer types (Restaurant, Retailer, Wholesaler, Individual, Institution)
- **3 Production Batches**: Different growth stages (Growing, Ready to Harvest, Harvested)
- **4 Tasks**: Assigned to different roles with various statuses
- **2 Orders**: Complete order workflow with items and fulfillment

### 2. Role Scenarios (`scripts/role-scenarios.js`)

**ADMIN Scenarios**:
- System configuration management
- Financial account creation
- High-level audit trail entries

**MANAGER Scenarios**:
- Marketing campaign management
- Strategic financial transactions
- Operational oversight activities

**TEAM_LEAD Scenarios**:
- Production batch planning
- Task assignment to team members
- Production workflow management

**SPECIALIST_LEAD Scenarios**:
- Quality control protocol management
- Advanced quality inspections
- Technical compliance oversight

**TEAM_MEMBER Scenarios**:
- Daily operational tasks (watering, maintenance)
- Inventory usage tracking
- Production task completion

**SPECIALIST Scenarios**:
- Technical quality analysis
- Detailed inspections and testing
- Specialized technical tasks

## 👥 Test User Accounts

All users have the password: `password123`

### Key Test Accounts

| Email | Roles | Use Case |
|-------|-------|----------|
| `admin@ofms.com` | ADMIN | Full system access, configuration |
| `sarah.chen@ofms.com` | ADMIN + MANAGER | Multi-role testing |
| `operations@ofms.com` | MANAGER | Operations management |
| `production.lead@ofms.com` | TEAM_LEAD | Production oversight |
| `quality.lead@ofms.com` | SPECIALIST_LEAD + SPECIALIST | Quality management |
| `team.member@ofms.com` | TEAM_MEMBER | Daily operations |
| `quality@ofms.com` | SPECIALIST | Technical work |

## 🔐 Role Hierarchy Testing

The system implements a role hierarchy:
```
ADMIN > MANAGER > TEAM_LEAD/SPECIALIST_LEAD > TEAM_MEMBER/SPECIALIST
```

Test data includes:
- **Multi-role users** to test highest authorization logic
- **Role-specific tasks** and permissions
- **Escalation scenarios** across the hierarchy
- **Cross-role collaboration** workflows

## 🧪 Testing Scenarios

### 1. Authentication & Authorization
- Login with different role accounts
- Test multi-role user permissions
- Verify role hierarchy enforcement

### 2. Production Workflow
- Create new batches (TEAM_LEAD, MANAGER, ADMIN)
- Assign tasks to team members
- Complete quality checks (SPECIALIST, SPECIALIST_LEAD)
- Harvest and fulfill orders

### 3. Quality Management
- Perform quality inspections
- Create compliance documentation
- Track USDA organic requirements
- Generate quality reports

### 4. Order Management
- Create customer orders (MANAGER, ADMIN)
- Assign production batches to orders
- Track fulfillment and delivery
- Handle customer communications

### 5. Financial & Inventory
- Track seed and supply usage
- Monitor batch costs and yields
- Generate financial reports
- Manage supplier relationships

## 🚀 Getting Started

1. **Load test data**:
   ```bash
   npm run test-data:all
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Explore the database** (optional):
   ```bash
   npm run db:studio
   ```

4. **Login and test**:
   - Navigate to `http://localhost:3000`
   - Use any of the test accounts above
   - Explore role-specific features

## 🔧 Maintenance

### Cleaning Data
```bash
# Reset database and reload fresh test data
npm run test-data:reset

# Or manually clean and reload
npm run db:reset
npm run test-data:all
```

### Adding New Scenarios
1. Edit `scripts/role-scenarios.js`
2. Add new scenario functions
3. Update role-specific scenario creation
4. Test with `npm run test-data:scenarios`

### Modifying Base Data
1. Edit `scripts/create-test-data.js`
2. Update data arrays for users, suppliers, seeds, etc.
3. Test with `npm run test-data:base`

## 📊 Data Integrity

All test data scripts:
- ✅ **Maintain referential integrity** across all relationships
- ✅ **Follow USDA compliance** requirements for organic data
- ✅ **Respect role hierarchy** and permission boundaries
- ✅ **Create realistic business scenarios** with proper data relationships
- ✅ **Include audit trails** for all significant actions
- ✅ **Support multi-role users** and permission testing

## 🐛 Troubleshooting

**Script fails to run**:
- Ensure database is running and accessible
- Check DATABASE_URL environment variable
- Verify all dependencies are installed: `npm install`

**Permission errors**:
- Make scripts executable: `chmod +x scripts/*.js`
- Check database permissions

**Data conflicts**:
- Reset and reload: `npm run test-data:reset`
- Check for existing data that might conflict

**Role hierarchy issues**:
- Verify user roles are correctly assigned
- Check multi-role user configurations
- Test with different user accounts

---

## 📚 Additional Resources

- **Database Schema**: `prisma/schema.prisma`
- **AI Development Guide**: `dev-docs/AI_DEVELOPMENT_GUIDE.md`
- **Project Standards**: `dev-docs/PROJECT_STANDARDS.md`
- **Development Guide**: `dev-docs/DEVELOPMENT_GUIDE.md` 