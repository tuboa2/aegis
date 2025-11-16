<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\DisasterAlert;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'alert_id',
        'title',
        'description',
        'type',
        'media_urls',
        'status',
        'verified_by',
        'verified_at',
        'upvotes_count',
        'comments_count',
        'is_public',
        'location_name',
        'contact_info',
    ];

    protected $casts = [
        'media_urls' => 'array',
        'verified_at' => 'datetime',
        'is_public' => 'boolean',
        'upvotes_count' => 'integer',
        'comments_count' => 'integer',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal: 8',
    ];

    // Report status constants
    const STATUS_PENDING = 'pending';
    const STATUS_VERIFIED = 'verified';
    const STATUS_REJECTED = 'rejected';
    const STATUS_DUPLICATE = 'duplicate';

    // Disaster type constants
    const TYPE_EARTHQUAKE = 'earthquake';
    const TYPE_FLOOD = 'flood';
    const TYPE_STORM = 'storm';
    const TYPE_WILDFIRE = 'wildfire';
    const TYPE_VOLCANIC = 'volcanic';
    const TYPE_TSUNAMI = 'tsunami';
    const TYPE_OTHER = 'other';

    // Severity constants
    const SEVERITY_LOW = 'low';
    const SEVERITY_MEDIUM = 'medium';
    const SEVERITY_HIGH = 'high';
    const SEVERITY_CRITICAL = 'critical';


    // The user who submitted the report
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // The disaster alert this report is linked to
    public function alert()
    {
        return $this->belongsTo(DisasterAlert::class, 'alert_id');
    }

    // The user who verified the report
    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // Get comments for this report
    public function comments(): HasMany
    {
        return $this->hasMany(ReportComment::class);
    }

    // Get upvotes for this report
    public function upvotes(): HasMany
    {
        return $this->hasMany(ReportUpvote::class);
    }

    // Check if report is verified
    public function getIsVerifiedAttribute(): bool
    {
        return $this->status === self::STATUS_VERIFIED;
    }

    // Get severity color for ui
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

    // Scope public reports
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    // Scope verified reports
    public function scopeVerified($query)
    {
        return $query->where('status', self::STATUS_VERIFIED);
    }

    // Scope by type
    public function scopeType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Scope by location (within radius)
    public function scopeNearby($query, $lat, $lng, $radiusKm = 50)
    {
        $earthRadius = 6371; // km

        return $query->selectRaw("
            *,
            ({$earthRadius} * 
            ACOS(COS(RADIANS(?)) * 
            COS(RADIANS(latitude)) * 
            COS(RADIANS(longitude) - 
            RADIANS(?)) +
            SIN(RADIANS(?)) *
            SIN(RADIANS(latitude)
            )) AS distance
        ", [$lat, $lng, $lat])
        ->havingRaw('distance < ?', [$radiusKm])
        ->orderBy('distance');
    }
}