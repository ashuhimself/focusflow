# FocusFlow - Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. AWS EC2 Setup
- [ ] Launch t3.small instance with Ubuntu 22.04 LTS
- [ ] Note the Public IP address: `________________`
- [ ] Download SSH key pair (`.pem` file)
- [ ] Configure Security Group:
  - [ ] SSH (22) - Your IP only
  - [ ] HTTP (80) - Anywhere
  - [ ] HTTPS (443) - Anywhere

### 2. Local Setup
- [ ] Generate Django secret key:
  ```bash
  python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
  ```
- [ ] Update `.env.production` with:
  - [ ] `DJANGO_SECRET_KEY` (from above)
  - [ ] `POSTGRES_PASSWORD` (create a strong password)
  - [ ] `ALLOWED_HOSTS` (already set to breathingmonk.com)

### 3. EC2 Server Configuration
- [ ] SSH into EC2: `ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP`
- [ ] Install Docker:
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker ubuntu
  ```
- [ ] Install Docker Compose:
  ```bash
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  ```
- [ ] Configure UFW firewall:
  ```bash
  sudo ufw allow OpenSSH
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```

### 4. Deploy Application to EC2
- [ ] Transfer files to EC2:
  ```bash
  scp -i ~/.ssh/focusflow-key.pem -r /Users/ashu/Desktop/stash/focusflow ubuntu@YOUR_EC2_IP:~/
  ```
- [ ] SSH into EC2 and deploy:
  ```bash
  ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP
  cd ~/focusflow
  chmod +x deploy.sh
  ./deploy.sh
  ```
- [ ] Verify containers are running:
  ```bash
  docker-compose -f docker-compose.prod.yml ps
  ```

### 5. GoDaddy Domain Configuration
- [ ] Log into GoDaddy
- [ ] Go to My Products → Domains → breathingmonk.com → DNS
- [ ] Add A Record:
  - Type: `A`
  - Name: `@`
  - Value: `YOUR_EC2_IP`
  - TTL: `600`
- [ ] Add WWW A Record:
  - Type: `A`
  - Name: `www`
  - Value: `YOUR_EC2_IP`
  - TTL: `600`
- [ ] Remove any conflicting records:
  - [ ] Delete CNAME for @ (root)
  - [ ] Disable domain forwarding
  - [ ] Remove URL redirects
- [ ] Wait for DNS propagation (10-30 minutes)
- [ ] Verify DNS:
  ```bash
  nslookup breathingmonk.com
  # Should return your EC2 IP
  ```

### 6. SSL Certificate Setup (Let's Encrypt)
- [ ] Wait for DNS to propagate (verify with nslookup)
- [ ] SSH into EC2
- [ ] Stop nginx:
  ```bash
  cd ~/focusflow
  docker-compose -f docker-compose.prod.yml stop nginx
  ```
- [ ] Obtain SSL certificate:
  ```bash
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
  ```
- [ ] Restart all services:
  ```bash
  docker-compose -f docker-compose.prod.yml down
  docker-compose -f docker-compose.prod.yml up -d
  ```
- [ ] Test HTTPS: Visit https://breathingmonk.com
  - [ ] Green padlock shows
  - [ ] HTTP redirects to HTTPS

### 7. GitHub CI/CD Setup (Optional but Recommended)
- [ ] Create GitHub repository
- [ ] Add GitHub Secrets (Settings → Secrets and variables → Actions):
  - [ ] `EC2_SSH_KEY` (content of .pem file)
  - [ ] `EC2_HOST` (your EC2 IP)
  - [ ] `EC2_USER` (`ubuntu`)
  - [ ] `DJANGO_SECRET_KEY` (same as .env.production)
  - [ ] `POSTGRES_PASSWORD` (same as .env.production)
- [ ] Push code to GitHub:
  ```bash
  git init
  git add .
  git commit -m "Initial deployment"
  git remote add origin https://github.com/YOUR_USERNAME/focusflow.git
  git push -u origin main
  ```
- [ ] Verify GitHub Actions deployment in Actions tab

### 8. Post-Deployment
- [ ] Access application: https://breathingmonk.com
- [ ] Log into admin panel: https://breathingmonk.com/admin
  - Username: `admin`
  - Password: `admin123` (CHANGE IMMEDIATELY!)
- [ ] Change admin password:
  ```bash
  docker-compose -f docker-compose.prod.yml exec backend python manage.py changepassword admin
  ```
- [ ] Create your user account
- [ ] Test all features:
  - [ ] User registration
  - [ ] Login/Logout
  - [ ] Create goals
  - [ ] Create tasks
  - [ ] Daily logs
  - [ ] Dashboard

---

## 🚨 Common Issues & Quick Fixes

### Issue: Frontend build fails with "vite: not found"
✅ **FIXED** - Updated `frontend/Dockerfile.prod` to use `npm ci` instead of `npm ci --only=production`

### Issue: Domain not resolving
```bash
# Check DNS propagation
nslookup breathingmonk.com

# Clear local DNS cache (macOS)
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

### Issue: SSL certificate failed
```bash
# Ensure DNS is pointing to EC2 first
dig breathingmonk.com

# Check if port 80 is accessible
curl http://breathingmonk.com
```

### Issue: Containers not starting
```bash
cd ~/focusflow
docker-compose -f docker-compose.prod.yml logs
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Issue: Can't SSH into EC2
```bash
# Verify key permissions
chmod 400 ~/.ssh/focusflow-key.pem

# Verify security group allows SSH from your IP
# Check AWS Console → EC2 → Security Groups
```

---

## 📚 Full Documentation

- **DEPLOYMENT.md** - Complete step-by-step deployment guide
- **GITHUB_SETUP.md** - GitHub Actions CI/CD configuration
- **README.md** - Application features and local development

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ https://breathingmonk.com loads with green padlock (SSL)
✅ HTTP redirects to HTTPS automatically
✅ Can register new user account
✅ Can login and access dashboard
✅ GitHub Actions deploys on every commit to main branch
✅ Admin password has been changed from default

---

## 💰 Monthly Cost Estimate

- EC2 t3.small: ~$15-20/month
- Storage (20GB): ~$2/month
- Data transfer: ~$1-5/month
- **Total: ~$18-27/month**

---

## 🔧 Maintenance Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update application (manual)
cd ~/focusflow
git pull origin main
./deploy.sh

# Backup database
docker-compose -f docker-compose.prod.yml exec db pg_dump -U focusflow focusflow > backup.sql

# Clean up Docker
docker system prune -a
```

---

**Good luck with your deployment! 🚀**

For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)
