import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { logout } from '../../services/authService';
import './EmDesenvolvimento.css';

// Página provisória para telas que ainda estão sendo construídas por outros
// responsáveis da sprint (ex.: Minhas Trocas #47, Agendamento #49).
// Para liberar a tela de verdade, troque a rota em App.jsx pelo componente final.
export default function EmDesenvolvimento({ titulo, descricao }) {
  const navigate = useNavigate();
  const { usuario } = useOutletContext() ?? {};

  async function sair() {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="em-dev-page">
      <Navbar usuario={usuario} onLogout={sair} onEditProfile={() => navigate('/perfil')} />
      <main className="em-dev-card">
        <span className="em-dev-selo">Em desenvolvimento</span>
        <h1>{titulo}</h1>
        <p>{descricao}</p>
        <p className="em-dev-aviso">
          Esta funcionalidade está sendo construída e estará disponível em breve.
        </p>
        <Link to="/feed" className="em-dev-voltar">Voltar para o feed</Link>
      </main>
    </div>
  );
}
