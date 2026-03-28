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
                    ->withPivot(['statut_presence', 'en_liste_attente', 'feedback_client', 'feedback_coach', 'note'])
                    ->withTimestamps();
    }

    /**
     * Vérifier si la séance est complète
     */
    public function estComplete(): bool
    {
        return $this->clientsInscrits()->count() >= $this->capacite_max;
    }

    /**
     * Obtenir le nombre de places restantes
     */
    public function getPlacesRestantesAttribute(): int
    {
        return max(0, $this->capacite_max - $this->clientsInscrits()->count());
    }

    /**
     * Vérifier si un client est déjà inscrit
     */
    public function clientEstInscrit(int $clientId): bool
    {
        return $this->clients()->where('client_id', $clientId)->exists();
    }

    /**
     * Relation des clients confirmés (hors liste d'attente)
     */
    public function clientsInscrits(): BelongsToMany
    {
        return $this->clients()->wherePivot('en_liste_attente', false);
    }

    /**
     * Marquer la présence d'un client inscrit
     */
    public function marquerPresence(int $clientId, string $statut): void
    {
        if (!in_array($statut, ['present', 'absent', 'excuse'], true)) {
            throw new \InvalidArgumentException('Statut de présence invalide.');
        }

        if (!$this->clientEstInscrit($clientId)) {
            throw new \InvalidArgumentException('Client non inscrit à cette séance.');
        }

        $this->clients()->updateExistingPivot($clientId, [
            'statut_presence' => $statut,
            'en_liste_attente' => false,
        ]);
    }

    /**
     * Alias attendu par l'issue (#16)
     */
    public function marquer_presence(int $clientId, string $statut): void
    {
        $this->marquerPresence($clientId, $statut);
    }

    /**
     * Clients présents
     */
    public function getParticipants()
    {
        return $this->clients()
            ->wherePivot('en_liste_attente', false)
            ->wherePivot('statut_presence', 'present')
            ->get();
    }

    /**
     * Alias attendu par l'issue (#16)
     */
    public function get_participants()
    {
        return $this->getParticipants();
    }

    /**
     * Clients absents (inclut absents et excusés)
     */
    public function getAbsents()
    {
        return $this->clients()
            ->wherePivot('en_liste_attente', false)
            ->wherePivotIn('statut_presence', ['absent', 'excuse'])
            ->get();
    }

    /**
     * Alias attendu par l'issue (#16)
     */
    public function get_absents()
    {
        return $this->getAbsents();
    }

    /**
     * Clients en liste d'attente
     */
    public function getWaitingList()
    {
        return $this->clients()
            ->wherePivot('en_liste_attente', true)
            ->orderByPivot('created_at')
            ->get();
    }

    /**
     * Alias attendu par l'issue (#16)
     */
    public function get_waiting_list()
    {
        return $this->getWaitingList();
    }

    /**
     * Capacité restante réelle (hors waiting list)
     */
    public function capaciteRestante(): int
    {
        return max(0, $this->capacite_max - $this->clientsInscrits()->count());
    }

    /**
     * Alias attendu par l'issue (#16)
     */
    public function capacite_restante(): int
    {
        return $this->capaciteRestante();
    }

    /**
     * Inscrire un client en confirmé ou en liste d'attente
     */
    public function inscrireClientAvecWaitingList(int $clientId): string
    {
        if ($this->clientEstInscrit($clientId)) {
            throw new \InvalidArgumentException('Client déjà inscrit à cette séance.');
        }

        $enListeAttente = $this->estComplete();

        $this->clients()->attach($clientId, [
            'statut_presence' => 'inscrit',
            'en_liste_attente' => $enListeAttente,
        ]);

        return $enListeAttente ? 'liste_attente' : 'inscrit';
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
