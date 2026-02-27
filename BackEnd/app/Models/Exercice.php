<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exercice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'coach_id',
        'nom',
        'description',
        'consignes',
        'categorie',
        'niveau',
        'materiel',
        'medias',
        'muscles_cibles',
        'duree_estimee',
        'series_defaut',
        'repetitions_defaut',
        'repos_defaut',
        'est_public',
        'est_actif',
    ];

    protected $casts = [
        'materiel' => 'array',
        'medias' => 'array',
        'muscles_cibles' => 'array',
        'est_public' => 'boolean',
        'est_actif' => 'boolean',
    ];

    /**
     * Catégories disponibles
     */
    public const CATEGORIES = [
        'musculation'  => 'Musculation',
        'cardio'       => 'Cardio',
        'stretching'   => 'Stretching',
        'yoga'         => 'Yoga',
        'pilates'      => 'Pilates',
        'crossfit'     => 'CrossFit',
        'boxe'         => 'Boxe',
        'fonctionnel'  => 'Fonctionnel',
        'equilibre'    => 'Équilibre',
        'plyometrie'   => 'Pliométrie',
        'autre'        => 'Autre',
    ];

    /**
     * Niveaux disponibles
     */
    public const NIVEAUX = [
        'debutant'      => 'Débutant',
        'intermediaire' => 'Intermédiaire',
        'avance'        => 'Avancé',
        'expert'        => 'Expert',
    ];

    /**
     * Le coach créateur de l'exercice
     */
    public function coach(): BelongsTo
    {
        return $this->belongsTo(Coach::class);
    }

    /**
     * Obtenir la durée estimée formatée (ex: "1 min 30 s")
     */
    public function getDureeFormateeAttribute(): ?string
    {
        if (!$this->duree_estimee) {
            return null;
        }

        $minutes = intdiv($this->duree_estimee, 60);
        $secondes = $this->duree_estimee % 60;

        if ($minutes > 0 && $secondes > 0) {
            return "{$minutes} min {$secondes} s";
        } elseif ($minutes > 0) {
            return "{$minutes} min";
        }
        return "{$secondes} s";
    }

    /**
     * Scope pour les exercices actifs
     */
    public function scopeActif($query)
    {
        return $query->where('est_actif', true);
    }

    /**
     * Scope pour les exercices publics
     */
    public function scopePublic($query)
    {
        return $query->where('est_public', true)->actif();
    }

    /**
     * Scope pour filtrer par catégorie
     */
    public function scopeCategorie($query, string $categorie)
    {
        return $query->where('categorie', $categorie);
    }

    /**
     * Scope pour filtrer par niveau
     */
    public function scopeNiveau($query, string $niveau)
    {
        return $query->where('niveau', $niveau);
    }

    /**
     * Scope pour les exercices d'un coach
     */
    public function scopeOfCoach($query, int $coachId)
    {
        return $query->where('coach_id', $coachId);
    }

    /**
     * Scope pour filtrer par muscle ciblé
     */
    public function scopeMuscleCible($query, string $muscle)
    {
        return $query->whereJsonContains('muscles_cibles', $muscle);
    }
}
