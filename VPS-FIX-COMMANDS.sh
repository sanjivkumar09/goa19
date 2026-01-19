#!/bin/bash
# VPS UI Fix Commands
# Run these commands on your VPS server

echo "╔═══════════════════════════════════════════════╗"
echo "║   🔧 FIXING UI ON VPS                        ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# Navigate to project directory
cd /var/www/your-project-name
echo "✓ Changed to project directory"

# Stop server
pm2 stop all
echo "✓ Stopped server"

# Pull latest code
git pull origin main
echo "✓ Pulled latest code"

# Install dependencies
npm install
echo "✓ Installed dependencies"

# Fix file permissions
chmod -R 755 src/public/
echo "✓ Fixed file permissions"

# Create logs directory if it doesn't exist
mkdir -p logs
chmod 755 logs
echo "✓ Created logs directory"

# Check if public folder exists
if [ -d "src/public" ]; then
    echo "✓ Public folder exists"
    ls -la src/public/
else
    echo "✗ ERROR: Public folder not found!"
    echo "  Please upload the src/public folder"
    exit 1
fi

# Start server with PM2
pm2 start src/server.js --name goa-games
pm2 save
echo "✓ Started server"

# Show logs
echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║   📊 SERVER LOGS                             ║"
echo "╚═══════════════════════════════════════════════╝"
pm2 logs goa-games --lines 20 --nostream

echo ""
echo "✅ Done! Check http://your-domain.com"
echo ""
echo "If UI still broken, send me output of:"
echo "  1. ls -la src/public/"
echo "  2. pm2 logs --lines 50"
