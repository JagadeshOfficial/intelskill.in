#!/bin/bash

# Configuration
EMAIL="akshjavahub@gmail.com"
DOMAINS="-d frontend.intelskill.in -d backend.intelskill.in -d intelskill.in -d www.intelskill.in"

echo "Stopping Nginx to free up port 80 (if using standalone) or ensuring webroot is ready..."

# Using the webroot method as configured in docker-compose
docker-compose run --rm certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL \
    $DOMAINS \
    --agree-tos --no-eff-email --force-renewal

echo "Reloading Nginx to apply new certificates..."
docker-compose exec frontend nginx -s reload
