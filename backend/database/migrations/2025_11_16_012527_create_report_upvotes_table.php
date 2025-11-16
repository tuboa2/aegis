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
        Schema::create('report_upvotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cacade');
            $table->foreignId('report_id')->constrained('user_reports')->onDelete('cascade');
            $table->timestamps();

            // Ensure a user can only upvote a report once
            $table->unique(['user_id', 'report_id']);
            $table->index(['report_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_upvotes');
    }
};
