<?php 

namespace App\Services;

use App\Models\DisasterAlert;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class AiService 
{
    protected $apiKey;
    protected $baseUrl = 'https://api.openai.com/v1';

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key');
    }

    /*
        Generate AI summary for a disaster alert
    */
    public function generateAlertSummary(DisasterAlert $alert): array
    {
        $cacheKey = "ai_summary_{$alert->id}";

        // Return cached summary if available (cache for 1 hour)
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $prompt = $this->buildAlertSummaryPrompt($alert);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post($this->baseUrl . '/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert disaster response analyst. Provide concise, accurate analysis of disaster situtations with actionable insights.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.7,
                'max_tokens' => 50
              ]);

              if ($response->successful()) {
                  $content = $response->json()['choices'][0]['message']['content'];
                  $analysis = $this->parseAIAnalysis($content);

                  // Cache the result
                  Cache::put($cacheKey, $analysis, 3600);

                  return $analysis;
              }

              Log::error('OpenAI API request failed: ' . $response->status());
              return $this->getFallbackAnalysis($alert);
        } catch (\Exception $e) {
            Log::error('OpenAI API error: ' . $e->getMessage());
            return $this->getFallbackAnalysis($alert);
        }
    }

    /*
        Build prompt for disaster alert analysis
    */
    private function buildAlertSummaryPrompt(DisasterAlert $alert): string
    {
        $metadata = $alert->metadata ? json_encode($alert->metadata, JSON_PRETTY_PRINT) : 'No additional data';

        return "
            Analyze this disaster alert and provide a comprehensive assessment:

            ALERT INFORMATION:
            - Title: {$alert->title}
            - Description: {$alert->description}
            - Type: {$alert->type} 
            - Severity: {$alert->severity} 
            - Location: {$alert->latitude}, {$alert->longitude} 
            - Radius: {$alert->radius_km} km
            - Started: {$alert->started_at}
            - Source: {$alert->source}

            ADDITIONAL DATA:
            {$metadata}

            Please provide analysis in this JSON format:
            {
                \"summary\": \"Brief overview of the situation\",
                \"risk_assessment\": {
                    \"overall_risk\": \"low/moderate/high/severe/critical\",
                    \"factors\": [\"key risk factor 1\", \"key risk factor 2\"],
                    \"timeline\" \"Expected development timeline\",
                    \"impact_areas\": [\"Primary affected areas\", \"Secondary affected areas\"], 
                },
                \"key_findings\": [\"Important observation 1\", \"Important observation 2\"],
                \"predictive_insights\": {
                    \"short_term\": \"Next 24-48 hours prediction\",
                    \"medium_term\": \"Next 3-7 days outlook\",
                    \"escalation_triggers\": [\"Factors that could worsen situation\"]
                },
                \"safety_recommendations\": [\"Actionable safety advice 1\", \"Actionable safety advice 2\"],
                \"confidence_score\": 0.85
            }
        ";
    }

    /*
        Parse AI response into structured data
    */
    private function parseAIAnalysis(string $content): array
    {
        // Try to extract JSON from the response
        preg_match('/\{.*\}/s', $content, $matches);

        if (isset($matches[0])) {
            $data = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $data;
            }
        }

        // Fallback: create basic structure from text
        return [
            'summary' => $content,
            'risk_assessment' => [
                'overall_risk' => 'unknown',
                'factors' => ['Insufficient data for detailed analysis'],
                'timeline' => 'Unknown',
                'impact_areas' => ['Analysis unavailabale']
            ],
            'key_findings' => ['AI analysis generated summary only'],
            'predictive_insights' => [
                'short_term' => 'Insufficient data for prediction',
                'medium_term' => 'Monitor official source for updates',
                'escalation_triggers' => ['Unkown']
            ],
            'safety_recommendations' => ['Follow local authorities instructions', 'Monitor official news sources'],
            'confidence_score' => 0.3
        ];
    }

    /*
        Fallback analysis when AI service is unavailable
    */
    private function getFallbackAnalysis(DisasterAlert $alert): array
    {
        $severityMap = [
            'low' => 'moderate',
            'medium' => 'high',
            'high' => 'severe',
            'critical' => 'critical'
        ];

        return [
            'summary' => "Automated analysis of {$alert->type} event. {$alert->description}",
            'risk_assessment' => [
                'overall_risk' => $severityMap[$alert->severity] ?? 'moderate',
                'factors' => ['Event severity', 'Affected area size', 'Population density in region'],
                'timeline' => 'Monitor for updates from official sources',
                'impact_areas' => ['Immediate vicinity', 'Nearby regions may be affected']
            ],
            'key_findings' => [
                "{$alert->type} event detected",
                "Severity level: {$alert->severity}",
                "Affected radius: {$alert->radius_km} km"
            ],
            'predictive_insights' => [
                'short_term' => 'Situation may evolve over next 24 hours',
                'medium_term' => 'Continue monitoring regional developments',
                'escalation_triggers' => ['Additional seismic activity', 'Weather changes', 'Infrastructure damage']
            ],
            'safety_recommendations' => [
                'Follow emergency services instructions',
                'Avoid affected areas if possible',
                'Prepare emergency supplies',
                'Monitor official news sources'
            ],
            'confidence_score' => 0.5
        ];
    }

    /*
        Generate predictive insights for multiple alerts
    */
    public function generatePredictiveInsights(array $alerts): array
    {
        if (empty($alerts)) {
            return [
                'trend_analysis' => 'No active alers to analyze',
                'risk_hotspots' => [],
                'emerging_threats' => [],
                'preparedness_advice' => ['Maintain normal preparedness levels']
            ];
        }

        try {
            $prompt = $this->buildPredictivePrompt($alerts);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post($this->baseUrl . '/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a disaster prediction expert. Analyze patterns accross multiple disaster events to identify trends and risks.'
                    ],
                    [
                        'role' => 'user',
                        'message' => $prompt
                    ]
                ],
                'temperature' => 0.7,
                'max_tokens' => 50
            ]);

            if ($response->successful()) {
                return $this->parsePredictiveAnalysis($response->json()['choices'][0]['message']['content']);
            }
    
            // If request failed, fallback
            Log::error('Predictive AI request failed: ' . $response->status());
            return $this->getFallbackPredictiveAnalysis($alerts);
        } catch (\Exception $e) {
            Log::error('Predictive AI analysis error: ' . $e->getMessage());
            return $this->getFallbackPredictiveAnalysis($alerts);
        }
    }

    /*
        Build prompt for predictive analysis
    */
    private function buildPredictivePrompt(array $alerts): string
    {
        $alertSummary = "Active Alerts:\n";
        foreach ($alerts as $index => $alert) {
            $alertSummary .= "{$index}. {$alert->type} - {$alert->severity} - {$alert->title}\n";
        }

        return "
            Analyze these active disaster alerts and provide predictive insights:

            {$alertSummary}

            Provide analysis in JSON format:
            {
                \"trend_analysis\": \"Overall pattern analysis\",
                \"risk_hotspots\": [\"Geographic areas of concern\"],
                \"emerging_threats\": [\"Potential new risks\"],
                \"preparedness_advice\": [\"Regional preparedness recommendations]
            }
        ";
    }

    /*
        Parse predictive analysis response
    */
    private function parsePredictiveAnalysis(string $content): array
    {
        preg_match('/\{.*\}/s', $content, $matches);

        if (isset($matches[0])) {
            $data = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $data;
            }
        }

        return $this->getFallbackPredictiveAnalysis([]);
    }

    /*
        Fallback predictive analysis
    */
    private function getFallbackPredictiveAnalysis(array $alerts): array
    {
        $alertCount = count($alerts);
        $types = array_unique(array_column($alerts, 'type'));
        
        return [
            'trend_analysis' => "Monitoring {$alertCount} active alerts of types: " . implode(', ', $types),
            'risk_hotspots' => ['Areas with multiple overlapping alerts'],
            'emerging_threats' => ['Potential for secondary events following primary disasters'],
            'preparedness_advice' => [
                'Review emergency plans',
                'Ensure communication devices are charged',
                'Monitor local weather and news'
            ]
            ];
    }

    /*
        Process natural language query about disasters
    */
    public function processNaturalLanguageQuery(string $query, array $context): array
    {
        try {
            $prompt = $this->buildQueryPrompt($query, $context);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($this->baseUrl . '/chat/completions', 
                [
                    'model' => 'gpt-3.5-turbo',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are a helpful disaster information assistant. Answer questions based on provided disaster data.'
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt
                        ]
                    ],
                    'temperature' => 0.7,
                    'max_tokens' => 500
            ]);

            if ($response->successful()) {
                return [
                    'answer' => $response->json()['choices'][0]['message']['content'],
                    'sources' => $context['sources'] ?? [],
                    'confidence' => 0.8
                ];
            }

            return [
                'answer' => 'I apologize, but I am unable to process your query at the moment. Please try again later.',
                'sources' => [],
                'confidence' => 0.0
            ];
        } catch (\Exception $e) {
            Log::error('Natural language query error: ' . $e->getMessage());
            return [
                'answer' => 'I encountered an error while processing your question. Please try again.',
                'sources' => [],
                'confidence' => 0.0
            ];
        }
    }

    private function buildQueryPrompt(string $query, array $context): string
    {
        $alertsInfo = "Current Disaster Alerts:\n";
        foreach ($context['alerts'] as $alert) {
            $alertsInfo .= "- {$alert->type} in {$alert->latitude}, {$alert->longitude}: {$alert->title} (Severity: {$alert->severity})\n";
        }

        $stats = $context['statistics'] ?? [];

        return "
            User Question: {$query}

            Context Data:
            {$alertsInfo} 

            Statistics:
            - Total Active Alerts: " . ($stats['total_active'] ?? 0) . "
            - Alerts Last 24h: " . ($stats['last_24_hours'] ?? 0) . "
            - By Type: " . json_encode($stats['by_type'] ?? []) . "
            - By Severity: " . json_encode($stats['by_severity'] ?? []). "

            Please provide a helpful, accurate answer based on this disaster data. If the data doesn't contain relevant information, say so.
        ";
    }
}