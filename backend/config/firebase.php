<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Firebase Realtime Database
    |--------------------------------------------------------------------------
    |
    | Configuração para conexão com o Firebase RTDB.
    | O Wokwi ESP32 envia dados de sensores para este banco,
    | e o Laravel sincroniza periodicamente para o MySQL local.
    |
    */

    'rtdb_url' => env('FIREBASE_RTDB_URL', 'https://projeto-pi-bf5a6-default-rtdb.firebaseio.com'),

    'project_id' => env('FIREBASE_PROJECT_ID', 'projeto-pi-bf5a6'),

    /*
    | Caminho para o arquivo de credenciais do service account (JSON).
    | Necessário apenas se as regras do Firebase exigirem autenticação.
    | Para regras abertas (.read: true, .write: true), pode ser null.
    */
    'credentials' => env('FIREBASE_CREDENTIALS', null),

];
