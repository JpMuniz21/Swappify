<?php

// FRONTEND: altere FRONTEND_URL no backend/.env quando o endereço do React mudar.
// A origem deve ser exata (protocolo, domínio e porta), sem barra final.
return [
    'paths' => ['api/*'], // Aplica CORS às URLs que serão consumidas pelo React.
    'allowed_methods' => ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], // Métodos utilizados pelo CRUD.
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:8080')], // Autoriza somente o frontend configurado.
    'allowed_origins_patterns' => [], // Não abre acesso por padrões de domínio.
    'allowed_headers' => ['Accept', 'Content-Type', 'X-CSRF-TOKEN', 'X-XSRF-TOKEN'], // Cabeçalhos esperados.
    'exposed_headers' => [], // Não expõe cabeçalhos extras ao JavaScript.
    'max_age' => 0, // Não mantém cache da autorização de preflight durante o desenvolvimento.
    'supports_credentials' => true, // Permite enviar o cookie de sessão com credentials: 'include'.
];
