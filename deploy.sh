#!/bin/bash

# FocusFlow Production Deployment Script for AWS EC2
# This script automates the deployment process

set -e  # Exit on any error

echo "=========================================="
echo "FocusFlow Production Deployment"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production file not found!${NC}"
    echo "Please create .env.production from .env.production template"
    exit 1
fi

# Check if required environment variables are set
echo -e "${YELLOW}Checking environment variables...${NC}"
source .env.production

if [ "$DJANGO_SECRET_KEY" = "CHANGE-THIS-TO-A-STRONG-RANDOM-SECRET-KEY-AT-LEAST-50-CHARS" ]; then
    echo -e "${RED}Error: DJANGO_SECRET_KEY is not set in .env.production${NC}"
    exit 1
fi

if [ "$POSTGRES_PASSWORD" = "CHANGE-THIS-TO-A-STRONG-DATABASE-PASSWORD" ]; then
    echo -e "${RED}Error: POSTGRES_PASSWORD is not set in .env.production${NC}"
    exit 1
fi

echo -e "${GREEN}Environment variables validated ✓${NC}"

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down || true

# Pull latest changes (if in git repo)
if [ -d .git ]; then
    echo -e "${YELLOW}Pulling latest changes from git...${NC}"
    git pull || echo -e "${YELLOW}Warning: Could not pull from git${NC}"
fi

# Build and start containers
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

echo -e "${YELLOW}Starting containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 10

# Check if services are running
echo -e "${YELLOW}Checking service health...${NC}"
docker-compose -f docker-compose.prod.yml ps

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate --noinput

# Collect static files
echo -e "${YELLOW}Collecting static files...${NC}"
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput

# Create superuser (if needed)
echo -e "${YELLOW}Creating superuser...${NC}"
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@breathingmonk.com', 'admin123')
    print('Superuser created: admin / admin123')
    print('⚠️  IMPORTANT: Change the password immediately!')
else:
    print('Superuser already exists')
EOF

echo -e "${GREEN}=========================================="
echo "Deployment completed successfully! ✓"
echo "==========================================${NC}"
echo ""
echo "Application URLs:"
echo "  - Frontend: https://breathingmonk.com"
echo "  - Backend API: https://breathingmonk.com/api"
echo "  - Admin Panel: https://breathingmonk.com/admin"
echo ""
echo "Default credentials (CHANGE IMMEDIATELY):"
echo "  - Username: admin"
echo "  - Password: admin123"
echo ""
echo "Next steps:"
echo "  1. Setup SSL certificates (see DEPLOYMENT.md)"
echo "  2. Change admin password"
echo "  3. Configure GoDaddy DNS to point to this server"
echo ""
echo "To view logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
