// Acha datas e horários escritos em português dentro de uma mensagem.
//
// Entende, por exemplo:
//   "hoje", "amanhã", "depois de amanhã"
//   "segunda", "sexta-feira", "sábado que vem"
//   "25/11", "25/11/2026"
//   "dia 25", "dia 25 de novembro"
// seguidos (ou não) de horário: "às 15h", "15h30", "15:30", "às 15", "meio-dia"
// e também horário sozinho: "às 15h", "14:30" (vale para hoje, ou amanhã se já passou).
//
// A data é calculada a partir de `referencia` (o momento em que a mensagem foi enviada),
// para "amanhã" numa mensagem antiga não virar o "amanhã" de hoje.

const MESES = {
  janeiro: 0,
  fevereiro: 1,
  marco: 2,
  março: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
};

const DIAS_DA_SEMANA = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  terça: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
  sábado: 6,
};

const NOMES_DOS_MESES = Object.keys(MESES).join('|');

const PADRAO = new RegExp(
  [
    String.raw`(?<depois>depois\s+de\s+amanh[ãa])`,
    String.raw`(?<amanha>amanh[ãa])`,
    String.raw`(?<hoje>hoje)`,
    String.raw`(?<semana>segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado|domingo)(?:-feira)?(?:\s+(?:que\s+vem|pr[óo]xim[ao]))?`,
    String.raw`(?<dm>(?<d>\d{1,2})\/(?<m>\d{1,2})(?:\/(?<a>\d{4}|\d{2}))?)`,
    String.raw`dia\s+(?<dd>\d{1,2})(?![\d/])(?:\s+de\s+(?<mes>${NOMES_DOS_MESES}))?`,
    // horário sozinho: "15h", "15h30", "15:30", "às 15h", "meio-dia"
    String.raw`(?<hs>(?:[àa]s\s+)?(?<hh>\d{1,2})(?:h(?<hm>\d{2})?|:(?<hm2>\d{2})))`,
    String.raw`(?<meiodia>meio[-\s]dia)`,
  ].join('|'),
  'giu',
);

// Horário logo depois de uma data: " às 15h", ", 15:30", " de 9h", " meio-dia"
const HORA_DEPOIS = new RegExp(
  String.raw`^(?:[\s,]+(?:(?:de|em)\s+)?(?:[àa]s\s+)?(?<h>\d{1,2})(?:h(?<mi>\d{2})?|:(?<mi2>\d{2}))|[\s,]+[àa]s\s+(?<h3>\d{1,2})(?![\d:/hH])|[\s,]+(?<md>meio[-\s]dia))`,
  'iu',
);

function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function somarDias(data, dias) {
  const nova = inicioDoDia(data);
  nova.setDate(nova.getDate() + dias);
  return nova;
}

function normalizar(palavra) {
  return palavra.toLowerCase();
}

// Hora válida? devolve { h, mi } ou null.
function lerHora(h, mi) {
  const hora = Number(h);
  const minuto = mi === undefined || mi === '' ? 0 : Number(mi);
  if (!Number.isInteger(hora) || hora > 23 || minuto > 59) return null;
  return { h: hora, mi: minuto };
}

function diaDoMes(referencia, dia, mes) {
  // mes: 0-11 ou undefined (próximo "dia N" a partir da referência)
  const base = inicioDoDia(referencia);
  if (mes === undefined) {
    let candidato = new Date(base.getFullYear(), base.getMonth(), dia);
    if (candidato.getDate() !== dia || candidato < base) {
      // já passou neste mês (ou o mês não tem esse dia): tenta os próximos meses
      for (let i = 1; i <= 12; i += 1) {
        candidato = new Date(base.getFullYear(), base.getMonth() + i, dia);
        if (candidato.getDate() === dia) break;
      }
    }
    return candidato.getDate() === dia ? candidato : null;
  }
  let ano = base.getFullYear();
  let candidato = new Date(ano, mes, dia);
  if (candidato.getDate() !== dia) return null;
  if (candidato < base) {
    ano += 1;
    candidato = new Date(ano, mes, dia);
    if (candidato.getDate() !== dia) return null;
  }
  return candidato;
}

