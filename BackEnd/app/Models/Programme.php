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
     * Ajouter un exercice au programme.
     *
     * @param int $exerciceId
     * @param int $ordre
     * @param array<string, mixed> $details
     */
    public function ajouterExercice(int $exerciceId, int $ordre = 1, array $details = []): void
    {
        $exercice = Exercice::query()->find($exerciceId);

        if (!$exercice) {
            throw new \InvalidArgumentException('Exercice introuvable.');
        }

        if ($exercice->coach_id !== $this->coach_id) {
            throw new \InvalidArgumentException('Un programme ne peut contenir que des exercices du meme coach.');
        }

        $pivotData = [
            'ordre' => $ordre,
            'semaine' => (int) ($details['semaine'] ?? 1),
            'jour' => $details['jour'] ?? null,
            'sets' => $details['sets'] ?? null,
            'reps' => $details['reps'] ?? null,
            'repos' => $details['repos'] ?? null,
            'notes' => $details['notes'] ?? null,
        ];

        if ($pivotData['jour'] !== null && !in_array($pivotData['jour'], self::JOURS, true)) {
            throw new \InvalidArgumentException('Jour invalide pour le programme.');
        }

        $existeDeja = $this->exercices()
            ->where('exercice_id', $exerciceId)
            ->wherePivot('semaine', $pivotData['semaine'])
            ->wherePivot('jour', $pivotData['jour'])
            ->exists();

        if ($existeDeja) {
            throw new \InvalidArgumentException('Cet exercice existe deja pour cette semaine/jour.');
        }

        $this->exercices()->attach($exerciceId, $pivotData);
    }

    /**
     * Alias attendu par l'issue (#17)
     *
     * @param int $exerciceId
     * @param int $ordre
     * @param array<string, mixed> $details
     */
    public function ajouter_exercice(int $exerciceId, int $ordre = 1, array $details = []): void
    {
        $this->ajouterExercice($exerciceId, $ordre, $details);
    }

    /**
     * Retirer un exercice du programme.
     */
    public function retirerExercice(int $exerciceId): void
    {
        $this->exercices()->detach($exerciceId);
    }

    /**
     * Alias attendu par l'issue (#17)
     */
    public function retirer_exercice(int $exerciceId): void
    {
        $this->retirerExercice($exerciceId);
    }

    /**
     * Publier le programme (brouillon → publié)
     */
    public function publier(): bool
    {
        if ($this->statut !== 'brouillon') {
            return false;
        }

        if (!$this->estPubliable()) {
            return false;
        }

        return $this->update(['statut' => 'publie']);
    }

    /**
     * Alias attendu par l'issue (#17)
     */
    public function publier_programme(): bool
    {
        return $this->publier();
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
     * Retourner les exercices groupés par semaine.
     *
     * @return \Illuminate\Support\Collection<int, \Illuminate\Support\Collection<int, Exercice>>
     */
    public function getExercicesParSemaine()
    {
        return $this->exercices()
            ->get()
            ->groupBy(fn ($exercice) => (int) $exercice->pivot->semaine)
            ->sortKeys();
    }

    /**
     * Alias attendu par l'issue (#17)
     *
     * @return \Illuminate\Support\Collection<int, \Illuminate\Support\Collection<int, Exercice>>
     */
    public function get_exercices_par_semaine()
    {
        return $this->getExercicesParSemaine();
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
