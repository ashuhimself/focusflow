# Deploy FocusFlow to EC2 (www.breathingmonk.com)

## Complete Deployment Guide

This guide will help you deploy FocusFlow to your EC2 instance with the domain **www.breathingmonk.com**.

---

## Prerequisites

Before deploying, ensure:

1. ✅ **EC2 Instance is running** with Ubuntu
2. ✅ **Domain DNS configured**: `breathingmonk.com` and `www.breathingmonk.com` point to EC2 IP
3. ✅ **SSH access** to EC2: `ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP`
4. ✅ **Security Group rules**:
   - Port 80 (HTTP) - open to 0.0.0.0/0
   - Port 443 (HTTPS) - open to 0.0.0.0/0
   - Port 22 (SSH) - open to your IP

---

## Step 1: Push Latest Code to GitHub

**On your local machine:**

```bash
cd /Users/ashu/Desktop/stash/focusflow

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Production deployment ready - nginx fixed, registration working"

# Push to GitHub
git push origin main
```

**Verify your changes:**
- ✅ `.env.production` has production settings (VITE_API_URL=https://breathingmonk.com/api)
- ✅ `nginx/conf.d/focusflow.conf` is enabled (with SSL)
- ✅ `nginx/conf.d/focusflow-http-only.conf.disabled` is disabled
- ✅ All nginx upstream errors fixed

---

## Step 2: SSH to EC2

```bash
ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP
```

Replace `YOUR_EC2_IP` with your actual EC2 public IP address.

---

## Step 3: Install Docker (If Not Already Installed)

```bash
# Update system
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt-get install -y docker-compose-plugin

# Logout and login again for group changes
exit
# Then SSH back in
```

---

## Step 4: Clone or Update Repository

### If first time deployment:

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/focusflow.git
cd focusflow
```

### If already cloned (updating):

```bash
cd ~/focusflow

# Stop services first
docker-compose -f docker-compose.prod.yml --env-file .env.production down

# Pull latest changes
git fetch origin
git reset --hard origin/main
```

---

## Step 5: Setup Environment File

**Create `.env.production` on EC2:**

```bash
nano .env.production
```

**Paste this content:**

```bash
# FocusFlow Production Environment Configuration

# Django Backend Configuration
DEBUG=False
DJANGO_SECRET_KEY="a9f2c1b7e48d90f36ae542c8d917b6e4fa21cb77d9e3a4615b343324###"

# Domain Configuration
ALLOWED_HOSTS=breathingmonk.com,www.breathingmonk.com
CORS_ALLOWED_ORIGINS=https://breathingmonk.com,https://www.breathingmonk.com
CSRF_TRUSTED_ORIGINS=https://breathingmonk.com,https://www.breathingmonk.com

# Database Configuration
POSTGRES_DB=focusflow
POSTGRES_USER=focusflow
POSTGRES_PASSWORD="Darunpur@#$2025"

# Frontend Configuration
VITE_API_URL=https://breathingmonk.com/api
```

**Save:** Press `Ctrl+O`, `Enter`, then `Ctrl+X`

---

## Step 6: Setup SSL Certificates (First Time Only)

**If you don't have SSL certificates yet:**

```bash
# Make script executable
chmod +x setup-ssl.sh

# Run SSL setup script
./setup-ssl.sh
```

**During setup:**
- Enter your email when prompted
- Accept terms of service
- Certificates will be saved to `./certbot/conf/live/breathingmonk.com/`

**If certificates already exist, skip this step.**

---

## Step 7: Deploy with Emergency Script

```bash
# Make script executable
chmod +x emergency-deploy.sh

# Run deployment
./emergency-deploy.sh
```

**This script will:**
1. ✅ Check current services
2. ✅ Stop all services
3. ✅ Pull latest code from GitHub
4. ✅ Verify environment variables
5. ✅ Build Docker images (with --no-cache)
6. ✅ Start all services
7. ✅ Wait for initialization
8. ✅ Run database migrations
9. ✅ Collect static files
10. ✅ Create admin user (if doesn't exist)
11. ✅ Test all endpoints
12. ✅ Show diagnostics

**Expected output:**
```
========================================
   EMERGENCY DEPLOYMENT & FIX
========================================

[1/10] Checking if services are running...
[2/10] Stopping all services...
✓ All services stopped

[3/10] Pulling latest code...
✓ Code updated

[4/10] Checking environment variables...
✓ Environment variables OK

[5/10] Building Docker images...
✓ Images built

[6/10] Starting services...
✓ Services started

[7/10] Waiting for services to initialize...

[8/10] Checking service status...
✓ db is running
✓ backend is running
✓ frontend is running
✓ nginx is running

[9/10] Running database migrations and setup...
✓ Migrations applied
✓ Static files collected
✓ Admin user created: admin / Darunpur@#2025

[10/10] Testing endpoints...
✓ https://breathingmonk.com/ → HTTP 200
✓ https://breathingmonk.com/admin/ → HTTP 302
✓ https://breathingmonk.com/api/ → HTTP 401
```

**Duration:** ~5-10 minutes

---

## Step 8: Verify Deployment

### Check Services Status:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production ps
```

**Expected output:**
```
NAME                 IMAGE                COMMAND                  STATUS
focusflow_backend    focusflow-backend    ...                     Up
focusflow_certbot    certbot/certbot      ...                     Up
focusflow_db         postgres:15-alpine   ...                     Up (healthy)
focusflow_frontend   focusflow-frontend   ...                     Up
focusflow_nginx      nginx:alpine         ...                     Up
```

### Test URLs from EC2:

```bash
# Test main site
curl -I https://breathingmonk.com/

# Test www redirect
curl -I https://www.breathingmonk.com/

# Test admin
curl -I https://breathingmonk.com/admin/

# Test API
curl -I https://breathingmonk.com/api/

# Test registration endpoint
curl -X POST https://breathingmonk.com/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Test123!","password_confirm":"Test123!","first_name":"Test","last_name":"User"}'
```

### View Logs:

```bash
# All logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Specific service
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f nginx
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f backend
```

---

## Step 9: Test in Browser

**Open your browser and test:**

1. **Main Site:** https://breathingmonk.com/
   - Should load React app
   - Should redirect from HTTP to HTTPS

2. **Registration:** https://breathingmonk.com/register
   - Fill in the form
   - Submit
   - Should see: "Registration successful! Your account is pending admin approval."

3. **Login:** https://breathingmonk.com/login
   - Should load login form

4. **Admin:** https://breathingmonk.com/admin/
   - Login: `admin` / `Darunpur@#2025`
   - Should access Django admin panel

5. **Approve Users:**
   - In admin, go to "User Profiles"
   - Find newly registered users
   - Check "is_approved" checkbox
   - Save

---

## Step 10: Common Issues & Fixes

### Issue 1: Nginx not starting

```bash
# Check nginx logs
docker logs focusflow_nginx

# Test nginx config
docker-compose -f docker-compose.prod.yml --env-file .env.production exec nginx nginx -t

# If config error, check conf files
ls -la nginx/conf.d/
```

### Issue 2: SSL Certificate Missing

```bash
# Check certificates
ls -la certbot/conf/live/breathingmonk.com/

# If missing, run setup again
./setup-ssl.sh
```

### Issue 3: Backend 400 Bad Request

```bash
# Check backend logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs backend | tail -50

# Verify ALLOWED_HOSTS in .env.production
cat .env.production | grep ALLOWED_HOSTS
```

### Issue 4: Registration not working

```bash
# Test registration from EC2
curl -X POST https://breathingmonk.com/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test2","email":"test2@test.com","password":"Test123!","password_confirm":"Test123!","first_name":"Test","last_name":"User"}'

# Should return: {"user":{...},"message":"Registration successful!..."}
```

### Issue 5: Database not healthy

```bash
# Check database status
docker-compose -f docker-compose.prod.yml --env-file .env.production ps db

# Check database logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs db

# Restart database
docker-compose -f docker-compose.prod.yml --env-file .env.production restart db
```

---

## Useful Commands

### Start Services:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Stop Services:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production down
```

### Rebuild Services:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### View Logs:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f [service]
```

### Check Status:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production ps
```

### Django Shell:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py shell
```

### Create Superuser:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py createsuperuser
```

### Approve User via Shell:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py shell

# In shell:
from core.models import UserProfile
profile = UserProfile.objects.get(user__username='username')
profile.is_approved = True
profile.save()
exit()
```

---

## Success Checklist

After deployment, verify:

- [ ] All 5 containers running (nginx, backend, frontend, db, certbot)
- [ ] https://breathingmonk.com/ loads React app
- [ ] https://breathingmonk.com/register - registration form works
- [ ] https://breathingmonk.com/login - login form loads
- [ ] https://breathingmonk.com/admin/ - admin panel accessible
- [ ] HTTP redirects to HTTPS
- [ ] Can register new user via UI
- [ ] Can approve user in admin panel
- [ ] Approved user can login
- [ ] No 301 redirect loops
- [ ] No 502 Bad Gateway errors
- [ ] No nginx upstream errors in logs

---

## Support

If you encounter issues:

1. Check logs: `docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f`
2. Check service status: `docker-compose -f docker-compose.prod.yml --env-file .env.production ps`
3. Check nginx config: `docker-compose -f docker-compose.prod.yml --env-file .env.production exec nginx nginx -t`
4. Re-run deployment: `./emergency-deploy.sh`

---

## What's Different from Local?

| Setting | Local (localhost) | Production (EC2) |
|---------|------------------|------------------|
| VITE_API_URL | http://localhost/api | https://breathingmonk.com/api |
| ALLOWED_HOSTS | localhost,127.0.0.1 | breathingmonk.com,www.breathingmonk.com |
| CORS_ALLOWED_ORIGINS | http://localhost | https://breathingmonk.com |
| Nginx Config | focusflow-http-only.conf | focusflow.conf (with SSL) |
| Protocol | HTTP | HTTPS (SSL/TLS) |
| Certificates | None | Let's Encrypt via Certbot |

---

**You're all set! Your FocusFlow app should now be live at https://breathingmonk.com/** 🚀
