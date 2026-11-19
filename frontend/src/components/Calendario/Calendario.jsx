import { chaveDoDia, STATUS } from '../../services/agendamentoService';
import './Calendario.css';

const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export default function Calendario({ mes, hoje, eventosPorDia, selecionado, onSelecionar, onMudarMes, onIrParaHoje }) {
  const ano = mes.getFullYear();
  const numeroMes = mes.getMonth();
  const vazios = new Date(ano, numeroMes, 1).getDay();
  const totalDias = new Date(ano, numeroMes + 1, 0).getDate();

  const chaveHoje = chaveDoDia(hoje);
  const chaveSelecionada = chaveDoDia(selecionado);

  const celulas = [];
  for (let i = 0; i < vazios; i += 1) celulas.push(null);
  for (let d = 1; d <= totalDias; d += 1) celulas.push(new Date(ano, numeroMes, d));

  const titulo = mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <section className="cal" aria-label="Calendário de agendamentos">
      <header className="cal-topo">
        <button type="button" className="cal-seta" onClick={() => onMudarMes(-1)} aria-label="Mês anterior">
          ‹
        </button>
        <h2 className="cal-titulo">{titulo}</h2>
        <button type="button" className="cal-seta" onClick={() => onMudarMes(1)} aria-label="Próximo mês">
          ›
        </button>
        <button type="button" className="cal-hoje" onClick={onIrParaHoje}>
          Hoje
        </button>
      </header>

      <div className="cal-grade" role="grid">
        {DIAS_SEMANA.map((nome) => (
          <span key={nome} className="cal-semana" role="columnheader">{nome}</span>
        ))}

        {celulas.map((data, i) => {
          if (!data) return <span key={`vazio-${i}`} className="cal-vazio" />;

          const chave = chaveDoDia(data);
          const eventos = eventosPorDia.get(chave) ?? [];
          const classes = [
            'cal-dia',
            chave === chaveHoje ? 'cal-dia--hoje' : '',
            chave === chaveSelecionada ? 'cal-dia--selecionado' : '',
          ].join(' ');
          const descricao = eventos.length
            ? `${data.getDate()}, ${eventos.length} ${eventos.length === 1 ? 'agendamento' : 'agendamentos'}`
            : `${data.getDate()}, sem agendamentos`;

          return (
            <button
              key={chave}
              type="button"
              className={classes}
              onClick={() => onSelecionar(data)}
              aria-pressed={chave === chaveSelecionada}
              aria-label={descricao}
            >
              <span className="cal-numero">{data.getDate()}</span>
              <span className="cal-marcas" aria-hidden="true">
                {eventos.slice(0, 3).map((evento) => (
                  <i key={evento.id} style={{ background: STATUS[evento.status]?.cor }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <ul className="cal-legenda">
        {Object.values(STATUS).map(({ rotulo, cor }) => (
          <li key={rotulo}>
            <i style={{ background: cor }} aria-hidden="true" />
            {rotulo}
          </li>
        ))}
      </ul>
    </section>
  );
}
