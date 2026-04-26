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
        Schema::table('user_reports', function (Blueprint $table) {
            // New columns for community features
            $table->integer('upvotes_count')->default(0);
            $table->integer('comments_count')->default(0);
            $table->boolean('is_public')->default(true);
            $table->string('location_name')->nullable();
            $table->text('contact_info')->nullable();
            $table->timestamp('verified_at')->nullable();

            // Indexes for performance
            $table->index(['status', 'is_public']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_reports', function (Blueprint $table) {
            $table->dropColumn([
                'upvotes_count',
                'comments_count',
                'is_public',
                'location_name',
                'contact_info',
                'verified_at'
            ]);

            $table->dropIndex(['status', 'is_public']);
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropIndex(['latitude', 'longitude']);
        });
    }
};
