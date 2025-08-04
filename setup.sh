#!/bin/bash

# Setup script for first-time development setup
echo "🚀 Setting up ModulaR API development environment..."

# Check if Corepack is enabled
if ! command -v corepack &> /dev/null; then
    echo "❌ Corepack not found. Please install Node.js 16+ and enable corepack:"
    echo "   npm install -g corepack && corepack enable"
    exit 1
fi

# Enable corepack
echo "📦 Enabling Corepack..."
corepack enable

# Install dependencies
echo "📥 Installing dependencies..."
if [ -f "yarn.lock" ]; then
    echo "✅ yarn.lock exists - using immutable install"
    yarn install --immutable
else
    echo "🔄 No yarn.lock found - creating one"
    yarn install
    echo "✅ yarn.lock created successfully"
fi

# Build the project
echo "🔨 Building project..."
yarn build

echo "✅ Setup complete! You can now run:"
echo "   yarn dev    - Start development server"
echo "   yarn build  - Build the project"
echo "   yarn start  - Start production server"
