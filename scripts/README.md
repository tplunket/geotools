# Scripts

Utility scripts for the geotools project.

## Deployment

Deploy the production build to mightysprite.com using SFTP.

### Prerequisites

- `.env` file with DEPLOY\_HOST as named in `.ssh/config`
- `.env` file with DEPLOY\_DIR as output directory for deployment
- SSH access configured for host
- SFTP client available (included with SSH)

### Usage

```bash
scripts/deploy.sh
```

### What it does

1. Runs `npm run build` to create production build
2. Copies optimized client files to temporary directory
3. Backs up current deployment (`$DEPLOY_DIR` → `$DEPLOY_DIR.prev`)
4. Uploads new files via SFTP to `$DEPLOY_HOST`
5. Deploys prerendered `index.html` as main page
6. Cleans up temporary files

### Output

- Deploys to: `$DEPLOY_HOST:$DEPLOY_DIR`
- Uses optimized build output only
- Preserves favicon files and assets

## Favicon Generation

Convert the SVG favicon to PNG format using ImageMagick.

### Prerequisites

Install ImageMagick:
- **Windows**: Download from [https://imagemagick.org/script/download.php](https://imagemagick.org/script/download.php)
- **macOS**: `brew install imagemagick`
- **Linux**: `sudo apt install imagemagick` (Ubuntu/Debian) or `sudo yum install ImageMagick` (RHEL/CentOS)

### Usage

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
