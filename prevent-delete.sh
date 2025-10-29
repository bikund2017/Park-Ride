#!/bin/bash
# Prevent deletion of vercel.json from being committed

# Pattern to match: D       vercel.json
REGEXP="^D[[:space:]]+vercel.json$"

if git diff --cached --name-status | grep -qE "$REGEXP"; then
  echo "⚠️  Preventing deletion of vercel.json from being committed"
  echo "   (This file is needed for Vercel deployment routing)"
  git reset -- vercel.json
  exit 0
fi
