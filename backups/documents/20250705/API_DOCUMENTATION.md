# 📡 OFMS API Documentation

**Organic Farm Management System - RESTful API Reference**  
**Version**: 1.0.0  
**Base URL**: `http://localhost:3005/api`

## 🔑 Authentication

All API endpoints require authentication via session cookies (NextAuth.js).

### Headers
```http
Content-Type: application/json
X-Farm-ID: {current-farm-id}  # Required for tenant-scoped endpoints
Cookie: next-auth.session-token={session-token}
```

---

## 🏢 Multi-Tenant Endpoints

### Farm Management

#### Get User's Farms
```http
GET /api/farms
```

**Response**:
```json
{
  "farms": [
    {
      "id": "farm-uuid",
      "farm_name": "Curry Island Microgreens",
      "business_name": "Curry Island Microgreens LLC",
      "role": "FARM_MANAGER",
      "joined_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### Switch Active Farm
```http
POST /api/farms/switch
```

**Request Body**:
```json
{
  "farmId": "farm-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "currentFarm": {
    "id": "farm-uuid",
    "farm_name": "Curry Island Microgreens"
  }
}
```

#### Get Farm Details
```http
GET /api/farms/{farmId}
```

**Response**:
```json
{
  "farm": {
    "id": "farm-uuid",
    "farm_name": "Curry Island Microgreens",
    "business_name": "Curry Island Microgreens LLC",
    "owner_id": "user-uuid",
    "subscription_plan": "professional",
    "subscription_status": "active",
    "settings": {
      "timezone": "America/New_York",
      "currency": "USD"
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## 🌱 Production Management

### Batches

#### List Batches
```http
GET /api/batches
```

**Query Parameters**:
- `status` (optional): active, harvested, cancelled
- `seedVarietyId` (optional): Filter by seed variety
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response**:
```json
{
  "batches": [
    {
      "id": "batch-uuid",
      "batchNumber": "B2024-001",
      "seedVarietyId": "seed-uuid",
      "plantDate": "2024-01-15T00:00:00Z",
      "expectedHarvestDate": "2024-01-29T00:00:00Z",
      "quantity": 50,
      "unit": "trays",
      "status": "active",
      "growingZone": "Zone A",
      "organicCompliant": true
    }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 20
}
```

#### Create Batch
```http
POST /api/batches
```

**Request Body**:
```json
{
  "batchNumber": "B2024-002",
  "seedVarietyId": "seed-uuid",
  "plantDate": "2024-01-20T00:00:00Z",
  "quantity": 30,
  "unit": "trays",
  "growingZone": "Zone B",
  "growingMedium": "Coco coir",
  "lightHours": 16,
  "environmentalTemp": 72,
  "environmentalHumidity": 65
}
```

#### Update Batch
```http
PATCH /api/batches/{batchId}
```

**Request Body**:
```json
{
  "actualHarvestDate": "2024-01-28T00:00:00Z",
  "status": "harvested",
  "qualityGrade": "A",
  "notes": "Excellent yield, uniform growth"
}
```

### Seed Varieties

#### List Seed Varieties
```http
GET /api/seed-varieties
```

**Response**:
```json
{
  "seedVarieties": [
    {
      "id": "seed-uuid",
      "name": "Arugula - Rocket",
      "scientificName": "Eruca sativa",
      "supplier": "Johnny's Selected Seeds",
      "stockQuantity": 500,
      "unit": "g",
      "daysToGermination": 5,
      "daysToHarvest": 21,
      "isOrganic": true,
      "organicCertNumber": "MOSA-12345"
    }
  ]
}
```

---

## 👥 Customer Management

### Customers

#### List Customers
```http
GET /api/customers
```

**Query Parameters**:
- `type` (optional): B2B, B2C
- `status` (optional): active, inactive
- `search` (optional): Search by name or email

**Response**:
```json
{
  "customers": [
    {
      "id": "customer-uuid",
      "name": "Green Valley Restaurant",
      "email": "orders@greenvalley.com",
      "type": "B2B",
      "businessType": "Restaurant",
      "preferredVarieties": ["Arugula", "Pea Shoots"],
      "orderFrequency": "weekly",
      "status": "active"
    }
  ]
}
```

#### Create Customer
```http
POST /api/customers
```

**Request Body**:
```json
{
  "name": "Fresh Market Co-op",
  "email": "contact@freshmarket.coop",
  "phone": "555-0123",
  "type": "B2B",
  "businessType": "Retail",
  "street": "123 Main St",
  "city": "Portland",
  "state": "OR",
  "zipCode": "97201",
  "preferredVarieties": ["Sunflower", "Radish"],
  "paymentTerms": "Net 30"
}
```

---

## 📦 Order Management

### Orders

#### List Orders
```http
GET /api/orders
```

**Query Parameters**:
- `status` (optional): pending, processing, completed, cancelled
- `customerId` (optional): Filter by customer
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response**:
```json
{
  "orders": [
    {
      "id": "order-uuid",
      "orderNumber": "ORD-2024-001",
      "customerId": "customer-uuid",
      "orderDate": "2024-01-15T10:00:00Z",
      "requestedDeliveryDate": "2024-01-17T00:00:00Z",
      "status": "processing",
      "subtotal": 150.00,
      "tax": 12.75,
      "shippingCost": 10.00,
      "total": 172.75,
      "items": [
        {
          "id": "item-uuid",
          "productName": "Arugula Microgreens",
          "seedVarietyId": "seed-uuid",
          "quantity": 10,
          "unit": "oz",
          "unitPrice": 15.00,
          "totalPrice": 150.00
        }
      ]
    }
  ]
}
```

#### Create Order
```http
POST /api/orders
```

**Request Body**:
```json
{
  "customerId": "customer-uuid",
  "requestedDeliveryDate": "2024-01-20T00:00:00Z",
  "deliveryMethod": "delivery",
  "items": [
    {
      "seedVarietyId": "seed-uuid",
      "productName": "Pea Shoot Microgreens",
      "quantity": 5,
      "unit": "oz",
      "unitPrice": 12.00
    }
  ],
  "notes": "Please deliver before 10 AM"
}
```

---

## 🔍 Quality Control

### Quality Checks

#### List Quality Checks
```http
GET /api/quality-checks
```

**Query Parameters**:
- `batchId` (optional): Filter by batch
- `checkType` (optional): pre-harvest, post-harvest, packaging
- `status` (optional): passed, failed, needs-review

**Response**:
```json
{
  "qualityChecks": [
    {
      "id": "check-uuid",
      "batchId": "batch-uuid",
      "checkType": "pre-harvest",
      "checkDate": "2024-01-28T14:00:00Z",
      "inspectorId": "user-uuid",
      "status": "passed",
      "visualAppearance": "excellent",
      "visualColor": "vibrant green",
      "uniformity": 95,
      "notes": "Ready for harvest"
    }
  ]
}
```

#### Create Quality Check
```http
POST /api/quality-checks
```

**Request Body**:
```json
{
  "batchId": "batch-uuid",
  "checkType": "post-harvest",
  "visualAppearance": "good",
  "visualColor": "dark green",
  "visualTexture": "crisp",
  "uniformity": 90,
  "measurementWeight": 2.5,
  "contaminationType": null,
  "correctiveActions": "None required",
  "status": "passed"
}
```

---

## 📊 Analytics

### Dashboard Analytics
```http
GET /api/analytics/dashboard
```

**Response**:
```json
{
  "metrics": {
    "activeBatches": 12,
    "pendingOrders": 5,
    "monthlyRevenue": 8500.00,
    "inventoryAlerts": 2,
    "upcomingTasks": 8,
    "qualityScore": 94.5
  },
  "recentActivity": [
    {
      "type": "batch_planted",
      "description": "Batch B2024-003 planted",
      "timestamp": "2024-01-15T09:00:00Z"
    }
  ],
  "trends": {
    "revenue": [
      { "month": "Jan", "value": 8500 },
      { "month": "Feb", "value": 9200 }
    ]
  }
}
```

---

## 🔒 Admin Endpoints (Global Admin Only)

### System Statistics
```http
GET /api/admin/stats
```

**Response**:
```json
{
  "global": {
    "totalFarms": 2,
    "totalUsers": 13,
    "totalBatches": 123,
    "totalRevenue": 45000.00,
    "activeSubscriptions": 2
  },
  "farms": [
    {
      "id": "farm-uuid",
      "farm_name": "Curry Island Microgreens",
      "userCount": 9,
      "batchCount": 119,
      "revenue": 35000.00,
      "storageUsed": "1.2 GB"
    }
  ]
}
```

### Farm Management
```http
POST /api/admin/farms
```

**Request Body**:
```json
{
  "farm_name": "New Farm",
  "business_name": "New Farm LLC",
  "owner_email": "owner@newfarm.com",
  "owner_name": "John Farmer",
  "subscription_plan": "starter"
}
```

---

## 🌿 Cannabis Module Endpoints

### Cannabis Strains
```http
GET /api/cannabis/strains
```

**Response**:
```json
{
  "strains": [
    {
      "id": "strain-uuid",
      "name": "Blue Dream",
      "type": "Hybrid",
      "thcContent": 18.5,
      "cbdContent": 0.5,
      "terpeneProfile": ["Myrcene", "Pinene", "Caryophyllene"],
      "effects": ["Relaxed", "Happy", "Creative"],
      "medicalUses": ["Stress", "Depression", "Pain"]
    }
  ]
}
```

### Cannabis Compliance
```http
GET /api/cannabis/compliance/reports
```

**Query Parameters**:
- `reportType`: monthly, quarterly, annual
- `period`: 2024-01

**Response**:
```json
{
  "report": {
    "period": "2024-01",
    "licenseNumber": "BCC-LIC-420001",
    "totalProduction": 50.5,
    "unit": "lbs",
    "salesByCategory": {
      "medical": 20.2,
      "recreational": 30.3
    },
    "taxesCollected": 5420.00,
    "complianceStatus": "compliant"
  }
}
```

---

## ⚠️ Error Handling

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### Error Codes
- `AUTH_REQUIRED`: Authentication required
- `PERMISSION_DENIED`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `FARM_REQUIRED`: Farm context required
- `CONFLICT`: Resource conflict (duplicate)
- `SERVER_ERROR`: Internal server error

---

## 📝 Rate Limiting

- **Default**: 100 requests per minute per user
- **Analytics**: 20 requests per minute
- **Admin**: No rate limiting

---

## 🔄 Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page` (default: 1): Page number
- `pageSize` (default: 20): Items per page
- `sortBy` (optional): Field to sort by
- `sortOrder` (optional): asc or desc

**Response Headers**:
```http
X-Total-Count: 150
X-Page-Count: 8
X-Current-Page: 1
X-Page-Size: 20
``` 