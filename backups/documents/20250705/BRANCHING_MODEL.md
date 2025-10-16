# 🌿 Git Branching Model & Workflow

**Organic Farm Management System (OFMS)**

## 🎯 **BRANCHING STRATEGY OVERVIEW**

**Model**: GitFlow-inspired with simplified production workflow  
**Primary Branches**: `main`, `development`, `feature/*`, `hotfix/*`  
**Release Cycle**: Continuous integration with staged deployments  
**Branch Protection**: Enforced on `main` and `development` branches

---

## 🏗️ **BRANCH STRUCTURE**

### **Core Branches**

#### 1. **`main`** - Production Branch 🚀
- **Purpose**: Production-ready code only
- **Protection**: Branch protection enabled
- **Deployment**: Automatic deployment to production
- **Merge Policy**: Only from `development` via pull request
- **Stability**: Always deployable, thoroughly tested

#### 2. **`development`** - Integration Branch 🔧
- **Purpose**: Integration of new features and fixes
- **Source**: Base for all feature branches
- **Merge Target**: Features merge here first
- **Testing**: Comprehensive testing before merging to `main`
- **Stability**: Stable but may contain experimental features

#### 3. **`in-progress`** - Active Development Branch ⚡
- **Purpose**: Current working branch for active development
- **Usage**: Day-to-day development and feature implementation
- **Flexibility**: More frequent commits and experimental work
- **Integration**: Regular merging to `development` when features are complete

### **Supporting Branches**

#### **Feature Branches** (`feature/*`)
```bash
# Naming convention
feature/user-management-enhancement
feature/financial-analytics-dashboard
feature/compliance-automation
feature/issue-123-batch-tracking
```

- **Lifetime**: Short-lived (1-2 weeks max)
- **Source**: Branch from `development`
- **Merge Target**: Back to `development`
- **Naming**: `feature/descriptive-name` or `feature/issue-number-description`

#### **Hotfix Branches** (`hotfix/*`)
```bash
# Naming convention
hotfix/critical-calculation-fix
hotfix/security-vulnerability-patch
hotfix/production-database-issue
```

- **Lifetime**: Very short-lived (hours to days)
- **Source**: Branch from `main`
- **Merge Target**: Both `main` and `development`
- **Priority**: Immediate production fixes only

#### **Release Branches** (`release/*`)
```bash
# Naming convention
release/v1.0.0
release/v1.1.0-beta
release/sprint-15
```

- **Lifetime**: Short-lived (days to weeks)
- **Source**: Branch from `development`
- **Purpose**: Prepare for production release
- **Activities**: Final testing, bug fixes, version updates

---

## 🔄 **WORKFLOW PATTERNS**

### **Standard Feature Development**

#### 1. **Create Feature Branch**
```bash
# Switch to development
git checkout development
git pull origin development

# Create and switch to feature branch
git checkout -b feature/new-analytics-dashboard

# Push branch to remote
git push -u origin feature/new-analytics-dashboard
```

#### 2. **Development Process**
```bash
# Regular commits during development
git add .
git commit -m "feat: add revenue analytics component"

# Push changes regularly
git push origin feature/new-analytics-dashboard

# Keep feature branch updated with development
git checkout development
git pull origin development
git checkout feature/new-analytics-dashboard
git merge development
```

#### 3. **Complete Feature**
```bash
# Final testing and quality checks
npm run quality:check
npm run test
npm run build

# Push final changes
git push origin feature/new-analytics-dashboard

# Create pull request to development branch
# PR Title: "feat: Add comprehensive analytics dashboard"
# Include: Description, testing notes, breaking changes
```

### **Hotfix Workflow**

#### 1. **Critical Issue Identified**
```bash
# Branch from main for critical fixes
git checkout main
git pull origin main
git checkout -b hotfix/critical-calculation-fix
```

