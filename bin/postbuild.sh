#!/bin/bash
set -e

rm -rf ./.amplify-hosting
mkdir -p ./.amplify-hosting/compute/default

# Copy built output and dependencies
cp -r ./dist ./.amplify-hosting/compute/default/
cp -r ./node_modules ./.amplify-hosting/compute/default/node_modules
# package.json required for ESM ("type": "module") - Node needs it to run dist/index.js
cp package.json ./.amplify-hosting/compute/default/

# Copy manifest (Amplify looks for it in .amplify-hosting root)
cp deploy-manifest.json ./.amplify-hosting/deploy-manifest.json
