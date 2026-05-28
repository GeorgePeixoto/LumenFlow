<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Firebase Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure the multiple Firebase connections for your application.
    |
    */

    'default' => env('FIREBASE_DEFAULT_CONNECTION', 'wokwi'),

    'connections' => [
        'wokwi' => [
            'database_url' => env('FIREBASE_WOKWI_DATABASE_URL'),
            'client_email' => env('FIREBASE_WOKWI_CLIENT_EMAIL'),
            'private_key' => env('FIREBASE_WOKWI_PRIVATE_KEY'),
            'service_account_json' => env('FIREBASE_WOKWI_SERVICE_ACCOUNT_JSON'),
            'storage_bucket' => env('FIREBASE_WOKWI_STORAGE_BUCKET', 'projeto-pi-bf5a6.appspot.com'),
            'api_key' => env('FIREBASE_WOKWI_API_KEY'),
        ],

        'auth' => [
            'database_url' => env('FIREBASE_AUTH_DATABASE_URL'),
            'client_email' => env('FIREBASE_AUTH_CLIENT_EMAIL'),
            'private_key' => env('FIREBASE_AUTH_PRIVATE_KEY'),
            'service_account_json' => env('FIREBASE_AUTH_SERVICE_ACCOUNT_JSON'),
            'storage_bucket' => env('FIREBASE_AUTH_STORAGE_BUCKET', 'pi-login-b7130.appspot.com'),
            'api_key' => env('FIREBASE_AUTH_API_KEY'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Firebase Realtime Database Settings
    |--------------------------------------------------------------------------
    |
    | Default settings for Realtime Database connections.
    |
    */

    'database' => [
        'timeout' => env('FIREBASE_DATABASE_TIMEOUT', 10),
        'keep_alive' => env('FIREBASE_KEEP_ALIVE', true),
        'http_client' => [
            'timeout' => env('FIREBASE_HTTP_TIMEOUT', 30),
            'connect_timeout' => env('FIREBASE_CONNECT_TIMEOUT', 10),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Firebase Storage Settings
    |--------------------------------------------------------------------------
    |
    | Default settings for Firebase Storage.
    |
    */

    'storage' => [
        'default_visibility' => env('FIREBASE_STORAGE_VISIBILITY', 'private'),
        'max_size' => env('FIREBASE_MAX_FILE_SIZE', 1024 * 1024 * 10), // 10MB
    ],
];
