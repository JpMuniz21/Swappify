<?php

// Salve em: backend/app/Http/Controllers/ChatController.php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Usa a MESMA conexão de banco do resto do projeto (DB_* do backend/.env).
//
// ATENÇÃO: o login do Laravel usa a tabela "users", mas as tabelas do chat
// (match e mensagem) apontam para a tabela "usuario". Por enquanto, ligamos as
// duas pelo E-MAIL: a pessoa logada precisa existir nas duas tabelas com o mesmo e-mail.
class ChatController extends Controller
{
    // id_usuario (tabela "usuario") de quem está logado, achado pelo e-mail
    private function meuIdUsuario(Request $request): ?int
    {
        $email = mb_strtolower($request->user()->email);

        $id = DB::table('usuario')->whereRaw('lower(email) = ?', [$email])->value('id_usuario');

        return $id === null ? null : (int) $id;
    }

    private function semCadastro(): JsonResponse
    {
        return response()->json(
            ['message' => 'Seu e-mail não foi encontrado na tabela "usuario" do banco.'],
            404
        );
    }

    private function souDoMatch(int $eu): \Closure
    {
        return fn ($q) => $q->where('id_usuario_1', $eu)->orWhere('id_usuario_2', $eu);
    }

    // Este usuário participa deste match?
    private function participa(int $eu, string $idMatch): bool
    {
        return DB::table('match')
            ->where('id_match', $idMatch)
            ->where($this->souDoMatch($eu))
            ->exists();
    }

    // GET /api/conversas
    public function conversas(Request $request): JsonResponse
    {
        $eu = $this->meuIdUsuario($request);
        if ($eu === null) {
            return $this->semCadastro();
        }

        $matches = DB::table('match')
            ->where($this->souDoMatch($eu))
            ->get(['id_match', 'id_usuario_1', 'id_usuario_2']);

        $idOutro = fn ($m) => $m->id_usuario_1 == $eu ? $m->id_usuario_2 : $m->id_usuario_1;

        $nomes = DB::table('usuario')
            ->whereIn('id_usuario', $matches->map($idOutro)->unique()->values())
            ->pluck('nome', 'id_usuario');

        return response()->json(
            $matches->map(fn ($m) => [
                'id_match' => $m->id_match,
                'outro' => [
                    'id' => $idOutro($m),
                    'nome' => $nomes[$idOutro($m)] ?? 'Usuário',
                    'avatar_url' => null, // a tabela usuario ainda não tem coluna de foto
                ],
            ])->values()
        );
    }

    // GET /api/conversas/{idMatch}/mensagens
    public function mensagens(Request $request, string $idMatch): JsonResponse
    {
        $eu = $this->meuIdUsuario($request);
        if ($eu === null) {
            return $this->semCadastro();
        }
        if (! $this->participa($eu, $idMatch)) {
            return response()->json(['message' => 'Conversa não encontrada.'], 404);
        }

        // marca como lidas as mensagens enviadas pela outra pessoa
        DB::table('mensagem')
            ->where('id_match', $idMatch)
            ->where('id_remetente', '!=', $eu)
            ->where('lida', false)
            ->update(['lida' => true]);

        $lista = DB::table('mensagem')
            ->where('id_match', $idMatch)
            ->orderBy('data_envio')
            ->orderBy('id_mensagem')
            ->get(['id_mensagem', 'id_match', 'id_remetente', 'conteudo', 'data_envio', 'lida'])
            ->map(fn ($m) => [...(array) $m, 'minha' => $m->id_remetente == $eu]);

        return response()->json($lista->values());
    }

    // POST /api/conversas/{idMatch}/mensagens   corpo: { "conteudo": "..." }
    public function enviar(Request $request, string $idMatch): JsonResponse
    {
        $eu = $this->meuIdUsuario($request);
        if ($eu === null) {
            return $this->semCadastro();
        }

        $dados = $request->validate([
            'conteudo' => ['required', 'string', 'max:2000'],
        ]);

        if (! $this->participa($eu, $idMatch)) {
            return response()->json(['message' => 'Conversa não encontrada.'], 404);
        }

        $id = DB::table('mensagem')->insertGetId([
            'id_match' => $idMatch,
            'id_remetente' => $eu,
            'conteudo' => $dados['conteudo'],
            'data_envio' => now(),
            'lida' => false,
        ], 'id_mensagem');

        $nova = DB::table('mensagem')
            ->where('id_mensagem', $id)
            ->first(['id_mensagem', 'id_match', 'id_remetente', 'conteudo', 'data_envio', 'lida']);

        return response()->json([...(array) $nova, 'minha' => true], 201);
    }
}