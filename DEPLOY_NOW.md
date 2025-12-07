# 🚀 DEPLOY TO EC2 NOW - Quick Guide

## Current Status
✅ All fixes applied and tested locally
✅ Production config ready for www.breathingmonk.com
✅ Nginx SSL config enabled
✅ Registration working perfectly

---

## Quick Deployment Steps

### 1️⃣ **Push Code to GitHub** (Run on your Mac)

```bash
cd /Users/ashu/Desktop/stash/focusflow

# Stage all changes
git add .

# Commit
git commit -m "Production ready: nginx fixes, registration working, SSL config enabled"

# Push to GitHub
git push origin main
```

---

### 2️⃣ **SSH to EC2**

```bash
ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP
```

*(Replace YOUR_EC2_IP with your actual EC2 public IP)*

---

### 3️⃣ **Deploy on EC2** (Run on EC2 server)

```bash
# Go to project directory
cd ~/focusflow

# Pull latest code
git pull origin main

# Run emergency deployment script
chmod +x emergency-deploy.sh
./emergency-deploy.sh
```

**That's it!** The script does everything automatically.

---

## After Deployment - Test These URLs

Open in your browser:

1. **Main App:** https://breathingmonk.com/
2. **Registration:** https://breathingmonk.com/register  ← **This should work now!**
3. **Login:** https://breathingmonk.com/login
4. **Admin:** https://breathingmonk.com/admin/ (admin / Darunpur@#2025)

---

## What Was Fixed

1. ✅ Nginx upstream error - Fixed port in proxy_pass
2. ✅ Duplicate upstream definitions - Proper config enabled
3. ✅ Django ALLOWED_HOSTS - Correct domains
4. ✅ Frontend API URL - Points to https://breathingmonk.com/api
5. ✅ Registration - Fully working!

---

**Your app will be live at https://breathingmonk.com in ~10 minutes!** 🎉
