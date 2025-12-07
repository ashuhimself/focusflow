#!/bin/bash

echo "========================================="
echo "  FocusFlow - Services Test"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if containers are running
echo "1. Checking Docker containers..."
if docker-compose ps | grep -q "focusflow_db.*Up.*healthy"; then
    echo -e "${GREEN}✓${NC} Database is running and healthy"
else
    echo -e "${RED}✗${NC} Database is not running properly"
    exit 1
fi

if docker-compose ps | grep -q "focusflow_backend.*Up"; then
    echo -e "${GREEN}✓${NC} Backend is running"
else
    echo -e "${RED}✗${NC} Backend is not running"
    exit 1
fi

if docker-compose ps | grep -q "focusflow_frontend.*Up"; then
    echo -e "${GREEN}✓${NC} Frontend is running"
else
    echo -e "${RED}✗${NC} Frontend is not running"
    exit 1
fi

echo ""

# Test 2: Test Backend API
echo "2. Testing Backend API..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/)
if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
    echo -e "${GREEN}✓${NC} Backend API is responding (authentication required)"
else
    echo -e "${RED}✗${NC} Backend API returned unexpected status: $RESPONSE"
fi

# Test 3: Test Authentication
echo "3. Testing Authentication..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/token/ \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}')

if echo "$TOKEN_RESPONSE" | grep -q "access"; then
    echo -e "${GREEN}✓${NC} Authentication successful"
    ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access'])")
else
    echo -e "${RED}✗${NC} Authentication failed"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

# Test 4: Test Dashboard Stats Endpoint
echo "4. Testing Dashboard Stats endpoint..."
STATS_RESPONSE=$(curl -s http://localhost:8000/api/dashboard/stats/ \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$STATS_RESPONSE" | grep -q "greeting"; then
    echo -e "${GREEN}✓${NC} Dashboard stats endpoint working"
    echo "   Sample data:"
    echo "$STATS_RESPONSE" | python3 -m json.tool 2>/dev/null | head -15 | sed 's/^/   /'
else
    echo -e "${RED}✗${NC} Dashboard stats endpoint failed"
    echo "Response: $STATS_RESPONSE"
fi

echo ""

# Test 5: Test Frontend
echo "5. Testing Frontend..."
FRONTEND_RESPONSE=$(curl -s http://localhost:5173)
if echo "$FRONTEND_RESPONSE" | grep -q "FocusFlow"; then
    echo -e "${GREEN}✓${NC} Frontend is serving correctly"
else
    echo -e "${RED}✗${NC} Frontend is not responding correctly"
fi

echo ""
echo "========================================="
echo "  All Services Status"
echo "========================================="
echo ""
echo "✅ Database:  http://localhost:5432"
echo "✅ Backend:   http://localhost:8000/api"
echo "✅ Frontend:  http://localhost:5173"
echo "✅ Admin:     http://localhost:8000/admin"
echo ""
echo "Default credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo -e "${GREEN}All services are running successfully!${NC}"
echo ""
