<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('disaster_alert_id')->nullable()->constrained('disaster_alerts')->onDelete('cascade');
            $table->text('summary_text')->nullable();
            $table->json('risk_assessment')->nullable(); // New: { overall_risk, factors, timeline, impact_areas }
            $table->json('sources_used')->nullable();
            $table->json('key_findings'); // New: Key insights and patterns
            $table->json('predictive_insights'); // New: Future predictions and trends
            $table->json('safety_recommendations'); // New: Actionable safety advice
            $table->decimal('confidence_score', 3, 2)->default(0.00); // New: 0.00 to 1.00
            $table->timestamp('generated_at')->useCurrent();
            $table->timestamps();

            $table->index(['disaster_alert_id']);
            $table->index(['confidence_score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_summaries');
    }
};
