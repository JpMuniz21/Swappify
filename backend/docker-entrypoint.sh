#!/bin/sh
set -eu
cd /var/www/html
if [ ! -f .env ]; then
    cp .env.example .env
    chown --reference=composer.json .env
fi
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
composer install --no-interaction --prefer-dist
if ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --no-interaction
fi
exec php artisan serve --host=0.0.0.0 --port=8000
