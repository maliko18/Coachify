<?php

namespace App\Http\Requests;

use App\Models\Programme;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProgrammeRequest extends FormRequest
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
            'titre' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'duree_semaines' => ['sometimes', 'integer', 'min:1', 'max:52'],
            'type' => ['sometimes', 'string', Rule::in(Programme::TYPES)],
            'statut' => ['sometimes', 'string', Rule::in(Programme::STATUTS)],
            'prix' => ['nullable', 'numeric', 'min:0', 'max:9999.99'],
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
            'titre.max' => 'Le titre ne peut pas dépasser 255 caractères.',
            'duree_semaines.min' => 'La durée doit être d\'au moins 1 semaine.',
            'duree_semaines.max' => 'La durée ne peut pas dépasser 52 semaines.',
            'type.in' => 'Le type de programme n\'est pas valide.',
            'statut.in' => 'Le statut n\'est pas valide.',
            'prix.numeric' => 'Le prix doit être un nombre.',
            'prix.min' => 'Le prix ne peut pas être négatif.',
        ];
    }
}
