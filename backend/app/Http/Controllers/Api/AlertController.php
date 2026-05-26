<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->alerts()->with(['sector:id,name', 'device:id,name']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        $alerts = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($alerts);
    }

    public function show(Request $request, Alert $alert): JsonResponse
    {
        $this->authorizeUser($request, $alert);

        $alert->load(['sector:id,name', 'device:id,name']);

        return response()->json(['alert' => $alert]);
    }

    public function acknowledge(Request $request, Alert $alert): JsonResponse
    {
        $this->authorizeUser($request, $alert);

        $alert->acknowledge();

        return response()->json(['alert' => $alert]);
    }

    public function resolve(Request $request, Alert $alert): JsonResponse
    {
        $this->authorizeUser($request, $alert);

        $alert->resolve();

        return response()->json(['alert' => $alert]);
    }

    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $summary = [
            'total_open' => $user->alerts()->open()->count(),
            'by_severity' => [
                'critical' => $user->alerts()->open()->where('severity', 'critical')->count(),
                'high' => $user->alerts()->open()->where('severity', 'high')->count(),
                'medium' => $user->alerts()->open()->where('severity', 'medium')->count(),
                'low' => $user->alerts()->open()->where('severity', 'low')->count(),
            ],
            'by_type' => $user->alerts()->open()
                ->selectRaw('type, count(*) as total')
                ->groupBy('type')
                ->pluck('total', 'type'),
        ];

        return response()->json(['summary' => $summary]);
    }

    public function count(Request $request): JsonResponse
    {
        $query = $request->user()->alerts();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json(['count' => $query->count()]);
    }

    private function authorizeUser(Request $request, Alert $alert): void
    {
        if ($alert->user_id !== $request->user()->id) {
            abort(403, 'Acesso negado.');
        }
    }
}
