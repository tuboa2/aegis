<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('disaster_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->enum('type', ['earthquake', 'flood', 'storm', 'wildfire', 'volcanic', 'tsunami']);
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->decimal('radius_km', 8, 2)->default(10);
            $table->enum('source', ['openweather', 'usgs', 'phivolcs', 'nasa', 'user_report']);
            $table->string('external_id')->nullable();
            $table->timestamp('started_at');
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['type', 'is_active']);
            $table->index(['latitude', 'longitude']);
            $table->index(['started_at']);
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('disaster_alerts');
    }
};
