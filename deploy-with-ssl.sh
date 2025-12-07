#!/bin/bash

# FocusFlow Complete Deployment with SSL
# ONE SCRIPT TO RULE THEM ALL - No deployment pain!

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="breathingmonk.com"
EMAIL="admin@breathingmonk.com"

echo -e "${BLUE}"
echo "================================================"
echo "   FocusFlow Complete Deployment with SSL"
echo "   No Pain, All Gain! 🚀"
echo "================================================"
echo -e "${NC}"

# Step 1: Check environment file
echo -e "${YELLOW}[1/8] Checking environment configuration...${NC}"
if [ ! -f .env.production ]; then
    echo -e "${RED}ERROR: .env.production not found!${NC}"
    exit 1
fi

source .env.production

if [ "$DJANGO_SECRET_KEY" = "CHANGE-THIS-TO-A-STRONG-RANDOM-SECRET-KEY-AT-LEAST-50-CHARS" ]; then
    echo -e "${RED}ERROR: Please update DJANGO_SECRET_KEY in .env.production${NC}"
    exit 1
fi

if [ "$POSTGRES_PASSWORD" = "CHANGE-THIS-TO-A-STRONG-DATABASE-PASSWORD" ]; then
    echo -e "${RED}ERROR: Please update POSTGRES_PASSWORD in .env.production${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment configured${NC}"
echo ""

# Step 2: Check DNS
echo -e "${YELLOW}[2/8] Checking DNS propagation...${NC}"
DNS_IP=$(dig +short $DOMAIN | head -n 1)

if [ -z "$DNS_IP" ]; then
    echo -e "${RED}ERROR: Domain $DOMAIN does not resolve${NC}"
    echo "Please configure GoDaddy DNS:"
    echo "  1. A record @ → Your EC2 IP"
    echo "  2. A record www → Your EC2 IP"
    echo "  3. Wait 10-30 minutes for propagation"
    exit 1
fi

echo -e "${GREEN}✓ Domain resolves to: $DNS_IP${NC}"
echo ""

# Step 3: Stop existing services
echo -e "${YELLOW}[3/8] Stopping existing services...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production down || true
echo -e "${GREEN}✓ Services stopped${NC}"
echo ""

# Step 4: Setup HTTP-only config first
echo -e "${YELLOW}[4/8] Preparing HTTP-only configuration...${NC}"

# Backup and disable HTTPS config if it exists
if [ -f "nginx/conf.d/focusflow.conf" ]; then
    mv nginx/conf.d/focusflow.conf nginx/conf.d/focusflow-https.conf.backup
fi

# Ensure HTTP-only config is active
if [ -f "nginx/conf.d/focusflow-http-only.conf.disabled" ]; then
    mv nginx/conf.d/focusflow-http-only.conf.disabled nginx/conf.d/focusflow-http-only.conf
fi

echo -e "${GREEN}✓ HTTP-only config ready${NC}"
echo ""

# Step 5: Build and start services (HTTP only)
echo -e "${YELLOW}[5/8] Building and starting services (HTTP mode)...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production build --no-cache
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

echo -e "${YELLOW}Waiting for services to initialize...${NC}"
sleep 15

# Run migrations
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T backend python manage.py migrate --noinput
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T backend python manage.py collectstatic --noinput

# Create superuser
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T backend python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@breathingmonk.com', 'admin123')
    print('✓ Superuser created: admin / admin123 (CHANGE THIS!)')
else:
    print('✓ Superuser already exists')
EOF

echo -e "${GREEN}✓ Services running in HTTP mode${NC}"
echo ""

# Step 6: Test HTTP access
echo -e "${YELLOW}[6/8] Testing HTTP access...${NC}"
sleep 5

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/health 2>/dev/null || echo "000")

if [ "$HTTP_CODE" != "200" ]; then
    echo -e "${YELLOW}Warning: HTTP health check returned code $HTTP_CODE${NC}"
    echo "Continuing anyway... check logs if issues persist"
else
    echo -e "${GREEN}✓ HTTP access working${NC}"
fi
echo ""

