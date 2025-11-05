<?php

require __DIR__.'/../vendor/autoload.php';
use Illuminate\Support\Facades\DB;

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🔍 Environment Verification:\n";
echo "Database: " . (DB::connection()->getPdo() ? "✅ Connected" : "❌ Failed") . "\n";
echo "Redis: " . (app('redis')->connection()->ping() ? "✅ Connected" : "❌ Failed") . "\n";
echo "OpenWeather API Key: " . (config('services.openweather.api_key') ? "✅ Set" : "❌ Missing") . "\n";
echo "NASA EONET: " . (config('services.nasa_eonet.api_key') ? "✅ Set" : "⚠️  Optional") . "\n";