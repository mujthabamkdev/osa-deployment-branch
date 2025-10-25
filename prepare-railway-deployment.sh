#!/bin/bash

# Railway Deployment Preparation Script
# This script prepares the OSA application for Railway deployment

echo "🚂 Preparing OSA for Railway Deployment..."

# Check if we're in the right directory
if [ ! -d "osa-backend" ] || [ ! -d "osa-frontend" ]; then
    echo "❌ Error: Please run this script from the OSA root directory"
    exit 1
fi

echo "✅ Directory structure verified"

# Check if Railway CLI is installed (optional)
if command -v railway &> /dev/null; then
    echo "✅ Railway CLI is installed"
else
    echo "ℹ️  Railway CLI not found. Install it with: npm install -g @railway/cli"
fi

# Verify configuration files exist
if [ -f "osa-backend/railway.json" ]; then
    echo "✅ Backend railway.json found"
else
    echo "❌ Backend railway.json missing"
fi

if [ -f "osa-frontend/railway.json" ]; then
    echo "✅ Frontend railway.json found"
else
    echo "❌ Frontend railway.json missing"
fi

# Check if git repository is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes. Please commit them before deploying."
    echo "   Run: git add . && git commit -m 'Prepare for Railway deployment'"
else
    echo "✅ Git repository is clean"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Push your code to GitHub (if not already done)"
echo "2. Go to https://railway.app/dashboard"
echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
echo "4. Connect your GitHub account and select this repository"
echo "5. Railway will automatically detect both services"
echo "6. Add a PostgreSQL database in Railway dashboard"
echo "7. Set environment variables in Railway:"
echo "   - Backend: DATABASE_URL, SECRET_KEY, CORS_ORIGINS"
echo "   - Frontend: API_BASE_URL (backend Railway URL)"
echo ""

echo "📚 For detailed instructions, see RAILWAY_DEPLOYMENT_GUIDE.md"

echo "🚂 Railway deployment preparation complete!"