# Deploy FocusFlow NOW - Zero Pain Guide

## ✅ Before You Start

**On your local machine:**

1. Verify `.env.production` has your secrets set (already done ✓):
   ```bash
   cat .env.production
   # Should show your DJANGO_SECRET_KEY and POSTGRES_PASSWORD
   ```

2. Push latest code to GitHub:
   ```bash
   git add .
   git commit -m "Deploy with automated SSL setup"
   git push origin main
   ```

## 🚀 On Your EC2 Instance

### ONE COMMAND TO DEPLOY EVERYTHING

```bash
# SSH into EC2
ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP

# Go to project directory
cd ~/focusflow

# Pull latest code
git pull origin main

# Make scripts executable
chmod +x deploy-with-ssl.sh manage-prod.sh

# RUN THE MAGIC SCRIPT - Handles everything including SSL!
./deploy-with-ssl.sh
```

That's it! The script will:
1. ✅ Check environment variables
2. ✅ Verify DNS is configured
3. ✅ Stop old containers
4. ✅ Build new images
5. ✅ Start in HTTP mode first
6. ✅ Run database migrations
7. ✅ Obtain SSL certificate automatically
8. ✅ Switch to HTTPS mode
9. ✅ Test everything

## 🎯 What Happens

### Phase 1: HTTP Mode (First ~30 seconds)
- Services start without SSL
- Database migrations run
- Static files collected
- Health check passed

### Phase 2: SSL Certificate (Next ~30 seconds)
- Nginx stops temporarily
- Let's Encrypt certificate obtained
- Certificate saved to `certbot/conf/`

### Phase 3: HTTPS Mode (Final ~20 seconds)
- HTTPS configuration enabled
- All services restart with SSL
- HTTP automatically redirects to HTTPS
- ✅ **DONE!**

## ✨ After Deployment

Your app will be live at:
- 🌐 **https://breathingmonk.com** (SSL enabled!)
- 🔧 **https://breathingmonk.com/admin** (Admin panel)
- 📊 **https://breathingmonk.com/api** (API endpoints)

## 🔐 Change Admin Password (IMPORTANT!)

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py changepassword admin
```

Or use the management script:
```bash
./manage-prod.sh shell
# Then in Django shell:
from django.contrib.auth import get_user_model
User = get_user_model()
admin = User.objects.get(username='admin')
admin.set_password('YourNewSecurePassword')
admin.save()
exit()
```

## 📋 Common Management Tasks

```bash
# View logs
./manage-prod.sh logs

# Check status
./manage-prod.sh status

# Restart services
./manage-prod.sh restart

# Backup database
./manage-prod.sh backup

# Update application (pull from GitHub)
./manage-prod.sh update
```

## 🐛 If Something Goes Wrong

### DNS Not Configured Yet
**Error:** `Domain breathingmonk.com does not resolve`

**Fix:** Configure GoDaddy DNS:
1. Go to GoDaddy → My Products → breathingmonk.com → DNS
2. Add A record: `@` → Your EC2 IP
3. Add A record: `www` → Your EC2 IP
4. Wait 10-30 minutes
5. Run `./deploy-with-ssl.sh` again

### SSL Certificate Failed
**Error:** `Failed to obtain SSL certificate`

Don't worry! The script will continue and deploy in HTTP mode:
- App will work at http://breathingmonk.com
- You can run `./setup-ssl.sh` later to add SSL

### Port 80 Blocked
**Error:** `Cannot access http://breathingmonk.com`

**Fix:** Check EC2 Security Group:
1. AWS Console → EC2 → Security Groups
2. Find your security group
3. Verify inbound rules:
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0

### Services Won't Start
**Error:** `Container failed to start`

```bash
# Check logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs

# Check specific service
docker-compose -f docker-compose.prod.yml --env-file .env.production logs backend
docker-compose -f docker-compose.prod.yml --env-file .env.production logs db
docker-compose -f docker-compose.prod.yml --env-file .env.production logs nginx
```

## ✅ Success Checklist

After deployment, verify:

- [ ] https://breathingmonk.com loads with green padlock 🔒
- [ ] http://breathingmonk.com redirects to HTTPS
- [ ] Can access https://breathingmonk.com/admin
- [ ] Can login with admin / admin123
- [ ] Changed admin password
- [ ] Can create a new user account
- [ ] Dashboard loads correctly
- [ ] Can create goals and tasks

## 📞 Need Help?

1. **Check logs first:**
   ```bash
   ./manage-prod.sh logs
   ```

2. **Check service status:**
   ```bash
   ./manage-prod.sh status
   ```

3. **See detailed troubleshooting:**
   - [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
   - [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🎉 That's It!

You now have a production-ready FocusFlow deployment with:
- ✅ Automatic SSL/HTTPS
- ✅ Auto-renewing certificates
- ✅ Database with migrations
- ✅ Static files served efficiently
- ✅ GitHub Actions for future deployments

**Estimated total time:** 2-5 minutes ⚡

**No pain, all gain!** 🚀

---

**Last Updated:** 2025-12-08
**Domain:** breathingmonk.com
**SSL:** Automatic via Let's Encrypt
