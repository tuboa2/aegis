<?php

namespace App\Http\Controllers;

use App\Models\DisasterAlert;
use App\Services\ExternalApiService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class DisasterAlertController extends Controller
{
    protected $externalApiService;

    public function __construct(ExternalApiService $externalApiService)
    {
        $this->externalApiService = $externalApiService;
    }

    /*
        Get all active alerts
    */
    public function index(Request $request)
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

        // Filter by location
        if ($request->has(['ne_lat', 'ne_lng', 'sw_lat', 'sw_lang'])) {
            $query->whereBetween('latitude', [$request->sw_lat, $request->ne_lat])->whereBetween('longitude', [$request->sw_lng, $request->ne_lang]);
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

    /*
        Get alert statistics
    */
    public function statistics()
    {
        $stats = Cache::remember('alert_statistics', 300, function () {
            // 5 minutes cache
            $totalAlerts = DisasterAlert::active()->count();

            $byType = DisasterAlert::active()
                ->selectRaw('type, count(*)')
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

    /*
        Sync alerts from external APIs
    */
    public function syncExternalData()
    {
        $newAlerts = [];

        // Fetch from all external sources
        $usgsAlerts = $this->externalApiService->fetchUsgsEarthquakes();
        $weatherAlerts = $this->externalApiService->fetchWeatherAlerts();
        $nasaAlerts = $this->externalApiService->fetchNasaEvents();

        $allExternalAlerts = array_merge($usgsAlerts, $weatherAlerts, $nasaAlerts);

        foreach ($allExternalAlerts as $alertData) {
            // Check if alert already exists
            $existingAlert = DisasterAlert::where('external_id', $alertData['external_id'])
                ->where('source', $alertData['source'])
                ->first();
            
                if (!$existingAlert) {
                    $alert = DisasterAlert::create($alertData);
                    $newAlerts[] = $alert;
                }
        }

        return response()->json([
            'message' => 'External data synced successful',
            'new_alerts' => count($newAlerts),
            'total_processed' => count($allExternalAlerts),
        ]);
    }

    /*
        Get a specific alert
    */
    public function show(DisasterAlert $alert) 
    {
        $alert->load(['user', 'reports.user', 'aiSummary']);
        
        return response()->json($alert);
    }

    /*
        Create a user-reported alert
    */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:earthquake,fload,storm,wildfire,volcanic,tsunami',
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
    }
}
