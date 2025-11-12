<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QueryLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'query',
        'response',
        'confidence',
        'user_id',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'confidence' => 'decimal:2',
    ];

    /*
        Get the user that made the query
    */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
