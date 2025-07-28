#!/bin/bash
cd "$(dirname "$0")"/..

# Deploy geotools to the host using SFTP

if [[ ! -f .env ]];
then
    echo "Must have a file named .env which defines DEPLOY_HOST and DEPLOY_DIR"
fi

source .env
DEPLOY_DIR_ROOT=${DEPLOY_DIR%/*}
DEPLOY_DIR_LEAF=${DEPLOY_DIR##*/}

echo "Starting deployment to $DEPLOY_HOST:$DEPLOY_DIR_ROOT/$DEPLOY_DIR_LEAF..."

# Just run the build
echo "Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed"
    exit 1
fi

echo "Preparing deployment files..."

# Create temporary deployment directory
rm -rf temp-deploy
mkdir -p temp-deploy

# Copy client build output to temp directory
cp -r .svelte-kit/output/client/* temp-deploy/

# Copy the prerendered index.html to root
cp .svelte-kit/output/prerendered/pages/index.html temp-deploy/index.html

echo "Creating SFTP batch file..."

# Create SFTP commands file with backup strategy
cat > sftp-commands.txt << EOF
cd $DEPLOY_DIR_ROOT
-rmdir $DEPLOY_DIR_LEAF.prev
rename $DEPLOY_DIR_LEAF $DEPLOY_DIR_LEAF.prev
mkdir $DEPLOY_DIR_LEAF
cd $DEPLOY_DIR_LEAF
put -r temp-deploy/* .
quit
EOF

echo "Uploading files via SFTP..."
sftp -b sftp-commands.txt $DEPLOY_HOST

# Check if SFTP succeeded
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Site available!"
else
    echo "❌ Deployment failed"
    echo "Check your SSH key or connection to dreamhost"
    exit 1
fi

# Cleanup
rm -f sftp-commands.txt
rm -rf temp-deploy

echo "🎯 Deployment process complete!"
