<?php

namespace App\Console\Commands;

use App\Services\ExternalApiService;
use App\Models\DisasterAlert;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncDisasterData extends Command
{
    protected $signature = 'aegis:sync-disaster-data';
    protected $description = 'Sync disaster data from external APIs';

    protected $externalApiService;

    public function __construct(ExternalApiService $externalApiService)
    {
        parent::__construct();
        $this->externalApiService = $externalApiService;
    }

    public function handle()
    {
        $this->info('Starting disaster data sync...');

        $sources = [
            'USGS Earthquakes' => fn() => $this->externalApiService->fetchUsgsEarthquakes(),
            'OpenWeatherMap Alerts' => fn() => $this->externalApiService->fetchWeatherAlerts(),
            'NASA EONET Events' => fn() => $this->externalApiService->fetchNasaEvents(),
        ];

        $totalNew = 0;

        foreach ($sources as $sourceName => $fetchFunction) {
            $this->info("Fetching from {$sourceName}...");

            try {
                $alerts = $fetchFunction();
                $newCount = 0;

                foreach ($alerts as $alertData) {
                    $existing = DisasterAlert::where('external_id', $alertData['external_id'])
                        ->where('source', $alertData['source'])
                        ->first();
                    
                    if (!$existing) {
                        DisasterAlert::create($alertData);
                        $newCount++;
                    }

                    // New: Generate AI summary for high severity alerts immediately
                    if (in_array($alertData['severity'], ['high', 'critical'])) {
                        dispatch(function () use ($alertData) {
                            app(\App\Services\AiService::class)->generateAlertSummary($alertData);
                        });
                    }
                }

                $totalNew += $newCount;
                $this->info("{$sourceName}: {$newCount} new alerts");
            } catch (\Exception $e) {
                $this->error("Error fetching from {$sourceName}: " . $e->getMessage());
                Log::error("Disaster data sync error for {$sourceName}: " . $e->getMessage());
            }
        }

        // Deactivate expired alerts
        $expiredCount = DisasterAlert::where('is_active', true)
            ->where('expires_at', '<', now())
            ->update(['is_active' => false]);
        
        $this->info("Deactivated {$expiredCount} expired alerts");
        $this->info("Sync completed. {$totalNew} new alerts added.");

        return Command::SUCCESS;
    }
}
