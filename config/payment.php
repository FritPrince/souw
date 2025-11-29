<?php

return [
    'fedapay' => [
        'public_key' => env('FEDAPAY_PUBLIC_KEY'),
        'secret_key' => env('FEDAPAY_SECRET_KEY'),
        'sandbox' => env('FEDAPAY_SANDBOX', true),
        'api_url' => env('FEDAPAY_API_URL', 'https://api.fedapay.com'),
    ],

    'currency' => env('PAYMENT_CURRENCY', 'XOF'),
    'default_method' => env('DEFAULT_PAYMENT_METHOD', 'fedapay'),
];
