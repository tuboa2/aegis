<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'report_id',
        'content',
        'is_edited',
        'edited_at',
    ];

    protected $casts = [
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
    ];

    // Get the user that wrote the comment
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Get the report this comment belongs to
    public function report(): BelongsTo
    {
        return $this->belongsTo(UserReport::class, 'report_id');
    }
}
