import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { consultarPerfil } from '../../services/authService';
import './RotaProtegida.css';

// Envolve as rotas que exigem login. Consulta /me uma vez:
// - 200 → renderiza a página e entrega o usuário via useOutletContext()
// - 401 → manda para /login
// - outro erro (API fora do ar) → mostra aviso com opção de tentar de novo
export default function RotaProtegida() {
  const location = useLocation();
  const [estado, setEstado] = useState({ status: 'carregando', usuario: null });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    consultarPerfil()
      .then((resposta) => {
        if (ativo) setEstado({ status: 'ok', usuario: resposta?.data ?? null });
      })
      .catch((erro) => {
        if (!ativo) return;
        setEstado({ status: erro.status === 401 || erro.status === 419 ? 'deslogado' : 'erro', usuario: null });
      });
    return () => { ativo = false; };
  }, [tentativa]);

  if (estado.status === 'carregando') {
    return <div className="rota-protegida" role="status">Carregando…</div>;
  }

  if (estado.status === 'deslogado') {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  }

  if (estado.status === 'erro') {
    return (
      <div className="rota-protegida" role="alert">
        <p>Não foi possível conectar ao servidor.</p>
        <button
          type="button"
          onClick={() => {
            setEstado({ status: 'carregando', usuario: null });
            setTentativa((n) => n + 1);
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return <Outlet context={{ usuario: estado.usuario }} />;
}
