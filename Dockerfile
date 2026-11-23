# Imagem de PRODUÇÃO do Swappify (Railway): 1 serviço com front + API.
#   1) builda o React (frontend/) com a API em /api (mesmo domínio)
#   2) coloca o build dentro do public/ do Laravel (backend/)
#   3) Apache serve as páginas, os arquivos estáticos e a API
# Para desenvolvimento continue usando docker-compose.yml.

# ---------- 1) Frontend ----------
FROM node:22-alpine AS frontend
WORKDIR /front
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
ENV VITE_API_URL=/api
RUN npm run build

# ---------- 2) Backend + front ----------
FROM php:8.3-apache-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev libzip-dev libonig-dev unzip \
    && docker-php-ext-install pdo_pgsql mbstring zip opcache \
    && a2enmod rewrite headers deflate \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

COPY backend/docker/php.ini /usr/local/etc/php/conf.d/zz-producao.ini
COPY backend/docker/apache.conf /etc/apache2/sites-available/000-default.conf
# O Railway informa a porta em $PORT; o Apache lê ${PORT} da variável de ambiente.
RUN sed -i 's/^Listen 80$/Listen ${PORT}/' /etc/apache2/ports.conf

WORKDIR /var/www/html

# Dependências primeiro para aproveitar o cache do Docker.
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY backend/ ./
# Build do React dentro do public/ (index.html, assets/ e imagens)
COPY --from=frontend /front/dist/ ./public/

RUN composer dump-autoload --optimize --no-dev \
    && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Desempenho (o banco fica em outro datacenter, cada ida ao banco custa caro):
# - sessão em arquivo no servidor: não consulta/grava o banco a cada clique
#   (efeito colateral: um deploy novo desloga quem estava logado);
# - cache em arquivo: o limite de requisições (throttle) não consulta o banco;
# - conexão persistente: cada processo do Apache reaproveita a conexão com o banco
#   em vez de abrir uma conexão TLS nova a cada requisição.
# Variáveis com o mesmo nome no Railway têm prioridade sobre estes valores.
ENV PORT=8080 \
    APP_NAME=Swappify \
    APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    SESSION_DRIVER=file \
    CACHE_STORE=file \
    DB_PERSISTENT=true

EXPOSE 8080
CMD ["sh", "/var/www/html/docker/entrypoint.prod.sh"]
