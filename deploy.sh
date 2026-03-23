#!/bin/bash
set -e
echo "🚀 Deploying Intermezzo Archive PWA..."

# Create/update data file from master intermezzos.json
cp ~/.openclaw/workspace/intermezzos.json ./intermezzos.json 2>/dev/null || echo "Using existing data"

# Git setup
git init -q 2>/dev/null || true
git remote remove origin 2>/dev/null || true
git remote add origin git@github.com:GustavoIbenc/intermezzos.git

# Commit & push
git add -A
if ! git diff --cached --quiet; then
  git commit -m "Deploy: $(date +'%Y-%m-%d')"
  git branch -M main 2>/dev/null || true
fi

git push -u origin main --force
echo ""
echo "✅ LIVE at: https://gustavoibenc.github.io/intermezzos/"
