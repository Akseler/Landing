#!/bin/bash

# Quick fix script for Hostinger database connection
# Run this on your Hostinger server

echo "🔧 Fixing database connection on Hostinger..."

# Navigate to project directory
cd ~/Landing || cd /root/Landing || { echo "❌ Project directory not found!"; exit 1; }

# Create .env file with database connection
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres.sirnowikpquelnzowbzp:akseler420%2A%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
ANALYTICS_PASSWORD=Akseler500*
PORT=3000
NODE_ENV=production
EOF

echo "✅ .env file created!"

# Check if using Docker Compose
if [ -f docker-compose.yml ]; then
    echo "🐳 Detected Docker Compose - restarting containers..."
    docker-compose down
    docker-compose up -d
    
    echo "⏳ Waiting for containers to start..."
    sleep 5
    
    echo "📊 Container status:"
    docker-compose ps
    
    echo "📝 Recent logs (check for 'Database connection successful'):"
    docker-compose logs --tail=20 | grep -i "database\|error" || docker-compose logs --tail=20
elif command -v pm2 &> /dev/null; then
    echo "🔄 Detected PM2 - restarting with new environment..."
    pm2 restart all --update-env
    pm2 logs --lines 20
else
    echo "⚠️  No Docker Compose or PM2 detected. Please restart your application manually."
    echo "Make sure to export DATABASE_URL before starting:"
    echo "  export DATABASE_URL=\"postgresql://postgres.sirnowikpquelnzowbzp:akseler420%2A%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres\""
fi

echo ""
echo "✅ Done! Check your application logs to verify database connection."
echo "You should see: 'Database connection successful'"


