# GitHub Actions CI/CD Setup Guide

This guide will help you configure GitHub Actions for automatic deployment to AWS EC2 on every commit to the main branch.

## Overview

When you push code to the `main` branch, GitHub Actions will automatically:
1. Pull the latest code on your EC2 instance
2. Update environment variables
3. Rebuild and restart Docker containers
4. Run database migrations
5. Collect static files
6. Verify deployment

---

## Prerequisites

1. ✅ EC2 instance set up and running
2. ✅ Application deployed manually at least once (follow DEPLOYMENT.md)
3. ✅ GitHub repository created
4. ✅ SSH access to EC2 instance working

---

## Step 1: Prepare EC2 Instance for GitHub Deployments

### 1.1 Create Deploy User (Optional but Recommended)

```bash
# SSH into your EC2 instance
ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP

# Create deploy user (optional - you can use 'ubuntu' user instead)
sudo adduser deploy
sudo usermod -aG docker deploy
sudo usermod -aG sudo deploy

# Switch to deploy user
sudo su - deploy
```

### 1.2 Clone Repository on EC2

```bash
# If not already done
cd ~
git clone https://github.com/YOUR_USERNAME/focusflow.git
cd focusflow

# Make deploy script executable
chmod +x deploy.sh
```

### 1.3 Configure Git for Auto-Deployment

```bash
# Set up git to allow force updates
cd ~/focusflow
git config pull.rebase false
```

---

## Step 2: Configure GitHub Repository Secrets

### 2.1 Navigate to Repository Settings

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/focusflow`
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### 2.2 Add Required Secrets

Add each of the following secrets:

#### Secret 1: `EC2_SSH_KEY`
- **Name**: `EC2_SSH_KEY`
- **Value**: Your SSH private key content

```bash
# On your local machine, get the private key content:
cat ~/.ssh/focusflow-key.pem
```

Copy the entire output (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`) and paste as the secret value.

#### Secret 2: `EC2_HOST`
- **Name**: `EC2_HOST`
- **Value**: Your EC2 public IP address or domain
- **Example**: `54.123.45.67` or `breathingmonk.com`

#### Secret 3: `EC2_USER`
- **Name**: `EC2_USER`
- **Value**: The SSH user for EC2
- **Example**: `ubuntu` (or `deploy` if you created a deploy user)

#### Secret 4: `DJANGO_SECRET_KEY`
- **Name**: `DJANGO_SECRET_KEY`
- **Value**: Your Django secret key

```bash
# Generate a new secret key:
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

Copy the generated key and paste as the secret value.

#### Secret 5: `POSTGRES_PASSWORD`
- **Name**: `POSTGRES_PASSWORD`
- **Value**: Your PostgreSQL database password
- **Example**: Use a strong password like `Foc8sFlow!2024$Secure`

### 2.3 Verify Secrets

Your GitHub repository should now have 5 secrets:
- ✅ `EC2_SSH_KEY`
- ✅ `EC2_HOST`
- ✅ `EC2_USER`
- ✅ `DJANGO_SECRET_KEY`
- ✅ `POSTGRES_PASSWORD`

---

## Step 3: Push Code to GitHub

### 3.1 Initialize Git Repository (if not already done)

```bash
# On your local machine, in the focusflow directory
cd /Users/ashu/Desktop/stash/focusflow

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with CI/CD setup"
```

### 3.2 Add GitHub Remote

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/focusflow.git

# Or if using SSH
git remote add origin git@github.com:YOUR_USERNAME/focusflow.git
```

### 3.3 Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

---

## Step 4: Verify GitHub Actions Workflow

### 4.1 Check Workflow Execution

1. Go to your GitHub repository
2. Click the **Actions** tab
3. You should see a workflow run triggered by your push
4. Click on the workflow to view progress

### 4.2 Monitor Deployment

Watch the workflow steps:
- ✅ Checkout code
- ✅ Setup SSH
- ✅ Deploy to EC2
- ✅ Verify Deployment
- ✅ Notify Deployment Status

### 4.3 View Logs

If deployment fails:
1. Click on the failed workflow run
2. Click on the "Deploy to Production" job
3. Expand failed steps to see error messages

---

## Step 5: Test Automatic Deployment

### 5.1 Make a Change

