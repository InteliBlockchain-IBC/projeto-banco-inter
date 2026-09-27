// Dados e regras 100% mockados — sem chamadas de API ou blockchain reais.
// Isso simula o que o backend/contrato deveriam devolver (ver RF01-RF06 no TAP).

export const CDI_REFERENCIA = 10.75;
export const LIMITE_DISPONIVEL = 4200000;

export const STATUS = ["Ofertada", "Aceita", "Liquidada", "Cancelada"];

export const operacoesIniciais = [
  {
    id: "OP-1042",
    contraparte: "Banco Fictício A",
    valor: 500000,
    taxaCdi: 10.75,
    prazoDias: 1,
    status: "Ofertada",
    minha: true,
    hash: null,
    criadaEm: "2026-09-26T09:12:00",
  },
  {
    id: "OP-1041",
    contraparte: "Banco Fictício B",
    valor: 1200000,
    taxaCdi: 10.8,
    prazoDias: 1,
    status: "Aceita",
    minha: false,
    hash: null,
    criadaEm: "2026-09-26T08:40:00",
  },
  {
    id: "OP-1039",
    contraparte: "Banco Fictício C",
    valor: 800000,
    taxaCdi: 10.7,
    prazoDias: 2,
    status: "Liquidada",
    minha: false,
    hash: "0x8f3ac1e7...c21d",
    criadaEm: "2026-09-25T16:05:00",
  },
  {
    id: "OP-1035",
    contraparte: "Banco Fictício D",
    valor: 300000,
    taxaCdi: 10.9,
    prazoDias: 1,
    status: "Cancelada",
    minha: true,
    hash: null,
    criadaEm: "2026-09-24T11:30:00",
  },
];

export function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function formatarData(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function gerarHashFicticio() {
  const rnd = () => Math.random().toString(16).slice(2, 10);
  return `0x${rnd()}...${rnd().slice(0, 4)}`;
}

// Ações permitidas dependem do status e de quem é o "dono" da oferta —
// espelha as regras RF02/RF06 e as diretrizes de UX do documentacao.md.
export function acoesDisponiveis(operacao) {
  if (operacao.status === "Ofertada" && operacao.minha) return ["cancelar"];
  if (operacao.status === "Ofertada" && !operacao.minha) return ["aceitar"];
  return [];
}
