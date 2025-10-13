#!/bin/bash

# This script downloads city data, processes it, and saves it as a JSON file.

set -e # Exit immediately if a command exits with a non-zero status.

URL="https://download.geonames.org/export/dump/cities15000.zip"
ZIP_FILE="cities15000.zip"
TEXT_FILE="cities15000.txt"
OUTPUT_JSON="public/cities.json"

echo "Downloading data from $URL..."
curl -L -o "$ZIP_FILE" "$URL"

echo "Unzipping $TEXT_FILE from $ZIP_FILE..."
# use unzip or unzzip
if [ -x "$(command -v unzip)" ]; then
    unzip "$ZIP_FILE"
elif [ -x "$(command -v unzzip)" ]; then
    unzzip "$ZIP_FILE"
else
    echo "Error: Neither 'unzip' nor 'unzzip' command is available."
    exit 1
fi

echo "Processing $TEXT_FILE and creating $OUTPUT_JSON..."

# Use awk to process the tab-separated file and generate JSON.
# It groups cities by timezone.
awk -F'\t' '
  BEGIN {
    printf "{\n"
  }
  NF > 17 {
    tz = $18
    name = $2
    lat = $5
    lon = $6
    
    # Escape double quotes in the city name for valid JSON
    gsub(/"/, "\\\"", name)

    # Create a JSON object for the city
    city_json = sprintf("    { \"name\": \"%s\", \"lat\": %s, \"lon\": %s }", name, lat, lon)
    
    # Group cities by timezone
    if (tz in cities_by_tz) {
      cities_by_tz[tz] = cities_by_tz[tz] ",\n" city_json
    } else {
      cities_by_tz[tz] = city_json
    }
  }
  END {
    first_tz = 1
    for (tz in cities_by_tz) {
      if (!first_tz) {
        printf ",\n"
      }
      first_tz = 0
      printf "  \"%s\": [\n%s\n  ]", tz, cities_by_tz[tz]
    }
    printf "\n}\n"
  }
' "$TEXT_FILE" > "$OUTPUT_JSON"

echo "Cleaning up temporary files..."
rm "$ZIP_FILE"
rm "$TEXT_FILE"

echo "Done. City data saved to $OUTPUT_JSON"
