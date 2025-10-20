#!/bin/bash

set -e # exit on error

# This script builds all React apps found in src/*/main.tsx

# Ensure the public directory exists
mkdir -p public

# Clean the public directory before building, except for the root index.html and assets if any.
# Let's be specific about what to remove to avoid deleting something important.
find public -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} +

./process_cities.sh

for d in src/*/; do
    if [ -f "${d}main.tsx" ]; then
      name=$(basename "$d")
      echo "Building $name..."
      mkdir -p "public/$name"
      
      # Build CSS files
      if [ -f "${d}index.css" ]; then
        npx postcss "${d}index.css" -o "public/$name/index.css"
      fi

      # Build TypeScript/TSX files
      npx esbuild "${d}main.tsx" --bundle --outfile="public/$name/bundle.js" --define:process.env.NODE_ENV='"production"' --minify --jsx=automatic --platform=browser --target=es2017 --loader:.png=file
      
      # Copy HTML file
      if [ -f "${d}index.html" ]; then
        cp "${d}index.html" "public/$name/index.html"
      fi
      
      # Copy PWA files
      if [ -f "${d}manifest.json" ]; then
        cp "${d}manifest.json" "public/$name/manifest.json"
      fi
      if [ -f "${d}sw.js" ]; then
        cp "${d}sw.js" "public/$name/sw.js"
      fi
      if [ -f "${d}icon-192x192.png" ]; then
        cp "${d}icon-192x192.png" "public/$name/icon-192x192.png"
      fi
      if [ -f "${d}icon-512x512.png" ]; then
        cp "${d}icon-512x512.png" "public/$name/icon-512x512.png"
      fi
    fi
done

echo "Build complete."
