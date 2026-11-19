<?php

$url_supabase = env('SUPABASE_URL');
$chave_supabase = env('SUPABASE_SECRET_KEY');

function conectarSupabase()
{
    global $url_supabase, $chave_supabase;

    return [
        "url" => $url_supabase,
        "chave" => $chave_supabase
    ];
}