<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostagemRequest;
use App\Http\Requests\UpdatePostagemRequest;
use App\Http\Resources\PostagemResource;
use App\Models\Postagem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PostagemController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return PostagemResource::collection(
            Postagem::with('usuario')
                ->whereIn('status', ['ativa', 'editada'])
                ->orderByDesc('data_publicacao')
                ->paginate(15)
        );
    }

    public function store(StorePostagemRequest $request): JsonResponse
    {
        $postagem = $request->user()->postagens()->create(
            $request->validated() + ['data_publicacao' => now(), 'status' => 'ativa']
        );

        return response()->json([
            'message' => 'Postagem criada com sucesso.',
            'data' => new PostagemResource($postagem->load('usuario')),
        ], 201);
    }

    public function show(Postagem $postagem): PostagemResource
    {
        abort_if($postagem->status === 'excluida', 404);

        return new PostagemResource($postagem->load('usuario'));
    }

    public function update(UpdatePostagemRequest $request, Postagem $postagem): JsonResponse
    {
        $postagem->update($request->validated() + ['status' => 'editada']);

        return response()->json([
            'message' => 'Postagem atualizada com sucesso.',
            'data' => new PostagemResource($postagem->fresh()->load('usuario')),
        ]);
    }

    public function destroy(Request $request, Postagem $postagem): JsonResponse
    {
        abort_unless(
            $request->user()->id === $postagem->usuario_id && $postagem->status !== 'excluida',
            403
        );
        $postagem->update(['status' => 'excluida']);

        return response()->json(['message' => 'Postagem excluída com sucesso.']);
    }
}
