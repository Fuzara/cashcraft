#!/bin/bash

# Exit on error
set -e

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Initialize Tailwind CSS
echo "🎨 Initializing Tailwind CSS..."
npx tailwindcss init -p

echo "✅ Setup complete. Run: npm run dev"