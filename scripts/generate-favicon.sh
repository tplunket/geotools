#!/bin/bash
cd "$(dirname "$0")"/..

# Generate PNG favicon from SVG using ImageMagick
# Requires ImageMagick to be installed: https://imagemagick.org/script/download.php

echo "Converting SVG favicon to PNG..."

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick not found. Please install ImageMagick first."
    echo "Download from: https://imagemagick.org/script/download.php"
    exit 1
fi

# Determine which command to use (newer ImageMagick uses 'magick', older uses 'convert')
if command -v magick &> /dev/null; then
    CONVERT_CMD="magick"
else
    CONVERT_CMD="convert"
fi

# Input and output paths
SVG_FILE="static/favicon.svg"
PNG_FILE="static/favicon.png"

# Check if SVG file exists
if [ ! -f "$SVG_FILE" ]; then
    echo "Error: SVG file not found at $SVG_FILE"
    exit 1
fi

# Convert SVG to PNG at 64x64 pixels with explicit transparency
echo "Using $CONVERT_CMD to convert favicon..."
$CONVERT_CMD -background none "$SVG_FILE" -resize 64x64 "$PNG_FILE"

# Check if conversion was successful
if [ $? -eq 0 ] && [ -f "$PNG_FILE" ]; then
    echo "✅ Success! Generated $PNG_FILE (64x64 pixels)"

    # Show file size
    if command -v ls &> /dev/null; then
        FILE_SIZE=$(ls -lh "$PNG_FILE" | awk '{print $5}')
        echo "📦 File size: $FILE_SIZE"
    fi
else
    echo "❌ Error: Failed to generate PNG favicon"
    exit 1
fi

echo "🎯 Favicon generation complete!"
