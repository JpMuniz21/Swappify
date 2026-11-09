import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import './RecuperarSenha.css';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  function enviar(e) {
    e.preventDefault();
    setErro('');
    setMensagem('');

    if (!email.trim()) {
      setErro('Informe seu e-mail.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro('Informe um e-mail válido.');
      return;
    }

    // A interface está pronta; a solicitação real depende
    // da implementação do serviço de recuperação no backend.
    setMensagem(
      'E-mail validado! A recuperação precisa ser conectada ao serviço da aplicação.'
    );
  }

  return (
    <AuthLayout>
      <form
        className="recuperar-form"
        onSubmit={enviar}
        noValidate
      >
        <div className="recuperar-cabecalho">
          <h2>Recuperar acesso</h2>
          <p>
            Esqueceu sua senha? Informe o e-mail cadastrado
            para iniciar a recuperação da sua conta.
          </p>
        </div>

        <Input
          id="email-recuperacao"
          label="E-mail"
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          erro={erro}
          autoComplete="email"
          icone="email"
        />

        {mensagem && (
          <p className="recuperar-sucesso" role="status">
            {mensagem}
          </p>
        )}

        <Button type="submit">
          Recuperar senha
        </Button>

        <p className="recuperar-voltar">
          <Link to="/login">← Voltar para o login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}