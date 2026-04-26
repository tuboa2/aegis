<?php

namespace App\Console\Commands;

use App\Services\ExternalApiService;
use App\Models\DisasterAlert;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncDisasterData extends Command
{
    protected $signature = 'aegis:sync-disaster-data {--source= : Sync a specific source only (usgs, gdacs, nws, nasa)}';
    protected $description = 'Sync disaster data from all external APIs (USGS, GDACS, NWS, NASA EONET)';

    protected ExternalApiService $externalApiService;

    public function __construct(ExternalApiService $externalApiService)
    {
        parent::__construct();
        $this->externalApiService = $externalApiService;
    }

    public function handle(): int
    {
        $startTime = microtime(true);
        $this->info('═══════════════════════════════════════════════');
        $this->info('  Aegis Disaster Data Sync - ' . now()->toDateTimeString());
        $this->info('═══════════════════════════════════════════════');

        Log::info('[Sync] Starting disaster data sync cycle');

        $sourceFilter = $this->option('source');

        $sources = [
            'usgs'  => ['name' => 'USGS Earthquakes',  'fn' => fn() => $this->externalApiService->fetchUsgsEarthquakes()],
            'gdacs' => ['name' => 'GDACS Alerts',       'fn' => fn() => $this->externalApiService->fetchGdacsAlerts()],
            'nws'   => ['name' => 'NWS Weather Alerts', 'fn' => fn() => $this->externalApiService->fetchNwsAlerts()],
            'nasa'  => ['name' => 'NASA EONET Events',  'fn' => fn() => $this->externalApiService->fetchNasaEvents()],
        ];

        // Filter to specific source if requested
        if ($sourceFilter && isset($sources[$sourceFilter])) {
            $sources = [$sourceFilter => $sources[$sourceFilter]];
            $this->info("Filtering to source: {$sourceFilter}");
        } elseif ($sourceFilter) {
            $this->error("Unknown source: {$sourceFilter}. Available: " . implode(', ', array_keys($sources)));
            return Command::FAILURE;
        }

        $totalNew = 0;
        $totalSkipped = 0;
        $totalErrors = 0;
        $sourceResults = [];

        foreach ($sources as $key => $source) {
            $this->newLine();
            $this->info("┌─ Fetching from {$source['name']}...");

            try {
                $alerts = ($source['fn'])();
                $newCount = 0;
                $skipCount = 0;
                $errorCount = 0;

                if (empty($alerts)) {
                    $this->warn("│  ⚠ Source returned 0 alerts");
                    Log::warning("[Sync] {$source['name']} returned 0 alerts — possible upstream issue or no active events");
                    $sourceResults[$key] = ['new' => 0, 'skipped' => 0, 'errors' => 0, 'total' => 0, 'status' => 'empty'];
                    continue;
                }

                $this->info("│  Received " . count($alerts) . " alerts, processing...");

                foreach ($alerts as $alertData) {
                    try {
                        // Check for existing alert by external_id + source
                        $existing = DisasterAlert::where('external_id', $alertData['external_id'])
                            ->where('source', $alertData['source'])
                            ->first();

                        if ($existing) {
                            $skipCount++;
                            continue;
                        }

                        // Create new alert
                        $alert = DisasterAlert::create($alertData);
                        $newCount++;

                        // Generate AI summary for high severity alerts
                        if (in_array($alertData['severity'], ['high', 'critical'])) {
                            try {
                                dispatch(function () use ($alert) {
                                    app(\App\Services\AiService::class)->generateAlertSummary($alert);
                                });
                            } catch (\Exception $e) {
                                Log::warning("[Sync] Failed to dispatch AI summary for alert {$alert->id}: {$e->getMessage()}");
                            }
                        }

                        Log::info("[Sync] New alert ingested", [
                            'id' => $alert->id,
                            'title' => $alert->title,
                            'type' => $alert->type,
                            'severity' => $alert->severity,
                            'source' => $alert->source,
                        ]);
                    } catch (\Exception $e) {
                        $errorCount++;
                        Log::error("[Sync] Failed to process alert from {$source['name']}: {$e->getMessage()}", [
                            'alert_external_id' => $alertData['external_id'] ?? 'unknown',
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                $totalNew += $newCount;
                $totalSkipped += $skipCount;
                $totalErrors += $errorCount;

                $sourceResults[$key] = [
                    'new' => $newCount,
                    'skipped' => $skipCount,
                    'errors' => $errorCount,
                    'total' => count($alerts),
                    'status' => $errorCount > 0 ? 'partial' : 'ok',
                ];

                $this->info("│  ✓ {$newCount} new, {$skipCount} duplicates, {$errorCount} errors");
                $this->info("└─ {$source['name']} complete");
            } catch (\Exception $e) {
                $totalErrors++;
                $sourceResults[$key] = ['new' => 0, 'skipped' => 0, 'errors' => 1, 'total' => 0, 'status' => 'failed'];

                $this->error("│  ✗ Error: {$e->getMessage()}");
                $this->info("└─ {$source['name']} failed");
                Log::error("[Sync] Source {$source['name']} completely failed: {$e->getMessage()}");
            }
        }

        // Deactivate expired alerts
        $expiredCount = DisasterAlert::where('is_active', true)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->update(['is_active' => false]);

        if ($expiredCount > 0) {
            $this->info("Deactivated {$expiredCount} expired alerts");
            Log::info("[Sync] Deactivated {$expiredCount} expired alerts");
        }

        // Invalidate statistics cache since we may have new data
        if ($totalNew > 0) {
            Cache::forget('alert_statistics');
            Log::info("[Sync] Invalidated statistics cache after {$totalNew} new alerts");
        }

        // Summary
        $elapsed = round(microtime(true) - $startTime, 2);

        $this->newLine();
        $this->info('═══════════════════════════════════════════════');
        $this->info("  Sync Complete in {$elapsed}s");
        $this->info("  New: {$totalNew} | Skipped: {$totalSkipped} | Errors: {$totalErrors} | Expired: {$expiredCount}");
        $this->info('═══════════════════════════════════════════════');

        Log::info("[Sync] Cycle complete", [
            'elapsed_seconds' => $elapsed,
            'new_alerts' => $totalNew,
            'skipped_duplicates' => $totalSkipped,
            'errors' => $totalErrors,
            'expired_deactivated' => $expiredCount,
            'source_results' => $sourceResults,
        ]);

        // Cache sync health for the ingestion health endpoint
        Cache::put('last_sync_result', [
            'timestamp' => now()->toISOString(),
            'elapsed_seconds' => $elapsed,
            'new_alerts' => $totalNew,
            'total_errors' => $totalErrors,
            'sources' => $sourceResults,
        ], 3600);

        return Command::SUCCESS;
    }
}
