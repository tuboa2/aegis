<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExternalApiService
{
    protected $httpClient;

    public function __construct()
    {
        $this->httpClient = Http::timeout(30)->retry(3, 100);
    }

    /*
        Fetch earthquake data from USGS
    */
    public function fetchUsgsEarthquakes(): array
    {
        try {
            $response = $this->httpClient->get(
              'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
            );

            if ($response->successful()) {
                $data = $response->json();
                return $this->parseUsgsData($data);
            };

            Log::error('USGS API request failed: ' . $response->status());
            return [];
        } catch (\Exception $e) {
            Log::error('USGS API error: ' . $e->getMessage());
            return [];
        }
    }

    /*
        Parse USGS earthquake data
    */
    private function parseUsgsData(array $data): array
    {
        $alerts = [];

        foreach ($data['features'] ?? [] as $feature) {
            $properties = $feature['properties'];
            $geometry = $feature['geometry'];

            // Only process significant earthquakes (magnitude 4.0+)
            if (($properties['mag'] ?? 0) < 4.0) {
                continue;
            }

            $alerts[] = [
                'external_id' => $feature['id'],
                'title' => $properties['title'],
                'description' => "Magnitude {$properties['mag']} earthquake",
                'type' => 'earthquake',
                'severity' => $this->calculateEarthquakeSeverity($properties['mag']),
                'latitude' => $geometry['coordinates'][1],
                'longitude' => $geometry['coordinates'][0],
                'radius_km' => $this->calculateEarthquakeRadius($properties['mag']),
                'source' => 'usgs',
                'started_at' => now()->parse($properties['time'] / 1000),
                'metadata' => [
                    'magnitude' => $properties['mag'],
                    'place' => $properties['place'],
                    'time' => $properties['time'],
                    'url' => $properties['url'],
                    'detail' => $properties['detail'] ?? null,
                ],
            ];
        }

        return $alerts;
    }

    /*
        Calculate earthquake severity based on magnitude
    */
    private function calculateEarthquakeSeverity(float $magnitude): string
    {
        return match(true) {
            $magnitude >= 7.0 => 'critical',
            $magnitude >= 6.0 => 'high',
            $magnitude >= 5.0 => 'medium',
            default => 'low',
        };
    }

    /*
        Calculate affected radius based on magnitude
    */
    private function calculateEarthquakeRadius(float $magnitude): float
    {
        return match(true) {
            $magnitude >= 7.0 => 500.0,
            $magnitude >= 6.0 => 300.0,
            $magnitude >= 5.0 => 100.0,
            $magnitude >= 4.0 => 50.0,
            default => 20.0,
        };
    }

    /*
        Fetch weather alerts from OpenWeatherMap
    */
    public function fetchWeatherAlerts(float $lat = 14.5995, float $lon = 120.9842): array
    {
        try {
            $apiKey = config('services.openweather.api_key');

            if (!$apiKey) {
                Log::error('OpenWeatherMap API key not configured');
                return [];
            }

            $response = $this->httpClient->get(
                "https://api.openweathermap.org/data/3.0/onecall?lat={$lat}&lon={$lon}&exclude=current,minutely,hourly,daily&appid={$apiKey}"
            );

            if ($response->successful()) {
                $data = $response->json();
                return $this->parseWeatherAlerts($data);
            }

            Log::error('OpenWeatherMap API request failed: ' . $response->status());
            return [];
        } catch (\Exception $e) {
            Log::error('OpenWeatherMap API error: ' . $e->getMessage());
            return [];
        }
    }

    /*
        Parse weather alert data
    */
    private function parseWeatherAlerts(array $data): array
    {
        $alerts = [];

        foreach ($data['alerts'] ?? [] as $alert) {
            $alerts[] = [
                'external_id' => md5($alert['event'] . $alert['start']),
                'title' => $alert['event'],
                'description' => $alert['description'],
                'type' => $this->mapWeatherEventToType($alert['event']),
                'severity' => 'high',
                'latitude' => 14.5995,
                'longitude' => 120.9842,
                'radius_km' => 100.0,
                'source' => 'openweather',
                'started_at' => now()->parse($alert['start']),
                'expires_at' => now()->parse($alert['end']),
                'metadata' => $alert,
            ];
        }

        return $alerts;
    }

    /*
        Map weather event to disaster type
    */
    private function mapWeatherEventToType(string $event): string
    {
        $event = strtolower($event);

        if (str_contains($event, 'flood')) return 'flood';
        if (str_contains($event, 'storm')) return 'storm';
        if (str_contains($event, 'huricane')) return 'storm';
        if (str_contains($event, 'tornado')) return 'storm';
        if (str_contains($event, 'fire')) return 'wildfire';
        if (str_contains($event, 'earthquake')) return 'earthquake';

        return 'storm'; // default
    }

    /*
        fetch events from NASA EONET
    */
    public function fetchNasaEvents(): array
    {
        try {
            $response = $this->httpClient->get(
                'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=20'
            );

            if ($response->successful()) {
                $data = $response->json();
                return $this->parseNasaEvents($data);
            }

            Log::error('NASA EONET API request failed: ' . $response->status());
            return [];
        } catch (\Exception $e) {
            Log::error('NASA EONET API error: ' . $e->getMessage());
            return [];
        }
    }

    /*
        Parse NASA EONET events
    */
    private function parseNasaEvents(array $data): array
    {
        $alerts = [];

        foreach ($data['events'] ?? [] as $event) {
            $category = $event['categories'][0]['id'] ?? '';
            $geometry = $event['geometry'][0] ?? [];

            if (empty($geometry) || empty($geometry['coordinates'])) {
              continue;
            }

            $alerts[] = [
                'external_id' => $event['id'],
                'title' => $event['title'],
                'description' => $event['description'] ?? 'Natural event detected',
                'type' => $this->mapNasaCategoryToType($category),
                'severity' => 'medium',
                'latitude' => $geometry['coordinates'][1],
                'longitude' => $geometry['coordinates'][0],
                'radius_km' => 200.0,
                'source' => 'nasa',
                'started_at' => now()->parse($event['geometry'][0]['date']),
                'metadata' => [
                    'category' => $category,
                    'sources' => $event['sources'] ?? [],
                    'link' => $event['link'] ?? null,
                ],
            ];
        }

        return $alerts;
    }

    /*
        Map NASA category to disaster type
    */
    private function mapNasaCategoryToType(string $category): string
    {
        return match($category) {
            'severeStorms', 'severe-storms' => 'storm',
            'volcanoes' => 'volcanic',
            'wildfires' => 'wildfire',
            'earthquakes' => 'earthquake',
            'floods' => 'flood',
            'landslides' => 'flood',
            default => 'storm',
        };
    }
}