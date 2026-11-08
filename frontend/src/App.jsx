import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Profile from './pages/Profile/Profile';
import Chat from './pages/Chat/chat';
import Feed from './pages/Feed/Feed';
import Configuracoes from './pages/Configuracoes/Configuracoes';
import RecuperarSenha from './pages/RecuperarSenha/RecuperarSenha';
import Favoritos from './pages/Favoritos/Favoritos';
import Match from './pages/Match/Match';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/match" element={<Match />} />
      </Routes>
    </BrowserRouter>
  );
}
