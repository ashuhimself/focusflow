# FocusFlow AWS EC2 Deployment Guide

Complete guide for deploying FocusFlow on AWS EC2 with Docker and configuring your breathingmonk.com domain from GoDaddy.

## 🚀 Quick Links
- **Manual Deployment**: Follow this guide for initial setup
- **GitHub CI/CD**: See [GITHUB_SETUP.md](GITHUB_SETUP.md) for automatic deployment on commit

## Table of Contents
1. [AWS EC2 Setup](#aws-ec2-setup)
2. [Server Configuration](#server-configuration)
3. [Application Deployment](#application-deployment)
4. [Domain Configuration (GoDaddy)](#domain-configuration)
5. [SSL Certificate Setup](#ssl-certificate-setup)
6. [Maintenance & Updates](#maintenance-updates)

---

## AWS EC2 Setup

### 1. Choose EC2 Instance Type
For **5 users**, we recommend:
- **Instance Type**: `t3.micro` or `t3.small`
  - **t3.micro**: 1 vCPU, 1 GB RAM (Free tier eligible, suitable for very light usage)
  - **t3.small**: 2 vCPUs, 2 GB RAM ($15-20/month, **recommended**)
- **Storage**: 20 GB SSD (General Purpose SSD - gp3)
- **Operating System**: Ubuntu 22.04 LTS

### 2. Launch EC2 Instance

#### Step 2.1: Log into AWS Console
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Navigate to **EC2 Dashboard**
3. Click **Launch Instance**

#### Step 2.2: Configure Instance
1. **Name**: `FocusFlow-Production`
2. **Application and OS Image**: Select **Ubuntu Server 22.04 LTS**
3. **Instance Type**: Select `t3.small`
4. **Key Pair**:
   - Create new key pair: `focusflow-key`
   - Download and save the `.pem` file securely
   - Move it to `~/.ssh/`: `mv ~/Downloads/focusflow-key.pem ~/.ssh/`
   - Set permissions: `chmod 400 ~/.ssh/focusflow-key.pem`

#### Step 2.3: Network Settings
1. **Create Security Group**: `focusflow-sg`
2. **Inbound Rules**:
   - SSH (Port 22) - Your IP only
   - HTTP (Port 80) - Anywhere (0.0.0.0/0)
   - HTTPS (Port 443) - Anywhere (0.0.0.0/0)
   - PostgreSQL (Port 5432) - Only if needed for external access (not recommended)

#### Step 2.4: Storage
- **Size**: 20 GB
- **Volume Type**: gp3 (General Purpose SSD)

#### Step 2.5: Launch Instance
1. Review settings
2. Click **Launch Instance**
3. Note down the **Public IP Address** (e.g., `54.123.45.67`)

---

## Server Configuration

### 1. Connect to EC2 Instance

```bash
# Replace with your instance's public IP
ssh -i ~/.ssh/focusflow-key.pem ubuntu@54.123.45.67
```

### 2. Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker ubuntu

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
```

### 4. Install Docker Compose

```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 5. Install Git

```bash
sudo apt install git -y
git --version
```

### 6. Configure Firewall (UFW)

```bash
# Enable UFW
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check status
sudo ufw status
```

---

## Application Deployment

### 1. Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone https://github.com/yourusername/focusflow.git
cd focusflow
```

**OR** transfer files via SCP:

```bash
# From your local machine
scp -i ~/.ssh/focusflow-key.pem -r /Users/ashu/Desktop/stash/focusflow ubuntu@54.123.45.67:~/
```

### 2. Configure Environment Variables

```bash
# Copy production environment template
cp .env.production .env.production

# Edit environment file
nano .env.production
```

**Update the following in `.env.production`:**

```bash
# Generate a strong secret key (run this on your local machine)
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Then update .env.production with:
DEBUG=False
DJANGO_SECRET_KEY=<paste-generated-secret-key-here>

# Domain Configuration
ALLOWED_HOSTS=insightned.com,www.insightned.com,54.123.45.67
CORS_ALLOWED_ORIGINS=https://insightned.com,https://www.insightned.com
CSRF_TRUSTED_ORIGINS=https://insightned.com,https://www.insightned.com

# Database (use a strong password)
POSTGRES_DB=focusflow
POSTGRES_USER=focusflow
POSTGRES_PASSWORD=<your-strong-password>

# Frontend
VITE_API_URL=https://insightned.com/api
```

Save and exit: `Ctrl+X`, `Y`, `Enter`

### 3. Create Required Directories

```bash
mkdir -p certbot/conf certbot/www
```

### 4. Initial Deployment (HTTP only)

First, we'll deploy without SSL to set up Let's Encrypt:

```bash
# Temporarily comment out SSL lines in nginx config
nano nginx/conf.d/focusflow.conf
```

Comment out the HTTPS server block and SSL certificate lines temporarily. Keep only the HTTP server block.

```bash
# Deploy
./deploy.sh
```

### 5. Verify Deployment

```bash
# Check if all containers are running
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Test the application
curl http://54.123.45.67
```

---

## Domain Configuration (GoDaddy)

### 1. Configure DNS Records

1. Log into [GoDaddy](https://www.godaddy.com)
2. Go to **My Products** → **Domains**
3. Click on `breathingmonk.com` → **DNS**
4. Add/Edit the following records:

| Type  | Name | Value (Points to)     | TTL    |
|-------|------|-----------------------|--------|
| A     | @    | `54.123.45.67`        | 600    |
| A     | www  | `54.123.45.67`        | 600    |
| CNAME | *    | breathingmonk.com     | 1 Hour |

**Notes:**
- Replace `54.123.45.67` with your actual EC2 instance public IP
- TTL = 600 seconds (10 minutes) for faster propagation
- The `*` CNAME is optional (catches all subdomains)

### 2. Wait for DNS Propagation

DNS changes can take 1-48 hours to propagate. Check status:

```bash
# From your local machine
nslookup breathingmonk.com
dig breathingmonk.com

# You should see your EC2 IP address
```

---

## SSL Certificate Setup (Let's Encrypt)

### 1. Obtain SSL Certificate

Once DNS is pointing to your server:

```bash
# On your EC2 instance
cd ~/focusflow

# Stop nginx temporarily
docker-compose -f docker-compose.prod.yml stop nginx

# Run certbot in standalone mode
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email admin@breathingmonk.com \
  --agree-tos \
  --no-eff-email \
  -d breathingmonk.com \
  -d www.breathingmonk.com
```

### 2. Update Nginx Configuration

```bash
# Uncomment the HTTPS server block in nginx config
nano nginx/conf.d/focusflow.conf
```

Ensure the SSL certificate paths are correct:
```nginx
ssl_certificate /etc/letsencrypt/live/breathingmonk.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/breathingmonk.com/privkey.pem;
```

### 3. Restart Services

```bash
# Restart all services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### 4. Test SSL

Visit: https://breathingmonk.com

Verify:
- ✓ Green padlock in browser
- ✓ Certificate is valid
- ✓ HTTP redirects to HTTPS

### 5. Auto-Renewal Setup

Let's Encrypt certificates expire every 90 days. The certbot container automatically renews them.

Test renewal:
```bash
docker-compose -f docker-compose.prod.yml exec certbot certbot renew --dry-run
```

---

## Maintenance & Updates

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Update Application

```bash
cd ~/focusflow
git pull
./deploy.sh
```

### Backup Database

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U focusflow focusflow > backup_$(date +%Y%m%d).sql

# Download to local machine
scp -i ~/.ssh/focusflow-key.pem ubuntu@54.123.45.67:~/focusflow/backup_*.sql ~/backups/
```

### Restore Database

```bash
# Upload backup to server
scp -i ~/.ssh/focusflow-key.pem ~/backups/backup_20251208.sql ubuntu@54.123.45.67:~/focusflow/

# Restore
cat backup_20251208.sql | docker-compose -f docker-compose.prod.yml exec -T db psql -U focusflow focusflow
```

### Monitor Resources

```bash
# System resources
htop

# Docker stats
docker stats

# Disk usage
df -h
du -sh ~/focusflow/*
```

### Clean Up Docker

```bash
# Remove unused images
docker system prune -a

# Remove old volumes (careful!)
docker volume prune
```

---

## Security Checklist

- [x] Change default admin password
- [x] Use strong database password
- [x] Enable HTTPS/SSL
- [x] Configure firewall (UFW)
- [x] Restrict SSH to your IP only
- [x] Keep system updated: `sudo apt update && sudo apt upgrade`
- [x] Regular database backups
- [x] Monitor logs for suspicious activity
- [x] Disable DEBUG mode in production

---

## Troubleshooting

### Application Not Loading

```bash
# Check if containers are running
docker-compose -f docker-compose.prod.yml ps

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### SSL Certificate Issues

```bash
# Check certificate expiry
docker-compose -f docker-compose.prod.yml exec certbot certbot certificates

# Force renewal
docker-compose -f docker-compose.prod.yml exec certbot certbot renew --force-renewal
```

### Database Connection Issues

```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs db

# Connect to database
docker-compose -f docker-compose.prod.yml exec db psql -U focusflow
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a

# Clean logs
sudo journalctl --vacuum-time=7d
```

---

## Cost Estimate (AWS)

For 5 users with recommended setup:

- **EC2 t3.small**: ~$15-20/month
- **20 GB SSD Storage**: ~$2/month
- **Data Transfer**: ~$1-5/month (minimal for 5 users)
- **Total**: ~$18-27/month

**Cost Optimization Tips:**
- Use AWS Free Tier (t3.micro for first 12 months)
- Set up CloudWatch billing alerts
- Stop instance when not in use (if applicable)

---

## Support

For issues:
1. Check application logs
2. Review this deployment guide
3. Check Django and Docker documentation
4. Review AWS EC2 console for instance status

---

## Quick Reference Commands

```bash
# Deploy/Update
cd ~/focusflow && git pull && ./deploy.sh

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Backup database
docker-compose -f docker-compose.prod.yml exec db pg_dump -U focusflow focusflow > backup.sql

# System status
docker-compose -f docker-compose.prod.yml ps
htop
```

---

**Deployment Date**: 2025-12-08
**Last Updated**: 2025-12-08
**Domain**: breathingmonk.com
**EC2 Region**: (Your chosen region)
**CI/CD**: GitHub Actions (see GITHUB_SETUP.md)
