# Port Configuration - Organic Farm Management System (OFMS)

## 🚪 Port Assignment Policy

**All ports (except PostgreSQL) are incremented by +5 to avoid conflicts.**

## 📋 Current Port Configuration

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Development** | `3005` | `http://localhost:3005` | Local development with hot reload |
| **Test Environment** | `7035` | `http://localhost:7035` | Production build testing |
| **PostgreSQL Database** | `5432` | `localhost:5432` | Database server (unchanged) |

## 🔧 Port Increment Policy

- **Base ports**: 3000 (dev), 7030 (test)
- **Increment**: +5 for conflict avoidance
- **Result**: 3005 (dev), 7035 (test)
- **Exception**: PostgreSQL remains on standard port 5432

## 📝 Configuration Locations

### Package.json Scripts
```json
{
  "dev": "next dev -p 3005",
  "start": "next start -p 7035"
}
```

### Environment Variables
```bash
NEXTAUTH_URL="http://localhost:3005"  # Development
DATABASE_URL="postgresql://user:pass@localhost:5432/db"  # Database
```

### Script Commands
```bash
# Development
npm run dev                    # → http://localhost:3005

# Test Environment  
./scripts/dev-instances.sh test  # → http://localhost:7035
```

## 🌐 Service URLs

### Development Environment
- **Application**: http://localhost:3005
- **Database**: localhost:5432
- **Hot Reload**: Enabled
- **Environment**: `NODE_ENV=development`

### Test Environment
- **Application**: http://localhost:7035
- **Database**: localhost:5432  
- **Production Build**: Enabled
- **Environment**: `NODE_ENV=test`

## 🚨 Port Conflict Prevention

The +5 increment ensures:
- ✅ **No conflicts** with standard development tools
- ✅ **Clear separation** between environments
- ✅ **Consistent policy** across all services
- ✅ **Easy to remember** (+5 rule)

## 🛠️ Quick Commands

```bash
# Check port status
lsof -i :3005  # Development
lsof -i :7035  # Test environment
lsof -i :5432  # PostgreSQL

# Kill processes if needed
lsof -ti:3005 | xargs kill -9  # Kill dev server
lsof -ti:7035 | xargs kill -9  # Kill test server

# Start services
npm run dev                    # Development (3005)
./scripts/dev-instances.sh test  # Test (7035)
```

---

**Project**: Organic Farm Management System (OFMS)  
**Policy**: +5 Port Increment for Conflict Avoidance  
**Last Updated**: January 2025  
**Repository**: https://github.com/sharedoxygen/organic-farmer 