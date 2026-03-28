<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Commande extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUTS = ['attente', 'envoye', 'livre', 'annule'];

    protected $fillable = [
        'client_id',
        'coach_id',
        'date_commande',
        'statut',
        'total',
    ];

    protected $casts = [
        'date_commande' => 'datetime',
        'total' => 'decimal:2',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function coach(): BelongsTo
    {
        return $this->belongsTo(Coach::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CommandeItem::class);
    }

    public function canTransitionTo(string $newStatut): bool
    {
        if (!in_array($newStatut, self::STATUTS, true)) {
            return false;
        }

        return match ($this->statut) {
            'attente' => in_array($newStatut, ['envoye', 'annule'], true),
            'envoye' => in_array($newStatut, ['livre', 'annule'], true),
            default => false,
        };
    }
}
