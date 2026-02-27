<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ExerciceCollection extends ResourceCollection
{
    /**
     * The resource that this resource collects.
     */
    public $collects = ExerciceResource::class;

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
                'categories' => $this->collection->pluck('categorie')->unique()->values(),
                'niveaux' => $this->collection->pluck('niveau')->unique()->values(),
            ],
        ];
    }
}
