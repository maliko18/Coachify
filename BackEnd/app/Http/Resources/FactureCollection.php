<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class FactureCollection extends ResourceCollection
{
    /**
     * The resource that this resource collects.
     *
     * @var string
     */
    public $collects = FactureResource::class;

    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total' => $this->collection->count(),
                'total_ht' => $this->collection->sum(fn($f) => (float) $f->montant_ht),
                'total_ttc' => $this->collection->sum(fn($f) => (float) $f->montant_ttc),
                'statuts' => $this->collection->pluck('statut')->unique()->values(),
                'en_retard' => $this->collection->filter(fn($f) => $f->resource->estEnRetard())->count(),
            ],
        ];
    }
}
