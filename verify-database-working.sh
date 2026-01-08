#!/bin/bash

echo "🔍 Verifying database connection..."
echo ""

cd ~/Landing || cd /root/Landing || { echo "❌ Project directory not found!"; exit 1; }

echo "1️⃣ Checking if container is running:"
docker-compose ps
echo ""

echo "2️⃣ Testing API health endpoint:"
docker-compose exec app curl -s http://localhost:3000/api/health || echo "Container not responding"
echo ""

echo "3️⃣ Checking database connection in logs:"
docker-compose logs --tail=100 | grep -i "database\|connection\|successful\|error" | tail -10
echo ""

echo "4️⃣ Checking if DATABASE_URL is set in container:"
docker-compose exec app env | grep DATABASE_URL
echo ""

echo "✅ Verification complete!"
echo ""
echo "If you see 'Database connection successful' in the logs, everything is working! ✅"
echo "The warnings about SUPABASE_DATABASE_URL, GOOGLE_OAUTH, etc. are just for optional features."

