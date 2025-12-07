#!/bin/bash

# SSL Certificate Setup Script for FocusFlow
# Run this AFTER initial deployment and DNS propagation

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DOMAIN="breathingmonk.com"
EMAIL="admin@breathingmonk.com"

echo "=========================================="
echo "FocusFlow SSL Certificate Setup"
echo "=========================================="
echo ""

# Check if DNS is propagated
echo -e "${YELLOW}Checking DNS propagation...${NC}"
DNS_IP=$(dig +short $DOMAIN | head -n 1)

if [ -z "$DNS_IP" ]; then
    echo -e "${RED}ERROR: Domain $DOMAIN does not resolve to any IP${NC}"
    echo "Please configure GoDaddy DNS first and wait for propagation"
    exit 1
fi

echo -e "${GREEN}Domain resolves to: $DNS_IP ✓${NC}"
echo ""

# Check if using HTTP-only config
if [ -f "nginx/conf.d/focusflow.conf" ] && grep -q "ssl_certificate" nginx/conf.d/focusflow.conf; then
    echo -e "${YELLOW}Detected SSL config in focusflow.conf${NC}"
    echo -e "${YELLOW}Temporarily renaming to use HTTP-only config...${NC}"
    mv nginx/conf.d/focusflow.conf nginx/conf.d/focusflow-https.conf.disabled
    echo -e "${GREEN}Renamed to focusflow-https.conf.disabled ✓${NC}"
fi

# Ensure HTTP-only config is active
if [ ! -f "nginx/conf.d/focusflow-http-only.conf" ]; then
    echo -e "${RED}ERROR: focusflow-http-only.conf not found!${NC}"
    exit 1
fi

echo -e "${YELLOW}Using HTTP-only configuration${NC}"
echo ""

# Restart nginx with HTTP-only config
echo -e "${YELLOW}Restarting nginx with HTTP-only config...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production restart nginx
sleep 3

# Check if port 80 is accessible
echo -e "${YELLOW}Testing HTTP access...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/health || echo "000")

if [ "$HTTP_CODE" != "200" ]; then
    echo -e "${RED}ERROR: Cannot access http://$DOMAIN (HTTP code: $HTTP_CODE)${NC}"
    echo "Please check:"
    echo "  1. DNS is properly configured"
    echo "  2. EC2 security group allows port 80"
    echo "  3. Nginx is running: docker ps | grep nginx"
    exit 1
fi

echo -e "${GREEN}HTTP access working ✓${NC}"
echo ""

# Stop nginx to free port 80 for certbot
echo -e "${YELLOW}Stopping nginx temporarily...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production stop nginx
sleep 2

# Obtain SSL certificate
echo -e "${YELLOW}Obtaining SSL certificate from Let's Encrypt...${NC}"
echo "Domain: $DOMAIN, www.$DOMAIN"
echo "Email: $EMAIL"
echo ""

docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN

if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to obtain SSL certificate${NC}"
    echo "Starting nginx with HTTP-only config..."
    docker-compose -f docker-compose.prod.yml --env-file .env.production start nginx
    exit 1
fi

echo -e "${GREEN}SSL certificate obtained successfully ✓${NC}"
echo ""

# Switch to HTTPS config
echo -e "${YELLOW}Switching to HTTPS configuration...${NC}"

# Disable HTTP-only config
mv nginx/conf.d/focusflow-http-only.conf nginx/conf.d/focusflow-http-only.conf.disabled

# Enable HTTPS config
if [ -f "nginx/conf.d/focusflow-https.conf.disabled" ]; then
    mv nginx/conf.d/focusflow-https.conf.disabled nginx/conf.d/focusflow.conf
else
    echo -e "${RED}ERROR: focusflow-https.conf.disabled not found!${NC}"
    exit 1
fi

echo -e "${GREEN}HTTPS configuration enabled ✓${NC}"
echo ""

# Restart all services with HTTPS
echo -e "${YELLOW}Restarting all services with HTTPS...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production down
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

echo ""
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 10

# Test HTTPS
echo -e "${YELLOW}Testing HTTPS access...${NC}"
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/health || echo "000")

if [ "$HTTPS_CODE" = "200" ]; then
    echo -e "${GREEN}✓ HTTPS working!${NC}"
else
    echo -e "${YELLOW}HTTPS returned code: $HTTPS_CODE${NC}"
    echo "Check logs: docker-compose -f docker-compose.prod.yml --env-file .env.production logs nginx"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "SSL Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Your application is now available at:"
echo "  🌐 https://$DOMAIN"
echo "  🌐 https://www.$DOMAIN"
echo ""
echo "HTTP traffic will automatically redirect to HTTPS"
echo ""
echo "Certificate will auto-renew via the certbot container"
echo ""
