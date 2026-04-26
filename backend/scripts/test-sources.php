<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Http;

echo "═══ USGS API Test ═══\n";
$response = Http::timeout(30)->get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
echo "Status: {$response->status()}\n";

if ($response->successful()) {
    $data = $response->json();
    $totalFeatures = $data['metadata']['count'] ?? 0;
    echo "Total features: {$totalFeatures}\n";

    $mag4 = collect($data['features'])->filter(fn($f) => ($f['properties']['mag'] ?? 0) >= 4.0)->count();
    $mag2 = collect($data['features'])->filter(fn($f) => ($f['properties']['mag'] ?? 0) >= 2.0)->count();
    echo "Magnitude 4.0+: {$mag4}\n";
    echo "Magnitude 2.0+: {$mag2}\n";
} else {
    echo "FAILED: {$response->body()}\n";
}

echo "\n═══ GDACS API Test ═══\n";
$response = Http::timeout(30)->withHeaders(['Accept' => 'application/xml'])->get('https://www.gdacs.org/xml/rss.xml');
echo "Status: {$response->status()}\n";

if ($response->successful()) {
    $xml = @simplexml_load_string($response->body());
    if ($xml !== false) {
        $items = count($xml->channel->item ?? []);
        echo "Items in feed: {$items}\n";
    } else {
        echo "XML parse failed\n";
    }
} else {
    echo "FAILED: " . substr($response->body(), 0, 200) . "\n";
}

echo "\n═══ NWS API Test ═══\n";
$response = Http::timeout(30)
    ->withHeaders([
        'Accept' => 'application/geo+json',
        'User-Agent' => '(Aegis Disaster Monitor, contact@aegis.app)',
    ])
    ->get('https://api.weather.gov/alerts/active', [
        'status' => 'actual',
        'severity' => 'Severe,Extreme',
        'limit' => 50,
    ]);
echo "Status: {$response->status()}\n";

if ($response->successful()) {
    $data = $response->json();
    $features = count($data['features'] ?? []);
    echo "Features: {$features}\n";
} else {
    echo "FAILED: " . substr($response->body(), 0, 200) . "\n";
}

echo "\n═══ NASA EONET Test ═══\n";
$response = Http::timeout(30)->get('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50');
echo "Status: {$response->status()}\n";

if ($response->successful()) {
    $data = $response->json();
    $events = count($data['events'] ?? []);
    echo "Events: {$events}\n";
} else {
    echo "FAILED: " . substr($response->body(), 0, 200) . "\n";
}
