#!/bin/bash

echo "🚀 Setting up ModulaR API development environment with Bun..."

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun not found. Please install Bun: https://bun.sh/docs/installation"
    exit 1
fi

# Install dependencies
echo "📥 Installing dependencies with Bun..."
bun install

# Build the project
echo "🔨 Building project with Bun..."
bun run build

echo "✅ Setup complete! You can now run:"
echo "   bun run dev    - Start development server"
echo "   bun run build  - Build the project"
echo "   bun run start  - Start production server"
