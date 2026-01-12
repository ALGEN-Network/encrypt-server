#!/bin/bash
set -e

TAG=$1
if [ -z "$TAG" ]; then
  echo "Usage: ./deploy.sh v1.2.3"
  exit 1
fi

git fetch --tags
git checkout $TAG

npm ci
npm run build

pm2 start ecosystem.config.json
