<?php

namespace App\Http\Requests;

use App\Models\Seance;
use Illuminate\Foundation\Http\FormRequest;

class StoreSeanceRequest extends FormRequest
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
            'titre'        => 'required|string|max:255',
            'date'         => 'required|date|after_or_equal:today',
            'heure_debut'  => 'required|date_format:H:i',
            'duree'        => 'required|integer|min:15|max:480',
            'type'         => 'required|in:' . implode(',', Seance::TYPES),
            'capacite_max' => 'required|integer|min:1|max:50',
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
            'titre.required'       => 'Le titre de la séance est obligatoire.',
            'date.required'        => 'La date de la séance est obligatoire.',
            'date.after_or_equal'  => 'La date de la séance doit être aujourd\'hui ou dans le futur.',
            'heure_debut.required' => 'L\'heure de début est obligatoire.',
            'heure_debut.date_format' => 'L\'heure de début doit être au format HH:MM.',
            'duree.required'       => 'La durée est obligatoire.',
            'duree.min'            => 'La durée minimale est de 15 minutes.',
            'duree.max'            => 'La durée maximale est de 480 minutes (8h).',
            'type.required'        => 'Le type de séance est obligatoire.',
            'type.in'              => 'Le type doit être : individuelle, collective ou en_ligne.',
            'capacite_max.required' => 'La capacité maximale est obligatoire.',
            'capacite_max.min'     => 'La capacité minimale est de 1 personne.',
            'capacite_max.max'     => 'La capacité maximale est de 50 personnes.',
        ];
    }
}
