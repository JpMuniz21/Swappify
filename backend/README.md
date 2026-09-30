# Backend do Swappify

API Laravel 13 executada em Docker com PHP 8.3 e Composer. Nenhuma instalação local de PHP ou Composer é necessária.

## Iniciar

Na raiz do repositório:

```sh
docker compose up --build -d
```

Na primeira inicialização, o backend cria .env a partir de .env.example, instala as dependências do composer.lock e gera APP_KEY. A chave existente é preservada nas próximas inicializações.

- API: http://localhost:8000
- Verificação JSON: http://localhost:8000/api/health
- Verificação do framework: http://localhost:8000/up

Aguarde a instalação inicial terminar antes de acessar. Veja os logs:

```sh
docker compose logs -f backend
```

## Verificações

```sh
docker compose exec backend php artisan test
docker compose exec backend composer validate --strict
docker compose exec backend php artisan route:list
```

## Desenvolvimento

O código é montado em /var/www/html e vendor fica em um volume Docker. Alterações em PHP ficam disponíveis sem reconstruir a imagem. Mudanças no Dockerfile exigem novo build; mudanças no composer.lock exigem reiniciar o serviço para reinstalar dependências.

Use os comandos PHP e Composer pelo docker compose exec backend. Execute os comandos Docker na raiz do repositório.

## Banco e Supabase

O driver PostgreSQL está preparado para a integração futura. Preencha os dados DB_* no .env local quando for conectar o Supabase. Não é necessário adicionar um banco ao Compose para usar Supabase hospedado.

As rotas de verificação não acessam o banco. O CRUD do próprio usuário e a autenticação por sessão estão implementados; requerem banco configurado e migrations para uso manual. Os testes usam SQLite em memória. Sessões e cache usam arquivos; filas usam execução síncrona. A conexão Supabase ainda precisa ser configurada. Nenhuma migration é executada automaticamente.

## Estrutura de banco e CRUD de serviços

As migrations deste sprint criam as entidades de base do DER necessárias para
serviços: `localizacoes`, `categorias`, os campos de perfil de `users` e
`servicos`. A relação é: uma localização possui usuários; um usuário e uma
categoria possuem vários serviços.

Depois que a equipe conectar o PostgreSQL/Supabase, execute:

```sh
docker compose exec backend php artisan migrate --seed
docker compose exec backend php artisan test --filter=ServicoCrudTest
```

O seeder cria uma localização, três categorias, um usuário e um serviço de
exemplo para facilitar os testes.

### Rotas de serviços

| Método | Rota | Função |
| --- | --- | --- |
| GET | `/api/servicos` | Lista serviços paginados. |
| POST | `/api/servicos` | Cria um serviço. |
| GET | `/api/servicos/{id}` | Exibe um serviço. |
| PUT/PATCH | `/api/servicos/{id}` | Atualiza um serviço. |
| DELETE | `/api/servicos/{id}` | Exclui um serviço. |

A consulta e a listagem são públicas e retornam somente os campos públicos do perfil.
Cadastro, edição e exclusão exigem a sessão do Laravel e proteção CSRF.
O dono vem da sessão; não envie usuario_id. Apenas o dono pode editar/excluir seu serviço.
Excluir definitivamente a conta também exclui seus serviços, conforme a chave estrangeira.

Após atualizar uma instalação existente, execute php artisan migrate pelo Compose.
A migration 2026_09_30_000001_integrate_user_profile_fields adiciona os campos de perfil
ausentes e torna a localização opcional sem recriar as contas. Não use migrate:fresh
para atualizar um banco com dados. O rollback dessa migration remove os campos de perfil.

Não versione .env, vendor ou logs. Versione composer.json e composer.lock juntos. O servidor Artisan e APP_DEBUG=true são configurações exclusivas de desenvolvimento.

## Imagens e primeira construção

O Dockerfile usa PHP 8.3.33 e Composer 2.10.3. A primeira construção baixa as imagens e bibliotecas; o tempo depende da conexão. Nesta máquina, a validação inicial reutilizou uma imagem PHP 8.3.33 local por meio do argumento PHP_IMAGE. Os demais computadores usam a imagem oficial padrão, sem precisar dessa imagem local.

## CRUD do próprio usuário

Cadastro, login, consulta/edição/exclusão da própria conta e logout estão implementados
com comentários em português. Veja [o guia de usuários](docs/usuarios.md) para as rotas,
os campos, exemplos de chamadas do futuro React, teste local e conexão PostgreSQL/Supabase.