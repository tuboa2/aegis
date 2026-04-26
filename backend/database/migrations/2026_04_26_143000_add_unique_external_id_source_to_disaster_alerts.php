<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add unique composite index on external_id + source to prevent duplicate
     * alert ingestion during race conditions or overlapping sync cycles.
     */
    public function up(): void
    {
        Schema::table('disaster_alerts', function (Blueprint $table) {
            // Unique constraint prevents duplicate external alerts
            // external_id can be null for user-reported alerts, so this only
            // applies when external_id is set (PostgreSQL handles this correctly)
            $table->unique(['external_id', 'source'], 'disaster_alerts_external_source_unique');
        });
    }

    public function down(): void
    {
        Schema::table('disaster_alerts', function (Blueprint $table) {
            $table->dropUnique('disaster_alerts_external_source_unique');
        });
    }
};
