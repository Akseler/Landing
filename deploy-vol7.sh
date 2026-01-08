#!/bin/bash

# Deployment script for vol.7 branch to Hostinger
# Usage: ./deploy-vol7.sh

set -e

echo "🚀 Starting deployment of vol.7 branch..."

# Navigate to project directory (adjust path if needed)
cd ~/Landing || cd /root/Landing || { echo "❌ Project directory not found!"; exit 1; }

echo "📦 Pulling latest vol.7 branch..."
git fetch origin
git checkout vol.7
git pull origin vol.7

echo "🔨 Building Docker image..."
docker-compose build --no-cache

echo "🛑 Stopping existing containers..."
docker-compose down

echo "🚀 Starting new containers..."
docker-compose up -d

echo "⏳ Waiting for health check..."
sleep 10

echo "📊 Checking container status..."
docker-compose ps

echo "📝 Viewing recent logs..."
docker-compose logs --tail=50

echo "✅ Deployment complete!"
echo "🌐 Check your site at: https://akseler.lt/test"



