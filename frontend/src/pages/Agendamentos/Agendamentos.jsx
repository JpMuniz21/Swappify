import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Calendario from '../../components/Calendario/Calendario';
import { logout } from '../../services/authService';
import { listarAgendamentos, chaveDoDia, STATUS } from '../../services/agendamentoService';
import './Agendamentos.css';

function hora(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function CartaoAgendamento({ agendamento, mostrarData = false, onClick }) {
  const { inicio, parceiro, ofereco, recebo, status } = agendamento;
  const info = STATUS[status];
  const data = new Date(inicio);
  const quando = mostrarData
    ? `${data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')} · ${hora(inicio)}`
    : hora(inicio);

  const conteudo = (
    <>
      <span className="agenda-hora">{quando}</span>
      <span className="agenda-info">
        <strong>{parceiro.nome}</strong>
        <small>{ofereco} ⇄ {recebo}</small>
      </span>
      <span className="agenda-status" style={{ '--cor-status': info?.cor }}>
        {info?.rotulo ?? status}
      </span>
    </>
  );

  return onClick ? (
    <button type="button" className="agenda-cartao agenda-cartao--botao" onClick={onClick}>
      {conteudo}
    </button>
  ) : (
    <div className="agenda-cartao">{conteudo}</div>
  );
}

export default function Agendamentos() {
  const navigate = useNavigate();
  const { usuario } = useOutletContext() ?? {};

  const [agora] = useState(() => new Date());
  const [mes, setMes] = useState(() => new Date(agora.getFullYear(), agora.getMonth(), 1));
  const [selecionado, setSelecionado] = useState(agora);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let cancelado = false;
    listarAgendamentos()
      .then((lista) => {
        if (!cancelado) setAgendamentos(lista);
      })
      .catch((err) => {
        if (!cancelado) setErro(err.message);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const eventosPorDia = useMemo(() => {
    const mapa = new Map();
    [...agendamentos]
      .sort((a, b) => new Date(a.inicio) - new Date(b.inicio))
      .forEach((item) => {
        const chave = chaveDoDia(new Date(item.inicio));
        mapa.set(chave, [...(mapa.get(chave) ?? []), item]);
      });
    return mapa;
  }, [agendamentos]);

  const proximos = useMemo(
    () =>
      agendamentos
        .filter((item) => new Date(item.inicio) >= agora && item.status !== 'cancelada')
        .sort((a, b) => new Date(a.inicio) - new Date(b.inicio))
        .slice(0, 5),
    [agendamentos, agora],
  );

  const doDia = eventosPorDia.get(chaveDoDia(selecionado)) ?? [];
  const tituloDia = selecionado.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  function mudarMes(delta) {
    const novo = new Date(mes.getFullYear(), mes.getMonth() + delta, 1);
    setMes(novo);
    const mesmoMesDeHoje = novo.getFullYear() === agora.getFullYear() && novo.getMonth() === agora.getMonth();
    setSelecionado(mesmoMesDeHoje ? agora : novo);
  }

  function irParaHoje() {
    setMes(new Date(agora.getFullYear(), agora.getMonth(), 1));
    setSelecionado(agora);
  }

  function irParaAgendamento(item) {
    const data = new Date(item.inicio);
    setMes(new Date(data.getFullYear(), data.getMonth(), 1));
    setSelecionado(data);
  }

  async function sair() {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="agenda-pagina">
      <Navbar usuario={usuario} onLogout={sair} onEditProfile={() => navigate('/perfil')} />

      <main className="agenda">
        <header className="agenda-cabecalho">
          <h1>Agendamentos</h1>
          <p>Suas trocas combinadas, organizadas por data.</p>
        </header>

        {erro && <p className="agenda-erro" role="alert">{erro}</p>}

        {carregando ? (
          <p className="agenda-vazio">Carregando agendamentos…</p>
        ) : (
          <>
            <div className="agenda-corpo">
              <Calendario
                mes={mes}
                hoje={agora}
                eventosPorDia={eventosPorDia}
                selecionado={selecionado}
                onSelecionar={setSelecionado}
                onMudarMes={mudarMes}
                onIrParaHoje={irParaHoje}
              />

              <aside className="agenda-dia" aria-live="polite">
                <h2>{tituloDia}</h2>
                {doDia.length === 0 ? (
                  <p className="agenda-vazio">Nenhum agendamento neste dia.</p>
                ) : (
                  <ul>
                    {doDia.map((item) => (
                      <li key={item.id}><CartaoAgendamento agendamento={item} /></li>
                    ))}
                  </ul>
                )}
              </aside>
            </div>

            <section className="agenda-proximos">
              <h2>Próximos agendamentos</h2>
              {proximos.length === 0 ? (
                <p className="agenda-vazio">Você não tem agendamentos futuros.</p>
              ) : (
                <ul>
                  {proximos.map((item) => (
                    <li key={item.id}>
                      <CartaoAgendamento agendamento={item} mostrarData onClick={() => irParaAgendamento(item)} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
