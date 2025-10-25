#!/bin/bash

# OSA Sevalla Deployment Script
# This script helps prepare the project for Sevalla deployment

echo "🚀 Preparing OSA for Sevalla Deployment"

# Backend preparation
echo "📦 Preparing backend..."
cd osa-backend

# Check if .env exists, if not copy from production template
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.production..."
    cp .env.production .env
    echo "✏️  Please edit .env file with your actual production values"
fi

# Check if requirements.txt is up to date
echo "📋 Checking Python dependencies..."
pip freeze > requirements.txt.tmp
if ! cmp -s requirements.txt requirements.txt.tmp; then
    echo "⚠️  requirements.txt may be outdated. Consider updating it."
fi
rm requirements.txt.tmp

cd ..

# Frontend preparation
echo "🎨 Preparing frontend..."
cd osa-frontend

# Build the frontend
echo "🔨 Building frontend for production..."
npm install
npm run build

# Check if build was successful
if [ -d "dist/osa-frontend/browser" ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

echo ""
echo "🎉 Preparation complete!"
echo ""
echo "Next steps:"
echo "1. Update osa-backend/.env with your production database and secrets"
echo "2. Push these changes to your GitHub repository"
echo "3. Connect your repository to Sevalla"
echo "4. Create backend service (Python) with the provided sevalla.json config"
echo "5. Create frontend service (Static/Node.js) with the provided sevalla.json config"
echo "6. Configure your domain (app.sevalla.com) in Sevalla"
echo ""
echo "📖 See SEVALA_DEPLOYMENT_GUIDE.md for detailed instructions"