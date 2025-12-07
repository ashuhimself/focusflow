#!/bin/bash

set -e

echo "=========================================="
echo "   Enabling SSL for FocusFlow"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Verify certificates exist
echo -e "${YELLOW}Step 1: Verifying SSL certificates...${NC}"
if [ ! -f "certbot/conf/live/breathingmonk.com/fullchain.pem" ]; then
    echo "ERROR: SSL certificates not found!"
    echo "Please run ./setup-ssl.sh first to obtain certificates."
    exit 1
fi
echo -e "${GREEN}✓ Certificates found${NC}"

# Step 2: Stop all services
echo -e "${YELLOW}Step 2: Stopping all services...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production down

# Step 3: Switch to SSL configuration
echo -e "${YELLOW}Step 3: Activating SSL configuration...${NC}"
cd nginx/conf.d
# Backup current config if it exists
if [ -f "focusflow.conf" ]; then
    mv focusflow.conf focusflow.conf.backup.$(date +%Y%m%d_%H%M%S)
fi
# Copy SSL config to active config
cp focusflow.conf.ssl focusflow.conf
cd ../..
echo -e "${GREEN}✓ SSL configuration activated${NC}"

# Step 4: Start all services with SSL
echo -e "${YELLOW}Step 4: Starting all services with SSL...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Wait for services to start
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 10

# Step 5: Check service status
echo -e "${YELLOW}Step 5: Checking service status...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production ps

echo ""
echo -e "${GREEN}=========================================="
echo "   SSL Enabled Successfully!"
echo "==========================================${NC}"
echo ""
echo "Your site is now accessible at:"
echo "  🔒 https://breathingmonk.com"
echo "  🔒 https://www.breathingmonk.com"
echo ""
echo "HTTP traffic will automatically redirect to HTTPS."
echo ""
echo "Test your deployment:"
echo "  curl -I https://breathingmonk.com"
echo ""
