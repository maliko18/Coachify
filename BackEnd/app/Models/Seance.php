<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Seance extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'coach_id',
        'titre',
        'date',
        'heure_debut',
        'duree',
        'type',
        'capacite_max',
        'statut',
        'lieu',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'capacite_max' => 'integer',
        'duree' => 'integer',
    ];

    /**
     * Types de séances disponibles
     */
    public const TYPES = ['individuelle', 'collective', 'en_ligne'];

    /**
     * Statuts possibles d'une séance
     */
    public const STATUTS = ['planifiee', 'en_cours', 'terminee', 'annulee'];

    /**
     * Statuts de présence possibles
     */
    public const STATUTS_PRESENCE = ['inscrit', 'present', 'absent', 'excuse'];

    /**
     * Le coach responsable de la séance
     */
    public function coach(): BelongsTo
    {
        return $this->belongsTo(Coach::class);
    }

    /**
     * Les clients inscrits à la séance (pivot seance_client)
     */
    public function clients(): BelongsToMany
    {
        return $this->belongsToMany(Client::class, 'seance_client')
                    ->withPivot(['statut_presence', 'feedback_client', 'feedback_coach', 'note'])
                    ->withTimestamps();
    }

    /**
     * Vérifier si la séance est complète
     */
    public function estComplete(): bool
    {
        return $this->clients()->count() >= $this->capacite_max;
    }

    /**
     * Obtenir le nombre de places restantes
     */
    public function getPlacesRestantesAttribute(): int
    {
        return max(0, $this->capacite_max - $this->clients()->count());
    }

    /**
     * Vérifier si un client est déjà inscrit
     */
    public function clientEstInscrit(int $clientId): bool
    {
        return $this->clients()->where('client_id', $clientId)->exists();
    }

    /**
     * Scope : séances planifiées
     */
    public function scopePlanifiee($query)
    {
        return $query->where('statut', 'planifiee');
    }

    /**
     * Scope : séances à venir
     */
    public function scopeAVenir($query)
    {
        return $query->where('date', '>=', now()->toDateString());
    }

    /**
     * Scope : séances d'un coach
     */
    public function scopeDuCoach($query, int $coachId)
    {
        return $query->where('coach_id', $coachId);
    }

    /**
     * Scope : séances par type
     */
    public function scopeDeType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
