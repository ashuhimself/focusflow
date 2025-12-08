#!/bin/bash

# BreathingMonk Production Deployment Script
set -e

echo "========================================="
echo "🚀 Starting BreathingMonk Deployment"
echo "========================================="

# Verify .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please ensure .env file is created with proper credentials"
    exit 1
fi

echo "✓ Using existing .env file"

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check container status
echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps

# Check backend logs for any errors
echo "📝 Checking backend logs..."
docker logs focusflow_backend --tail 20

echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo "🌐 Site: https://breathingmonk.com"
echo "🔧 API: https://breathingmonk.com/api"
echo "⚙️  Admin: https://breathingmonk.com/admin"
echo "========================================="
