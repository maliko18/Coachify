<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class SportsData extends Model
{
    use HasFactory;

    protected $table = 'sports_data';

    protected $fillable = [
        'client_id',
        'source',
        'distance_km',
        'duration_minutes',
        'calories',
        'heart_rate_avg',
        'recorded_at',
        'raw_payload',
    ];

    protected $casts = [
        'distance_km' => 'decimal:2',
        'duration_minutes' => 'integer',
        'calories' => 'integer',
        'heart_rate_avg' => 'integer',
        'recorded_at' => 'datetime',
        'raw_payload' => 'array',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function workoutSession(): HasOne
    {
        return $this->hasOne(WorkoutSession::class);
    }
}
