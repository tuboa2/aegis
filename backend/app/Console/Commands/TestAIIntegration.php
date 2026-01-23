<?php

namespace App\Console\Commands;

use App\Models\DisasterAlert;
use App\Services\AIService;
use Illuminate\Console\Command;

class TestAIIntegration extends Command
{
    protected $signature = 'aegis:test-ai';
    protected $description = 'Test AI integration with sample data';

    protected $aiService;

    public function __construct(AIService $aiService)
    {
        parent::__construct();
        $this->aiService = $aiService;
    }

    public function handle()
    {
        $this->info('Testing AI integration...');

        // Get a sample alert
        $alert = DisasterAlert::first();

        if (!$alert) {
            $this->error('No alerts found. Please seed the database first.');
            return;
        }

        $this->info("Testing AI summary for alert: {$alert->title}");

        $summary = $this->aiService->generateAlertSummary($alert);

        $this->info("Summary generated successfully!");
        $this->info("Risk Level: " . ($summary['risk_assessment']['overall_risk'] ?? 'Unknown'));
        $this->info("Confidence: " . (($summary['confidence'] ?? 0) * 100) . '%');

        return Command::SUCCESS;
    }
}