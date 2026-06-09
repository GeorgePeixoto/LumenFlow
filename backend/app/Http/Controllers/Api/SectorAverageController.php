<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SectorConsumptionAverage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SectorAverageController extends Controller
{
    /**
     * GET /api/sector-averages
     * Lista todas as médias de consumo por setor.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $averages = SectorConsumptionAverage::where(function ($query) use ($userId) {
            $query->where('user_id', $userId)
                  ->orWhereNull('user_id');
        })->orderBy('sector_name')->get();

        return response()->json([
            'success' => true,
            'averages' => $averages,
        ]);
    }

    /**
     * PUT /api/sector-averages
     * Atualiza ou cria médias de consumo por setor (override manual).
     */
    public function upsert(Request $request): JsonResponse
    {
        $request->validate([
            'averages' => ['required', 'array'],
            'averages.*.sector_name' => ['required', 'string'],
            'averages.*.average_kwh' => ['required', 'numeric', 'min:0'],
            'averages.*.is_manual_override' => ['required', 'boolean'],
        ]);

        $user = $request->user();

        foreach ($request->averages as $avg) {
            if ($avg['is_manual_override']) {
                SectorConsumptionAverage::updateOrCreate(
                    [
                        'sector_name' => $avg['sector_name'],
                        'user_id' => $user->id,
                    ],
                    [
                        'average_kwh' => $avg['average_kwh'],
                        'is_manual_override' => true,
                        'calculated_at' => now(),
                    ]
                );
            } else {
                // Se desativando override manual, remover registro manual
                SectorConsumptionAverage::where('sector_name', $avg['sector_name'])
                    ->where('user_id', $user->id)
                    ->where('is_manual_override', true)
                    ->delete();
            }
        }

        $averages = SectorConsumptionAverage::orderBy('sector_name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Médias atualizadas com sucesso.',
            'averages' => $averages,
        ]);
    }
}
