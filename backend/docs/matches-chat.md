# Matches e chat

Um match é criado automaticamente quando há interesses ativos recíprocos: a pessoa A
favorita um serviço de B e B favorita um serviço de A. Cada match registra os dois
usuários e os dois serviços envolvidos na troca.

## Rotas de match

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/matches` | Lista os matches ativos da pessoa logada. |
| GET | `/api/matches/{id}` | Exibe um match do qual a pessoa logada participa. |
| POST | `/api/matches/{id}/cancelar` | Desfaz o match (status `cancelado`). Só participantes; 409 se já cancelado. |

Ao criar um interesse, a resposta inclui `meta.match_criado` e `meta.match_id`. O
frontend pode usar esses valores para mostrar o aviso de match e abrir a conversa.

Um match cancelado some de `/api/matches` e do chat, mas o registro e as mensagens
continuam no banco.

> **Atenção:** remover um favorito (`DELETE /api/interesses/{id}`) apaga em cascata o
> match que depende dele e as mensagens dessa conversa. `GET /api/interesses` informa
> esse match em `match_id`, para o frontend avisar a pessoa antes de remover.

## Rotas de chat

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/conversas` | Lista conversas dos matches ativos. |
| GET | `/api/conversas/{id}/mensagens` | Lista mensagens e marca as recebidas como lidas. |
| POST | `/api/conversas/{id}/mensagens` | Envia `{ "conteudo": "..." }`. |

Todas as rotas exigem sessão autenticada e CSRF nas escritas. Somente participantes
do match conseguem consultar ou enviar mensagens. O chat usa `users`, `matches` e
`mensagens`; não depende mais da tabela antiga `usuario` nem associa pessoas por e-mail.
