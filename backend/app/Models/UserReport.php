<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\DisasterAlert;
use App\Models\User;

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
    ];

    protected $casts = [
        'media_urls' => 'array',
    ];

    // 🔹 Relationships

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
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}