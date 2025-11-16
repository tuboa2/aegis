<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SafetyTip extends Model
{
    use HasFactory;

    protected $fillable = [
        'disaster_type',
        'severity_level',
        'title',
        'content',
        'short_description',
        'image_url',
        'video_url',
        'source',
        'source_url',
        'is_active',
        'order',
        'tags',
    ];

    // Disaster type constants
    const TYPE_EARTHQUAKE = 'earthquake';
    const TYPE_FLOOD = 'flood';
    const TYPE_STORM = 'storm';
    const TYPE_WILDFIRE = 'wildfire';
    const TYPE_VOLCANIC = 'volcanic';
    const TYPE_TSUNAMI = 'tsunami';
    const TYPE_GENERAL = 'general';

    // Severity level constants
    const SEVERITY_BASIC = 'basic';
    const SEVERITY_MODERATE = 'moderate';
    const SEVERITY_EXTREME = 'extreme';

    // Scope active tips
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope by disaster type
    public function scopeType($query, $type)
    {
        return $query->where('disaster_type', $type);
    }

    // Scope by severity level
    public function scopeSeverity($query, $severity)
    {
        return $query->where('severity_level', $severity);
    }

    // Get related disaster type icon
    public function getTypeIconAttribute(): string
    {
        return match($this->disaster_type) {
            self::TYPE_EARTHQUAKE => '🌋',
            self::TYPE_FLOOD => '🌊',
            self::TYPE_STORM => '⛈️',
            self::TYPE_WILDFIRE => '🔥',
            self::TYPE_VOLCANIC => '🌋',
            self::TYPE_TSUNAMI => '🌊',
            default => '📚',
        };
    }
}
