<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'coach_id',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function coach(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderByDesc('sent_at');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId)
            ->orWhere('coach_id', $userId);
    }

    public function hasParticipant(int $userId): bool
    {
        return $this->user_id === $userId || $this->coach_id === $userId;
    }
}
