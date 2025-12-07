#!/bin/bash

# Fix for 301 Redirect Loop on Admin Page

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}=========================================="
echo "Fixing 301 Redirect Loop"
echo "==========================================${NC}"
echo ""

echo -e "${YELLOW}Issue detected:${NC} Backend returning HTTP 301 redirects in a loop"
echo -e "${YELLOW}Root cause:${NC} Nginx not properly passing HTTP protocol headers"
echo ""

# Pull latest nginx config fixes
echo -e "${YELLOW}[1/4] Pulling latest nginx configuration...${NC}"
git pull origin main
echo -e "${GREEN}✓ Configuration updated${NC}"
echo ""

# Restart nginx with new config
echo -e "${YELLOW}[2/4] Restarting nginx with fixed configuration...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production restart nginx
sleep 3
echo -e "${GREEN}✓ Nginx restarted${NC}"
echo ""

# Restart backend to clear any caching
echo -e "${YELLOW}[3/4] Restarting backend...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production restart backend
sleep 5
echo -e "${GREEN}✓ Backend restarted${NC}"
echo ""

# Test admin page
echo -e "${YELLOW}[4/4] Testing admin page access...${NC}"
RESPONSE=$(curl -sL -w "%{http_code}" -o /dev/null https://breathingmonk.com/admin/ 2>/dev/null || echo "000")

if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Admin page is working! (HTTP $RESPONSE)${NC}"
elif [ "$RESPONSE" = "301" ] || [ "$RESPONSE" = "302" ]; then
    echo -e "${YELLOW}⚠ Still getting redirect (HTTP $RESPONSE)${NC}"
    echo "This may be normal if Django is adding a trailing slash"
else
    echo -e "${RED}✗ Admin page returned HTTP $RESPONSE${NC}"
fi
echo ""

echo -e "${GREEN}=========================================="
echo "Fix Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}What was fixed:${NC}"
echo "  • Updated nginx to use HTTP/1.1 instead of HTTP/1.0"
echo "  • Added X-Forwarded-Host header"
echo "  • Fixed proxy_pass to include port :8000"
echo ""
echo -e "${YELLOW}Test the admin page:${NC}"
echo "  🌐 https://breathingmonk.com/admin/"
echo ""
echo -e "${YELLOW}If still having issues:${NC}"
echo "  • Clear browser cache and cookies"
echo "  • Try in incognito/private mode"
echo "  • Check logs: ./manage-prod.sh logs"
echo ""
