#!/bin/bash

set -e

echo "=========================================="
echo "   SSL Certificate Setup for FocusFlow"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Ensure HTTP-only config is active
echo -e "${YELLOW}Step 1: Setting up HTTP-only configuration for certificate verification...${NC}"
cd nginx/conf.d
if [ -f "focusflow.conf" ]; then
    mv focusflow.conf focusflow.conf.backup
fi
cp focusflow-http-only.conf focusflow.conf
cd ../..

# Step 2: Start services with HTTP-only
echo -e "${YELLOW}Step 2: Starting services with HTTP-only configuration...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d nginx

# Wait for nginx to be ready
echo -e "${YELLOW}Waiting for nginx to be ready...${NC}"
sleep 5

# Step 3: Obtain SSL certificate
echo -e "${YELLOW}Step 3: Obtaining SSL certificate from Let's Encrypt...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@breathingmonk.com \
    --agree-tos \
    --no-eff-email \
    -d breathingmonk.com \
    -d www.breathingmonk.com || echo -e "${GREEN}Certificates already exist, continuing...${NC}"

# Step 4: Switch to SSL configuration
echo -e "${YELLOW}Step 4: Switching to SSL configuration...${NC}"
cd nginx/conf.d
mv focusflow.conf focusflow-http-only.conf.backup
cp focusflow.conf.ssl focusflow.conf
cd ../..

# Step 5: Restart nginx with SSL
echo -e "${YELLOW}Step 5: Restarting nginx with SSL configuration...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production restart nginx

# Step 6: Start all remaining services
echo -e "${YELLOW}Step 6: Starting all services...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

echo ""
echo -e "${GREEN}=========================================="
echo "   SSL Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Your site should now be accessible at:"
echo "  🌐 https://breathingmonk.com"
echo "  🔒 https://www.breathingmonk.com"
echo ""
echo "Certificate will auto-renew every 12 hours via certbot container."
echo ""
