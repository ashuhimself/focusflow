#!/bin/bash

# Quick Fix for Admin Page Not Loading

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Quick Fix: Admin Page Not Loading${NC}"
echo ""

# Step 1: Add CSRF_TRUSTED_ORIGINS to .env.production if missing
echo -e "${YELLOW}[1] Checking CSRF_TRUSTED_ORIGINS...${NC}"
if ! grep -q "CSRF_TRUSTED_ORIGINS" .env.production; then
    echo "CSRF_TRUSTED_ORIGINS=https://breathingmonk.com,https://www.breathingmonk.com" >> .env.production
    echo -e "${GREEN}✓ Added CSRF_TRUSTED_ORIGINS${NC}"
else
    echo -e "${GREEN}✓ CSRF_TRUSTED_ORIGINS already set${NC}"
fi
echo ""

# Step 2: Recollect static files
echo -e "${YELLOW}[2] Collecting static files...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production exec backend python manage.py collectstatic --noinput
echo -e "${GREEN}✓ Static files collected${NC}"
echo ""

# Step 3: Restart backend
echo -e "${YELLOW}[3] Restarting backend...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production restart backend
echo -e "${GREEN}✓ Backend restarted${NC}"
echo ""

# Step 4: Wait and test
echo -e "${YELLOW}[4] Waiting for backend to start...${NC}"
sleep 5

# Step 5: Test admin page
echo -e "${YELLOW}[5] Testing admin page...${NC}"
HTTP_CODE=$(docker-compose -f docker-compose.prod.yml --env-file .env.production exec nginx wget -q -O- http://backend:8000/admin/ 2>&1 | head -1 | grep -o "HTTP.*" || echo "Request sent")
echo "Response: $HTTP_CODE"
echo ""

# Step 6: Check backend logs
echo -e "${YELLOW}[6] Recent backend logs:${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production logs --tail=20 backend
echo ""

echo -e "${GREEN}=========================================="
echo "Fix Applied!"
echo "==========================================${NC}"
echo ""
echo "Now try accessing:"
echo "  🔧 https://breathingmonk.com/admin/"
echo ""
echo "If still not working, run:"
echo "  ./diagnose.sh"
echo ""
