<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sector\StoreSectorRequest;
use App\Http\Requests\Sector\UpdateSectorRequest;
use App\Http\Resources\SectorResource;
use App\Models\Sector;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SectorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sectors = $request->user()->sectors()
            ->withCount('devices')
            ->orderBy('name')
            ->get();

        return response()->json(['sectors' => SectorResource::collection($sectors)]);
    }

    public function store(StoreSectorRequest $request): JsonResponse
    {
        $sector = $request->user()->sectors()->create($request->validated());

        return response()->json(['sector' => new SectorResource($sector)], 201);
    }

    public function show(Request $request, Sector $sector): JsonResponse
    {
        $this->authorizeUser($request, $sector);

        $sector->loadCount('devices');
        $sector->load('devices');

        return response()->json(['sector' => new SectorResource($sector)]);
    }

    public function update(UpdateSectorRequest $request, Sector $sector): JsonResponse
    {
        $sector->update($request->validated());

        return response()->json(['sector' => new SectorResource($sector)]);
    }

    public function destroy(Request $request, Sector $sector): JsonResponse
    {
        $this->authorizeUser($request, $sector);

        $sector->delete();

        return response()->json(['message' => 'Setor removido com sucesso.']);
    }

    private function authorizeUser(Request $request, Sector $sector): void
    {
        if ($sector->user_id !== $request->user()->id) {
            abort(403, 'Acesso negado.');
        }
    }
}
