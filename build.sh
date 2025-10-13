#!/bin/bash

set -e # exit on error

# This script builds all React apps found in src/*/main.tsx

# Ensure the public directory exists
mkdir -p public

# Clean the public directory before building, except for the root index.html and assets if any.
# Let's be specific about what to remove to avoid deleting something important.
find public -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} +

for d in src/*/; do
    if [ -f "${d}main.tsx" ]; then
      name=$(basename "$d")
      echo "Building $name..."
      mkdir -p "public/$name"
      
      # Build CSS files
      if [ -f "${d}index.css" ]; then
        npx postcss "${d}index.css" -o "public/$name/bundle.css"
      fi

      # Build TypeScript/TSX files
      npx esbuild "${d}main.tsx" --bundle --outfile="public/$name/bundle.js" --define:process.env.NODE_ENV='"production"' --minify --jsx=automatic --platform=browser --target=es2017
      
      # Copy HTML file
      if [ -f "${d}index.html" ]; then
        cp "${d}index.html" "public/$name/index.html"
      fi
    fi
done

echo "Build complete."