```bash
# On your local machine
cd /Users/ashu/Desktop/stash/focusflow

# Make a small change (e.g., update README)
echo "# Updated on $(date)" >> README.md

# Commit and push
git add README.md
git commit -m "Test automatic deployment"
git push origin main
```

### 5.2 Verify Auto-Deployment

1. Go to GitHub Actions tab
2. Watch the deployment workflow run
3. Once complete, verify changes at https://breathingmonk.com

---

## Manual Deployment Trigger

You can also manually trigger deployment without pushing code:

1. Go to **Actions** tab in GitHub
2. Click **Deploy to AWS EC2** workflow
3. Click **Run workflow** button
4. Select branch (main)
5. Click **Run workflow**

---

## Troubleshooting

### SSH Connection Failed

**Error**: `Permission denied (publickey)`

**Solution**:
```bash
# Verify EC2_SSH_KEY secret contains the correct private key
# Ensure the key has correct format with line breaks

# Test SSH connection manually:
ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP
```

### Deployment Script Failed

**Error**: `./deploy.sh: Permission denied`

**Solution**:
```bash
# SSH into EC2
ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP

# Make script executable
cd ~/focusflow
chmod +x deploy.sh
```

### Docker Compose Failed

**Error**: `docker-compose: command not found`

**Solution**:
```bash
# Install Docker Compose on EC2 (see DEPLOYMENT.md)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Environment Variables Not Updated

**Error**: Application still shows old configuration

**Solution**:
```bash
# SSH into EC2
ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP

# Verify .env.production exists and has correct values
cd ~/focusflow
cat .env.production

# Restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Database Migration Issues

**Error**: Database migration failed

**Solution**:
```bash
# SSH into EC2
cd ~/focusflow

# Run migrations manually
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Check for migration conflicts
docker-compose -f docker-compose.prod.yml exec backend python manage.py showmigrations
```

---

## Security Best Practices

### ✅ DO:
- Use GitHub Secrets for all sensitive data
- Rotate SSH keys periodically
- Use strong database passwords
- Keep secrets out of git commits
- Review workflow logs for sensitive data leaks
- Limit EC2 SSH access to specific IPs if possible

### ❌ DON'T:
- Commit `.env` or `.env.production` to git
- Share SSH private keys
- Use weak passwords
- Store secrets in workflow files
- Leave default admin passwords

---

## Workflow Customization

### Deploy Only on Specific Files Changed

Edit `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
      - 'frontend/**'
      - 'docker-compose.prod.yml'
      - 'nginx/**'
```

### Add Slack/Discord Notifications

Add notification step:

```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "✅ FocusFlow deployed successfully to https://breathingmonk.com"
      }
```

### Run Tests Before Deployment

Add test step before deployment:

```yaml
- name: Run Backend Tests
  run: |
    cd backend
    python -m pytest tests/

- name: Run Frontend Tests
  run: |
    cd frontend
    npm test
```

---

## Deployment Workflow Diagram

```
Developer pushes to main
         ↓
GitHub Actions triggered
         ↓
Checkout latest code
         ↓
Setup SSH connection to EC2
         ↓
Pull latest code on EC2
         ↓
Update .env.production
         ↓
Run deploy.sh script
    ├── Stop containers
    ├── Build images
    ├── Start containers
    ├── Run migrations
    ├── Collect static files
    └── Create superuser (if needed)
         ↓
Verify deployment
         ↓
Notify success/failure
         ↓
Application live at breathingmonk.com
```

---

## Quick Reference

### View Deployment Logs (EC2)
```bash
ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP
cd ~/focusflow
docker-compose -f docker-compose.prod.yml logs -f
```

### Manual Deployment (EC2)
```bash
cd ~/focusflow
git pull origin main
./deploy.sh
```

### Rollback to Previous Version
```bash
cd ~/focusflow
git log --oneline  # Find commit hash
git reset --hard COMMIT_HASH
./deploy.sh
```

### Check Workflow Status
```bash
# Using GitHub CLI
gh run list
gh run view RUN_ID
gh run watch
```

---

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. SSH into EC2 and check Docker logs
3. Verify all GitHub secrets are set correctly
4. Ensure EC2 security groups allow SSH from GitHub IPs
5. Review DEPLOYMENT.md for server setup issues

---

**Last Updated**: 2025-12-08
**Domain**: breathingmonk.com
**Deployment Method**: GitHub Actions + Docker + EC2
