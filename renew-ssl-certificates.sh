#!/bin/bash

set -e

echo "=========================================="
echo "   Remove Old & Install New SSL Certificates"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Stop all services
echo -e "${YELLOW}Step 1: Stopping all services...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production down

# Step 2: Remove old certificates
echo -e "${YELLOW}Step 2: Removing old SSL certificates...${NC}"
if [ -d "certbot/conf/live/breathingmonk.com" ]; then
    sudo rm -rf certbot/conf/live/breathingmonk.com
    echo -e "${GREEN}✓ Removed certificates from certbot/conf/live/${NC}"
fi

if [ -d "certbot/conf/archive/breathingmonk.com" ]; then
    sudo rm -rf certbot/conf/archive/breathingmonk.com
    echo -e "${GREEN}✓ Removed certificates from certbot/conf/archive/${NC}"
fi

if [ -d "certbot/conf/renewal/breathingmonk.com.conf" ]; then
    sudo rm -f certbot/conf/renewal/breathingmonk.com.conf
    echo -e "${GREEN}✓ Removed renewal configuration${NC}"
fi

echo -e "${GREEN}✓ All old certificates removed${NC}"

# Step 3: Setup HTTP-only configuration for certificate verification
echo -e "${YELLOW}Step 3: Setting up HTTP-only configuration...${NC}"
cd nginx/conf.d
if [ -f "focusflow.conf" ]; then
    mv focusflow.conf focusflow.conf.backup.$(date +%Y%m%d_%H%M%S)
fi
cp focusflow-http-only.conf focusflow.conf
cd ../..
echo -e "${GREEN}✓ HTTP-only configuration activated${NC}"

# Step 4: Start nginx for certificate verification
echo -e "${YELLOW}Step 4: Starting nginx for certificate verification...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d db backend frontend nginx

# Wait for nginx to be ready
echo -e "${YELLOW}Waiting for nginx to be ready...${NC}"
sleep 10

# Step 5: Obtain new SSL certificates
echo -e "${YELLOW}Step 5: Obtaining new SSL certificates from Let's Encrypt...${NC}"
echo -e "${YELLOW}This may take a minute...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@breathingmonk.com \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d breathingmonk.com \
    -d www.breathingmonk.com

# Check if certificates were created
if [ ! -f "certbot/conf/live/breathingmonk.com/fullchain.pem" ]; then
    echo -e "${RED}ERROR: Failed to obtain SSL certificates!${NC}"
    echo "Please check:"
    echo "  1. DNS is pointing to this server (nslookup breathingmonk.com)"
    echo "  2. Port 80 is open in EC2 security group"
    echo "  3. No firewall blocking port 80"
    exit 1
fi

echo -e "${GREEN}✓ New SSL certificates obtained successfully!${NC}"

# Step 6: Switch to SSL configuration
echo -e "${YELLOW}Step 6: Switching to SSL configuration...${NC}"
cd nginx/conf.d
mv focusflow.conf focusflow-http-only.conf.backup.$(date +%Y%m%d_%H%M%S)
cp focusflow.conf.ssl focusflow.conf
cd ../..
echo -e "${GREEN}✓ SSL configuration activated${NC}"

# Step 7: Restart all services with SSL
echo -e "${YELLOW}Step 7: Restarting all services with SSL...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production down
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Wait for services to start
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 10

# Step 8: Show certificate info
echo -e "${YELLOW}Step 8: Verifying new certificates...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production run --rm certbot certificates

echo ""
echo -e "${GREEN}=========================================="
echo "   SSL Certificates Installed Successfully!"
echo "==========================================${NC}"
echo ""
echo "Your site is now accessible at:"
echo "  🔒 https://breathingmonk.com"
echo "  🔒 https://www.breathingmonk.com"
echo ""
echo "Certificate details saved in: certbot/conf/live/breathingmonk.com/"
echo ""
echo "Certificates will auto-renew every 12 hours via certbot container."
echo ""
echo "Test your deployment:"
echo "  curl -I https://breathingmonk.com"
echo ""
