import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { cadastrar } from '../../services/authService';
import fundoCirculos from '../../assets/fundo-circulos.svg';
import './Cadastro.css';

export default function Cadastro() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: '', email: '', senha: '', confirmarSenha: '',
  });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  function atualizar(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  }

  function validar() {
    const novos = {};
    if (!form.nome.trim()) novos.nome = 'Informe seu nome completo.';
    if (!form.email.trim()) novos.email = 'Informe seu e-mail.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) novos.email = 'Informe um e-mail válido.';
    if (!form.senha || form.senha.length < 8) novos.senha = 'A senha precisa ter ao menos 8 caracteres.';
    if (form.confirmarSenha !== form.senha) novos.confirmarSenha = 'As senhas não coincidem.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function enviar(e) {
    e.preventDefault();
    setErroGeral('');
    if (!validar()) return;

    setEnviando(true);
    try {
      await cadastrar({
        name: form.nome.trim(),
        email: form.email.trim(),
        password: form.senha,
        password_confirmation: form.confirmarSenha,
      });
      // O Laravel já cria a sessão no cadastro; leva a pessoa direto ao perfil.
      navigate('/perfil', { replace: true });
    } catch (err) {
      setErros({
        nome: err.errors?.name?.[0],
        email: err.errors?.email?.[0],
        senha: err.errors?.password?.[0],
      });
      setErroGeral(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="cadastro-fundo" style={{ backgroundImage: `url(${fundoCirculos})` }}>
      <section className="cadastro-cartao">
        <Link to="/login" className="cadastro-voltar" aria-label="Voltar para o login">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="m15 5-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <h1 className="cadastro-titulo">Cadastre-se aqui</h1>

        <form className="cadastro-form" onSubmit={enviar} noValidate>
          {/* BLOCO 1: Sobre você */}
          <fieldset className="cadastro-grupo">
            <legend>Sobre você :</legend>
            <Input
              id="nome"
              label="Nome completo"
              placeholder="Nome completo"
              icone={<IconePessoa />}
              value={form.nome}
              onChange={atualizar('nome')}
              erro={erros.nome}
            />
            <Input
              id="email"
              label="E-mail"
              type="email"
              placeholder="seuemail@exemplo.com"
              icone={<IconeEmail />}
              value={form.email}
              onChange={atualizar('email')}
              erro={erros.email}
              autoComplete="email"
            />
            <Input
              id="senha"
              label="Senha"
              placeholder="Senha"
              type="password"
              icone={<IconeCadeado />}
              value={form.senha}
              onChange={atualizar('senha')}
              erro={erros.senha}
              autoComplete="new-password"
            />
            <Input
              id="confirmar-senha"
              label="Confirmar senha"
              placeholder="Confirme sua senha"
              type="password"
              icone={<IconeCadeado />}
              value={form.confirmarSenha}
              onChange={atualizar('confirmarSenha')}
              erro={erros.confirmarSenha}
              autoComplete="new-password"
            />
          </fieldset>

          <p className="cadastro-aviso" role="note">
            Depois do cadastro, você poderá completar profissão, localização e outros dados no seu perfil.
          </p>

          <p className="cadastro-termos">
            Ao clicar em Cadastre-se, você concorda com os nossos{' '}
            <Link to="/termos">Termos</Link>, <Link to="/privacidade">Política de Privacidade</Link> e{' '}
            <Link to="/cookies">Política de Cookies</Link>. Você poderá receber notificações por SMS.
          </p>

          {erroGeral && <p className="cadastro-erro" role="alert">{erroGeral}</p>}

          <Button type="submit" disabled={enviando}>
            {enviando ? 'Cadastrando...' : 'CADASTRE-SE'}
          </Button>
        </form>
      </section>
    </main>
  );
}

function IconePessoa() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeEmail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconeCadeado() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="18" height="11" x="3" y="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
