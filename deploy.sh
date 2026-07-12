#!/bin/bash
# Droplet — Deploy to Vercel
# Run: bash deploy.sh

set -e

echo "💧 Droplet — Deploying to Vercel..."

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"

# Build check
echo "🔨 Testing build..."
npm run build

echo ""
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployed! Check your Vercel dashboard for the URL."
echo ""
