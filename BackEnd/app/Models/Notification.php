<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'lue',
        'data',
        'unique_key',
    ];

    protected $casts = [
        'lue' => 'boolean',
        'data' => 'array',
    ];

    /**
     * Utilisateur destinataire
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
