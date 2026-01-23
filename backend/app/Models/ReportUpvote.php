<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportUpvote extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'report_id',
    ];

    // Get the user that upvoted
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Get the report that was upvoted
    public function report(): BelongsTo
    {
        return $this->belongsTo(UserReport::class, 'report_id');
    }
}
