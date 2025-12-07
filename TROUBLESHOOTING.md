# Troubleshooting Guide

## Common Deployment Issues

### 1. Environment Variables Not Loading

**Error:**
```
WARN[0000] The "DJANGO_SECRET_KEY" variable is not set. Defaulting to a blank string.
WARN[0000] The "POSTGRES_PASSWORD" variable is not set. Defaulting to a blank string.
...
dependency failed to start: container focusflow_db is unhealthy
```

**Cause:**
Docker Compose not loading the `.env.production` file.

**Solution:**
✅ **FIXED** - Updated `deploy.sh` to use `--env-file` flag:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

**How to Fix on Your Server:**

1. SSH into your EC2 instance
2. Pull the latest changes:
   ```bash
   cd ~/focusflow
   git pull origin main
   ```

3. Ensure `.env.production` exists and has correct values:
   ```bash
   cat .env.production
   # Should show all environment variables
   ```

4. Redeploy:
   ```bash
   ./deploy.sh
   ```

**Manual Alternative:**
If you need to run commands manually:
```bash
# Always include --env-file flag
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
docker-compose -f docker-compose.prod.yml --env-file .env.production ps
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f
```

---

### 2. Frontend Build Error: "vite: not found"

**Error:**
```
ERROR [frontend builder 6/6] RUN npm run build
sh: vite: not found
```

**Cause:**
Using `npm ci --only=production` which skips devDependencies (Vite is in devDependencies).

**Solution:**
✅ **FIXED** - Updated `frontend/Dockerfile.prod` to use `npm ci` instead.

**Verify Fix:**
```bash
cd ~/focusflow
git pull origin main
docker-compose -f docker-compose.prod.yml --env-file .env.production build frontend --no-cache
```

---

### 3. Database Container Unhealthy

**Error:**
```
dependency failed to start: container focusflow_db is unhealthy
```

