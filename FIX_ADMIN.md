# Fix Admin Page Not Loading

## Issue
- ✅ Main site (https://breathingmonk.com/) is loading
- ❌ Admin page (https://breathingmonk.com/admin/) is NOT loading
- ❌ No default admin user can login

## Root Causes

1. **CSRF_TRUSTED_ORIGINS not set** - Django blocks admin requests from breathingmonk.com
2. **SECURE_SSL_REDIRECT causing issues** - Django tries to redirect but it's behind nginx proxy
3. **Static files might not be collected** - Admin CSS/JS may be missing
4. **Proxy headers not configured** - Django doesn't know it's behind HTTPS proxy

## Quick Fix (On EC2)

### Option 1: Automated Fix (Recommended)

```bash
# SSH to EC2
ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP

# Go to project
cd ~/focusflow

# Pull latest fixes
git pull origin main

# Run the auto-fix script
chmod +x quick-fix-admin.sh
./quick-fix-admin.sh
```

### Option 2: Manual Fix

```bash
# SSH to EC2
ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP
cd ~/focusflow

# 1. Pull latest code with fixes
git pull origin main

# 2. Rebuild backend (has Django settings fixes)
docker-compose -f docker-compose.prod.yml --env-file .env.production build backend --no-cache

# 3. Restart services
docker-compose -f docker-compose.prod.yml --env-file .env.production down
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 4. Wait for services
sleep 10

# 5. Collect static files
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py collectstatic --noinput

# 6. Run migrations (just in case)
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py migrate

# 7. Verify admin user exists
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
admin = User.objects.filter(username='admin').first()
if admin:
    print(f"✓ Admin user exists: {admin.username}")
    print(f"✓ Is superuser: {admin.is_superuser}")
    print(f"✓ Is staff: {admin.is_staff}")
else:
    print("✗ Admin user NOT found!")
    print("Creating admin user...")
    User.objects.create_superuser('admin', 'admin@breathingmonk.com', 'admin123')
    print("✓ Admin user created: admin / admin123")
EOF
```

## What Was Fixed in Django Settings

### 1. Added CSRF_TRUSTED_ORIGINS
```python
# In backend/focusflow/settings.py
CSRF_TRUSTED_ORIGINS = os.environ.get(
    'CSRF_TRUSTED_ORIGINS',
    'http://localhost:5173'
).split(',')
```

### 2. Fixed Proxy Settings
```python
# In production mode:
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True
SECURE_SSL_REDIRECT = False  # Nginx handles this
```

### 3. Updated .env.production
```bash
# Should have this line:
CSRF_TRUSTED_ORIGINS=https://breathingmonk.com,https://www.breathingmonk.com
```

## Verify Admin Access

After running the fix:

1. **Access admin page:**
   ```
   https://breathingmonk.com/admin/
   ```

2. **Login with:**
   - Username: `admin`
   - Password: `admin123`

3. **Change password immediately:**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py changepassword admin
   ```

## Diagnostic Commands

### Check if backend is accessible

```bash
# From EC2
docker-compose -f docker-compose.prod.yml --env-file .env.production exec nginx wget -O- http://backend:8000/admin/
```

### Check Django settings

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py shell << 'EOF'
from django.conf import settings
print(f"DEBUG: {settings.DEBUG}")
print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
print(f"CSRF_TRUSTED_ORIGINS: {settings.CSRF_TRUSTED_ORIGINS}")
print(f"SECURE_SSL_REDIRECT: {settings.SECURE_SSL_REDIRECT}")
EOF
```

### Check admin user

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
for user in User.objects.all():
    print(f"User: {user.username}, Superuser: {user.is_superuser}, Staff: {user.is_staff}")
EOF
```

### View backend logs

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production logs backend --tail=50
```

### View nginx logs

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production logs nginx --tail=50
```

## Troubleshooting

### Admin page returns 404

**Check URL routing:**
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py show_urls 2>/dev/null || echo "admin/ should be listed in URLs"
```

### Admin page loads but no styling

**Collect static files:**
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py collectstatic --noinput
docker-compose -f docker-compose.prod.yml --env-file .env.production restart nginx
```

### CSRF verification failed

**Verify CSRF_TRUSTED_ORIGINS:**
```bash
# Check .env.production has:
grep CSRF_TRUSTED_ORIGINS .env.production

# Should show:
# CSRF_TRUSTED_ORIGINS=https://breathingmonk.com,https://www.breathingmonk.com

# If missing, add it:
echo "CSRF_TRUSTED_ORIGINS=https://breathingmonk.com,https://www.breathingmonk.com" >> .env.production

# Restart backend:
docker-compose -f docker-compose.prod.yml --env-file .env.production restart backend
```

### "DisallowedHost" error

**Check ALLOWED_HOSTS:**
```bash
grep ALLOWED_HOSTS .env.production

# Should show:
# ALLOWED_HOSTS=breathingmonk.com,www.breathingmonk.com

# Check what Django sees:
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python -c "import os; print(os.environ.get('ALLOWED_HOSTS'))"
```

## Success Checklist

After applying fixes, verify:

- [ ] https://breathingmonk.com/ loads
- [ ] https://breathingmonk.com/admin/ loads (shows login page)
- [ ] Can login with admin / admin123
- [ ] Admin interface has proper styling (CSS loaded)
- [ ] Can navigate admin sections
- [ ] Can view users, groups, etc.
- [ ] Changed admin password

## If Still Not Working

Run the diagnostic script:
```bash
chmod +x diagnose.sh
./diagnose.sh
```

Or check comprehensive troubleshooting:
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

**Last Updated:** 2025-12-08
**Issue:** Admin page not loading
**Status:** Fixes applied
