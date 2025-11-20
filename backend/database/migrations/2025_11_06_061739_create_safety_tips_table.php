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
        Schema::create('safety_tips', function (Blueprint $table) {
            $table->id();
            $table->enum('disaster_type', ['earthquake', 'flood', 'storm', 'wildfire', 'other']);
            $table->enum('severity_level', ['low', 'medium', 'high', 'critical']);
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->text('short_description')->nullable();
            $table->string('source')->nullable();
            $table->boolean('is_active')->nullable();
            $table->integer('order')->nullable();
            $table->json('tags')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('safety_tips');
    }
};
