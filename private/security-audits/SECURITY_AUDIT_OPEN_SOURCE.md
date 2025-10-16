# OFMS Open Source Security Audit

## 🔒 Security Audit Results

**Date:** 2025-10-11  
**Purpose:** Prepare OFMS for open source release  
**Status:** ⚠️ CREDENTIALS FOUND - CLEANUP REQUIRED

---

## 🚨 **CRITICAL FINDINGS**

### 1. **Database Credentials in Scripts** ❌ HIGH RISK

**Files with hardcoded database passwords:**
- `scripts/ofms-sql-data-seeder.js` (Line 39)
- `scripts/ofms-data-seeder.js` (Lines 49-50)
- `scripts/test-seeder.js` (Line 10)
- `scripts/ofms-real-data-seeder.js` (Line 41)

**Exposed credential:**
```
postgresql://postgres:postgres-cbr!000Rr@localhost:5432/afarm_d
```

**Risk:** Database password exposed in git history

---

### 2. **Test/Demo Passwords in Code** ⚠️ MEDIUM RISK

**Files with hardcoded test passwords:**
- `automation/real-crud-test.js`
- `automation/ofms-data-entry-original.js`
- `automation/ofms-data-entry-fixed.js`
- `automation/ofms-data-entry.js`
- `automation/ofms-data-entry-backup.js`
- `automation/ofms-fixed-demo.js`
- `automation/lib/auth-helper.js`
- `automation/fixtures/test-data.json`
- `scripts/ofms-data-generator.js`
- `scripts/ofms-admin-tools.js`

**Exposed credentials:**
```javascript
admin@ofms.com / ofmsadmin123
manager@ofms.com / manager123
worker@ofms.com / worker123
```

**Risk:** If these are real accounts, they're compromised

---

### 3. **.env File** ✅ SAFE (Not in Git)

**Status:** `.env` is properly gitignored and NOT in git history
- ✅ Not tracked in git
- ✅ Listed in `.gitignore`
- ✅ No commits found

---

## ✅ **CLEANUP REQUIRED**

### Step 1: Remove Hardcoded Database Credentials

**Files to fix:**
1. `scripts/ofms-sql-data-seeder.js`
2. `scripts/ofms-data-seeder.js`
3. `scripts/test-seeder.js`
4. `scripts/ofms-real-data-seeder.js`

**Action:** Replace with environment variables

---

### Step 2: Sanitize Test Credentials

**Files to fix:**
1. All automation scripts
2. `automation/lib/auth-helper.js`
3. `automation/fixtures/test-data.json`
4. `scripts/ofms-data-generator.js`
5. `scripts/ofms-admin-tools.js`

**Action:** Use generic test credentials or environment variables

---

### Step 3: Clean Git History

**Required:** Remove sensitive data from all commits

**Tools:**
- `git filter-repo` (recommended)
- `BFG Repo-Cleaner` (alternative)

---

## 🛠️ **REMEDIATION PLAN**

### Phase 1: Update Code (Immediate)

1. ✅ Replace all hardcoded DB credentials with `process.env.DATABASE_URL`
2. ✅ Replace test passwords with generic ones
3. ✅ Create `.env.example` file
4. ✅ Update documentation

### Phase 2: Clean Git History (Before Open Source)

1. ⚠️ Use `git filter-repo` to remove sensitive data
2. ⚠️ Force push to remote (if exists)
3. ⚠️ Notify all contributors to re-clone

### Phase 3: Security Best Practices (Ongoing)

1. ✅ Add pre-commit hooks to prevent credential commits
2. ✅ Use secret scanning tools
3. ✅ Document security practices
4. ✅ Set up GitHub secret scanning

---

## 📋 **FILES TO MODIFY**

### High Priority (Database Credentials)
```
scripts/ofms-sql-data-seeder.js
scripts/ofms-data-seeder.js
scripts/test-seeder.js
scripts/ofms-real-data-seeder.js
```

### Medium Priority (Test Credentials)
```
automation/real-crud-test.js
automation/ofms-data-entry-original.js
automation/ofms-data-entry-fixed.js
automation/ofms-data-entry.js
automation/ofms-data-entry-backup.js
automation/ofms-fixed-demo.js
automation/lib/auth-helper.js
automation/fixtures/test-data.json
scripts/ofms-data-generator.js
scripts/ofms-admin-tools.js
```

### Low Priority (Documentation)
```
backups/documents/20250705/DATABASE_GUIDE.md
```

---

## 🔐 **RECOMMENDED CHANGES**

### Before (Insecure):
```javascript
const sourceDb = 'postgresql://postgres:postgres-cbr!000Rr@localhost:5432/afarm_d';
```

