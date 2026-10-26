# CRUD de postagens

Uma postagem pertence ao usuário autenticado e segue o modelo definido pela equipe:
`id_postagem`, `id_usuario`, `titulo`, `conteudo`, `url_anexo`, `data_publicacao` e `status`.
No Laravel, os nomes seguem a convenção já usada no projeto: tabela `postagens`, chave
primária `id` e chave estrangeira `usuario_id`.

## Endpoints

| Método | Caminho | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/api/postagens` | Público | Lista postagens ativas ou editadas, da mais recente para a mais antiga. |
| GET | `/api/postagens/{id}` | Público | Exibe uma postagem não excluída. |
| POST | `/api/postagens` | Autenticado + CSRF | Cria uma postagem. |
| PUT/PATCH | `/api/postagens/{id}` | Dono + CSRF | Atualiza uma postagem do próprio usuário. |
| DELETE | `/api/postagens/{id}` | Dono + CSRF | Marca a postagem como excluída. |

## Corpo para criar

```json
{
  "titulo": "Minha publicação",
  "conteudo": "Texto da publicação.",
  "url_anexo": "https://exemplo.com/imagem.png"
}
```

`url_anexo` é opcional. O servidor define `usuario_id`, `data_publicacao` e o status
inicial `ativa`; esses campos não podem ser enviados pelo frontend. Ao editar, o status
passa a `editada`. Ao excluir, passa a `excluida`, mantendo o registro fora das leituras públicas.
