#!/bin/bash
set -e

echo "========================================"
echo "  OneBrik Deployment Script"
echo "========================================"

# 1. Pull latest code from git
echo "[1/4] Pulling latest code..."
git pull origin main

# 2. Install dependencies (skip devDependencies in production)
echo "[2/4] Installing dependencies..."
npm install --omit=dev

# 3. Build the project
echo "[3/4] Building..."
npm run build

# 4. Restart the app
echo "[4/4] Restarting app..."
if command -v pm2 &> /dev/null; then
  pm2 restart onebrik --update-env || pm2 start dist/main.js --name onebrik
else
  echo "pm2 not found. Run manually: node dist/main.js"
fi

echo "========================================"
echo "  Deployment complete!"
echo "========================================"
