# Fix: 301 Redirect Loop on Admin Page

## Problem Identified ✅

From your diagnostic output:
```
INFO "GET /admin/ HTTP/1.0" 301 0
```

**Issue:** Backend is returning HTTP 301 (redirect) in an infinite loop

**Root Causes:**
1. Nginx was using HTTP/1.0 instead of HTTP/1.1
2. Missing `X-Forwarded-Host` header
3. `proxy_pass` not including port `:8000`
4. Django's APPEND_SLASH and URL routing causing redirect loops

## Solution Applied ✅

### Fixed Nginx Configuration

**Changed in `nginx/conf.d/focusflow.conf`:**

```nginx
# BEFORE (BROKEN)
location /admin/ {
    proxy_pass http://backend;  # Missing port
    proxy_set_header Host $host;
    # Missing X-Forwarded-Host
    # Using HTTP/1.0 by default
}

# AFTER (FIXED)
location /admin/ {
    proxy_pass http://backend:8000/admin/;  # Added port and path
    proxy_http_version 1.1;                  # Force HTTP/1.1
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host; # Added
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
}
```

**Key Changes:**
1. ✅ Added `:8000` port to `proxy_pass`
2. ✅ Added `proxy_http_version 1.1`
3. ✅ Added `X-Forwarded-Host` header
4. ✅ Added trailing slash to proxy_pass URL

## How to Apply Fix

### On Your EC2 Instance:

```bash
# SSH to EC2
ssh -i ~/.ssh/focusflow-key.pem ubuntu@YOUR_EC2_IP

# Go to project
cd ~/focusflow

# Pull fixes
git pull origin main

# Run the fix script
chmod +x fix-redirect-loop.sh
./fix-redirect-loop.sh
```

### Or Manual Steps:

```bash
# Pull latest nginx config
git pull origin main

# Restart nginx
docker-compose -f docker-compose.prod.yml --env-file .env.production restart nginx

# Restart backend
docker-compose -f docker-compose.prod.yml --env-file .env.production restart backend

# Wait for services
sleep 5

# Test admin page
curl -I https://breathingmonk.com/admin/
```

## Verification

After applying the fix:

1. **Check backend logs** (should see HTTP 200, not 301):
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production logs backend --tail=10
   ```

   **Should see:**
   ```
   INFO "GET /admin/ HTTP/1.1" 200 xxx
   ```

2. **Access admin page:**
   ```
   https://breathingmonk.com/admin/
   ```

3. **Should show:** Django admin login page (not redirect loop)

## Why This Fix Works

### HTTP/1.0 vs HTTP/1.1
- **HTTP/1.0**: Doesn't properly support virtual hosts and proxies
- **HTTP/1.1**: Full proxy support with Host headers

### X-Forwarded-Host Header
- Tells Django what the original host was
- Prevents Django from generating wrong redirect URLs

### Explicit Port in proxy_pass
- Ensures nginx connects to correct backend port
- Prevents resolution issues

### Trailing Slash
- Matches Django's APPEND_SLASH behavior
- Prevents additional redirect from Django

## Expected Behavior After Fix

### Before (BROKEN):
```
Browser → https://breathingmonk.com/admin/
   ↓
Nginx → http://backend/admin/ (HTTP/1.0)
   ↓
Django → 301 Redirect to /admin/ (same URL)
   ↓
🔁 INFINITE LOOP
```

### After (FIXED):
```
Browser → https://breathingmonk.com/admin/
   ↓
Nginx → http://backend:8000/admin/ (HTTP/1.1)
   ↓
Django → 200 OK (admin login page)
   ↓
✅ WORKS!
```

## Troubleshooting

### Still getting 301 redirects?

**Check nginx config is loaded:**
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production exec nginx cat /etc/nginx/conf.d/focusflow.conf | grep "proxy_http_version"
```

**Should show:** `proxy_http_version 1.1;`

### Admin page shows but no styling?

**Collect static files:**
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py collectstatic --noinput
docker-compose -f docker-compose.prod.yml --env-file .env.production restart nginx
```

### Backend logs still show HTTP/1.0?

**Restart nginx completely:**
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production down
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Browser keeps redirecting?

**Clear browser cache:**
- Chrome: Ctrl+Shift+Del → Clear cached images and files
- Or try incognito/private mode
- Or different browser

## Success Checklist

After applying fix:

- [ ] Pulled latest code with `git pull origin main`
- [ ] Restarted nginx and backend
- [ ] Backend logs show `HTTP/1.1 200` (not `HTTP/1.0 301`)
- [ ] https://breathingmonk.com/admin/ shows login page
- [ ] No redirect loop in browser
- [ ] Can access admin interface

## Additional Notes

This fix also applies to:
- `/api/` endpoints
- Any other Django URLs
- Both HTTP-only and HTTPS nginx configs

All proxy locations now use:
- ✅ HTTP/1.1
- ✅ Proper forwarding headers
- ✅ Explicit backend port

---

**Issue:** 301 Redirect Loop
**Status:** Fixed
**Date:** 2025-12-08
**Files Modified:**
- `nginx/conf.d/focusflow.conf`
- `nginx/conf.d/focusflow-http-only.conf`
