#!/bin/bash
set -e

echo "========================================"
echo "  OneBrik Deployment Script"
echo "========================================"

# 1. Pull latest code
echo "[1/4] Pulling latest code..."
git pull origin master

# 2. Install production dependencies only
echo "[2/4] Installing dependencies..."
npm install --omit=dev

# 3. Build with increased memory limit
echo "[3/4] Building..."
NODE_OPTIONS="--max-old-space-size=1024" node node_modules/.bin/nest build

# 4. Restart app
echo "[4/4] Restarting..."
pm2 restart main --update-env || pm2 start dist/main.js --name main

echo "========================================"
echo "  Deployment complete!"
echo "========================================"