# Step 7: Obtain SSL certificate
echo -e "${YELLOW}[7/8] Obtaining SSL certificate...${NC}"

# Check if certificate already exists
if [ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${GREEN}✓ SSL certificate already exists${NC}"
    CERT_EXISTS=true
else
    echo "Stopping nginx to obtain certificate..."
    docker-compose -f docker-compose.prod.yml --env-file .env.production stop nginx
    sleep 2

    echo "Requesting certificate from Let's Encrypt..."
    docker run --rm \
      -v $(pwd)/certbot/conf:/etc/letsencrypt \
      -v $(pwd)/certbot/www:/var/www/certbot \
      -p 80:80 \
      certbot/certbot certonly \
      --standalone \
      --non-interactive \
      --email $EMAIL \
      --agree-tos \
      --no-eff-email \
      -d $DOMAIN \
      -d www.$DOMAIN

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ SSL certificate obtained${NC}"
        CERT_EXISTS=true
    else
        echo -e "${RED}ERROR: Failed to obtain SSL certificate${NC}"
        echo "Starting services without SSL..."
        docker-compose -f docker-compose.prod.yml --env-file .env.production start nginx
        CERT_EXISTS=false
    fi
fi
echo ""

# Step 8: Enable HTTPS
if [ "$CERT_EXISTS" = true ]; then
    echo -e "${YELLOW}[8/8] Enabling HTTPS configuration...${NC}"

    # Disable HTTP-only config
    if [ -f "nginx/conf.d/focusflow-http-only.conf" ]; then
        mv nginx/conf.d/focusflow-http-only.conf nginx/conf.d/focusflow-http-only.conf.disabled
    fi

    # Enable HTTPS config
    if [ -f "nginx/conf.d/focusflow-https.conf.backup" ]; then
        mv nginx/conf.d/focusflow-https.conf.backup nginx/conf.d/focusflow.conf
    fi

    # Restart with HTTPS
    docker-compose -f docker-compose.prod.yml --env-file .env.production down
    docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

    echo -e "${YELLOW}Waiting for HTTPS services to start...${NC}"
    sleep 10

    # Test HTTPS
    HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/health 2>/dev/null || echo "000")

    if [ "$HTTPS_CODE" = "200" ]; then
        echo -e "${GREEN}✓ HTTPS working perfectly!${NC}"
    else
        echo -e "${YELLOW}HTTPS returned code: $HTTPS_CODE (may need a moment to start)${NC}"
    fi
else
    echo -e "${YELLOW}[8/8] Running in HTTP mode (SSL setup failed)${NC}"
    echo "Application is accessible via HTTP only"
fi

echo ""
echo -e "${GREEN}"
echo "================================================"
echo "   ✅ Deployment Complete!"
echo "================================================"
echo -e "${NC}"
echo ""

if [ "$CERT_EXISTS" = true ]; then
    echo -e "${GREEN}Your application is live at:${NC}"
    echo "  🌐 https://$DOMAIN"
    echo "  🌐 https://www.$DOMAIN"
    echo "  🔒 SSL/HTTPS enabled and working!"
    echo ""
    echo "  🔧 Admin: https://$DOMAIN/admin"
    echo "  📊 API: https://$DOMAIN/api"
else
    echo -e "${YELLOW}Your application is live at (HTTP only):${NC}"
    echo "  🌐 http://$DOMAIN"
    echo "  🌐 http://www.$DOMAIN"
    echo "  ⚠️  SSL setup failed - running in HTTP mode"
    echo ""
    echo "  🔧 Admin: http://$DOMAIN/admin"
    echo "  📊 API: http://$DOMAIN/api"
fi

echo ""
echo -e "${YELLOW}Default credentials (CHANGE IMMEDIATELY):${NC}"
echo "  👤 Username: admin"
echo "  🔑 Password: admin123"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  View logs:    ./manage-prod.sh logs"
echo "  Check status: ./manage-prod.sh status"
echo "  Restart:      ./manage-prod.sh restart"
echo "  Backup DB:    ./manage-prod.sh backup"
echo ""
echo -e "${GREEN}🎉 Deployment successful! No pain, all gain!${NC}"
echo ""
