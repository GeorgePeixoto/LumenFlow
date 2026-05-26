<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tariff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TariffController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tariffs = $request->user()->tariffs()->orderByDesc('active')->orderBy('name')->get();

        return response()->json(['tariffs' => $tariffs]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:convencional,bandeira'],
            'value_kwh' => ['required', 'numeric', 'min:0'],
            'flag_color' => ['nullable', 'in:green,yellow,red_1,red_2'],
        ]);

        $tariff = $request->user()->tariffs()->create($validated);

        return response()->json(['tariff' => $tariff], 201);
    }

    public function show(Request $request, Tariff $tariff): JsonResponse
    {
        $this->authorizeUser($request, $tariff);

        return response()->json(['tariff' => $tariff]);
    }

    public function update(Request $request, Tariff $tariff): JsonResponse
    {
        $this->authorizeUser($request, $tariff);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'in:convencional,bandeira'],
            'value_kwh' => ['sometimes', 'numeric', 'min:0'],
            'flag_color' => ['nullable', 'in:green,yellow,red_1,red_2'],
            'active' => ['sometimes', 'boolean'],
        ]);

        $tariff->update($validated);

        return response()->json(['tariff' => $tariff]);
    }

    public function destroy(Request $request, Tariff $tariff): JsonResponse
    {
        $this->authorizeUser($request, $tariff);

        $tariff->delete();

        return response()->json(['message' => 'Tarifa removida com sucesso.']);
    }

    private function authorizeUser(Request $request, Tariff $tariff): void
    {
        if ($tariff->user_id !== $request->user()->id) {
            abort(403, 'Acesso negado.');
        }
    }
}
