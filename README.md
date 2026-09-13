# Swappify

Frontend em React e JavaScript. O ambiente de desenvolvimento da equipe roda em Docker, sem exigir Node.js ou npm instalados no computador.

## Iniciar o desenvolvimento

Requisitos: Docker Engine com Docker Compose, ou Docker Desktop com integração WSL habilitada.
Na raiz da pasta Swappify (onde está docker-compose.yml), execute:

```sh
docker compose up --build -d
```

Abra http://localhost:8080. A página inicial está em branco, pronta para receber a interface.
Edite os arquivos normalmente no editor: as alterações em frontend/src e frontend/public são refletidas automaticamente no navegador.
Node.js e as dependências ficam dentro da imagem Linux; node_modules do computador não é utilizado.

## Comandos da equipe

```sh
# Acompanhar logs
docker compose logs -f frontend

# Parar o ambiente
docker compose down

# Validar o código dentro do container
docker compose exec frontend npm run lint

# Conferir o build dentro do container
docker compose exec frontend npm run build
```

Depois de atualizar frontend/package.json ou frontend/package-lock.json, execute novamente `docker compose up --build -d` para reconstruir o ambiente. A instalação usa npm ci e respeita o lockfile versionado.

Para adicionar uma dependência, use um container temporário que grava os manifests no projeto e mantém node_modules em um volume anônimo:

```sh
docker compose run --rm --no-deps --volume ./frontend:/app --volume /app/node_modules frontend npm install nome-do-pacote
docker compose up --build -d
```

Versione frontend/package.json e frontend/package-lock.json juntos.

## Estrutura

- frontend/src/App.jsx: ponto inicial da interface.
- frontend/src/index.css: estilos globais.
- frontend/src/main.jsx: inicialização do React.
- frontend/public/: arquivos estáticos.
- frontend/Dockerfile: etapas de desenvolvimento, build e produção.
- docker-compose.yml: desenvolvimento com atualização automática.

## Variáveis de ambiente

A página inicial não exige .env. O arquivo .env.example reserva variáveis para a futura integração com Supabase, ainda não implementada.
Quando necessário, copie .env.example para .env e preencha os valores. Reinicie o ambiente com `docker compose up -d` após mudanças.
Variáveis VITE_ são públicas; não inclua segredos nelas.
