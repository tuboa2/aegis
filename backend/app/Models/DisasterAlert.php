<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DisasterAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'type',
        'severity',
        'latitude',
        'longitude',
        'radius_km',
        'source',
        'external_id',
        'started_at',
        'expires_at',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'radius_km' => 'decimal:2',
        'metadata' => 'array',
    ];

    // Disaster type constants
    const TYPE_EARTHQUAKE = 'earthquake';
    const TYPE_FLOOD = 'flood';
    const TYPE_STORM = 'storm';
    const TYPE_WILDFIRE = 'wildfire';
    const TYPE_VOLCANIC = 'volcanic';
    const TYPE_TSUNAMI = 'tsunami';

    // Severity constants
    const SEVERITY_LOW = 'low';
    const SEVERITY_MEDIUM = 'medium';
    const SEVERITY_HIGH = 'high';
    const SEVERITY_CRITICAL = 'critical';

    // Source constants
    const SOURCE_OPENWEATHER = 'openweather';
    const SOURCE_USGS = 'usgs';
    const SOURCE_PHIVOLCS = 'phivolcs';
    const SOURCE_NASA = 'nasa';
    const SOURCE_USER_REPORT = 'user_report';

    /*
        Get the user that created the alert (if user-reported)
    */
    public function user(): BelongsTo 
    {
        return $this->belongsTo(User::class);
    }

    /*
        Get related user reports
    */
    public function reports(): HasMany
    {
        return $this->hasMany(UserReport::class);
    }

    /*
        Get AI Summary for this alert
    */
    /*public function aiSummary(): HasOne
    {
        return $this->hasOne(AiSummary::class);
    }
    */
    /*
        Scope active alerts
    */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        });
    }

    /*
        Scope by severity
    */
    public function scopeSeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    /*
        Scope by type
    */
    public function scopeType($query, $type)
    {
        return $query->where('type', $type);
    }

    /*
        Get severity color
    */
    public function getSeverityColorAttribute(): string
    {
        return match($this->severity) {
            self::SEVERITY_LOW => 'green',
            self::SEVERITY_MEDIUM => 'yellow',
            self::SEVERITY_HIGH => 'orange',
            self::SEVERITY_CRITICAL => 'red',
            default => 'gray',
        };
    }

    /*
        Get disaster type icon
    */
    public function getTypeIconAttribute(): string
    {
        return match($this->type) {
            self::TYPE_EARTHQUAKE => '🏞️',
            self::TYPE_FLOOD => '🌊',
            self::TYPE_WILDFIRE => '🔥',
            self::TYPE_VOLCANIC => '🌋',
            self::TYPE_TSUNAMI => '🌋',
            default => '⚠️',
        };
    }
}
