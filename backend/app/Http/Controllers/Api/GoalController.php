<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Goal;
use App\Services\GoalProjectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->goals()->with(['sector:id,name', 'device:id,name']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $goals = $query->orderByDesc('created_at')->get();

        return response()->json(['goals' => $goals]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'scope' => ['required', 'in:global,sector,device'],
            'sector_id' => ['nullable', 'integer', 'exists:sectors,id'],
            'device_id' => ['nullable', 'integer', 'exists:devices,id'],
            'unit' => ['required', 'in:kwh,reais,percent'],
            'value' => ['required', 'numeric', 'min:0'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after:period_start'],
        ]);

        $goal = $request->user()->goals()->create($validated);

        return response()->json(['goal' => $goal], 201);
    }

    public function show(Request $request, Goal $goal): JsonResponse
    {
        $this->authorizeUser($request, $goal);

        $goal->load(['sector:id,name', 'device:id,name']);

        return response()->json([
            'goal' => $goal,
            'progress' => $goal->progress,
            'is_overdue' => $goal->is_overdue,
        ]);
    }

    public function update(Request $request, Goal $goal): JsonResponse
    {
        $this->authorizeUser($request, $goal);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'value' => ['sometimes', 'numeric', 'min:0'],
            'period_end' => ['sometimes', 'date', 'after:period_start'],
            'status' => ['sometimes', 'in:active,completed,failed,cancelled'],
        ]);

        $goal->update($validated);

        return response()->json(['goal' => $goal]);
    }

    public function destroy(Request $request, Goal $goal): JsonResponse
    {
        $this->authorizeUser($request, $goal);

        $goal->delete();

        return response()->json(['message' => 'Meta removida com sucesso.']);
    }

    public function projections(Request $request, GoalProjectionService $projectionService): JsonResponse
    {
        $projections = $projectionService->projectAll($request->user());

        return response()->json(['projections' => $projections]);
    }

    public function projection(Request $request, Goal $goal, GoalProjectionService $projectionService): JsonResponse
    {
        $this->authorizeUser($request, $goal);

        $projection = $projectionService->project($goal, $request->user());

        return response()->json($projection);
    }

    private function authorizeUser(Request $request, Goal $goal): void
    {
        if ($goal->user_id !== $request->user()->id) {
            abort(403, 'Acesso negado.');
        }
    }
}
