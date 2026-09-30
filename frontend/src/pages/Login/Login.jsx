import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { login } from '../../services/authService';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [identificacao, setIdentificacao] = useState(() => {
    try { return localStorage.getItem('swappify.email') ?? ''; }
    catch { return ''; }
  });
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(Boolean(identificacao));
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  function validar() {
    const novos = {};
    if (!identificacao.trim()) novos.identificacao = 'Informe seu e-mail.';
    if (!senha) novos.senha = 'Informe sua senha.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function enviar(e) {
    e.preventDefault();
    setErroGeral('');
    if (!validar()) return;

    setEnviando(true);
    try {
      await login({ email: identificacao.trim(), password: senha });
      // Guarda somente a identificação quando solicitado; senha e sessão nunca são salvas aqui.
      try {
        if (lembrar) localStorage.setItem('swappify.email', identificacao.trim());
        else localStorage.removeItem('swappify.email');
      } catch { /* Armazenamento pode estar bloqueado pelo navegador. */ }
      navigate('/perfil', { replace: true });
    } catch (err) {
      setErros({
        identificacao: err.errors?.email?.[0],
        senha: err.errors?.password?.[0],
      });
      setErroGeral(err.status === 419 ? 'Sessão expirada. Tente entrar novamente.' : err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout>
      <form className="login-form" onSubmit={enviar} noValidate>
        <Input
          id="identificacao"
          label="E-mail" type="email"
          placeholder="Seu e-mail"
          value={identificacao}
          onChange={(e) => setIdentificacao(e.target.value)}
          erro={erros.identificacao}
          autoComplete="username"
          icone="email"
        />
        <Input
          id="senha"
          label="Senha"
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          erro={erros.senha}
          autoComplete="current-password"
          icone="senha"
        />

        <div className="login-opcoes">
          <label className="login-lembrar">
            <input
              type="checkbox"
              checked={lembrar}
              onChange={(e) => setLembrar(e.target.checked)}
            />
            Lembrar identificação de usuário
          </label>
          <Link to="/recuperar-senha">Esqueceu sua senha?</Link>
        </div>

        {erroGeral && <p className="login-erro" role="alert">{erroGeral}</p>}

        <Button type="submit" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Acessar'}
        </Button>

        <p className="login-cadastro">
          Não tem uma conta? <Link to="/cadastro">Clique aqui</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
