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

Nesta etapa, as rotas de verificação não acessam o banco. Sessões e cache usam arquivos; filas usam execução síncrona. Autenticação, persistência e Supabase ainda não estão integrados. Nenhuma migration é executada automaticamente.

Não versione .env, vendor ou logs. Versione composer.json e composer.lock juntos. O servidor Artisan e APP_DEBUG=true são configurações exclusivas de desenvolvimento.

## Imagens e primeira construção

O Dockerfile usa PHP 8.3.33 e Composer 2.10.3. A primeira construção baixa as imagens e bibliotecas; o tempo depende da conexão. Nesta máquina, a validação inicial reutilizou uma imagem PHP 8.3.33 local por meio do argumento PHP_IMAGE. Os demais computadores usam a imagem oficial padrão, sem precisar dessa imagem local.
