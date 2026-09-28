const UM_DIA = 24 * 60 * 60 * 1000;
const DATA_ATUAL = Date.now();

function dataDaOferta(oferta) {
  return Date.parse(`${oferta.criadaEm.slice(0, 10)}T00:00:00Z`);
}

function rotuloDia(data) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(data);
}

export function resumirOfertas(ofertas, periodo) {
  const datas = ofertas.map(dataDaOferta);
  const dataFinal = datas.length ? Math.max(...datas) : DATA_ATUAL;
  const referencia = new Date(Math.floor(dataFinal / UM_DIA) * UM_DIA);
  const ano = referencia.getUTCFullYear();
  const mes = referencia.getUTCMonth();
  const fimExclusivo = referencia.getTime() + UM_DIA;

  let intervalos;
  let descricao;

  if (periodo === "mes") {
    const quantidade = Math.ceil(referencia.getUTCDate() / 7);
    intervalos = Array.from({ length: quantidade }, (_, indice) => {
      const inicio = Date.UTC(ano, mes, 1 + indice * 7);
      const fim = Math.min(inicio + 7 * UM_DIA, fimExclusivo);
      const ultimoDia = new Date(fim - UM_DIA).getUTCDate();
      return { inicio, fim, label: `${new Date(inicio).getUTCDate()}–${ultimoDia}` };
    });
    descricao = "Acumulado no mês, por semana";
  } else if (periodo === "semestre") {
    intervalos = Array.from({ length: 6 }, (_, indice) => {
      const inicio = Date.UTC(ano, mes - 5 + indice, 1);
      const fim = Math.min(Date.UTC(ano, mes - 4 + indice, 1), fimExclusivo);
      const label = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" })
        .format(new Date(inicio)).replace(".", "");
      return { inicio, fim, label };
    });
    descricao = "Acumulado no semestre, por mês";
  } else {
    intervalos = Array.from({ length: 7 }, (_, indice) => {
      const inicio = referencia.getTime() - (6 - indice) * UM_DIA;
      return { inicio, fim: inicio + UM_DIA, label: rotuloDia(new Date(inicio)) };
    });
    descricao = "Acumulado na semana, por dia";
  }

  const acumulado = { feitas: 0, aceitas: 0, negadas: 0 };
  const colunas = intervalos.map(({ inicio, fim, label }) => {
    const ofertasNoIntervalo = ofertas.filter((oferta) => {
      const data = dataDaOferta(oferta);
      return data >= inicio && data < fim;
    });
    acumulado.feitas += ofertasNoIntervalo.length;
    acumulado.aceitas += ofertasNoIntervalo.filter((oferta) => ["Aceita", "Liquidada"].includes(oferta.status)).length;
    acumulado.negadas += ofertasNoIntervalo.filter((oferta) => oferta.status === "Negada").length;
    return { label, ...acumulado };
  });

  return { colunas, totais: { ...acumulado }, descricao };
}
