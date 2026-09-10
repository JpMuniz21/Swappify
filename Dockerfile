# ---- Etapa 1: Build ----
FROM node:20-alpine AS build

WORKDIR /app

# Instala dependências primeiro (aproveita cache do Docker)
COPY package*.json ./
RUN npm ci

# Copia o restante do código
COPY . .

# Variáveis do Supabase precisam estar disponíveis em build time
# (Vite embute VITE_* no bundle final)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# ---- Etapa 2: Produção (Nginx servindo os arquivos estáticos) ----
FROM nginx:1.27-alpine AS production

# Remove config padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa config customizada (com fallback de SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos buildados
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
