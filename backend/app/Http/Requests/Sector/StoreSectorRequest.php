<?php

namespace App\Http\Requests\Sector;

use Illuminate\Foundation\Http\FormRequest;

class StoreSectorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'threshold_yellow' => ['nullable', 'numeric', 'min:0'],
            'threshold_red' => ['nullable', 'numeric', 'min:0', 'gte:threshold_yellow'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome do setor é obrigatório.',
            'threshold_red.gte' => 'O limite vermelho deve ser maior ou igual ao amarelo.',
        ];
    }
}
