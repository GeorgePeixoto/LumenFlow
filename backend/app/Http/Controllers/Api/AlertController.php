<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\AlertNotificationMail;

class AlertController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $query = Alert::with(['sector:id,name', 'device:id,name'])
            ->where('user_id', $userId);

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
        $userId = $request->user()->id;
        $summary = [
            'total_open' => Alert::where('user_id', $userId)->open()->count(),
            'by_severity' => [
                'critical' => Alert::where('user_id', $userId)->open()->where('severity', 'critical')->count(),
                'high' => Alert::where('user_id', $userId)->open()->where('severity', 'high')->count(),
                'medium' => Alert::where('user_id', $userId)->open()->where('severity', 'medium')->count(),
                'low' => Alert::where('user_id', $userId)->open()->where('severity', 'low')->count(),
            ],
            'by_type' => Alert::where('user_id', $userId)->open()
                ->selectRaw('type, count(*) as total')
                ->groupBy('type')
                ->pluck('total', 'type'),
        ];

        return response()->json(['summary' => $summary]);
    }

    public function count(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $query = Alert::where('user_id', $userId);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json(['count' => $query->count()]);
    }

    public function bulkAcknowledge(Request $request): JsonResponse
    {
        $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']]);

        $count = Alert::whereIn('id', $request->ids)
            ->where('status', 'open')
            ->update(['status' => 'acknowledged', 'acknowledged_at' => now()]);

        return response()->json(['updated' => $count]);
    }

    public function bulkResolve(Request $request): JsonResponse
    {
        $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']]);

        $count = Alert::whereIn('id', $request->ids)
            ->whereIn('status', ['open', 'acknowledged'])
            ->update(['status' => 'resolved', 'resolved_at' => now()]);

        return response()->json(['updated' => $count]);
    }

    public function notify(Request $request, Alert $alert): JsonResponse
    {
        $this->authorizeUser($request, $alert);

        if ($alert->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $user = $alert->user;
        if (!$user || !$user->email) {
            return response()->json(['message' => 'User or email not found for this alert.'], 404);
        }

        Mail::to($user->email)->send(new AlertNotificationMail($alert));

        return response()->json(['message' => 'Notification email sent successfully.']);
    }

    private function authorizeUser(Request $request, Alert $alert): void
    {
        // Todos os usuários autenticados têm acesso aos alertas compartilhados
    }
}