**Possible Causes:**
1. `POSTGRES_PASSWORD` not set (see Issue #1 above)
2. Database still initializing
3. Port 5432 already in use
4. Insufficient resources

**Diagnosis:**

```bash
# Check database logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs db

# Check if postgres is running
docker-compose -f docker-compose.prod.yml --env-file .env.production ps db

# Check database health
docker inspect focusflow_db | grep -A 10 Health
```

**Solutions:**

**A. Wait longer for initialization:**
```bash
# Stop everything
docker-compose -f docker-compose.prod.yml --env-file .env.production down

# Remove database volume (WARNING: This deletes data!)
docker volume rm focusflow_postgres_data

# Restart
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

**B. Check if port is in use:**
```bash
sudo lsof -i :5432
# If postgres is running outside Docker, stop it:
sudo systemctl stop postgresql
```

**C. Verify environment variables:**
```bash
# Make sure .env.production has correct values
nano .env.production

# Should have:
# POSTGRES_DB=focusflow
# POSTGRES_USER=focusflow
# POSTGRES_PASSWORD=<your-strong-password>
```

---

### 4. Nginx SSL Certificate Not Found

**Error:**
```
nginx: [emerg] cannot load certificate "/etc/letsencrypt/live/breathingmonk.com/fullchain.pem"
```

**Cause:**
Trying to start nginx with SSL before obtaining certificates.

**Solution:**

**Step 1:** Temporarily disable SSL in nginx config:
```bash
cd ~/focusflow
nano nginx/conf.d/focusflow.conf

# Comment out the HTTPS server block (lines with ssl_certificate)
# Keep only the HTTP server block
```

**Step 2:** Restart nginx:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production restart nginx
```

**Step 3:** Obtain SSL certificate:
```bash
# Stop nginx
docker-compose -f docker-compose.prod.yml --env-file .env.production stop nginx

# Get certificate
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email admin@breathingmonk.com \
  --agree-tos \
  -d breathingmonk.com \
  -d www.breathingmonk.com

# Uncomment SSL block in nginx config
nano nginx/conf.d/focusflow.conf

# Restart all services
docker-compose -f docker-compose.prod.yml --env-file .env.production down
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

---

### 5. Domain Not Resolving

**Error:**
```
curl: (6) Could not resolve host: breathingmonk.com
```

**Diagnosis:**
```bash
# Check DNS propagation
nslookup breathingmonk.com
dig breathingmonk.com

# Check from multiple locations
# Visit: https://www.whatsmydns.net/#A/breathingmonk.com
```

**Solution:**

1. **Verify GoDaddy DNS settings:**
   - A record @ → Your EC2 IP
   - A record www → Your EC2 IP
   - No CNAME for @ (root)
   - No domain forwarding enabled

2. **Wait for DNS propagation** (10-30 minutes)

3. **Clear local DNS cache:**
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Linux
   sudo systemd-resolve --flush-caches

   # Windows
   ipconfig /flushdns
   ```

4. **Verify nameservers:**
   ```bash
   dig NS breathingmonk.com
   # Should show GoDaddy nameservers
   ```

---

### 6. Port 80/443 Not Accessible

**Error:**
```
curl: (7) Failed to connect to breathingmonk.com port 80: Connection refused
```

**Diagnosis:**
```bash
# Check if nginx is running
docker ps | grep nginx

# Check nginx logs
docker logs focusflow_nginx

# Check if ports are listening
sudo netstat -tlnp | grep -E '80|443'
```

**Solution:**

1. **Check EC2 Security Group:**
   - AWS Console → EC2 → Security Groups
   - Verify inbound rules allow:
     - HTTP (80) from 0.0.0.0/0
     - HTTPS (443) from 0.0.0.0/0

2. **Check UFW firewall:**
   ```bash
   sudo ufw status
   # Should show:
   # 80/tcp    ALLOW    Anywhere
   # 443/tcp   ALLOW    Anywhere

   # If not, add rules:
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **Restart nginx:**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production restart nginx
   ```

---

### 7. Out of Disk Space

**Error:**
```
no space left on device
```

**Diagnosis:**
```bash
# Check disk usage
df -h

# Check Docker disk usage
docker system df
```

**Solution:**
```bash
# Clean up Docker resources
./manage-prod.sh clean

# Or manually:
docker system prune -a
docker volume prune

# Clean logs
sudo journalctl --vacuum-time=7d

# Remove old backups
rm -f backup_*.sql
```

---

### 8. GitHub Actions Deployment Fails

**Error:**
```
Permission denied (publickey)
```

**Solution:**

1. **Verify GitHub Secrets are set:**
   - Go to GitHub repo → Settings → Secrets
   - Verify all 5 secrets exist:
     - EC2_SSH_KEY
     - EC2_HOST
     - EC2_USER
     - DJANGO_SECRET_KEY
     - POSTGRES_PASSWORD

2. **Verify SSH key format:**
   ```bash
   # The EC2_SSH_KEY secret should include:
   -----BEGIN RSA PRIVATE KEY-----
   ...key content...
   -----END RSA PRIVATE KEY-----
   ```

3. **Test SSH connection manually:**
   ```bash
   ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP
   ```

4. **Check GitHub Actions logs:**
   - GitHub repo → Actions → Click on failed workflow
   - Expand steps to see detailed error

---

### 9. Django Admin Not Accessible

**Error:**
```
404 Not Found when accessing /admin
```

**Solution:**

1. **Check URL routing:**
   ```bash
   # Should be:
   https://breathingmonk.com/admin/
   # Not:
   https://breathingmonk.com/admin (without trailing slash)
   ```

2. **Verify backend is running:**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production ps backend
   ```

3. **Check backend logs:**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production logs backend
   ```

4. **Collect static files:**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py collectstatic --noinput
   ```

---

### 10. Can't Login - CSRF Error

**Error:**
```
CSRF verification failed
```

**Solution:**

1. **Check CSRF_TRUSTED_ORIGINS in .env.production:**
   ```bash
   nano .env.production
   # Should have:
   CSRF_TRUSTED_ORIGINS=https://breathingmonk.com,https://www.breathingmonk.com
   ```

2. **Restart backend:**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production restart backend
   ```

3. **Clear browser cookies and cache**

---

## Useful Diagnostic Commands

```bash
# Check all container logs
./manage-prod.sh logs

# Check specific container
docker logs focusflow_backend
docker logs focusflow_frontend
docker logs focusflow_db
docker logs focusflow_nginx

# Check container status
./manage-prod.sh status

# Enter container shell
docker exec -it focusflow_backend bash
docker exec -it focusflow_db psql -U focusflow

# Check network connectivity
docker network inspect focusflow_focusflow_network

# Check volumes
docker volume ls
docker volume inspect focusflow_postgres_data

# System resources
htop
free -h
df -h
```

---

## Getting Help

If you're still stuck:

1. **Check the logs first:**
   ```bash
   ./manage-prod.sh logs
   ```

2. **Review documentation:**
   - DEPLOYMENT.md - Full deployment guide
   - QUICK_START.md - Quick checklist
   - GITHUB_SETUP.md - CI/CD setup

3. **Check service health:**
   ```bash
   ./manage-prod.sh status
   ```

4. **Verify environment:**
   ```bash
   cat .env.production
   ```

---

**Last Updated:** 2025-12-08
