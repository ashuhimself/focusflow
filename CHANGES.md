# Deployment Configuration Changes

## Summary of Updates (2025-12-08)

### 1. Domain Changed: insightned.com → breathingmonk.com

**Files Updated:**
- `.env.production` - All domain references
- `nginx/conf.d/focusflow.conf` - SSL certificates and server names
- `deploy.sh` - Application URLs and admin email
- `DEPLOYMENT.md` - Documentation references

### 2. Fixed Frontend Build Error

**Problem:**
```
ERROR [frontend builder 6/6] RUN npm run build
sh: vite: not found
```

**Root Cause:**
- `frontend/Dockerfile.prod` was using `npm ci --only=production`
- This skips devDependencies, but Vite is in devDependencies
- Build tools (Vite, Tailwind, PostCSS) are required for the build stage

**Solution:**
Changed in `frontend/Dockerfile.prod`:
```dockerfile
# BEFORE (BROKEN)
RUN npm ci --only=production

# AFTER (FIXED)
RUN npm ci
```

**Why This Works:**
- Multi-stage build still produces a minimal final image
- Stage 1 (builder) installs all dependencies to build the app
- Stage 2 (nginx) only copies the built static files
- Final image doesn't include node_modules, only the compiled output

### 3. Added Comprehensive Domain Configuration Guide

**New Section in DEPLOYMENT.md:**
- Step-by-step GoDaddy DNS configuration
- How to add A records for @ and www
- How to remove conflicting records (CNAME, forwarding)
- DNS propagation checking commands
- Troubleshooting DNS issues
- How to verify domain is pointing to EC2

**Key Steps Added:**
1. Get EC2 public IP address
2. Access GoDaddy DNS management
3. Add A records for root (@) and www
4. Remove conflicting records (CNAME for @, forwarding)
5. Disable domain forwarding
6. Wait for DNS propagation (10-30 min)
7. Verify with nslookup/dig
8. Test HTTP access before SSL

### 4. GitHub Actions CI/CD

**Created:**
- `.github/workflows/deploy.yml` - Auto-deployment on commit
- `GITHUB_SETUP.md` - Complete GitHub Actions setup guide

**Features:**
- Triggers on push to main branch
- Manual trigger option (workflow_dispatch)
- SSH connection to EC2
- Auto-pulls latest code
- Updates environment variables
- Rebuilds containers
- Runs migrations
- Verifies deployment
- Shows success/failure notifications

**Required GitHub Secrets:**
1. `EC2_SSH_KEY` - SSH private key (.pem file content)
2. `EC2_HOST` - EC2 public IP or domain
3. `EC2_USER` - SSH username (ubuntu)
4. `DJANGO_SECRET_KEY` - Django secret key
5. `POSTGRES_PASSWORD` - Database password

### 5. New Documentation Files

**QUICK_START.md:**
- Checklist-style deployment guide
- Pre-deployment requirements
- Step-by-step tasks with checkboxes
- Common issues and quick fixes
- Success criteria
- Maintenance commands

**GITHUB_SETUP.md:**
- GitHub Actions configuration guide
- How to add secrets
- Troubleshooting CI/CD issues
- Security best practices
- Workflow customization examples

**CHANGES.md (this file):**
- Summary of all changes
- Problem descriptions and solutions
- Migration notes

### 6. Updated Deployment Flow

**Before:**
1. Manual deployment only
2. No clear domain configuration steps
3. Frontend build failed

**After:**
1. Initial manual deployment
2. Automatic deployment via GitHub Actions on every commit
3. Clear GoDaddy DNS configuration steps
4. Frontend builds successfully
5. SSL certificate auto-renewal configured

---

## Breaking Changes

None. All changes are backwards compatible.

---

## Migration Guide

If you already have a partially deployed instance:

### Update Domain References

1. Pull latest changes:
   ```bash
   git pull origin main
   ```

2. Update `.env.production`:
   ```bash
   nano .env.production
   # Change all insightned.com to breathingmonk.com
   ```

3. Rebuild and restart:
   ```bash
   ./deploy.sh
   ```

### Fix Frontend Build

If you're experiencing frontend build errors:

1. Pull latest `frontend/Dockerfile.prod`
2. Rebuild:
   ```bash
   docker-compose -f docker-compose.prod.yml build frontend --no-cache
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Add GitHub CI/CD

Follow [GITHUB_SETUP.md](GITHUB_SETUP.md) to enable automatic deployments.

---

## Testing Checklist

Before deploying to production:

- [x] Frontend Docker build succeeds locally
- [x] Backend Docker build succeeds locally
- [x] Docker Compose production config is valid
- [x] Domain configuration guide is comprehensive
- [x] GitHub Actions workflow syntax is correct
- [x] SSL certificate process is documented
- [x] All domain references updated to breathingmonk.com

---

## Files Modified

1. `.env.production` - Domain configuration
2. `frontend/Dockerfile.prod` - npm ci fix
3. `nginx/conf.d/focusflow.conf` - Domain and SSL paths
4. `deploy.sh` - Application URLs
5. `DEPLOYMENT.md` - Enhanced domain configuration

## Files Created

1. `.github/workflows/deploy.yml` - GitHub Actions workflow
2. `GITHUB_SETUP.md` - CI/CD setup guide
3. `QUICK_START.md` - Deployment checklist
4. `CHANGES.md` - This file

---

## Next Steps

1. ✅ Push changes to GitHub
2. ✅ Follow QUICK_START.md for deployment
3. ✅ Configure GoDaddy DNS to point to EC2
4. ✅ Set up SSL certificate
5. ✅ Configure GitHub Actions for auto-deployment

---

## Support

For issues:
- Frontend build: See "Fixed Frontend Build Error" above
- Domain configuration: See DEPLOYMENT.md Domain Configuration section
- GitHub CI/CD: See GITHUB_SETUP.md
- General deployment: See QUICK_START.md

---

**Last Updated:** 2025-12-08
**Domain:** breathingmonk.com
**Deployment:** AWS EC2 + Docker + GitHub Actions
