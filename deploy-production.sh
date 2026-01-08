#!/bin/bash

# Deployment script for production (main branch)
# Usage: Run on server

set -e

echo "🚀 Starting production deployment..."

cd ~/Landing || cd /root/Landing || { echo "❌ Project directory not found!"; exit 1; }

echo "📦 Pulling latest main branch..."
git fetch origin
git checkout main
git pull origin main

echo "🔨 Building Docker image..."

# Try docker compose (v2) first, fallback to docker-compose (v1)
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    echo "Using 'docker compose' (v2)"
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    echo "Using 'docker-compose' (v1)"
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Neither 'docker compose' nor 'docker-compose' found!"
    echo "Please install Docker Compose first:"
    echo "  apt install docker-compose"
    echo "  OR"
    echo "  snap install docker"
    exit 1
fi

echo "🛑 Stopping existing containers..."
$DOCKER_COMPOSE down

echo "🔨 Building new image..."
$DOCKER_COMPOSE build --no-cache

echo "🚀 Starting containers..."
$DOCKER_COMPOSE up -d

echo "⏳ Waiting for health check..."
sleep 10

echo "📊 Checking container status..."
$DOCKER_COMPOSE ps

echo "📝 Viewing recent logs..."
$DOCKER_COMPOSE logs --tail=50

echo "✅ Deployment complete!"
echo "🌐 Check your site at: https://akseler.lt"



