<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Programme extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'coach_id',
        'titre',
        'description',
        'duree_semaines',
        'type',
        'statut',
        'prix',
    ];

    protected $casts = [
        'duree_semaines' => 'integer',
        'prix' => 'decimal:2',
    ];

    /**
     * Types de programmes disponibles
     */
    public const TYPES = [
        'perte_de_poids',
        'prise_de_masse',
        'remise_en_forme',
        'endurance',
        'force',
        'personnalise',
    ];

    /**
     * Statuts possibles d'un programme
     */
    public const STATUTS = ['brouillon', 'publie', 'archive'];

    /**
     * Jours de la semaine
     */
    public const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

    /**
     * Le coach créateur du programme
     */
    public function coach(): BelongsTo
    {
        return $this->belongsTo(Coach::class);
    }

    /**
     * Les exercices du programme (pivot programme_exercice)
     */
    public function exercices(): BelongsToMany
    {
        return $this->belongsToMany(Exercice::class, 'programme_exercice')
                    ->withPivot(['ordre', 'semaine', 'jour', 'sets', 'reps', 'repos', 'notes'])
                    ->withTimestamps()
                    ->orderByPivot('semaine')
                    ->orderByPivot('ordre');
    }

    /**
     * Publier le programme (brouillon → publié)
     */
    public function publier(): bool
    {
        if ($this->statut === 'brouillon') {
            return $this->update(['statut' => 'publie']);
        }
        return false;
    }

    /**
     * Archiver le programme
     */
    public function archiver(): bool
    {
        return $this->update(['statut' => 'archive']);
    }

    /**
     * Remettre en brouillon
     */
    public function depublier(): bool
    {
        if ($this->statut === 'publie') {
            return $this->update(['statut' => 'brouillon']);
        }
        return false;
    }

    /**
     * Vérifier si le programme est publiable (a au moins 1 exercice)
     */
    public function estPubliable(): bool
    {
        return $this->exercices()->count() > 0;
    }

    /**
     * Scope : programmes publiés
     */
    public function scopePublie($query)
    {
        return $query->where('statut', 'publie');
    }

    /**
     * Scope : programmes en brouillon
     */
    public function scopeBrouillon($query)
    {
        return $query->where('statut', 'brouillon');
    }

    /**
     * Scope : programmes d'un coach
     */
    public function scopeDuCoach($query, int $coachId)
    {
        return $query->where('coach_id', $coachId);
    }

    /**
     * Scope : programmes par type
     */
    public function scopeDeType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
