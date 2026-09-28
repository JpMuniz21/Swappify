<?php

namespace App\Http\Controllers; // Localiza esta classe no conjunto de controllers da aplicação.

use App\Models\User; // Representa a tabela users; a conexão vem do .env.
use Illuminate\Http\JsonResponse; // Define respostas com corpo JSON.
use Illuminate\Http\Request; // Dá acesso aos dados enviados e à sessão.
use Illuminate\Support\Facades\Auth; // Usa a autenticação por sessão do Laravel.
use Illuminate\Validation\Rule; // Permite validar e-mail único, ignorando a própria conta.
use Illuminate\Validation\Rules\Password; // Define a política de senha.
use Illuminate\Validation\ValidationException; // Devolve erros de validação como HTTP 422.
use Symfony\Component\HttpFoundation\Response; // Define respostas sem corpo, como HTTP 204.

// CRUD do próprio usuário. Administração deverá ter rotas e autorização separadas.
class AccountController extends Controller
{
    // FRONTEND: chamar antes de enviar cadastro/login e após mudanças de sessão.
    public function csrfToken(Request $request): JsonResponse
    {
        // O navegador também recebe o cookie de sessão pelos middlewares de web.php.
        return response()->json(['csrf_token' => $request->session()->token()])
            ->header('Cache-Control', 'no-store'); // Impede cache de um token ligado à sessão.
    }

    // CREATE: recebe nome, e-mail, senha e confirmação; cria e autentica a conta.
    public function store(Request $request): JsonResponse
    {
        $this->normalizeEmail($request); // Padroniza o e-mail antes de verificar duplicidade.
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'], // Nome obrigatório, limitado ao tamanho da coluna.
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'], // Não aceita e-mail repetido.
            'password' => ['required', 'confirmed', Password::min(8)], // Exige password_confirmation igual.
        ]);
        $user = User::create($data); // Salva só os campos validados; o model transforma a senha em hash.
        Auth::guard('web')->login($user); // Associa a nova conta à sessão do navegador.
        $request->session()->regenerate(); // Troca o identificador e o token CSRF após autenticar.

        return response()->json(['data' => $user], 201); // 201 significa criado; a senha fica oculta pelo model.
    }

    // Login é necessário para consultar/alterar a própria conta em acessos posteriores.
    public function login(Request $request): JsonResponse
    {
        $this->normalizeEmail($request); // Usa o mesmo formato de e-mail empregado no cadastro.
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'], // Valida o identificador da conta.
            'password' => ['required', 'string'], // Aqui não impõe nova política às senhas já cadastradas.
        ]);
        if (! Auth::guard('web')->attempt($credentials)) { // Compara a senha enviada com o hash salvo.
            throw ValidationException::withMessages([
                'email' => ['E-mail ou senha inválidos.'], // Não revela se o e-mail existe.
            ]);
        }
        $request->session()->regenerate(); // Evita reutilizar a sessão anterior ao login.

        return response()->json(['data' => $request->user('web')]); // Retorna o perfil autenticado.
    }

    // READ: o usuário vem da sessão, nunca de um ID escolhido pelo frontend.
    public function show(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user('web')]); // Retorna somente a própria conta.
    }

    // UPDATE: permite mudanças parciais; campos ausentes são preservados.
    public function update(Request $request): JsonResponse
    {
        $this->normalizeEmail($request); // Normaliza apenas quando há um e-mail do tipo texto.
        $user = $request->user('web'); // Identifica a conta autorizada pela sessão.
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'], // Valida o nome se enviado.
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($user->id)], // Aceita o e-mail atual, mas não o de outra pessoa.
            'password' => ['sometimes', 'required', 'confirmed', Password::min(8)], // Nova senha opcional.
            'current_password' => ['required_with:email,password', 'current_password:web'], // Confirma a senha atual para alterações sensíveis.
        ]);
        unset($data['current_password']); // A confirmação serve só para validar; nunca é salva.
        $user->fill($data); // Aplica apenas os campos permitidos pelo model.
        if ($user->isDirty('email')) { // Detecta uma alteração real no endereço de e-mail.
            $user->email_verified_at = null; // Uma eventual verificação anterior não vale para o novo endereço.
        }
        $user->save(); // Persiste as alterações na conexão de banco configurada.
        if (array_key_exists('password', $data)) { // Uma troca de senha também renova esta sessão.
            $request->session()->regenerate(); // auth.session invalida as outras sessões ao acessarem novamente.
        }

        return response()->json(['data' => $user]); // Entrega ao frontend o perfil atualizado.
    }

    // DELETE: exclui definitivamente a própria conta após conferir a senha.
    public function destroy(Request $request): Response
    {
        $request->validate([
            'current_password' => ['required', 'current_password:web'], // Impede exclusão sem confirmação da senha.
        ]);
        $user = $request->user('web'); // Guarda a conta antes de encerrar sua sessão.
        $this->endSession($request); // Logout vem antes: ele pode salvar o remember_token no model.
        $user->delete(); // FUTURO: rever a exclusão definitiva quando houver anúncios/trocas vinculados.

        return response()->noContent(); // HTTP 204 confirma a operação sem enviar JSON.
    }

    // Logout encerra a sessão, mas mantém a conta e seus dados.
    public function logout(Request $request): Response
    {
        $this->endSession($request); // Centraliza a limpeza da sessão.

        return response()->noContent(); // O frontend deve voltar à tela de login.
    }

    // Evita duplicidade por letras maiúsculas nos e-mails criados por esta API.
    private function normalizeEmail(Request $request): void
    {
        if (is_string($request->input('email'))) { // Deixa valores inválidos para a validação rejeitar.
            $request->merge(['email' => mb_strtolower(trim($request->input('email')))]); // Remove espaços e converte para minúsculas.
        }
    }

    // Compartilhado pelo logout e pela exclusão.
    private function endSession(Request $request): void
    {
        Auth::guard('web')->logout(); // Remove o usuário autenticado desta sessão.
        $request->session()->invalidate(); // Apaga os dados e troca o identificador da sessão.
        $request->session()->regenerateToken(); // Gera outro token CSRF para o próximo acesso.
    }
}
