<?php

// FRONTEND: alterar FRONTEND_URL no backend/.env ao mudar o endereço do React.
return [
    'paths' => ['api/*'],
    // PUT também é utilizado na edição dos serviços.
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:8080')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Accept', 'Content-Type', 'X-CSRF-TOKEN', 'X-XSRF-TOKEN'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // Permite o cookie de sessão do Laravel.
];
