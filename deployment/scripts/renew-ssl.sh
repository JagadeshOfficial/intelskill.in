#!/bin/bash

# Configuration
EMAIL="akshjavahub@gmail.com"
DOMAINS="-d frontend.intelskill.in -d backend.intelskill.in -d intelskill.in -d www.intelskill.in"

echo "Stopping Nginx to free up port 80 (if using standalone) or ensuring webroot is ready..."

# Check if docker-compose (V1) or docker compose (V2) is available
if command -v docker-compose &> /dev/null; then
    DOCKER_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_CMD="docker compose"
else
    echo "Error: Neither 'docker-compose' nor 'docker compose' found."
    exit 1
fi

echo "Using command: $DOCKER_CMD"
echo "Starting SSL renewal process..."

# Using the webroot method as configured in docker-compose
$DOCKER_CMD run --rm certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL \
    $DOMAINS \
    --agree-tos --no-eff-email --force-renewal

echo "Reloading Nginx to apply new certificates..."
# Only reload if the frontend container is actually running
if $DOCKER_CMD ps | grep -q "learnflow-frontend.*Up"; then
    $DOCKER_CMD exec frontend nginx -s reload
    echo "Nginx reloaded successfully."
else
    echo "Frontend container is not running. Start it with '$DOCKER_CMD up -d' after SSL is fixed."
fi
