# RUN THIS NOW - Emergency Deployment Guide

## 🚨 Website Not Loading - Quick Fix

### Step 1: Push Latest Code to GitHub

**On your local machine (run this first):**

```bash
cd /Users/ashu/Desktop/stash/focusflow

# Add all fixes
git add .

# Commit
git commit -m "Emergency deployment with all fixes - nginx, Django settings, SSL"

# Push to GitHub
git push origin main
```

### Step 2: Deploy on EC2

**SSH to your EC2 instance:**

```bash
ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP
```

**Then run the emergency deployment:**

```bash
cd ~/focusflow

# Make script executable
chmod +x emergency-deploy.sh

# Run emergency deployment
./emergency-deploy.sh
```

This script will:
1. ✅ Stop all services
2. ✅ Pull latest code with all fixes
3. ✅ Rebuild Docker images
4. ✅ Start all services
5. ✅ Run migrations
6. ✅ Collect static files
7. ✅ Create admin user
8. ✅ Test all endpoints
9. ✅ Show detailed diagnostics

**Time: ~5-7 minutes**

---

## 🔍 If Website Still Not Loading

### Quick Diagnostics

```bash
# Check what's running
docker ps

# Check if nginx config is valid
docker-compose -f docker-compose.prod.yml --env-file .env.production exec nginx nginx -t

# Check nginx logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs nginx --tail=50

# Check backend logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs backend --tail=50

# Check SSL certificates
ls -la certbot/conf/live/breathingmonk.com/
```

### Common Issues & Quick Fixes

#### Issue 1: SSL Certificate Missing

**Symptoms:** Website not loading at all

**Fix:**
```bash
# Use HTTP-only config temporarily
mv nginx/conf.d/focusflow.conf nginx/conf.d/focusflow-https.conf.disabled
mv nginx/conf.d/focusflow-http-only.conf.disabled nginx/conf.d/focusflow-http-only.conf

# Restart nginx
docker-compose -f docker-compose.prod.yml --env-file .env.production restart nginx

# Test HTTP
curl http://breathingmonk.com/
```

#### Issue 2: Nginx Not Starting

**Symptoms:** Nginx container keeps restarting

**Check:**
```bash
# View nginx logs
docker logs focusflow_nginx

# Test nginx config
docker-compose -f docker-compose.prod.yml --env-file .env.production exec nginx nginx -t
```

**Fix:**
```bash
# Rebuild and restart
docker-compose -f docker-compose.prod.yml --env-file .env.production down
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build nginx
```

#### Issue 3: Backend Not Responding

**Symptoms:** Main site loads but admin/API don't work

**Check:**
```bash
# Check if backend is running
docker ps | grep backend

# Check backend logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs backend
```

**Fix:**
```bash
# Restart backend
docker-compose -f docker-compose.prod.yml --env-file .env.production restart backend
```

#### Issue 4: Database Not Healthy

**Symptoms:** Backend can't connect to database

**Check:**
```bash
# Check database status
docker-compose -f docker-compose.prod.yml --env-file .env.production ps db

# Check database logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs db
```

**Fix:**
```bash
# Restart database
docker-compose -f docker-compose.prod.yml --env-file .env.production restart db

# Wait for it to become healthy
sleep 10

# Restart backend
docker-compose -f docker-compose.prod.yml --env-file .env.production restart backend
```

---

## 📊 Expected Results After Deployment

### Services Running

```bash
docker ps
```

Should show:
- ✅ focusflow_nginx
- ✅ focusflow_backend
- ✅ focusflow_frontend
- ✅ focusflow_db
- ✅ focusflow_certbot

### URLs Working

1. **Main Site:**
   ```bash
   curl -I https://breathingmonk.com/
   ```
   Expected: `HTTP/2 200`

2. **Admin Page:**
   ```bash
   curl -I https://breathingmonk.com/admin/
   ```
   Expected: `HTTP/2 200` or `HTTP/2 302`

3. **API:**
   ```bash
   curl -I https://breathingmonk.com/api/
   ```
   Expected: `HTTP/2 401` (unauthorized - normal, means API is working)

### In Browser

- ✅ https://breathingmonk.com/ - Shows React app
- ✅ https://breathingmonk.com/admin/ - Shows Django admin login
- ✅ Can login with `admin` / `admin123`

---

## 🆘 Emergency Rollback

If deployment breaks everything:

```bash
# Stop everything
docker-compose -f docker-compose.prod.yml --env-file .env.production down

# Remove all containers and volumes (CAREFUL - deletes data!)
docker-compose -f docker-compose.prod.yml --env-file .env.production down -v

# Start fresh
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

---

## 📞 Get Detailed Diagnostics

```bash
# Run full diagnostic
./diagnose.sh

# Or check individual services
./manage-prod.sh status
./manage-prod.sh logs
```

---

## ✅ Success Checklist

After running `./emergency-deploy.sh`:

- [ ] All 5 containers are running (docker ps)
- [ ] No containers in "Restarting" state
- [ ] https://breathingmonk.com/ loads (shows React app)
- [ ] https://breathingmonk.com/admin/ loads (shows login)
- [ ] https://breathingmonk.com/api/ returns response
- [ ] Can login to admin with admin/admin123
- [ ] No 301 redirect loops
- [ ] No 502 Bad Gateway errors

---

## 🎯 Next Steps After Success

1. **Change admin password:**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py changepassword admin
   ```

2. **Create your user account** via the web interface

3. **Test all features:**
   - Create goals
   - Create tasks
   - Add daily logs
   - Check dashboard

4. **Set up GitHub Actions** (optional) for future deployments

---

**Run this command on EC2 NOW:**

```bash
cd ~/focusflow && chmod +x emergency-deploy.sh && ./emergency-deploy.sh
```

This will deploy everything and tell you exactly what's working or not working! 🚀
