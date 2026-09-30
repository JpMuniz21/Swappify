import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import { cadastrar } from '../../services/authService';
import fundoCirculos from '../../assets/fundo-circulos.svg';
import './Cadastro.css';

const DIAS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: 100 }, (_, i) => String(ANO_ATUAL - i));
const GENEROS = ['Feminino', 'Masculino', 'Não Binário', 'Outro', 'Prefiro não dizer'];
const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
];

export default function Cadastro() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: '', contato: '', senha: '',
    dia: '', mes: '', ano: '',
    genero: '', profissao: '', uf: '', cidade: '',
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
    if (!form.contato.trim()) novos.contato = 'Informe seu celular ou e-mail.';
    if (!form.senha || form.senha.length < 6) novos.senha = 'A senha precisa ter ao menos 6 caracteres.';
    if (!form.dia || !form.mes || !form.ano) novos.dataNascimento = 'Informe sua data de nascimento completa.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function enviar(e) {
    e.preventDefault();
    setErroGeral('');
    if (!validar()) return;

    setEnviando(true);
    try {
      const mesNum = String(MESES.indexOf(form.mes) + 1).padStart(2, '0');
      const diaNum = String(form.dia).padStart(2, '0');

      await cadastrar({
        nome: form.nome,
        contato: form.contato,
        password: form.senha,
        data_nascimento: `${form.ano}-${mesNum}-${diaNum}`,
        genero: form.genero,
        profissao: form.profissao,
        uf: form.uf,
        cidade: form.cidade,
      });
      navigate('/login');
    } catch (err) {
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
              id="contato"
              label="Celular ou e-mail"
              placeholder="Celular ou E-mail"
              icone={<IconeEmail />}
              value={form.contato}
              onChange={atualizar('contato')}
              erro={erros.contato}
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
            />
          </fieldset>

          {/* BLOCO 2: Data de nascimento */}
          <fieldset className="cadastro-grupo">
            <legend>Data de nascimento :</legend>
            <div className="cadastro-linha cadastro-linha--3">
              <Select id="dia" label="Dia" placeholder="Dia" options={DIAS} value={form.dia} onChange={atualizar('dia')} />
              <Select id="mes" label="Mês" placeholder="Mês" options={MESES} value={form.mes} onChange={atualizar('mes')} />
              <Select id="ano" label="Ano" placeholder="Ano" options={ANOS} value={form.ano} onChange={atualizar('ano')} />
            </div>
            {erros.dataNascimento && <span className="campo-erro" role="alert">{erros.dataNascimento}</span>}
          </fieldset>

          {/* BLOCO 3: Dados complementares */}
          <fieldset className="cadastro-grupo">
            <legend>Dados complementares :</legend>
            <div className="cadastro-linha cadastro-linha--4">
              <Select id="genero" label="Gênero" placeholder="Gênero" options={GENEROS} value={form.genero} onChange={atualizar('genero')} />
              <Input id="profissao" label="Profissão" placeholder="Profissão" value={form.profissao} onChange={atualizar('profissao')} />
              <Select id="uf" label="UF" placeholder="UF" options={UFS} value={form.uf} onChange={atualizar('uf')} />
              <Input id="cidade" label="Cidade" placeholder="Cidade" value={form.cidade} onChange={atualizar('cidade')} />
            </div>
          </fieldset>

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