// Devolve [{ inicio, fim, texto, data (Date), temHora (boolean) }] na ordem do texto.
export function acharDatas(texto, referencia = new Date()) {
  if (!texto) return [];

  const achados = [];
  const regex = new RegExp(PADRAO.source, PADRAO.flags);
  let ultimoFim = 0;
  let encontrado = regex.exec(texto);

  while (encontrado) {
    const g = encontrado.groups;
    const comeco = encontrado.index;
    let fim = comeco + encontrado[0].length;
    let data = null;
    let hora = null;

    const antes = texto[comeco - 1];
    const depois = texto[fim];
    const colado = (c) => c !== undefined && /[\p{L}\d]/u.test(c);

    if (comeco >= ultimoFim && !colado(antes) && !colado(depois)) {
      if (g.hs !== undefined) {
        hora = lerHora(g.hh, g.hm ?? g.hm2);
        if (hora) data = inicioDoDia(referencia);
      } else if (g.meiodia !== undefined) {
        hora = { h: 12, mi: 0 };
        data = inicioDoDia(referencia);
      } else if (g.depois !== undefined) {
        data = somarDias(referencia, 2);
      } else if (g.amanha !== undefined) {
        data = somarDias(referencia, 1);
      } else if (g.hoje !== undefined) {
        data = inicioDoDia(referencia);
      } else if (g.semana !== undefined) {
        const alvo = DIAS_DA_SEMANA[normalizar(g.semana).replace('ç', 'c').replace('á', 'a')];
        let diferenca = (alvo - referencia.getDay() + 7) % 7;
        if (diferenca === 0) diferenca = 7;
        data = somarDias(referencia, diferenca);
      } else if (g.dm !== undefined) {
        const dia = Number(g.d);
        const mes = Number(g.m) - 1;
        let ano = g.a ? Number(g.a) : referencia.getFullYear();
        if (ano < 100) ano += 2000;
        let candidato = new Date(ano, mes, dia);
        if (candidato.getMonth() !== mes || candidato.getDate() !== dia) {
          candidato = null;
        } else if (!g.a && candidato < inicioDoDia(referencia)) {
          candidato = new Date(ano + 1, mes, dia);
        }
        data = candidato;
      } else if (g.dd !== undefined) {
        const dia = Number(g.dd);
        const mes = g.mes ? MESES[normalizar(g.mes)] : undefined;
        if (dia >= 1 && dia <= 31) data = diaDoMes(referencia, dia, mes);
      }

      // horário colado na data ("amanhã às 15h")
      if (data && !hora && g.hs === undefined && g.meiodia === undefined) {
        const resto = texto.slice(fim);
        const h = HORA_DEPOIS.exec(resto);
        if (h) {
          const hg = h.groups;
          const lida = hg.md
            ? { h: 12, mi: 0 }
            : lerHora(hg.h ?? hg.h3, hg.mi ?? hg.mi2);
          if (lida) {
            hora = lida;
            fim += h[0].length;
          }
        }
      }
    }

    if (data) {
      const completa = new Date(data);
      if (hora) completa.setHours(hora.h, hora.mi, 0, 0);

      // horário sozinho que já passou vale para amanhã
      const sohora = g.hs !== undefined || g.meiodia !== undefined;
      if (sohora && completa < referencia) completa.setDate(completa.getDate() + 1);

      achados.push({
        inicio: comeco,
        fim,
        texto: texto.slice(comeco, fim),
        data: completa,
        temHora: Boolean(hora),
      });
      ultimoFim = fim;
      regex.lastIndex = fim;
    }

    encontrado = regex.exec(texto);
  }

  return achados;
}

function doisDigitos(n) {
  return String(n).padStart(2, '0');
}

// Texto da URL para abrir o formulário já preenchido em /agendamentos.
export function paramsDoAgendamento(achado, matchId) {
  const { data, temHora } = achado;
  const params = new URLSearchParams();
  if (matchId !== undefined && matchId !== null) params.set('match', String(matchId));
  params.set('data', `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`);
  if (temHora) params.set('hora', `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`);
  return params.toString();
}
