<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'sports_data_id',
        'seance_id',
        'performance_score',
        'matched_at',
    ];

    protected $casts = [
        'performance_score' => 'decimal:2',
        'matched_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function sportsData(): BelongsTo
    {
        return $this->belongsTo(SportsData::class);
    }

    public function seance(): BelongsTo
    {
        return $this->belongsTo(Seance::class);
    }
}
