# Backend do Swappify

Este diretório receberá a API Laravel do projeto.

## Ambiente local

Após instalar a aplicação Laravel, suba os serviços a partir da raiz do projeto:

```sh
docker compose up --build -d
```

- Frontend: http://localhost:8080
- API Laravel: http://localhost:8000

O ambiente atual não inclui banco de dados. A equipe responsável deverá adicionar
o serviço de banco ao `docker-compose.yml` e preencher as variáveis `DB_*` no
arquivo `backend/.env`.

## Próxima etapa obrigatória

Instale uma aplicação Laravel real neste diretório antes de subir o serviço
`backend`. Essa instalação cria os arquivos de framework, incluindo o comando
`artisan`, as configurações e o ponto de entrada HTTP.
