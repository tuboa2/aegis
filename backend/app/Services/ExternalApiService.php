<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ExternalApiService
{
    protected $httpClient;

    /**
     * Track ingestion metrics per source for monitoring.
     */
    protected array $metrics = [];

    public function __construct()
    {
        $this->httpClient = Http::timeout(30)->retry(3, 1000, throw: false);
    }

    // ────────────────────────────────────────────────────────────────
    //  USGS Earthquakes (free, no API key)
    // ────────────────────────────────────────────────────────────────

    /**
     * Fetch earthquake data from USGS.
     * Feed updates every ~5 minutes. No API key required.
     * @see https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
     */
    public function fetchUsgsEarthquakes(): array
    {
        $source = 'USGS Earthquakes';

        try {
            Log::info("[Ingestion] Fetching from {$source}...");

            $response = $this->httpClient->get(
                'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
            );

            if (!$response->successful()) {
                Log::error("[Ingestion] {$source} HTTP {$response->status()}", [
                    'body' => substr($response->body(), 0, 500),
                ]);
                $this->recordMetric($source, 0, 0, "HTTP {$response->status()}");
                return [];
            }

            $data = $response->json();

            if (!isset($data['features']) || !is_array($data['features'])) {
                Log::error("[Ingestion] {$source} response missing 'features' array");
                $this->recordMetric($source, 0, 0, 'Invalid response structure');
                return [];
            }

            $alerts = $this->parseUsgsData($data);

            Log::info("[Ingestion] {$source}: {$data['metadata']['count']} total features, " . count($alerts) . " significant (M4.0+) parsed successfully");
            $this->recordMetric($source, $data['metadata']['count'] ?? count($data['features']), count($alerts));

            return $alerts;
        } catch (\Exception $e) {
            Log::error("[Ingestion] {$source} exception: {$e->getMessage()}", [
                'trace' => $e->getTraceAsString(),
            ]);
            $this->recordMetric($source, 0, 0, $e->getMessage());
            return [];
        }
    }

    /**
     * Parse USGS earthquake GeoJSON features into normalized alert format.
     */
    private function parseUsgsData(array $data): array
    {
        $alerts = [];

        foreach ($data['features'] ?? [] as $feature) {
            try {
                $properties = $feature['properties'] ?? [];
                $geometry = $feature['geometry'] ?? [];
                $coordinates = $geometry['coordinates'] ?? [];

                // Only process significant earthquakes (magnitude 4.0+)
                $magnitude = (float) ($properties['mag'] ?? 0);
                if ($magnitude < 4.0) {
                    continue;
                }

                // Validate coordinates exist
                if (count($coordinates) < 2) {
                    Log::debug("[Ingestion] USGS feature missing coordinates", ['id' => $feature['id'] ?? 'unknown']);
                    continue;
                }

                // USGS provides time as Unix milliseconds
                $startedAt = isset($properties['time'])
                    ? Carbon::createFromTimestampMs((int) $properties['time'])
                    : now();

                $alerts[] = [
                    'external_id' => $feature['id'] ?? uniqid('usgs_'),
                    'title' => $properties['title'] ?? 'Earthquake',
                    'description' => "Magnitude {$magnitude} earthquake" . (isset($properties['place']) ? " - {$properties['place']}" : ''),
                    'type' => 'earthquake',
                    'severity' => $this->calculateEarthquakeSeverity($magnitude),
                    'latitude' => (float) $coordinates[1],
                    'longitude' => (float) $coordinates[0],
                    'radius_km' => $this->calculateEarthquakeRadius($magnitude),
                    'source' => 'usgs',
                    'started_at' => $startedAt,
                    'is_active' => true,
                    'metadata' => [
                        'magnitude' => $magnitude,
                        'depth_km' => $coordinates[2] ?? null,
                        'place' => $properties['place'] ?? null,
                        'time' => $properties['time'] ?? null,
                        'url' => $properties['url'] ?? null,
                        'detail' => $properties['detail'] ?? null,
                        'felt' => $properties['felt'] ?? null,
                        'tsunami' => $properties['tsunami'] ?? null,
                        'alert' => $properties['alert'] ?? null,
                    ],
                ];
            } catch (\Exception $e) {
                Log::warning("[Ingestion] Failed to parse USGS feature: {$e->getMessage()}", [
                    'feature_id' => $feature['id'] ?? 'unknown',
                ]);
            }
        }

        return $alerts;
    }

    /**
     * Calculate earthquake severity based on magnitude.
     */
    private function calculateEarthquakeSeverity(float $magnitude): string
    {
        return match (true) {
            $magnitude >= 7.0 => 'critical',
            $magnitude >= 6.0 => 'high',
            $magnitude >= 5.0 => 'medium',
            default => 'low',
        };
    }

    /**
     * Calculate affected radius based on magnitude.
     */
    private function calculateEarthquakeRadius(float $magnitude): float
    {
        return match (true) {
            $magnitude >= 7.0 => 500.0,
            $magnitude >= 6.0 => 300.0,
            $magnitude >= 5.0 => 100.0,
            $magnitude >= 4.0 => 50.0,
            default => 20.0,
        };
    }

    // ────────────────────────────────────────────────────────────────
    //  GDACS - Global Disaster Alert and Coordination System (free)
    // ────────────────────────────────────────────────────────────────

    /**
     * Fetch active disaster alerts from GDACS RSS feed.
     * Covers: earthquakes, floods, cyclones, volcanoes, droughts, wildfires.
     * Free, no API key required.
     * @see https://www.gdacs.org/xml/rss.xml
     */
    public function fetchGdacsAlerts(): array
    {
        $source = 'GDACS';

        try {
            Log::info("[Ingestion] Fetching from {$source}...");

            $response = $this->httpClient
                ->withHeaders(['Accept' => 'application/xml'])
                ->get('https://www.gdacs.org/xml/rss.xml');

            if (!$response->successful()) {
                Log::error("[Ingestion] {$source} HTTP {$response->status()}", [
                    'body' => substr($response->body(), 0, 500),
                ]);
                $this->recordMetric($source, 0, 0, "HTTP {$response->status()}");
                return [];
            }

            $xml = @simplexml_load_string($response->body());

            if ($xml === false) {
                Log::error("[Ingestion] {$source} failed to parse XML response");
                $this->recordMetric($source, 0, 0, 'XML parse failure');
                return [];
            }

            $alerts = $this->parseGdacsData($xml);

            $totalItems = count($xml->channel->item ?? []);
            Log::info("[Ingestion] {$source}: {$totalItems} items in feed, " . count($alerts) . " alerts parsed");
            $this->recordMetric($source, $totalItems, count($alerts));

            return $alerts;
        } catch (\Exception $e) {
            Log::error("[Ingestion] {$source} exception: {$e->getMessage()}", [
                'trace' => $e->getTraceAsString(),
            ]);
            $this->recordMetric($source, 0, 0, $e->getMessage());
            return [];
        }
    }

    /**
     * Parse GDACS RSS XML into normalized alert format.
     */
    private function parseGdacsData(\SimpleXMLElement $xml): array
    {
        $alerts = [];
        $namespaces = $xml->getNamespaces(true);

        foreach ($xml->channel->item ?? [] as $item) {
            try {
                $gdacs = $item->children($namespaces['gdacs'] ?? 'http://www.gdacs.org');
                $geo = $item->children($namespaces['geo'] ?? 'http://www.w3.org/2003/01/geo/wgs84_pos#');

                $lat = (float) ($geo->lat ?? $geo->Point->lat ?? 0);
                $lon = (float) ($geo->long ?? $geo->Point->long ?? 0);

                // Skip if no valid coordinates
                if ($lat == 0 && $lon == 0) {
                    continue;
                }

                $title = (string) ($item->title ?? 'GDACS Alert');
                $eventType = strtolower((string) ($gdacs->eventtype ?? ''));
                $alertLevel = strtolower((string) ($gdacs->alertlevel ?? ''));

                $alerts[] = [
                    'external_id' => md5((string) ($item->guid ?? $item->link ?? $title . $lat)),
                    'title' => $title,
                    'description' => (string) ($item->description ?? 'Disaster alert from GDACS'),
                    'type' => $this->mapGdacsEventType($eventType),
                    'severity' => $this->mapGdacsSeverity($alertLevel),
                    'latitude' => $lat,
                    'longitude' => $lon,
                    'radius_km' => 200.0,
                    'source' => 'nasa', // Reuse 'nasa' source enum since GDACS is a global system
                    'started_at' => isset($item->pubDate) ? Carbon::parse((string) $item->pubDate) : now(),
                    'is_active' => true,
                    'metadata' => [
                        'gdacs_event_type' => $eventType,
                        'gdacs_alert_level' => $alertLevel,
                        'gdacs_severity' => (string) ($gdacs->severity ?? ''),
                        'gdacs_population' => (string) ($gdacs->population ?? ''),
                        'gdacs_country' => (string) ($gdacs->country ?? ''),
                        'link' => (string) ($item->link ?? ''),
                    ],
                ];
            } catch (\Exception $e) {
                Log::warning("[Ingestion] Failed to parse GDACS item: {$e->getMessage()}");
            }
        }

        return $alerts;
    }

    /**
     * Map GDACS event type to our disaster type enum.
     */
    private function mapGdacsEventType(string $eventType): string
    {
        return match ($eventType) {
            'eq' => 'earthquake',
            'fl' => 'flood',
            'tc' => 'storm',
            'vo' => 'volcanic',
            'ts' => 'tsunami',
            'wf' => 'wildfire',
            'dr' => 'storm', // drought → closest match
            default => 'storm',
        };
    }

    /**
     * Map GDACS alert level to our severity enum.
     */
    private function mapGdacsSeverity(string $alertLevel): string
    {
        return match ($alertLevel) {
            'red' => 'critical',
            'orange' => 'high',
            'green' => 'medium',
            default => 'low',
        };
    }

    // ────────────────────────────────────────────────────────────────
    //  NWS - National Weather Service Alerts (free, no API key)
    // ────────────────────────────────────────────────────────────────

    /**
     * Fetch active weather alerts from the US National Weather Service.
     * Covers: storms, floods, fires, tornadoes, hurricanes, etc.
     * Free, no API key required. Requires User-Agent header.
     * @see https://www.weather.gov/documentation/services-web-api
     */
    public function fetchNwsAlerts(): array
    {
        $source = 'NWS Weather Alerts';

        try {
            Log::info("[Ingestion] Fetching from {$source}...");

            // NWS requires a descriptive User-Agent header
            $response = Http::timeout(30)
                ->retry(3, 1000, throw: false)
                ->withHeaders([
                    'Accept' => 'application/geo+json',
                    'User-Agent' => '(Aegis Disaster Monitor, contact@aegis.app)',
                ])
                ->get('https://api.weather.gov/alerts/active', [
                    'status' => 'actual',
                    'severity' => 'Severe,Extreme',
                    'limit' => 50,
                ]);

            if (!$response->successful()) {
                Log::error("[Ingestion] {$source} HTTP {$response->status()}", [
                    'body' => substr($response->body(), 0, 500),
                ]);
                $this->recordMetric($source, 0, 0, "HTTP {$response->status()}");
                return [];
            }

            $data = $response->json();

            if (!isset($data['features']) || !is_array($data['features'])) {
                Log::error("[Ingestion] {$source} response missing 'features' array");
                $this->recordMetric($source, 0, 0, 'Invalid response structure');
                return [];
            }

            $alerts = $this->parseNwsAlerts($data);

            Log::info("[Ingestion] {$source}: " . count($data['features']) . " features, " . count($alerts) . " alerts parsed");
            $this->recordMetric($source, count($data['features']), count($alerts));

            return $alerts;
        } catch (\Exception $e) {
            Log::error("[Ingestion] {$source} exception: {$e->getMessage()}", [
                'trace' => $e->getTraceAsString(),
            ]);
            $this->recordMetric($source, 0, 0, $e->getMessage());
            return [];
        }
    }

    /**
     * Parse NWS GeoJSON alert features into normalized alert format.
     */
    private function parseNwsAlerts(array $data): array
    {
        $alerts = [];

        foreach ($data['features'] ?? [] as $feature) {
            try {
                $props = $feature['properties'] ?? [];

                // Skip if missing essential data
                if (empty($props['event']) || empty($props['id'])) {
                    continue;
                }

                // NWS uses area descriptions and optional point geometries
                // Try to extract centroid from geometry, or use affectedZones
                $lat = 0;
                $lon = 0;
                $geometry = $feature['geometry'] ?? null;

                if ($geometry && isset($geometry['type'])) {
                    if ($geometry['type'] === 'Point' && isset($geometry['coordinates'])) {
                        $lon = (float) $geometry['coordinates'][0];
                        $lat = (float) $geometry['coordinates'][1];
                    } elseif ($geometry['type'] === 'Polygon' && isset($geometry['coordinates'][0])) {
                        // Calculate centroid of polygon
                        $coords = $geometry['coordinates'][0];
                        $lat = array_sum(array_column($coords, 1)) / count($coords);
                        $lon = array_sum(array_column($coords, 0)) / count($coords);
                    }
                }

                // Skip alerts with no usable geometry
                if ($lat == 0 && $lon == 0) {
                    continue;
                }

                $startedAt = isset($props['onset'])
                    ? Carbon::parse($props['onset'])
                    : (isset($props['effective']) ? Carbon::parse($props['effective']) : now());

                $expiresAt = isset($props['expires'])
                    ? Carbon::parse($props['expires'])
                    : null;

                $alerts[] = [
                    'external_id' => $props['id'] ?? uniqid('nws_'),
                    'title' => $props['event'] . ' - ' . ($props['areaDesc'] ?? 'Unknown Area'),
                    'description' => $props['headline'] ?? $props['description'] ?? 'Weather alert from NWS',
                    'type' => $this->mapNwsEventToType($props['event'] ?? ''),
                    'severity' => $this->mapNwsSeverity($props['severity'] ?? ''),
                    'latitude' => $lat,
                    'longitude' => $lon,
                    'radius_km' => 100.0,
                    'source' => 'openweather', // Reuse 'openweather' enum slot for NWS weather alerts
                    'started_at' => $startedAt,
                    'expires_at' => $expiresAt,
                    'is_active' => true,
                    'metadata' => [
                        'nws_id' => $props['id'] ?? null,
                        'event' => $props['event'] ?? null,
                        'severity' => $props['severity'] ?? null,
                        'certainty' => $props['certainty'] ?? null,
                        'urgency' => $props['urgency'] ?? null,
                        'sender' => $props['senderName'] ?? null,
                        'area' => $props['areaDesc'] ?? null,
                        'instruction' => $props['instruction'] ?? null,
                    ],
                ];
            } catch (\Exception $e) {
                Log::warning("[Ingestion] Failed to parse NWS alert: {$e->getMessage()}");
            }
        }

        return $alerts;
    }

    /**
     * Map NWS event name to our disaster type enum.
     */
    private function mapNwsEventToType(string $event): string
    {
        $event = strtolower($event);

        if (str_contains($event, 'flood')) return 'flood';
        if (str_contains($event, 'flash flood')) return 'flood';
        if (str_contains($event, 'storm')) return 'storm';
        if (str_contains($event, 'hurricane')) return 'storm';
        if (str_contains($event, 'typhoon')) return 'storm';
        if (str_contains($event, 'tornado')) return 'storm';
        if (str_contains($event, 'thunderstorm')) return 'storm';
        if (str_contains($event, 'fire')) return 'wildfire';
        if (str_contains($event, 'earthquake')) return 'earthquake';
        if (str_contains($event, 'tsunami')) return 'tsunami';
        if (str_contains($event, 'volcano') || str_contains($event, 'volcanic')) return 'volcanic';

        return 'storm'; // Default for other extreme weather
    }

    /**
     * Map NWS severity to our severity enum.
     */
    private function mapNwsSeverity(string $severity): string
    {
        return match (strtolower($severity)) {
            'extreme' => 'critical',
            'severe' => 'high',
            'moderate' => 'medium',
            'minor' => 'low',
            default => 'medium',
        };
    }

    // ────────────────────────────────────────────────────────────────
    //  NASA EONET (free, API key optional)
    // ────────────────────────────────────────────────────────────────

    /**
     * Fetch active natural events from NASA EONET.
     * Covers: wildfires, volcanoes, severe storms, icebergs.
     * Free, no API key required.
     * @see https://eonet.gsfc.nasa.gov/docs/v3
     */
    public function fetchNasaEvents(): array
    {
        $source = 'NASA EONET';

        try {
            Log::info("[Ingestion] Fetching from {$source}...");

            $response = $this->httpClient->get(
                'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50'
            );

            if (!$response->successful()) {
                Log::error("[Ingestion] {$source} HTTP {$response->status()}", [
                    'body' => substr($response->body(), 0, 500),
                ]);
                $this->recordMetric($source, 0, 0, "HTTP {$response->status()}");
                return [];
            }

            $data = $response->json();

            if (!isset($data['events']) || !is_array($data['events'])) {
                Log::error("[Ingestion] {$source} response missing 'events' array");
                $this->recordMetric($source, 0, 0, 'Invalid response structure');
                return [];
            }

            $alerts = $this->parseNasaEvents($data);

            Log::info("[Ingestion] {$source}: " . count($data['events']) . " events, " . count($alerts) . " alerts parsed");
            $this->recordMetric($source, count($data['events']), count($alerts));

            return $alerts;
        } catch (\Exception $e) {
            Log::error("[Ingestion] {$source} exception: {$e->getMessage()}", [
                'trace' => $e->getTraceAsString(),
            ]);
            $this->recordMetric($source, 0, 0, $e->getMessage());
            return [];
        }
    }

    /**
     * Parse NASA EONET events into normalized alert format.
     */
    private function parseNasaEvents(array $data): array
    {
        $alerts = [];

        foreach ($data['events'] ?? [] as $event) {
            try {
                $category = $event['categories'][0]['id'] ?? '';

                // Get the most recent geometry entry
                $geometries = $event['geometry'] ?? [];
                $geometry = !empty($geometries) ? end($geometries) : [];

                if (empty($geometry) || empty($geometry['coordinates'])) {
                    Log::debug("[Ingestion] NASA EONET event missing coordinates", ['id' => $event['id'] ?? 'unknown']);
                    continue;
                }

                $startedAt = isset($geometry['date'])
                    ? Carbon::parse($geometry['date'])
                    : now();

                $alerts[] = [
                    'external_id' => $event['id'] ?? uniqid('nasa_'),
                    'title' => $event['title'] ?? 'Natural Event',
                    'description' => ($event['description'] ?? '') ?: "Natural event detected by NASA EONET ({$category})",
                    'type' => $this->mapNasaCategoryToType($category),
                    'severity' => 'medium',
                    'latitude' => (float) $geometry['coordinates'][1],
                    'longitude' => (float) $geometry['coordinates'][0],
                    'radius_km' => 200.0,
                    'source' => 'nasa',
                    'started_at' => $startedAt,
                    'is_active' => true,
                    'metadata' => [
                        'category' => $category,
                        'sources' => $event['sources'] ?? [],
                        'link' => $event['link'] ?? null,
                        'geometry_count' => count($geometries),
                    ],
                ];
            } catch (\Exception $e) {
                Log::warning("[Ingestion] Failed to parse NASA EONET event: {$e->getMessage()}", [
                    'event_id' => $event['id'] ?? 'unknown',
                ]);
            }
        }

        return $alerts;
    }

    /**
     * Map NASA EONET category to our disaster type enum.
     */
    private function mapNasaCategoryToType(string $category): string
    {
        return match ($category) {
            'severeStorms', 'severe-storms' => 'storm',
            'volcanoes' => 'volcanic',
            'wildfires' => 'wildfire',
            'earthquakes' => 'earthquake',
            'floods' => 'flood',
            'landslides' => 'flood', // closest match
            'seaLakeIce', 'snow' => 'storm',
            default => 'storm',
        };
    }

    // ────────────────────────────────────────────────────────────────
    //  Ingestion Metrics & Health
    // ────────────────────────────────────────────────────────────────

    /**
     * Record ingestion metric for a source.
     */
    private function recordMetric(string $source, int $fetched, int $parsed, ?string $error = null): void
    {
        $metric = [
            'source' => $source,
            'fetched' => $fetched,
            'parsed' => $parsed,
            'error' => $error,
            'timestamp' => now()->toISOString(),
        ];

        $this->metrics[] = $metric;

        // Cache last ingestion metrics for health monitoring
        $cacheKey = 'ingestion_metric_' . str_replace(' ', '_', strtolower($source));
        Cache::put($cacheKey, $metric, 3600); // 1 hour TTL
    }

    /**
     * Get all metrics from the current ingestion run.
     */
    public function getMetrics(): array
    {
        return $this->metrics;
    }

    /**
     * Get cached ingestion health for all sources.
     */
    public static function getIngestionHealth(): array
    {
        $sources = ['usgs_earthquakes', 'gdacs', 'nws_weather_alerts', 'nasa_eonet'];
        $health = [];

        foreach ($sources as $source) {
            $metric = Cache::get("ingestion_metric_{$source}");
            $health[$source] = $metric ?? ['status' => 'no_data', 'message' => 'No ingestion recorded yet'];
        }

        return $health;
    }
}