#!/bin/bash

# Park & Ride+ Delhi NCR - Vercel Deployment Script
# This script helps prepare and deploy the application to Vercel

echo "🚀 Park & Ride+ Delhi NCR - Vercel Deployment"
echo "=============================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found. Please run this script from the project root."
    exit 1
fi

# Build the React app
echo "📦 Building React application..."
cd client
npm install
npm run build
cd ..

# Check if build was successful
if [ ! -d "client/build" ]; then
    echo "❌ React build failed. Please check the build process."
    exit 1
fi

echo "✅ React app built successfully!"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp vercel-env-template.txt .env
    echo "📝 Please update .env file with your actual values before deploying."
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Park & Ride+ Delhi NCR"
fi

echo "🔧 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/park-and-ride-delhi-ncr.git"
echo "   git push -u origin main"
echo ""
echo "2. Deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "3. Or use Vercel dashboard:"
echo "   https://vercel.com/new"
echo ""
echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md"
