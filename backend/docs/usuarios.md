# CRUD do próprio usuário

## O que foi feito

O Laravel cadastra, autentica, consulta, edita e exclui a própria conta.
Os campos iniciais são name, email e password. O cadastro também recebe
password_confirmation, que serve apenas para confirmação e não é salvo.
O e-mail é convertido para minúsculas. Senhas ficam como hash e não aparecem nas respostas.

A escolha desta etapa é **Laravel responsável pela autenticação e Supabase como futuro
PostgreSQL**. Não foi usado Supabase Auth. Se essa decisão mudar, será necessário adaptar
a autenticação e o vínculo de contas; não basta trocar uma URL.

A API usa cookies de sessão e proteção CSRF nativos do Laravel. Por isso as rotas estão
em routes/account.php, incluído por routes/web.php, embora suas URLs comecem com /api.
routes/api.php mantém o health check público e independente do banco.

A administração, as telas React, a recuperação de senha e o envio de verificação de e-mail
ficam para próximas etapas. A exclusão atual é definitiva. Antes de criar anúncios e trocas
vinculados à conta, definir como esses registros devem ser tratados na exclusão.

## Onde ler e onde alterar

| Arquivo | Responsabilidade / alteração futura |
| --- | --- |
| app/Http/Controllers/AccountController.php | Fluxo do CRUD, login e logout; comentários explicam as instruções e validações. |
| app/Models/User.php | Tabela users, campos permitidos, ocultação e hash da senha. |
| routes/account.php | URLs que o frontend consumirá e proteção por sessão. |
| routes/web.php | Carrega as rotas com cookies e proteção CSRF. |
| bootstrap/app.php | Devolve erros da API em JSON, incluindo 401 sem página de login. |
| config/cors.php | Lê FRONTEND_URL para autorizar a origem do React e cookies. |
| .env.example | Modelo comentado; copiar os valores necessários para backend/.env. |
| database/migrations/0001_01_01_000000_create_users_table.php | Migration existente que já cria users; não foi necessário duplicá-la. |
| tests/Feature/AccountTest.php | Verifica cadastro, autenticação, edição, exclusão, isolamento de contas, CSRF e CORS. |
| phpunit.xml | Usa SQLite em memória e fixa o ambiente de testes mesmo com APP_ENV vindo do Docker. |

Em PHP, use importa uma classe; public permite chamar o método externamente; private
reserva um método auxiliar ao controller; $ identifica uma variável; -> acessa métodos
ou propriedades de um objeto; :: acessa um membro estático/facade; => associa chave e
valor em um array; return devolve o resultado; chaves delimitam blocos e ; encerra uma
instrução. Os tipos após : indicam o tipo de retorno. Os comentários no código explicam
o que cada instrução relevante faz.

## Testar agora, sem frontend e sem Supabase

Na raiz do repositório, com Docker em execução:

```sh
docker compose exec backend php artisan test
docker compose exec backend php artisan route:list --path=api
```

Os testes usam SQLite em memória e descartam os dados ao terminar. Eles criam as tabelas
pelas migrations existentes. Não foi feita conexão nem migration no Supabase.

Para **requisições manuais**, é necessário um banco persistente. Uma opção local já
suportada pela imagem Docker é SQLite. No backend/.env, substitua as definições existentes:

```dotenv
DB_CONNECTION=sqlite
DB_DATABASE=/var/www/html/database/database.sqlite
```

Se houver DB_URL, remova essa definição para não sobrepor a conexão. Depois execute:

```sh
docker compose exec backend php -r "is_file('database/database.sqlite') || touch('database/database.sqlite');"
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan migrate
```

Essa configuração manual não foi aplicada automaticamente. O .env real foi preservado.

## Quando conectar o Supabase

Altere **backend/.env** usando os parâmetros de conexão PostgreSQL fornecidos pelo seu
projeto. O .env da raiz e as chaves VITE_SUPABASE_* não configuram a conexão do Laravel.

```dotenv
DB_CONNECTION=pgsql
DB_HOST=host-fornecido-pelo-projeto
DB_PORT=porta-fornecida-pelo-projeto
DB_DATABASE=postgres
DB_USERNAME=usuario-fornecido-pelo-projeto
DB_PASSWORD="senha-do-banco"
DB_SSLMODE=require
```

Substitua os exemplos pelos valores reais da conexão escolhida. Não coloque senha de
banco em variáveis VITE_* ou no código React. Se existir DB_URL, remova-a ou atualize-a
de maneira consistente, pois ela pode sobrepor os parâmetros separados.

Depois de conferir o projeto de destino e as tabelas existentes:

```sh
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan migrate
```

As migrations criam public.users para o Laravel; essa tabela não é auth.users do
Supabase Auth. A API Laravel deve ser o caminho de acesso dos usuários a esses dados.
Ao configurar o Supabase, revise os privilégios/RLS de public.users para impedir acesso
direto pela API pública do Supabase. Não use chaves públicas do frontend como credenciais
PostgreSQL. Migrar dados eventualmente criados no SQLite é uma tarefa separada.

## Contrato da API

URL local: http://localhost:8000. Envie Accept: application/json em todas as chamadas.

