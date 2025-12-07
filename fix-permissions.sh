#!/bin/bash

echo "========================================="
echo "  FocusFlow - Permission Fix Script"
echo "========================================="
echo ""

# Fix entrypoint.sh permissions
echo "1. Fixing entrypoint.sh permissions..."
chmod +x backend/entrypoint.sh

# Fix line endings (Windows compatibility)
echo "2. Fixing line endings..."
sed -i.bak 's/\r$//' backend/entrypoint.sh 2>/dev/null || true

# Fix start.sh permissions
echo "3. Fixing start.sh permissions..."
chmod +x start.sh

echo ""
echo "✅ Permissions fixed!"
echo ""
echo "Now rebuild the containers:"
echo "  docker-compose down"
echo "  docker-compose build --no-cache"
echo "  docker-compose up"
echo ""
echo "Or use the quick start:"
echo "  ./start.sh"
echo ""
