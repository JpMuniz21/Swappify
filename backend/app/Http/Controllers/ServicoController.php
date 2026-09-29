<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServicoRequest;
use App\Http\Requests\UpdateServicoRequest;
use App\Models\Servico;
use Illuminate\Http\JsonResponse;

class ServicoController extends Controller
{
    public function index(): JsonResponse
    {
        $servicos = Servico::query()
            ->with(['usuario.localizacao', 'categoria'])
            ->latest()
            ->paginate(15);

        return response()->json($servicos);
    }

    public function store(StoreServicoRequest $request): JsonResponse
    {
        $servico = Servico::create($request->validated());

        return response()->json([
            'message' => 'Serviço cadastrado com sucesso.',
            'data' => $servico->load(['usuario.localizacao', 'categoria']),
        ], 201);
    }

    public function show(Servico $servico): JsonResponse
    {
        return response()->json([
            'data' => $servico->load(['usuario.localizacao', 'categoria']),
        ]);
    }

    public function update(UpdateServicoRequest $request, Servico $servico): JsonResponse
    {
        $servico->update($request->validated());

        return response()->json([
            'message' => 'Serviço atualizado com sucesso.',
            'data' => $servico->fresh()->load(['usuario.localizacao', 'categoria']),
        ]);
    }

    public function destroy(Servico $servico): JsonResponse
    {
        $servico->delete();

        return response()->json([
            'message' => 'Serviço excluído com sucesso.',
        ]);
    }
}
