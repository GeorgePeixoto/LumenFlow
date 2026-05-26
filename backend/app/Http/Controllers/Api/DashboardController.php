<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ConsumptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private ConsumptionService $consumptionService
    ) {}

    /**
     * GET /api/dashboard/kpis
     */
    public function kpis(Request $request): JsonResponse
    {
        $kpis = $this->consumptionService->getKpis($request->user());

        return response()->json($kpis);
    }

    /**
     * GET /api/dashboard/consumption
     */
    public function consumption(Request $request): JsonResponse
    {
        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'granularity' => ['nullable', 'in:hour,day,week,month'],
        ]);

        $from = $request->get('from', now()->subDays(7)->toDateString());
        $to = $request->get('to', now()->toDateString());
        $granularity = $request->get('granularity', 'day');

        $data = $this->consumptionService->getConsumptionChart(
            $request->user(), $from, $to, $granularity
        );

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/dashboard/top-sectors
     */
    public function topSectors(Request $request): JsonResponse
    {
        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to = $request->get('to', now()->toDateString());
        $limit = $request->get('limit', 5);

        $sectors = $this->consumptionService->getTopSectors(
            $request->user(), $from, $to, $limit
        );

        return response()->json(['sectors' => $sectors]);
    }

    /**
     * GET /api/dashboard/projection
     */
    public function projection(Request $request): JsonResponse
    {
        $projection = $this->consumptionService->getMonthlyProjection($request->user());

        return response()->json($projection);
    }
}
