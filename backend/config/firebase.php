<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Firebase Realtime Database
    |--------------------------------------------------------------------------
    |
    | Configuração para conexão com o Firebase RTDB.
    | O Wokwi ESP32 envia dados de sensores para este banco.
    |
    */

    'rtdb_url' => env('FIREBASE_RTDB_URL', 'https://seu-projeto-iot.firebaseio.com'),

    'project_id' => env('FIREBASE_PROJECT_ID', 'seu-projeto-id'),

    /*
    | Caminho para o arquivo de credenciais do service account (JSON).
    | Necessário apenas se as regras do Firebase exigirem autenticação.
    | Para regras abertas (.read: true, .write: true), pode ser null.
    */
    'credentials' => env('FIREBASE_CREDENTIALS', null),

    /*
    |--------------------------------------------------------------------------
    | Firebase Authentication
    |--------------------------------------------------------------------------
    |
    | Configuração para Firebase Authentication.
    | Usado para gerenciar usuários do sistema.
    |
    */

    'auth' => [
        'domain' => env('FIREBASE_AUTH_DOMAIN', 'seu-projeto.firebaseapp.com'),
        'api_key' => env('FIREBASE_API_KEY', ''),
        'project_id' => env('FIREBASE_PROJECT_ID', 'seu-projeto-id'),
    ],

];
