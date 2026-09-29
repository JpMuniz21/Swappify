import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { login } from '../../services/authService';
import './Login.css';

export default function Login() {
  const [identificacao, setIdentificacao] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  function validar() {
    const novos = {};
    if (!identificacao.trim()) novos.identificacao = 'Informe seu e-mail ou nome de usuário.';
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
      const resposta = await login({ login: identificacao, password: senha });
      // TODO: guardar o token (resposta.token) e redirecionar para a home
      console.log('Logado', resposta, { lembrar });
    } catch (err) {
      setErroGeral(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout>
      <form className="login-form" onSubmit={enviar} noValidate>
        <Input
          id="identificacao"
          label="E-mail ou nome de usuário"
          placeholder="Email ou nome do usuario"
          value={identificacao}
          onChange={(e) => setIdentificacao(e.target.value)}
          erro={erros.identificacao}
          autoComplete="username"
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
