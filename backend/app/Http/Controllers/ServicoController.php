<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServicoRequest;
use App\Http\Requests\UpdateServicoRequest;
use App\Http\Resources\ServicoResource;
use App\Models\Servico;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServicoController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        // Paginação e carregamento antecipado evitam uma consulta por serviço.
        return ServicoResource::collection(
            Servico::with(['usuario.localizacao', 'categoria'])->latest()->paginate(15)
        );
    }

    public function store(StoreServicoRequest $request): JsonResponse
    {
        // A sessão define o dono; o cliente não pode cadastrar em nome de outra pessoa.
        $servico = $request->user()->servicos()->create($request->validated());

        return response()->json([
            'message' => 'Serviço cadastrado com sucesso.',
            'data' => new ServicoResource($servico->load(['usuario.localizacao', 'categoria'])),
        ], 201);
    }

    public function show(Servico $servico): ServicoResource
    {
        return new ServicoResource($servico->load(['usuario.localizacao', 'categoria']));
    }

    public function update(UpdateServicoRequest $request, Servico $servico): JsonResponse
    {
        // A autorização do dono ocorre no UpdateServicoRequest antes da validação.
        $servico->update($request->validated());

        return response()->json([
            'message' => 'Serviço atualizado com sucesso.',
            'data' => new ServicoResource($servico->fresh()->load(['usuario.localizacao', 'categoria'])),
        ]);
    }

    public function destroy(Request $request, Servico $servico): JsonResponse
    {
        abort_unless($request->user()->id === $servico->usuario_id, 403); // Só o dono pode excluir.
        $servico->delete();

        return response()->json(['message' => 'Serviço excluído com sucesso.']);
    }
}
