#!/bin/bash

# Function to handle errors
set -e

echo "=================================="
echo "      Email Client Setup"
echo "=================================="

# Setup Backend
echo "\n[Backend] Checking environment..."
cd backend

if [ -d "node_modules" ]; then
    echo "[Backend] Removing existing node_modules..."
    rm -rf node_modules
    rm -f package-lock.json
fi

echo "[Backend] Installing dependencies..."
npm install

cd ..

# Setup Frontend
echo "\n[Frontend] Checking environment..."
cd frontend

if [ -d "node_modules" ]; then
    echo "[Frontend] Removing existing node_modules..."
    rm -rf node_modules
    rm -f package-lock.json
fi

echo "[Frontend] Installing dependencies..."
npm install

cd ..

echo "\n=================================="
echo "      Setup Complete!"
echo "=================================="
