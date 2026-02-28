<?php

namespace App\Http\Requests;

use App\Models\Facture;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFactureRequest extends FormRequest
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
            'client_id' => ['sometimes', 'integer', 'exists:clients,id'],
            'montant_ht' => ['sometimes', 'numeric', 'min:0.01', 'max:99999.99'],
            'tva' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'date_emission' => ['sometimes', 'date'],
            'date_echeance' => ['sometimes', 'date', 'after_or_equal:date_emission'],
            'statut' => ['sometimes', 'string', Rule::in(array_keys(Facture::STATUTS))],
            'notes' => ['nullable', 'string', 'max:1000'],
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
            'client_id.exists' => 'Le client sélectionné n\'existe pas.',
            'montant_ht.min' => 'Le montant HT doit être supérieur à 0.',
            'date_echeance.after_or_equal' => 'La date d\'échéance doit être égale ou postérieure à la date d\'émission.',
            'statut.in' => 'Le statut n\'est pas valide.',
        ];
    }
}
