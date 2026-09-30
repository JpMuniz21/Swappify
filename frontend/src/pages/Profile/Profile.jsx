import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import Button from '../../components/Button/Button';
import { consultarPerfil, logout } from '../../services/authService';
import './Profile.css';

// Destino mínimo do login: confirma a sessão usando o backend, sem token local.
export default function Profile() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [erro, setErro] = useState('');
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    let ativo = true; // Evita atualizar uma página que já foi desmontada.
    consultarPerfil().then(({ data }) => {
      if (ativo) setUsuario(data);
    }).catch((error) => {
      if (!ativo) return;
      if (error.status === 401) navigate('/login', { replace: true });
      else setErro('Não foi possível carregar seu perfil. Atualize a página para tentar novamente.');
    });
    return () => { ativo = false; };
  }, [navigate]);

  async function sair() {
    setSaindo(true);
    setErro('');
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      if (error.status === 401) navigate('/login', { replace: true });
      else setErro('Não foi possível sair. Tente novamente.');
    } finally {
      setSaindo(false);
    }
  }

  return (
    <AuthLayout>
      <section className="perfil" aria-label="Meu perfil">
        <h1>Meu perfil</h1>
        {erro && <p role="alert">{erro}</p>}
        {!usuario && !erro && <p role="status">Carregando...</p>}
        {usuario && (
          <>
            <p>Olá, {usuario.name}!</p>
            <p>{usuario.email}</p>
            <Button onClick={sair} disabled={saindo}>
              {saindo ? 'Saindo...' : 'Sair'}
            </Button>
          </>
        )}
      </section>
    </AuthLayout>
  );
}