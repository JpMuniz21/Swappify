import test, { afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { login, consultarPerfil, atualizarPerfil, excluirConta, logout } from '../src/services/authService.js';

afterEach(() => mock.restoreAll());

test('login envia email, cookie e token CSRF; nenhuma escrita ocorre antes da sessão', async () => {
  const requests = [];
  mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url, options });
    return new Response(JSON.stringify(requests.length === 1
      ? { csrf_token: 'token-atual' } : { data: { id: 1 } }), { status: 200 });
  });
  assert.deepEqual(await login({ email: 'ana@example.com', password: 'senha' }), { data: { id: 1 } });
  assert.equal(requests[0].url, 'http://localhost:8000/api/csrf-token');
  assert.equal(requests[0].options.credentials, 'include');
  assert.equal(requests[1].options.credentials, 'include');
  assert.equal(requests[1].options.headers['X-CSRF-TOKEN'], 'token-atual');
  assert.deepEqual(JSON.parse(requests[1].options.body), { email: 'ana@example.com', password: 'senha' });
});

test('perfil usa cookie sem solicitar token para uma leitura', async () => {
  const fetch = mock.method(globalThis, 'fetch', async () => new Response('{"data":{"id":1}}'));
  await consultarPerfil();
  assert.equal(fetch.mock.calls.length, 1);
  assert.equal(fetch.mock.calls[0].arguments[0], 'http://localhost:8000/api/me');
  assert.equal(fetch.mock.calls[0].arguments[1].credentials, 'include');
});

test('erros de validação preservam status e campos para o formulário', async () => {
  mock.method(globalThis, 'fetch', async (url) => url.endsWith('/csrf-token')
    ? new Response('{"csrf_token":"x"}')
    : new Response('{"message":"Dados inválidos","errors":{"email":["E-mail inválido"]}}', { status: 422 }));
  await assert.rejects(login({}), (error) =>
    error.status === 422 && error.errors.email[0] === 'E-mail inválido');
});

test('falha no CSRF impede enviar credenciais', async () => {
  const fetch = mock.method(globalThis, 'fetch', async () =>
    new Response('{"message":"Sessão expirada"}', { status: 419 }));
  await assert.rejects(login({ email: 'ana@example.com' }), (error) => error.status === 419);
  assert.equal(fetch.mock.calls.length, 1);
});

test('cada escrita busca token novo e respostas 204 são aceitas', async () => {
  const requests = [];
  mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url, options });
    return url.endsWith('/csrf-token')
      ? new Response(JSON.stringify({ csrf_token: 'token-' + requests.length }))
      : new Response(null, { status: 204 });
  });
  assert.equal(await logout(), null);
  assert.equal(await excluirConta('senha-atual'), null);
  assert.equal(requests[1].options.headers['X-CSRF-TOKEN'], 'token-1');
  assert.equal(requests[3].options.headers['X-CSRF-TOKEN'], 'token-3');
  assert.equal(requests[3].options.method, 'DELETE');
  assert.deepEqual(JSON.parse(requests[3].options.body), { current_password: 'senha-atual' });
});

test('edição utiliza PATCH e envia somente os dados recebidos', async () => {
  const requests = [];
  mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push(options);
    return new Response(url.endsWith('/csrf-token') ? '{"csrf_token":"x"}' : '{"data":{"name":"Ana"}}');
  });
  await atualizarPerfil({ name: 'Ana' });
  assert.equal(requests[1].method, 'PATCH');
  assert.deepEqual(JSON.parse(requests[1].body), { name: 'Ana' });
});