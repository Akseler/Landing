#!/bin/bash

echo "🔍 Checking if Docker Compose is reading .env file..."
echo ""

cd ~/Landing || cd /root/Landing || { echo "❌ Project directory not found!"; exit 1; }

echo "1️⃣ Checking .env file location:"
pwd
ls -la .env docker-compose.yml
echo ""

echo "2️⃣ Checking .env file contents:"
cat .env
echo ""

echo "3️⃣ Testing if Docker Compose can read variables:"
docker-compose config | grep -A 5 "DATABASE_URL" || echo "DATABASE_URL not found in docker-compose config"
echo ""

echo "4️⃣ Checking environment variables inside running container:"
docker-compose exec app env | grep -E "DATABASE_URL|ANALYTICS_PASSWORD|PORT|NODE_ENV" || echo "Container not running or variables not set"
echo ""

echo "5️⃣ Checking container logs for database connection:"
docker-compose logs --tail=20 | grep -i "database\|connection\|error" || echo "No database-related logs found"
echo ""

echo "✅ Check complete!"


