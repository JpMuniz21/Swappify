# Favoritos de serviços

Favoritos usam a entidade `interesses` do DER. Nesta etapa, uma pessoa pode favoritar
somente serviços de outras pessoas; favoritos de perfil não fazem parte desta API.

## Rotas

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/api/interesses` | Login + CSRF de sessão | Lista os serviços favoritos da pessoa logada. |
| POST | `/api/interesses` | Login + CSRF de sessão | Adiciona um serviço aos favoritos. |
| DELETE | `/api/interesses/{id}` | Dono + CSRF de sessão | Remove um favorito próprio. |

## Criar favorito

```json
{
  "servico_id": 12
}
```

O backend define `usuario_id`, `status` (`ativo`) e `data_criacao`. Não é permitido
favoritar o próprio serviço nem criar o mesmo favorito duas vezes. A listagem retorna
o serviço e dados públicos de seu dono para a tela de Favoritos.
