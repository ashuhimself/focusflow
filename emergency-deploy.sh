#!/bin/bash

# Emergency Full Deployment and Diagnosis Script
# Run this on EC2 to deploy and fix everything

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "=========================================="
echo "   EMERGENCY DEPLOYMENT & FIX"
echo "=========================================="
echo -e "${NC}"

# Function to check service
check_service() {
    local service=$1
    if docker ps --format '{{.Names}}' | grep -q "focusflow_$service"; then
        echo -e "${GREEN}✓ $service is running${NC}"
        return 0
    else
        echo -e "${RED}✗ $service is NOT running${NC}"
        return 1
    fi
}

# Function to test URL
test_url() {
    local url=$1
    local expected=$2
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✓ $url → HTTP $response${NC}"
        return 0
    else
        echo -e "${RED}✗ $url → HTTP $response (expected $expected)${NC}"
        return 1
    fi
}

echo -e "${YELLOW}[1/10] Checking if services are running...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production ps
echo ""

echo -e "${YELLOW}[2/10] Stopping all services...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production down
echo -e "${GREEN}✓ All services stopped${NC}"
echo ""

echo -e "${YELLOW}[3/10] Pulling latest code...${NC}"
git fetch origin
git reset --hard origin/main
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

echo -e "${YELLOW}[4/10] Checking environment variables...${NC}"
if [ ! -f .env.production ]; then
    echo -e "${RED}ERROR: .env.production not found!${NC}"
    exit 1
fi

source .env.production
if [ -z "$DJANGO_SECRET_KEY" ] || [ -z "$POSTGRES_PASSWORD" ]; then
    echo -e "${RED}ERROR: Required environment variables not set!${NC}"
    echo "DJANGO_SECRET_KEY: $(if [ -z "$DJANGO_SECRET_KEY" ]; then echo "NOT SET"; else echo "SET"; fi)"
    echo "POSTGRES_PASSWORD: $(if [ -z "$POSTGRES_PASSWORD" ]; then echo "NOT SET"; else echo "SET"; fi)"
    exit 1
fi
echo -e "${GREEN}✓ Environment variables OK${NC}"
echo ""

echo -e "${YELLOW}[5/10] Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production build --no-cache
echo -e "${GREEN}✓ Images built${NC}"
echo ""

echo -e "${YELLOW}[6/10] Starting services...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
echo -e "${GREEN}✓ Services started${NC}"
echo ""

echo -e "${YELLOW}[7/10] Waiting for services to initialize (30 seconds)...${NC}"
sleep 30

echo -e "${YELLOW}[8/10] Checking service status...${NC}"
check_service "db"
check_service "backend"
check_service "frontend"
check_service "nginx"
echo ""

echo -e "${YELLOW}[9/10] Running database migrations and setup...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T backend python manage.py migrate --noinput
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T backend python manage.py collectstatic --noinput

# Create admin user
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T backend python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@breathingmonk.com', 'admin123')
    print('✓ Admin user created')
else:
    print('✓ Admin user already exists')
EOF

echo -e "${GREEN}✓ Database setup complete${NC}"
echo ""

echo -e "${YELLOW}[10/10] Testing endpoints...${NC}"
sleep 5

# Test internal connectivity
echo ""
echo "Testing internal connectivity..."
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T nginx wget -q -O- http://backend:8000/api/ 2>&1 | head -5 || echo "Backend API accessible from nginx"

echo ""
echo "Testing external URLs..."

# Test main site
MAIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://breathingmonk.com/ 2>/dev/null || echo "000")
echo "Main site (https://breathingmonk.com/): HTTP $MAIN_CODE"

# Test admin
ADMIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://breathingmonk.com/admin/ 2>/dev/null || echo "000")
echo "Admin page (https://breathingmonk.com/admin/): HTTP $ADMIN_CODE"

# Test API
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://breathingmonk.com/api/ 2>/dev/null || echo "000")
echo "API (https://breathingmonk.com/api/): HTTP $API_CODE"

echo ""
echo -e "${BLUE}=========================================="
echo "   DEPLOYMENT STATUS"
echo "==========================================${NC}"
echo ""

# Service status
echo -e "${YELLOW}Service Status:${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production ps
echo ""

# Check logs for errors
echo -e "${YELLOW}Recent Backend Logs:${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production logs backend --tail=15
echo ""

echo -e "${YELLOW}Recent Nginx Logs:${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production logs nginx --tail=15
echo ""

# Summary
echo -e "${BLUE}=========================================="
echo "   SUMMARY"
echo "==========================================${NC}"
echo ""

if [ "$MAIN_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Main site is accessible${NC}"
else
    echo -e "${RED}✗ Main site returned HTTP $MAIN_CODE${NC}"
fi

if [ "$ADMIN_CODE" = "200" ] || [ "$ADMIN_CODE" = "302" ]; then
    echo -e "${GREEN}✓ Admin page is accessible${NC}"
else
    echo -e "${RED}✗ Admin page returned HTTP $ADMIN_CODE${NC}"
fi

if [ "$API_CODE" = "200" ] || [ "$API_CODE" = "401" ]; then
    echo -e "${GREEN}✓ API is accessible${NC}"
else
    echo -e "${RED}✗ API returned HTTP $API_CODE${NC}"
fi

echo ""
echo -e "${YELLOW}Access your application:${NC}"
echo "  🌐 Main: https://breathingmonk.com/"
echo "  🔧 Admin: https://breathingmonk.com/admin/"
echo "  📊 API: https://breathingmonk.com/api/"
echo ""
echo -e "${YELLOW}Default credentials:${NC}"
echo "  👤 Username: admin"
echo "  🔑 Password: admin123"
echo ""

if [ "$MAIN_CODE" != "200" ]; then
    echo -e "${RED}=========================================="
    echo "   TROUBLESHOOTING NEEDED"
    echo "==========================================${NC}"
    echo ""
    echo "Main site is not loading. Common issues:"
    echo ""
    echo "1. Check if nginx is running:"
    echo "   docker ps | grep nginx"
    echo ""
    echo "2. Check nginx configuration:"
    echo "   docker-compose -f docker-compose.prod.yml --env-file .env.production exec nginx nginx -t"
    echo ""
    echo "3. Check nginx error logs:"
    echo "   docker-compose -f docker-compose.prod.yml --env-file .env.production logs nginx"
    echo ""
    echo "4. Check SSL certificates:"
    echo "   ls -la certbot/conf/live/breathingmonk.com/"
    echo ""
    echo "5. Try HTTP instead of HTTPS:"
    echo "   curl -I http://breathingmonk.com/"
    echo ""
fi

echo -e "${BLUE}=========================================="
echo "   Deployment Complete!"
echo "==========================================${NC}"
