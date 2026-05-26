<?php

namespace App\Http\Requests\Device;

use App\Models\Sector;
use Illuminate\Foundation\Http\FormRequest;

class StoreDeviceRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Verifica se o setor pertence ao usuário
        $sector = Sector::find($this->sector_id);
        return $sector && $sector->user_id === $this->user()->id;
    }

    public function rules(): array
    {
        return [
            'sector_id' => ['required', 'integer', 'exists:sectors,id'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:100'],
            'power_watts' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'in:active,inactive,maintenance'],
        ];
    }

    public function messages(): array
    {
        return [
            'sector_id.required' => 'O setor é obrigatório.',
            'sector_id.exists' => 'Setor não encontrado.',
            'name.required' => 'O nome do dispositivo é obrigatório.',
            'type.required' => 'O tipo do dispositivo é obrigatório.',
        ];
    }
}
