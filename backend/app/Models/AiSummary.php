<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiSummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'disaster_alert_id',
        'summary_text',
        'risk_assessment',
        'sources_used',
        'key_findings',
        'predictive_insights',
        'safety_recommendations',
        'confidence_score',
        'generated_at',
    ];

    protected $casts = [
        'risk_assessment' => 'array',
        'sources_used' => 'array',
        'key_findings' => 'array',
        'predictive_insights' => 'array',
        'safety_recommendations' => 'array',
        'generated_at' => 'datetime',
        'confidence_score' => 'decimal:2',
    ];

    /*
        Get the alert that owns the AI summary
    */
    public function alert(): BelongsTo
    {
        return $this->belongsTo(DisasterAlert::class, 'alert_id');
    }

    /*
        Get risk level from assessment
    */
    public function getRiskLevelAttribute(): string
    {
        return $this->risk_assessment['overall_risk'] ?? 'unknown';
    }

    /*
        Get risk color for UI
    */
    public function getRiskColorAttribute(): string
    {
        return match($this->risk_level) {
            'low' => 'green',
            'moderate' => 'yellow',
            'high' => 'orange',
            'severe' => 'red',
            'critical' => 'purple',
            default => 'gray',
        };
    }
}
