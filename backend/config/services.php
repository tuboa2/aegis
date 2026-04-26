<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'gdacs' => [
        'base_url' => 'https://www.gdacs.org/xml/',
    ],

    'nws' => [
        'base_url' => 'https://api.weather.gov/',
    ],

    'nasa_eonet' => [
        'api_key' => env('NASA_EONET_API_KEY'),
        'base_url' => 'https://eonet.gsfc.nasa.gov/api/v3/',
    ],

    'usgs_earthquake' => [
        'base_url' => 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/',
    ],

    'phivolcs' => [
        'base_url' => 'https://earthquake.phivolcs.dost.gov.ph/api/',
    ],

    'newsapi' => [
        'api_key' => env('NEWSAPI_API_KEY'),
        'base_url' => 'https://newsapi.org/v2/',
    ],

    'openrouter' => [
        'api_key' => env('OPENROUTER_API_KEY'),
        'base_url' => 'https://openrouter.ai/api/v1',
    ],

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
