#!/bin/bash

# 🔥 Exit on error
set -e

# -------- CONFIG --------
DOCKER_USERNAME="jerinirowz"
VERSION=$1

if [ -z "$VERSION" ]; then
  echo "❌ Please provide version"
  echo "Usage: ./deploy.sh v1"
  exit 1
fi

echo "🚀 Building & Pushing version: $VERSION"

# -------- BUILD --------

echo "🔨 Building user-service..."
docker build -t $DOCKER_USERNAME/user-service:$VERSION ./user_service

echo "🔨 Building auth-service..."
docker build -t $DOCKER_USERNAME/auth-service:$VERSION ./auth_service

echo "🔨 Building reporting-service..."
docker build -t $DOCKER_USERNAME/reporting-service:$VERSION ./reporting_service

echo "🔨 Building api-gateway..."
docker build -t $DOCKER_USERNAME/api-gateway:$VERSION ./api_gateway

# -------- PUSH --------

echo "📤 Pushing user-service..."
docker push $DOCKER_USERNAME/user-service:$VERSION

echo "📤 Pushing auth-service..."
docker push $DOCKER_USERNAME/auth-service:$VERSION

echo "📤 Pushing reporting-service..."
docker push $DOCKER_USERNAME/reporting-service:$VERSION

echo "📤 Pushing api-gateway..."
docker push $DOCKER_USERNAME/api-gateway:$VERSION

echo "✅ All images pushed successfully!"