| Método e caminho | Entrada | Resposta |
| --- | --- | --- |
| GET /api/csrf-token | Nenhuma | 200 com csrf_token e cookie de sessão |
| POST /api/register | name, email, password, password_confirmation | 201 com data; já autentica |
| POST /api/login | email, password | 200 com data; autentica |
| GET /api/me | Cookie de sessão | 200 com data |
| PATCH /api/me | name e/ou email e/ou password | 200 com data |
| DELETE /api/me | current_password | 204, sem corpo |
| POST /api/logout | Nenhuma | 204, sem corpo |

Para alterar email ou password, envie também current_password. Nova senha exige
password_confirmation. A senha precisa ter pelo menos 8 caracteres.
Para mudar só o nome, basta enviar name. Envie apenas campos que deseja alterar.
Ao mudar o e-mail, email_verified_at volta a null; o envio de verificação ainda não foi implementado.
Ao mudar a senha, outras sessões serão recusadas no próximo acesso às rotas da conta.

Não envie ID para escolher a conta: /api/me sempre usa o usuário da sessão.
Campos fora da lista validada são ignorados. A listagem geral de usuários ainda não existe.

Erros comuns:

- 401: sessão ausente ou expirada; abrir login.
- 419: token CSRF ausente/expirado; obter novo token antes de reenviar conscientemente.
- 422: dados inválidos; mostrar os campos de errors no formulário.
- 429: excesso de tentativas; aguardar o tempo indicado pelo servidor.
- 500 por conexão: verificar banco configurado e migrations; /api/health não valida o banco.

Login e cadastro compartilham o limite de 5 tentativas por minuto por IP para visitantes.
Rotas autenticadas têm limite de 60 requisições por minuto.

## Quando o frontend ficar pronto

1. Configure FRONTEND_URL=http://localhost:8080 em backend/.env. Quando o domínio mudar,
   atualize esse valor, sem barra final, e execute php artisan config:clear pelo Compose.
2. Defina a URL da API no frontend, por exemplo VITE_API_URL=http://localhost:8000.
   No Compose atual, acrescente essa variável a frontend.environment e recrie o serviço.
   Para Vite fora do Docker, use frontend/.env.local e reinicie o Vite.
3. Envie credentials: 'include' em todas as chamadas para preservar cookies.
4. Obtenha o token em /api/csrf-token e envie X-CSRF-TOKEN nas requisições que alteram dados.
5. Após cadastro, login, troca de senha ou logout, obtenha outro token: essas operações
   renovam a sessão/token. O exemplo abaixo busca um token antes de cada escrita.
6. Para 204, não chame response.json(), pois não existe corpo.

Exemplo para copiar para o futuro serviço HTTP do React (nenhuma tela foi criada):

```js
// FRONTEND: defina VITE_API_URL na configuração do Vite/Compose.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function api(path, method = 'GET', body) {
  const headers = { Accept: 'application/json' }; // Solicita JSON, inclusive em erros.
  if (method !== 'GET') {
    const csrfResponse = await fetch(API_URL + '/api/csrf-token', {
      credentials: 'include', // Recebe/envia o cookie que identifica a sessão.
      headers,
      cache: 'no-store', // O token é específico da sessão atual.
    });
    if (!csrfResponse.ok) throw new Error('Não foi possível preparar a sessão.');
    const { csrf_token } = await csrfResponse.json(); // Lê o token devolvido pelo Laravel.
    headers['X-CSRF-TOKEN'] = csrf_token; // Comprova que a escrita pertence à sessão.
    headers['Content-Type'] = 'application/json'; // Informa o formato do corpo enviado.
  }
  const response = await fetch(API_URL + path, {
    method,
    credentials: 'include',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    const error = new Error(result?.message ?? 'Falha na requisição.');
    error.status = response.status; // A tela decide se abre login, espera ou mostra validação.
    error.errors = result?.errors; // Erros de cada campo retornados com 422.
    throw error;
  }
  return result; // Perfil fica em result.data; logout/exclusão retornam null.
}

// Exemplos independentes; ligue cada chamada ao formulário/botão correspondente:
await api('/api/register', 'POST', {
  name: 'Ana', email: 'ana@example.com',
  password: 'Senha12345', password_confirmation: 'Senha12345',
});
await api('/api/me');
await api('/api/me', 'PATCH', { name: 'Ana Silva' });
await api('/api/logout', 'POST');
await api('/api/login', 'POST', { email: 'ana@example.com', password: 'Senha12345' });
// Só executar quando a pessoa confirmar que deseja excluir a conta:
await api('/api/me', 'DELETE', { current_password: 'Senha12345' });
```

No Postman/Insomnia, preserve os cookies, faça GET /api/csrf-token e copie csrf_token
para X-CSRF-TOKEN antes de POST/PATCH/DELETE. Atualize o token após mudanças de sessão.

O fluxo atual considera frontend e API no mesmo site, como localhost em portas
diferentes. Use localhost nos dois, sem misturar com 127.0.0.1.
Em produção, planeje domínios do mesmo site e HTTPS, configure SESSION_SECURE_COOKIE=true
e APP_DEBUG=false. Domínios de sites diferentes exigem rever cookies e arquitetura;
alterar apenas CORS não garante funcionamento.
