#!/bin/bash

echo "========================================="
echo "  FocusFlow - Life Operating System"
echo "========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env exists, if not create from example
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ".env file created. You can edit it with your configuration."
    echo ""
fi

# Build and start containers
echo "Building and starting containers..."
docker-compose up --build -d

echo ""
echo "========================================="
echo "  FocusFlow is starting up!"
echo "========================================="
echo ""
echo "Services:"
echo "  Frontend:     http://localhost:5173"
echo "  Backend API:  http://localhost:8000/api"
echo "  Django Admin: http://localhost:8000/admin"
echo ""
echo "Default admin credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop:"
echo "  docker-compose down"
echo ""
echo "========================================="
