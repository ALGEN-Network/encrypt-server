#!/bin/bash
set -e

TAG=$1
ENV=${2:-production}

if [ -z "$TAG" ]; then
  echo "Usage: ./deploy.sh <tag> [env]"
  echo "Example:"
  echo "  ./deploy.sh v1.2.3"
  echo "  ./deploy.sh v1.2.3 test"
  exit 1
fi

echo "Deploying tag: $TAG"
echo "Environment : $ENV"

git fetch --tags
git checkout "$TAG"

npm ci
npm run build

pm2 start ecosystem.config.json --env "$ENV"
