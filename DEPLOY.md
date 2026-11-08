# Deploy do Swappify

| Parte | Onde | Configuração |
|---|---|---|
| Frontend (React/Vite) | **Vercel** | pasta `frontend/`, arquivo `frontend/vercel.json` |
| Backend (Laravel) | **Render** (Docker) | `backend/Dockerfile.prod` |
| Banco de dados | **Supabase** (PostgreSQL) | variáveis `DB_*` no Render |

O navegador acessa só o domínio do Vercel. O Vercel repassa tudo que começa com
`/api` para o Render (rewrite em `frontend/vercel.json`), então o cookie de login
fica no mesmo domínio do site e não há problema de CORS/SameSite.

```
navegador ──► https://swappify.vercel.app         (React)
          └─► https://swappify.vercel.app/api/... ──► https://<backend>.onrender.com/api/...
```

## 1. Backend no Render

1. Render → **New → Web Service** → conecte o repositório `JpMuniz21/Swappify`.
2. Configure:
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime/Language:** Docker
   - **Dockerfile Path:** `./Dockerfile.prod`
   - **Health Check Path:** `/api/health`
3. Variáveis de ambiente (**Environment**):

   | Variável | Valor |
   |---|---|
   | `APP_KEY` | gere com `docker compose exec backend php artisan key:generate --show` |
   | `APP_URL` | `https://<seu-app>.vercel.app` |
   | `FRONTEND_URL` | `https://<seu-app>.vercel.app` |
   | `DB_CONNECTION` | `pgsql` |
   | `DB_HOST` | host do Supabase (Project Settings → Database → *Session pooler*) |
   | `DB_PORT` | `5432` |
   | `DB_DATABASE` | `postgres` |
   | `DB_USERNAME` | usuário do pooler (ex.: `postgres.xxxxxxxx`) |
   | `DB_PASSWORD` | senha do banco |
   | `DB_SSLMODE` | `require` |
   | `SESSION_DRIVER` | `database` |
   | `SESSION_SECURE_COOKIE` | `true` |
   | `CACHE_STORE` | `database` |
   | `RUN_MIGRATIONS` | `true` no primeiro deploy (depois pode voltar para `false`) |

   `APP_ENV=production`, `APP_DEBUG=false` e `LOG_CHANNEL=stderr` já vêm do Dockerfile.
4. Deploy. Teste `https://<backend>.onrender.com/api/health` → `{"status":"ok"}`.

> Use o **Session pooler** do Supabase (IPv4). A conexão direta do Supabase é só IPv6
> e o Render não alcança.
>
> No plano gratuito o Render "dorme" após 15 min sem acesso; a primeira requisição
> depois disso demora ~1 minuto.

## 2. Frontend no Vercel

1. Edite `frontend/vercel.json` e troque `SUBSTITUA-PELA-URL-DO-RENDER` pela URL
   real do backend. Faça commit e push.
2. Vercel → **Add New → Project** → importe o repositório.
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (build `npm run build`, saída `dist`)
   - **Environment Variable:** `VITE_API_URL` = `/api`
4. Deploy.
5. Volte ao Render e confira se `APP_URL` e `FRONTEND_URL` têm a URL final do Vercel.

## 3. Checklist de teste em produção

- [ ] `/api/health` responde pelo domínio do Vercel (`https://<app>.vercel.app/api/health`)
- [ ] Cadastro → cai no perfil logado
- [ ] Recarregar a página (F5) em `/feed` e `/perfil` não dá 404 e continua logado
- [ ] Feed: publicar um texto e ver a publicação depois de recarregar
- [ ] Logout → acessar `/feed` redireciona para `/login`
- [ ] Minhas Trocas e Agendamentos mostram o aviso "Em desenvolvimento"
- [ ] Testar no celular

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Login "funciona" mas a próxima tela volta para `/login` | `SESSION_DRIVER` não é `database`, ou faltou `RUN_MIGRATIONS=true` para criar a tabela `sessions` |
| Erro 419 ao publicar/logar | sessão expirada ou `APP_KEY` mudou entre deploys |
| Erro 500 em tudo | veja os logs no Render; geralmente `DB_*` errado ou `APP_KEY` faltando |
| `/api/...` retorna o HTML do React | o rewrite do `vercel.json` ainda está com `SUBSTITUA-PELA-URL-DO-RENDER` |
