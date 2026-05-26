<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FirebaseSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FirebaseSyncController extends Controller
{
    /**
     * POST /api/firebase/sync — trigger manual de sincronização
     */
    public function sync(Request $request, FirebaseSyncService $service): JsonResponse
    {
        $request->validate([
            'sector_id' => ['nullable', 'integer', 'exists:sectors,id'],
        ]);

        $result = $service->syncReadings($request->sector_id);

        return response()->json($result);
    }

    /**
     * GET /api/firebase/preview — visualizar dados brutos do Firebase
     */
    public function preview(Request $request, FirebaseSyncService $service): JsonResponse
    {
        $path = $request->get('path', '/sensores');

        $data = $service->preview($path);

        if ($data === null) {
            return response()->json(['error' => 'Não foi possível acessar o Firebase'], 502);
        }

        return response()->json(['data' => $data]);
    }
}
