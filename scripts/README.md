# Scripts

Utility scripts for the geotools project.

## Favicon Generation

Convert the SVG favicon to PNG format using ImageMagick.

### Prerequisites

Install ImageMagick:
- **Windows**: Download from [https://imagemagick.org/script/download.php](https://imagemagick.org/script/download.php)
- **macOS**: `brew install imagemagick`
- **Linux**: `sudo apt install imagemagick` (Ubuntu/Debian) or `sudo yum install ImageMagick` (RHEL/CentOS)

### Usage

**Windows:**
```bash
scripts\generate-favicon.bat
```

**Unix/Linux/macOS:**
```bash
scripts/generate-favicon.sh
```

### Output

- Converts `static/favicon.svg` to `static/favicon.png`
- Output size: 64x64 pixels
- Transparent background preserved
- Optimized for browser compatibility

### Verification

After running the script, check that `static/favicon.png` exists and displays correctly in your browser.
