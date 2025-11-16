<?php

namespace App\Http\Controllers;

use App\Models\DisasterAlert;
use App\Models\AiSummary;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class AIController extends Controller
{
    protected $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    /*
        Generate or retrieve AI summary for an alert
    */
    public function generateSummary(DisasterAlert $alert)
    {
        // Check if summary already exists
        if ($alert->aiSummary) {
            return response()->json([
                'summary' => $alert->aiSummary,
                'from_cache' => true
            ]);
        }

        // Generate new summary
        $analysis = $this->aiService->generateAlertSummary($alert);

        // Store in database
        $aiSummary = AiSummary::create([
            'alert_id' => $alert->id,
            'summary_text' => $analysis['summary'],
            'risk_assessment' => $analysis['risk_assessment'],
            'sources_used' => [$alert->source],
            'key_findings' => $analysis['key_findings'],
            'predictive_insights' => $analysis['predictive_insights'],
            'safety_recommendations' => $analysis['safety_recommendations'],
            'confidence_store' => $analysis['confidence_score'],
            'generated_at' => now(),
        ]);

        return response()->json([
            'summary' => $aiSummary,
            'from_cache' => false
        ]);
    }

    /*
        Get predictive insights for all active alerts
    */
    public function predictiveInsights()
    {
        $cacheKey = 'predictive_insights';
        $insights = Cache::remember($cacheKey, 1800, function () {
            $alerts = DisasterAlert::with('aiSummary')
                ->active()
                ->orderBy('started_at', 'desc')
                ->limit(20)
                ->get();
            
            return $this->aiService->generatePredictiveInsights($alerts->toArray());
        });

        return response()->json($insights);
    }

    /*
        Process natural language query
    */
    public function processQuery(Request $request)
    {
        $request->validate([
            'query' => 'required|string|max:500'
        ]);

        // Get context data
        $alerts = DisasterAlert::active()
            ->orderBy('started_at', 'desc')
            ->limit(10)
            ->get();
        
        $stats = Cache::remember('alert_statistics', 300, function () {
            return [
                'total_active' => DisasterAlert::active()->count(),
                'last_24_hours' => DisasterAlert::where('started_at', '>=', now()->subHours(24))->count(),
                'by_type' => DisasterAlert::active()->selectRaw('type, count(*) as count')->groupBy('type')->get()->pluck('count', 'type'),
                'by_severity' => DisasterAlert::active()->selectRaw('severity, count(*) as count')->groupBy('severity')->get()->pluck('count', 'severity'),
            ];
        });

        $context = [
            'alerts' => $alerts,
            'statistics' => $stats,
            'sources' => ['USGS', 'OpenWeatherMap', 'NASA EONET', 'User Reports']
        ];

        $result = $this->aiService->processNaturalLanguageQuery($request->input('query'), $context);
        
        // Log the query for analytics
        \App\Models\QueryLog::create([
            'query' => $request->query,
            'response' => $result['answer'],
            'confidence' => $result['confidence'],
            'user_id' => $request->user()->id ?? null,
        ]);

        return response()->json($result);
    }

    /*
        Get AI analysis statistics
    */
    public function analysisStats()
    {
        $stats = [
            'total_analyses' => AiSummary::count(),
            'average_confidence' => AiSummary::avg('confidence_score'),
            'analyses_by_risk_level' => AiSummary::selectRaw("JSON_EXTRACT(risk_assessment, '$.overall_risk') as risk_level, COUNT(*) as count")
                ->groupBy('risk_level')
                ->get()
                ->pluck('count', 'risk_level'),
            'recent_analyses' => AiSummary::with('alert')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
        ];
    }

    /*
        Regenerate AI summary for an alert
    */
    public function regenerateSummary(DisasterAlert $alert)
    {
        // Clear any existing cache
        Cache::forget("ai_summary_{$alert->id}");

        // Delete existing summary
        $alert->aiSummary()->delete();

        // Generate new summary
        return $this->generateSummary($alert);
    }
}
