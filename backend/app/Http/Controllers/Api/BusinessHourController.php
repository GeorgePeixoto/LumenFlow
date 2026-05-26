<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusinessHourController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $hours = $request->user()->businessHours()->orderBy('day_of_week')->get();

        return response()->json(['business_hours' => $hours]);
    }

    public function upsert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hours' => ['required', 'array', 'min:1', 'max:7'],
            'hours.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'hours.*.enabled' => ['required', 'boolean'],
            'hours.*.start_time' => ['required', 'date_format:H:i'],
            'hours.*.end_time' => ['required', 'date_format:H:i', 'after:hours.*.start_time'],
        ]);

        $user = $request->user();

        foreach ($validated['hours'] as $hour) {
            $user->businessHours()->updateOrCreate(
                ['day_of_week' => $hour['day_of_week']],
                [
                    'enabled' => $hour['enabled'],
                    'start_time' => $hour['start_time'],
                    'end_time' => $hour['end_time'],
                ]
            );
        }

        $hours = $user->businessHours()->orderBy('day_of_week')->get();

        return response()->json(['business_hours' => $hours]);
    }
}
