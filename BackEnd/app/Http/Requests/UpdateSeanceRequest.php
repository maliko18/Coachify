<?php

namespace App\Http\Requests;

use App\Models\Seance;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSeanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Géré par le middleware is_coach
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titre'        => 'sometimes|string|max:255',
            'date'         => 'sometimes|date|after_or_equal:today',
            'heure_debut'  => 'sometimes|date_format:H:i',
            'duree'        => 'sometimes|integer|min:15|max:480',
            'type'         => 'sometimes|in:' . implode(',', Seance::TYPES),
            'capacite_max' => 'sometimes|integer|min:1|max:50',
            'statut'       => 'sometimes|in:' . implode(',', Seance::STATUTS),
            'lieu'         => 'nullable|string|max:255',
            'notes'        => 'nullable|string|max:2000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'date.after_or_equal'  => 'La date de la séance doit être aujourd\'hui ou dans le futur.',
            'heure_debut.date_format' => 'L\'heure de début doit être au format HH:MM.',
            'duree.min'            => 'La durée minimale est de 15 minutes.',
            'duree.max'            => 'La durée maximale est de 480 minutes (8h).',
            'type.in'              => 'Le type doit être : individuelle, collective ou en_ligne.',
            'statut.in'            => 'Le statut doit être : planifiee, en_cours, terminee ou annulee.',
            'capacite_max.min'     => 'La capacité minimale est de 1 personne.',
            'capacite_max.max'     => 'La capacité maximale est de 50 personnes.',
        ];
    }
}
