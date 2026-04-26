<?php

namespace App\Http\Controllers;

use App\Models\DisasterAlert;
use App\Services\ExternalApiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DisasterAlertController extends Controller
{
    protected ExternalApiService $externalApiService;

    public function __construct(ExternalApiService $externalApiService)
    {
        $this->externalApiService = $externalApiService;
    }

    /**
     * Get all active alerts with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = DisasterAlert::with(['user', 'reports'])->active()->orderBy('started_at', 'desc');

        // Filter by type
        if ($request->has('type')) {
            $query->type($request->type);
        }

        // Filter by severity
        if ($request->has('severity')) {
            $query->severity($request->severity);
        }

        // Filter by map bounds
        if ($request->has(['ne_lat', 'ne_lng', 'sw_lat', 'sw_lng'])) {
            $query->whereBetween('latitude', [$request->sw_lat, $request->ne_lat])
                  ->whereBetween('longitude', [$request->sw_lng, $request->ne_lng]);
        }

        $alerts = $query->paginate($request->get('per_page', 50));

        return response()->json([
            'data' => $alerts->items(),
            'meta' => [
                'current_page' => $alerts->currentPage(),
                'total' => $alerts->total(),
                'per_page' => $alerts->perPage(),
            ]
        ]);
    }

    /**
     * Get alert statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = Cache::remember('alert_statistics', 300, function () {
            $totalAlerts = DisasterAlert::active()->count();

            $byType = DisasterAlert::active()
                ->selectRaw('type, count(*) as count')
                ->groupBy('type')
                ->get()
                ->pluck('count', 'type');

            $bySeverity = DisasterAlert::active()
                ->selectRaw('severity, count(*) as count')
                ->groupBy('severity')
                ->get()
                ->pluck('count', 'severity');

            $recentAlerts = DisasterAlert::active()
                ->where('started_at', '>=', now()->subHours(24))
                ->count();

            return [
                'total_active' => $totalAlerts,
                'last_24_hours' => $recentAlerts,
                'by_type' => $byType,
                'by_severity' => $bySeverity,
            ];
        });

        return response()->json($stats);
    }

    /**
     * Sync alerts from external APIs (manual trigger endpoint).
     */
    public function syncExternalData(): JsonResponse
    {
        try {
            Log::info('[SyncEndpoint] Manual external data sync triggered');

            $newAlerts = [];
            $errors = [];

            // Fetch from all external sources
            $allExternalAlerts = [];

            $sources = [
                'USGS' => fn() => $this->externalApiService->fetchUsgsEarthquakes(),
                'GDACS' => fn() => $this->externalApiService->fetchGdacsAlerts(),
                'NWS' => fn() => $this->externalApiService->fetchNwsAlerts(),
                'NASA' => fn() => $this->externalApiService->fetchNasaEvents(),
            ];

            foreach ($sources as $name => $fetchFn) {
                try {
                    $alerts = $fetchFn();
                    $allExternalAlerts = array_merge($allExternalAlerts, $alerts);
                } catch (\Exception $e) {
                    $errors[] = "{$name}: {$e->getMessage()}";
                    Log::error("[SyncEndpoint] {$name} fetch failed: {$e->getMessage()}");
                }
            }

            foreach ($allExternalAlerts as $alertData) {
                try {
                    $existing = DisasterAlert::where('external_id', $alertData['external_id'])
                        ->where('source', $alertData['source'])
                        ->first();

                    if (!$existing) {
                        $alert = DisasterAlert::create($alertData);
                        $newAlerts[] = $alert;
                    }
                } catch (\Exception $e) {
                    $errors[] = "Alert processing: {$e->getMessage()}";
                    Log::error("[SyncEndpoint] Alert creation failed: {$e->getMessage()}", [
                        'external_id' => $alertData['external_id'] ?? 'unknown',
                    ]);
                }
            }

            // Invalidate stats cache if we got new data
            if (count($newAlerts) > 0) {
                Cache::forget('alert_statistics');
            }

            Log::info('[SyncEndpoint] Manual sync completed', [
                'new' => count($newAlerts),
                'total_processed' => count($allExternalAlerts),
                'errors' => count($errors),
            ]);

            return response()->json([
                'message' => 'External data synced successfully',
                'new_alerts' => count($newAlerts),
                'total_processed' => count($allExternalAlerts),
                'errors' => $errors,
            ]);
        } catch (\Exception $e) {
            Log::error('[SyncEndpoint] Sync completely failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Sync failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific alert with relationships.
     */
    public function show(DisasterAlert $alert): JsonResponse
    {
        $alert->load(['user', 'reports.user', 'aiSummary']);

        return response()->json($alert);
    }

    /**
     * Create a user-reported alert.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:earthquake,flood,storm,wildfire,volcanic,tsunami',
            'severity' => 'required|in:low,medium,high,critical',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_km' => 'sometimes|numeric|min:0.1'
        ]);

        $alert = DisasterAlert::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'source' => 'user_report',
            'started_at' => now(),
            'is_active' => true,
        ]);

        // Invalidate stats cache
        Cache::forget('alert_statistics');

        Log::info('[AlertCreated] User-reported alert created', [
            'id' => $alert->id,
            'type' => $alert->type,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Alert created successfully',
            'data' => $alert,
        ], 201);
    }

    /**
     * Get ingestion pipeline health status.
     */
    public function ingestionHealth(): JsonResponse
    {
        $lastSync = Cache::get('last_sync_result');
        $sourceHealth = ExternalApiService::getIngestionHealth();

        return response()->json([
            'last_sync' => $lastSync,
            'source_health' => $sourceHealth,
            'total_active_alerts' => DisasterAlert::active()->count(),
            'latest_alert_at' => DisasterAlert::latest('created_at')->value('created_at'),
        ]);
    }
}
