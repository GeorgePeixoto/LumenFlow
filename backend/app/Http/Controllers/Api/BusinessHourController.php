<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusinessHourController extends Controller
{
    private const DAY_MAP = [
        'sunday' => 0,
        'monday' => 1,
        'tuesday' => 2,
        'wednesday' => 3,
        'thursday' => 4,
        'friday' => 5,
        'saturday' => 6,
    ];

    public function index(Request $request): JsonResponse
    {
        $hours = $request->user()->businessHours()->orderBy('day_of_week')->get();

        // Converter para formato que o frontend espera
        $days = $hours->map(function ($hour) {
            $dayKey = array_search($hour->day_of_week, self::DAY_MAP);
            return [
                'day' => $dayKey ?: 'monday',
                'day_of_week' => $hour->day_of_week,
                'enabled' => $hour->enabled,
                'start' => substr($hour->start_time, 0, 5), // HH:mm
                'end' => substr($hour->end_time, 0, 5),
            ];
        });

        return response()->json([
            'business_hours' => $hours,
            'days' => $days,
        ]);
    }

    public function upsert(Request $request): JsonResponse
    {
        $data = $request->all();

        // Aceitar tanto o formato { hours: [...] } quanto { days: [...] }
        $items = $data['hours'] ?? $data['days'] ?? null;

        if (!$items || !is_array($items)) {
            return response()->json(['error' => 'Dados inválidos.'], 422);
        }

        $user = $request->user();

        foreach ($items as $item) {
            // Determinar day_of_week (aceitar número ou string)
            $dayOfWeek = null;

            if (isset($item['day_of_week'])) {
                $dayOfWeek = (int) $item['day_of_week'];
            } elseif (isset($item['day']) && isset(self::DAY_MAP[$item['day']])) {
                $dayOfWeek = self::DAY_MAP[$item['day']];
            }

            if ($dayOfWeek === null || $dayOfWeek < 0 || $dayOfWeek > 6) {
                continue;
            }

            // Aceitar tanto start_time/end_time quanto start/end
            $startTime = $item['start_time'] ?? $item['start'] ?? '08:00';
            $endTime = $item['end_time'] ?? $item['end'] ?? '18:00';
            $enabled = $item['enabled'] ?? true;

            $user->businessHours()->updateOrCreate(
                ['day_of_week' => $dayOfWeek],
                [
                    'enabled' => $enabled,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                ]
            );
        }

        $hours = $user->businessHours()->orderBy('day_of_week')->get();

        // Retornar em ambos os formatos
        $days = $hours->map(function ($hour) {
            $dayKey = array_search($hour->day_of_week, self::DAY_MAP);
            return [
                'day' => $dayKey ?: 'monday',
                'day_of_week' => $hour->day_of_week,
                'enabled' => $hour->enabled,
                'start' => substr($hour->start_time, 0, 5),
                'end' => substr($hour->end_time, 0, 5),
            ];
        });

        return response()->json([
            'business_hours' => $hours,
            'days' => $days,
        ]);
    }
}
