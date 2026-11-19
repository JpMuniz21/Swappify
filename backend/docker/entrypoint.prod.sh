#!/bin/sh
# Entrypoint de PRODUÇÃO. Todas as configurações vêm das variáveis de ambiente do Render
# (não existe .env dentro da imagem).
set -eu
cd /var/www/html

if [ -z "${APP_KEY:-}" ]; then
    echo "ERRO: defina APP_KEY nas variáveis de ambiente (php artisan key:generate --show)." >&2
    exit 1
fi

# Só roda migrations quando RUN_MIGRATIONS=true, para não mexer no banco sem querer.
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    php artisan migrate --force --no-interaction
fi

# Projeto é só API (não tem resources/views), então não usamos "optimize"/view:cache.
php artisan config:cache
php artisan route:cache
php artisan event:cache
# os caches são gerados como root; garante que o Apache (www-data) continue podendo escrever.
chown -R www-data:www-data storage bootstrap/cache

exec apache2-foreground
