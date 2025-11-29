<?php

return [
    'enabled' => env('WHATSAPP_ENABLED', false),
    'api_url' => env('WHATSAPP_API_URL', 'https://api.whatsapp.com'),
    'api_key' => env('WHATSAPP_API_KEY'),
    'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
    'access_token' => env('WHATSAPP_ACCESS_TOKEN'),
    'business_account_id' => env('WHATSAPP_BUSINESS_ACCOUNT_ID'),
    'verify_token' => env('WHATSAPP_VERIFY_TOKEN'),
    'webhook_url' => env('WHATSAPP_WEBHOOK_URL'),
];
