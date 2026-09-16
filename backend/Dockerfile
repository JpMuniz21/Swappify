ARG PHP_IMAGE=php:8.3.33-cli-bookworm
FROM ${PHP_IMAGE}

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git libonig-dev libpq-dev libsqlite3-dev libxml2-dev libzip-dev unzip zip \
    && docker-php-ext-install mbstring pdo_pgsql pdo_sqlite dom xml xmlwriter zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://getcomposer.org/download/2.10.3/composer.phar -o /usr/local/bin/composer \
    && chmod +x /usr/local/bin/composer

EXPOSE 8000
CMD ["sh", "/var/www/html/docker-entrypoint.sh"]