#### 2. **Apply Fix**
```bash
# Make necessary changes
git add .
git commit -m "fix: resolve division by zero in growth calculations"

# Test thoroughly
npm run test
npm run build

# Push hotfix
git push -u origin hotfix/critical-calculation-fix
```

#### 3. **Deploy Fix**
```bash
# Create PR to main (immediate deployment)
# Create PR to development (keep branches in sync)
# Tag release after merge: git tag v1.0.1
```

### **Release Process**

#### 1. **Prepare Release**
```bash
# Create release branch from development
git checkout development
git pull origin development
git checkout -b release/v1.1.0

# Update version numbers, documentation
npm version minor
git commit -am "chore: bump version to v1.1.0"

# Final testing and bug fixes only
```

#### 2. **Deploy Release**
```bash
# Merge to main
git checkout main
git merge --no-ff release/v1.1.0

# Tag release
git tag -a v1.1.0 -m "Release version 1.1.0"

# Merge back to development
git checkout development
git merge --no-ff release/v1.1.0

# Clean up release branch
git branch -d release/v1.1.0
git push origin --delete release/v1.1.0
```

---

## 📝 **COMMIT CONVENTIONS**

### **Conventional Commit Format**
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### **Commit Types**
| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): add multi-role user management` |
| `fix` | Bug fix | `fix(calc): resolve division by zero in analytics` |
| `docs` | Documentation | `docs(api): update endpoint documentation` |
| `style` | Code style/formatting | `style(css): fix linting issues in forms` |
| `refactor` | Code refactoring | `refactor(db): optimize query performance` |
| `test` | Adding/updating tests | `test(auth): add user authentication tests` |
| `chore` | Maintenance tasks | `chore(deps): update dependency versions` |
| `perf` | Performance improvements | `perf(api): optimize database queries` |
| `ci` | CI/CD changes | `ci(github): update automated test workflow` |

### **Scope Examples**
- `auth` - Authentication system
- `db` - Database operations
- `ui` - User interface components
- `api` - API endpoints
- `calc` - Calculations and analytics
- `compliance` - Regulatory compliance features
- `test` - Testing infrastructure

### **Good Commit Examples**
```bash
feat(analytics): add comprehensive financial dashboard
fix(orders): resolve order total calculation precision
docs(setup): update installation instructions
style(forms): improve responsive design consistency
refactor(auth): simplify role-based access control
test(integration): add API endpoint testing suite
chore(security): update dependencies for vulnerabilities
perf(db): optimize batch query performance
```

---

## 🛡️ **BRANCH PROTECTION RULES**

### **Main Branch Protection** 🔒
- ✅ Require pull request reviews (minimum 1 reviewer)
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Restrict pushes that create new commits
- ✅ Include administrators in restrictions

### **Development Branch Protection** 🛡️
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Dismiss stale reviews when new commits are pushed
- ✅ Allow force pushes for emergency fixes (admin only)

### **Required Status Checks** ✅
```yaml
# Required checks before merge
- lint-and-test
- build-verification
- security-scan
- type-check
- css-validation
```

---

## 🔍 **CODE REVIEW PROCESS**

### **Pull Request Requirements**
1. **Descriptive Title**: Use conventional commit format
2. **Detailed Description**: Explain changes, rationale, and impact
3. **Testing Notes**: How changes were tested
4. **Breaking Changes**: List any breaking changes
5. **Screenshots**: For UI changes
6. **Checklist**: Completed PR template checklist

### **Review Criteria**
- ✅ Code follows project standards
- ✅ Tests pass and coverage maintained
- ✅ Documentation updated if needed
- ✅ No security vulnerabilities introduced
- ✅ Performance impact considered
- ✅ Accessibility requirements met

### **PR Template Checklist**
```markdown
## Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for hard-to-understand areas
- [ ] Documentation updated for changes
- [ ] No new warnings introduced
- [ ] Tests added/updated for changes
- [ ] All tests pass locally
- [ ] Build succeeds without errors
- [ ] Changes are backward compatible
- [ ] Security implications considered
```

---

## 🚀 **DEPLOYMENT STRATEGY**

### **Environment Promotion**
```
feature/* → development → staging → main → production
```

### **Automated Deployments**
- **Development**: Auto-deploy on push to `development`
- **Staging**: Auto-deploy on push to `release/*`
- **Production**: Auto-deploy on push to `main`

### **Manual Deployments**
- **Hotfixes**: Manual trigger for immediate production deployment
- **Emergency**: Manual rollback capabilities

---

## 🔧 **USEFUL GIT ALIASES**

### **Setup Git Aliases**
```bash
# Quick status and log
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch

# Enhanced logging
git config --global alias.lg "log --oneline --decorate --graph --all"
git config --global alias.ls "log --pretty=format:'%C(yellow)%h%Creset %ad%Cred%d%Creset %s%Cblue [%cn]%Creset' --decorate --date=short"

# Useful shortcuts
git config --global alias.unstage "reset HEAD --"
git config --global alias.last "log -1 HEAD"

# Branch management
git config --global alias.cleanup "!git branch --merged | grep -v '\\*\\|main\\|development' | xargs -n 1 git branch -d"
```

### **Common Git Commands**
```bash
# Quick feature branch creation
git co development && git pull && git co -b feature/new-feature

# Update feature branch with latest development
git co development && git pull && git co feature/branch && git merge development

# Clean up merged branches
git cleanup

# Interactive rebase for clean commit history
git rebase -i HEAD~3
```

---

## 📊 **BRANCH METRICS**

### **Branch Health Indicators**
- **Branch Age**: Feature branches should be short-lived (< 2 weeks)
- **Merge Frequency**: Regular merging to avoid conflicts
- **Review Time**: Target < 24 hours for review turnaround
- **Test Coverage**: Maintain > 80% test coverage
- **Build Success**: > 95% build success rate

### **Monitoring Commands**
```bash
# Check branch age
git for-each-ref --format='%(committerdate) %09 %(authorname) %09 %(refname)' | sort -k1

# Check unmerged branches
git branch --no-merged development

# Check branch statistics
git shortlog -sn --since="1 month ago"
```

---

## 🎯 **BEST PRACTICES**

### **DO's** ✅
- ✅ Use descriptive branch names
- ✅ Keep feature branches small and focused
- ✅ Write clear, conventional commit messages
- ✅ Test thoroughly before creating PR
- ✅ Update documentation with changes
- ✅ Rebase feature branches to keep clean history
- ✅ Delete merged branches promptly

### **DON'Ts** ❌
- ❌ Commit directly to `main` or `development`
- ❌ Create long-lived feature branches
- ❌ Skip code review process
- ❌ Force push to shared branches
- ❌ Merge without testing
- ❌ Use unclear commit messages
- ❌ Leave broken code in development

---

## 🆘 **EMERGENCY PROCEDURES**

### **Critical Production Issue**
1. **Immediate Response**: Create hotfix branch from `main`
2. **Quick Fix**: Implement minimal fix for issue
3. **Fast Track**: Emergency PR review and merge
4. **Deploy**: Immediate production deployment
5. **Follow Up**: Comprehensive fix in next release

### **Failed Deployment Recovery**
```bash
# Rollback to previous version
git checkout main
git reset --hard HEAD~1
git push --force-with-lease origin main

# Or revert specific commit
git revert <commit-hash>
git push origin main
```

### **Emergency Contacts**
- **Lead Developer**: Immediate code review
- **DevOps**: Deployment and infrastructure issues
- **Product Owner**: Business impact assessment

---

## 📚 **RESOURCES**

### **Documentation**
- [Git Flow Model](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

### **Tools**
- **GitKraken**: Visual Git client
- **GitHub CLI**: Command-line GitHub integration
- **Husky**: Git hooks for quality enforcement

---

**🌿 Professional Git Workflow Established** ✅  
**Last Updated**: January 2025  
**Compliance**: Full workflow automation and protection  
**Status**: Production-ready branching model active 