<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AjouterExerciceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'exercice_id' => ['required', 'integer', 'exists:exercices,id'],
            'ordre' => ['sometimes', 'integer', 'min:1'],
            'jour_semaine' => ['required', 'string', Rule::in(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'])],
            'series' => ['required', 'integer', 'min:1', 'max:20'],
            'repetitions' => ['nullable', 'integer', 'min:1', 'max:100'],
            'duree_minutes' => ['nullable', 'integer', 'min:1', 'max:120'],
            'repos_secondes' => ['required', 'integer', 'min:0', 'max:600'],
            'instructions' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'exercice_id.required' => 'L\'identifiant de l\'exercice est obligatoire.',
            'exercice_id.exists' => 'L\'exercice sélectionné n\'existe pas.',
            'jour_semaine.required' => 'Le jour de la semaine est obligatoire.',
            'jour_semaine.in' => 'Le jour de la semaine n\'est pas valide.',
            'series.required' => 'Le nombre de séries est obligatoire.',
            'series.min' => 'Le nombre de séries doit être au moins 1.',
            'series.max' => 'Le nombre de séries ne peut pas dépasser 20.',
            'repetitions.min' => 'Le nombre de répétitions doit être au moins 1.',
            'repos_secondes.required' => 'Le temps de repos est obligatoire.',
            'repos_secondes.max' => 'Le temps de repos ne peut pas dépasser 10 minutes (600 secondes).',
            'instructions.max' => 'Les instructions ne peuvent pas dépasser 1000 caractères.',
        ];
    }
}
