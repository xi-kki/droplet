#!/bin/bash
# Droplet — Setup Script
# Run: bash setup.sh

set -e

echo "💧 Droplet — Setting up..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy env file if not exists
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "📝 Created .env.local — fill in your Supabase keys"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start development:"
echo "   npm run dev"
echo ""
echo "🔗 Open: http://localhost:3000"
echo ""
echo "📋 Next steps:"
echo "   1. Create Supabase project at https://supabase.com"
echo "   2. Add keys to .env.local"
echo "   3. Run Supabase SQL migrations (see supabase/schema.sql)"
echo "   4. Deploy Move contract (see contracts/README.md)"
echo ""
