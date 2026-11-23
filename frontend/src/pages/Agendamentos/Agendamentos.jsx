import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Calendario from '../../components/Calendario/Calendario';
import AgendamentoForm from '../../components/AgendamentoForm/AgendamentoForm';
import ConfirmarAcao from '../../components/ConfirmarAcao/ConfirmarAcao';
import { logout } from '../../services/authService';
import {
  listarAgendamentos,
  listarTrocasAtivas,
  criarAgendamento,
  atualizarAgendamento,
  chaveDoDia,
  STATUS,
} from '../../services/agendamentoService';
import './Agendamentos.css';

function hora(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function mensagemDeErro(err) {
  const primeiro = Object.values(err.errors ?? {})[0]?.[0];
  return primeiro ?? err.message ?? 'Não foi possível concluir a ação.';
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

// Botões de cada agendamento. Quem propôs o horário não confirma o próprio horário:
// a confirmação é sempre da outra pessoa.
function Acoes({ agendamento, onRemarcar, onStatus, onConversar, ocupado }) {
  const { status, criado_por_mim: souEu, parceiro } = agendamento;
  if (status === 'concluida' || status === 'cancelada') return null;

  const recusando = status === 'pendente' && !souEu;

  return (
    <div className="agenda-acoes">
      {status === 'pendente' && souEu && (
        <p className="agenda-espera">Aguardando {parceiro.nome} confirmar.</p>
      )}

      {recusando && (
        <button type="button" className="agenda-acao agenda-acao--principal" disabled={ocupado} onClick={() => onStatus(agendamento, 'confirmada')}>
          Confirmar
        </button>
      )}

      {status === 'confirmada' && (
        <button type="button" className="agenda-acao agenda-acao--principal" disabled={ocupado} onClick={() => onStatus(agendamento, 'concluida')}>
          Marcar como concluída
        </button>
      )}

      <button type="button" className="agenda-acao" disabled={ocupado} onClick={() => onRemarcar(agendamento)}>
        Remarcar
      </button>

      <button type="button" className="agenda-acao" onClick={onConversar} aria-label={`Conversar com ${parceiro.nome} no chat`}>
        Conversar
      </button>

      <button
        type="button"
        className="agenda-acao agenda-acao--perigo"
        disabled={ocupado}
        onClick={() =>
          onStatus(
            agendamento,
            'cancelada',
            recusando
              ? {
                  titulo: 'Recusar este horário?',
                  mensagem: `${parceiro.nome} será avisado de que o horário foi recusado.`,
                  rotulo: 'Sim, recusar',
                }
              : {
                  titulo: 'Cancelar este agendamento?',
                  mensagem: 'Essa ação não pode ser desfeita.',
                  rotulo: 'Sim, cancelar',
                },
          )
        }
      >
        {recusando ? 'Recusar' : 'Cancelar'}
      </button>
    </div>
  );
}

export default function Agendamentos() {
  const navigate = useNavigate();
  const { usuario } = useOutletContext() ?? {};

  const [agora] = useState(() => new Date());
  const [mes, setMes] = useState(() => new Date(agora.getFullYear(), agora.getMonth(), 1));
  const [selecionado, setSelecionado] = useState(agora);
  const [agendamentos, setAgendamentos] = useState([]);
  const [trocas, setTrocas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  // formulario: null (fechado) ou { agendamento } (null = novo, objeto = remarcar)
  const [formulario, setFormulario] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState('');

  // Trava de clique duplo nos botões de status (ref: vale na hora; state: desabilita o botão).
  const agindoRef = useRef(false);
  const [agindo, setAgindo] = useState(false);

  // confirmação pendente: null ou { item, status, titulo, mensagem, rotulo }
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    let cancelado = false;
    Promise.all([listarAgendamentos(), listarTrocasAtivas().catch(() => [])])
      .then(([lista, ativas]) => {
        if (cancelado) return;
        setAgendamentos(lista);
        setTrocas(ativas);
      })
      .catch((err) => {
        if (cancelado) return;
        if (err.status === 401 || err.status === 419) {
          navigate('/login', { replace: true });
          return;
        }
        setErro(mensagemDeErro(err));
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [navigate]);

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

  function abrirNovo() {
    setErroForm('');
    setFormulario({ agendamento: null });
  }

  function abrirRemarcar(item) {
    setErroForm('');
    setFormulario({ agendamento: item });
  }

  function tratarErroDeSessao(err) {
    if (err.status === 401 || err.status === 419) {
      navigate('/login', { replace: true });
      return true;
    }
    return false;
  }

  async function salvar(dados) {
    const remarcando = formulario?.agendamento ?? null;
    setSalvando(true);
    setErroForm('');
    try {
      const resultado = remarcando
        ? await atualizarAgendamento(remarcando.id, { inicio: dados.inicio, observacao: dados.observacao })
        : await criarAgendamento(dados);

      setAgendamentos((atual) =>
        remarcando ? atual.map((item) => (item.id === resultado.id ? resultado : item)) : [...atual, resultado],
      );
      irParaAgendamento(resultado);
      setFormulario(null);
      setAviso(
        remarcando
          ? 'Novo horário enviado. Aguarde a outra pessoa confirmar.'
          : 'Agendamento criado. Aguarde a outra pessoa confirmar.',
      );
    } catch (err) {
      if (!tratarErroDeSessao(err)) setErroForm(mensagemDeErro(err));
    } finally {
      setSalvando(false);
    }
  }

  // Ações que desfazem algo pedem confirmação em janela própria; as outras executam direto.
  function mudarStatus(item, status, confirmacao) {
    if (agindoRef.current) return;
    if (confirmacao) {
      setPedido({ item, status, ...confirmacao });
      return;
    }
    executarStatus(item, status);
  }

  async function executarStatus(item, status) {
    if (agindoRef.current) return;

    agindoRef.current = true;
    setAgindo(true);
    setErro('');
    setAviso('');
    try {
      const atualizado = await atualizarAgendamento(item.id, { status });
      setAgendamentos((atual) => atual.map((outro) => (outro.id === atualizado.id ? atualizado : outro)));
      setAviso(
        {
          confirmada: 'Agendamento confirmado.',
          concluida: 'Agendamento marcado como concluído.',
          cancelada: 'Agendamento cancelado.',
        }[status],
      );
    } catch (err) {
      if (!tratarErroDeSessao(err)) setErro(mensagemDeErro(err));
    } finally {
      agindoRef.current = false;
      setAgindo(false);
    }
  }

  async function sair() {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  }

  const dataInicial = chaveDoDia(selecionado) < chaveDoDia(agora) ? agora : selecionado;

  return (
    <div className="agenda-pagina">
      <Navbar usuario={usuario} onLogout={sair} onEditProfile={() => navigate('/perfil')} />

      <main className="agenda">
        <header className="agenda-cabecalho">
          <h1>Agendamentos</h1>
          <p>Suas trocas combinadas, organizadas por data.</p>
        </header>

        <div className="agenda-barra">
          <button type="button" className="agenda-novo" onClick={abrirNovo} disabled={carregando || trocas.length === 0}>
            + Novo agendamento
          </button>
          {!carregando && trocas.length === 0 && (
            <small>Você precisa de uma troca ativa (match) para agendar.</small>
          )}
        </div>

        {aviso && <p className="agenda-aviso" role="status">{aviso}</p>}
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
                      <li key={item.id}>
                        <CartaoAgendamento agendamento={item} />
                        <Acoes agendamento={item} onRemarcar={abrirRemarcar} onStatus={mudarStatus} onConversar={() => navigate('/chat')} ocupado={agindo} />
                      </li>
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

      {formulario && (
        <AgendamentoForm
          key={formulario.agendamento?.id ?? 'novo'}
          trocas={trocas}
          agendamento={formulario.agendamento}
          dataInicial={dataInicial}
          salvando={salvando}
          erro={erroForm}
          onSalvar={salvar}
          onCancelar={() => setFormulario(null)}
        />
      )}

      {pedido && (
        <ConfirmarAcao
          titulo={pedido.titulo}
          mensagem={pedido.mensagem}
          rotuloConfirmar={pedido.rotulo}
          perigo
          onConfirmar={() => {
            const { item, status } = pedido;
            setPedido(null);
            executarStatus(item, status);
          }}
          onCancelar={() => setPedido(null)}
        />
      )}
    </div>
  );
}
