#!/bin/bash

# Diagnostic Script for FocusFlow Deployment Issues

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "FocusFlow Diagnostic Tool"
echo "==========================================${NC}"
echo ""

# Check container status
echo -e "${YELLOW}[1] Container Status:${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production ps
echo ""

# Check backend logs
echo -e "${YELLOW}[2] Backend Logs (last 30 lines):${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production logs --tail=30 backend
echo ""

# Check nginx logs
echo -e "${YELLOW}[3] Nginx Logs (last 20 lines):${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production logs --tail=20 nginx
echo ""

# Check if backend is accessible from nginx
echo -e "${YELLOW}[4] Backend Accessibility Test:${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production exec nginx wget -O- http://backend:8000/admin/ 2>&1 | head -20
echo ""

# Check Django URLs
echo -e "${YELLOW}[5] Django URL Configuration:${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py show_urls 2>/dev/null || \
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py shell << 'EOF'
from django.urls import get_resolver
from django.urls.resolvers import URLPattern, URLResolver

def show_urls(urlpatterns, depth=0):
    for pattern in urlpatterns:
        if isinstance(pattern, URLResolver):
            print("  " * depth + str(pattern.pattern))
            show_urls(pattern.url_patterns, depth + 1)
        elif isinstance(pattern, URLPattern):
            print("  " * depth + str(pattern.pattern))

resolver = get_resolver()
print("\nRegistered URL Patterns:")
show_urls(resolver.url_patterns)
EOF
echo ""

# Check static files
echo -e "${YELLOW}[6] Static Files Check:${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend ls -lah /app/staticfiles/ | head -20
echo ""

# Test backend health
echo -e "${YELLOW}[7] Backend API Test:${NC}"
curl -s http://localhost:8000/api/ | head -20 || echo "Cannot reach backend API"
echo ""

# Test admin page
echo -e "${YELLOW}[8] Admin Page Test:${NC}"
curl -s http://localhost:8000/admin/ | head -20 || echo "Cannot reach admin page"
echo ""

# Check ALLOWED_HOSTS
echo -e "${YELLOW}[9] Django Settings Check:${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py shell << 'EOF'
from django.conf import settings
print(f"DEBUG: {settings.DEBUG}")
print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
print(f"CORS_ALLOWED_ORIGINS: {getattr(settings, 'CORS_ALLOWED_ORIGINS', 'Not set')}")
print(f"STATIC_URL: {settings.STATIC_URL}")
print(f"STATIC_ROOT: {settings.STATIC_ROOT}")
EOF
echo ""

# Network connectivity
echo -e "${YELLOW}[10] Network Connectivity:${NC}"
docker network inspect focusflow_focusflow_network | grep -A 5 "Containers"
echo ""

echo -e "${BLUE}=========================================="
echo "Diagnostic Complete"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}Common Issues:${NC}"
echo "1. If backend is not running → Check backend logs above"
echo "2. If admin page returns 404 → Check URL configuration"
echo "3. If static files missing → Run: docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py collectstatic --noinput"
echo "4. If ALLOWED_HOSTS error → Check .env.production settings"
echo ""