### After (Secure):
```javascript
const sourceDb = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dbname';
```

### Test Credentials Before (Insecure):
```javascript
async login(email = 'admin@ofms.com', password = 'ofmsadmin123') {
```

### Test Credentials After (Secure):
```javascript
async login(
  email = process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
  password = process.env.TEST_ADMIN_PASSWORD || 'test123'
) {
```

---

## 📝 **CREATE .env.example**

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Optional: Separate source/target databases for migration
SOURCE_DATABASE_URL="postgresql://username:password@localhost:5432/source_db"
TARGET_DATABASE_URL="postgresql://username:password@localhost:5432/target_db"

# Test Credentials (for automation/testing)
TEST_ADMIN_EMAIL="admin@example.com"
TEST_ADMIN_PASSWORD="change_me_in_production"
TEST_MANAGER_EMAIL="manager@example.com"
TEST_MANAGER_PASSWORD="change_me_in_production"

# Application Settings
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3005"
```

---

## 🚀 **GIT HISTORY CLEANUP COMMANDS**

### Option 1: Using git-filter-repo (Recommended)

```bash
# Install git-filter-repo
pip install git-filter-repo

# Create backup first!
git clone --mirror /path/to/repo /path/to/backup

# Remove sensitive patterns
git filter-repo --invert-paths --path-glob '*.env' --force
git filter-repo --replace-text <(echo 'postgres-cbr!000Rr==>REDACTED_PASSWORD')
git filter-repo --replace-text <(echo 'ofmsadmin123==>REDACTED_PASSWORD')
git filter-repo --replace-text <(echo 'manager123==>REDACTED_PASSWORD')
git filter-repo --replace-text <(echo 'worker123==>REDACTED_PASSWORD')
```

### Option 2: Using BFG Repo-Cleaner

```bash
# Download BFG
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# Create passwords.txt with sensitive strings
echo "postgres-cbr!000Rr" > passwords.txt
echo "ofmsadmin123" >> passwords.txt
echo "manager123" >> passwords.txt

# Run BFG
java -jar bfg-1.14.0.jar --replace-text passwords.txt /path/to/repo

# Clean up
cd /path/to/repo
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

## ✅ **VERIFICATION CHECKLIST**

Before open sourcing, verify:

- [ ] No `.env` files in git history
- [ ] No database passwords in any file
- [ ] No real user passwords in code
- [ ] `.env.example` created with safe defaults
- [ ] All scripts use environment variables
- [ ] Test credentials are generic
- [ ] README updated with setup instructions
- [ ] CONTRIBUTING.md created
- [ ] LICENSE file added
- [ ] Security policy documented
- [ ] GitHub secret scanning enabled

---

## 📚 **ADDITIONAL SECURITY MEASURES**

### 1. Pre-commit Hook

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Prevent committing .env files
if git diff --cached --name-only | grep -E '\.env$'; then
    echo "Error: Attempting to commit .env file"
    exit 1
fi

# Check for potential secrets
if git diff --cached | grep -iE 'password.*=.*["\']|api_key.*=|secret.*='; then
    echo "Warning: Potential secret detected in commit"
    echo "Please review your changes"
    exit 1
fi
```

### 2. GitHub Actions Secret Scanning

Create `.github/workflows/security.yml`:
```yaml
name: Security Scan
on: [push, pull_request]
jobs:
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: TruffleHog Secret Scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
```

### 3. .gitignore Additions

Ensure these are in `.gitignore`:
```
# Environment variables
.env
.env.local
.env.*.local
.env.production
.env.development

# Credentials
**/credentials.json
**/secrets.json
**/*.pem
**/*.key

# Database
*.db
*.sqlite
*.sqlite3
```

---

## 🎯 **NEXT STEPS**

1. **IMMEDIATE:** Fix all hardcoded credentials in code
2. **BEFORE PUSH:** Clean git history
3. **BEFORE OPEN SOURCE:** Add security documentation
4. **AFTER OPEN SOURCE:** Monitor for leaked secrets

---

## ⚠️ **IMPORTANT NOTES**

1. **Change all real passwords** after cleanup
2. **Backup repository** before git history cleanup
3. **Coordinate with team** if repo is shared
4. **Test thoroughly** after cleanup
5. **Document** the cleanup process

---

## 📞 **SECURITY CONTACTS**

If sensitive data is found after open sourcing:
1. Immediately rotate all credentials
2. Contact GitHub security
3. Issue security advisory
4. Update all deployments

---

**Status:** READY FOR CLEANUP  
**Risk Level:** HIGH (before cleanup) → LOW (after cleanup)  
**Timeline:** Complete before open source release
