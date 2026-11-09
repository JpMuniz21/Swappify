import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RotaProtegida from './components/RotaProtegida/RotaProtegida';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Profile from './pages/Profile/Profile';
import Chat from './pages/Chat/chat';
import Feed from './pages/Feed/Feed';
import Configuracoes from './pages/Configuracoes/Configuracoes';
import RecuperarSenha from './pages/RecuperarSenha/RecuperarSenha';
import Favoritos from './pages/Favoritos/Favoritos';
import Match from './pages/Match/Match';
import MinhasTrocas from './pages/MinhasTrocas';
import EmDesenvolvimento from './pages/EmDesenvolvimento/EmDesenvolvimento';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />

        {/* Rotas que exigem login: sem sessão válida, redireciona para /login */}
        <Route element={<RotaProtegida />}>
          <Route path="/perfil" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/match" element={<Match />} />

          {/* Telas em construção por outros responsáveis da sprint */}
          <Route path="/minhas-trocas" element={<MinhasTrocas />} />
          <Route
            path="/agendamentos"
            element={
              <EmDesenvolvimento
                titulo="Agendamentos"
                descricao="Aqui você vai organizar datas e horários das suas trocas."
              />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
