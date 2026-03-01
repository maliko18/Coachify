<?php

namespace App\Http\Requests;

use App\Models\Programme;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProgrammeRequest extends FormRequest
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
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'duree_semaines' => ['required', 'integer', 'min:1', 'max:52'],
            'type' => ['required', 'string', Rule::in(Programme::TYPES)],
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
            'titre.required' => 'Le titre du programme est obligatoire.',
            'titre.max' => 'Le titre ne peut pas dépasser 255 caractères.',
            'duree_semaines.required' => 'La durée en semaines est obligatoire.',
            'duree_semaines.min' => 'La durée doit être d\'au moins 1 semaine.',
            'duree_semaines.max' => 'La durée ne peut pas dépasser 52 semaines.',
            'type.required' => 'Le type de programme est obligatoire.',
            'type.in' => 'Le type de programme n\'est pas valide.',
            'statut.in' => 'Le statut n\'est pas valide.',
            'prix.numeric' => 'Le prix doit être un nombre.',
            'prix.min' => 'Le prix ne peut pas être négatif.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Par défaut, le statut est brouillon
        if (!$this->has('statut')) {
            $this->merge([
                'statut' => 'brouillon',
            ]);
        }
    }
}
