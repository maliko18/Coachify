<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Produit extends Model
{
    use HasFactory, SoftDeletes;

    public const TYPES = ['physique', 'numerique', 'service'];

    protected $fillable = [
        'coach_id',
        'nom',
        'description',
        'type',
        'prix',
        'stock_quantite',
        'alerte_stock',
        'visible',
    ];

    protected $casts = [
        'prix' => 'decimal:2',
        'stock_quantite' => 'integer',
        'alerte_stock' => 'integer',
        'visible' => 'boolean',
    ];

    public function coach(): BelongsTo
    {
        return $this->belongsTo(Coach::class);
    }

    public function commandeItems(): HasMany
    {
        return $this->hasMany(CommandeItem::class);
    }

    public function isLowStock(): bool
    {
        return $this->stock_quantite < $this->alerte_stock;
    }

    public function decrementStock(int $quantite): void
    {
        if ($quantite <= 0) {
            throw new \InvalidArgumentException('La quantité doit être positive.');
        }

        if ($this->stock_quantite < $quantite) {
            throw new \InvalidArgumentException('Stock insuffisant pour ce produit.');
        }

        $this->stock_quantite -= $quantite;
        $this->save();
    }
}
