// Serviços e mocks do Crédito Interfinanceiro - Banco Inter

export const CDI_VIGENTE = 10.65; // % a.a.
export const LIMITE_TOTAL = 500000000; // R$ 500.000.000,00
export const LIMITE_UTILIZADO_PADRAO = 125000000; // R$ 125.000.000,00 (25%)
export const VOLUME_OFERTADO_24H = 120000000; // R$ 120.000.000,00
export const CARTEIRA_CONECTADA = "0x82049Af37c89C2e1...7a1c";
export const REDE_PADRAO = "Sepolia";

export const STATUS_LIST = ["Todas", "Ofertadas", "Aceitas", "Liquidadas", "Canceladas"];

export const BANCOS_RECENTES = [
  { id: "banco-b", nome: "Banco B", taxaCdi: "101,5% CDI", limite: 45000000, prazo: "1 dia", percentualLimite: 9 },
  { id: "banco-d", nome: "Banco D", taxaCdi: "102,0% CDI", limite: 70000000, prazo: "1 dia", percentualLimite: 14 },
  { id: "banco-f", nome: "Banco F", taxaCdi: "101,8% CDI", limite: 30000000, prazo: "2 dias", percentualLimite: 6 },
];

export const operacoesIniciais = [
  {
    id: "#001",
    rawId: "OP-001",
    contraparte: "Banco B",
    valor: 50000000,
    taxaCdi: "101,5% CDI",
    taxaPercent: 101.5,
    prazoDias: 1,
    prazoTexto: "1 dia (Overnight)",
    status: "Ofertada",
    minha: false,
    impactoLimite: 10,
    salva: true,
    hash: null,
    bloco: null,
    criadaEm: "2026-09-27T08:15:00",
  },
  {
    id: "#002",
    rawId: "OP-002",
    contraparte: "Banco C",
    valor: 30000000,
    taxaCdi: "101,8% CDI",
    taxaPercent: 101.8,
    prazoDias: 2,
    prazoTexto: "2 dias",
    status: "Ofertada",
    minha: false,
    impactoLimite: 6,
    salva: false,
    hash: null,
    bloco: null,
    criadaEm: "2026-09-27T08:45:00",
  },
  {
    id: "#003",
    rawId: "OP-003",
    contraparte: "Banco D",
    valor: 75000000,
    taxaCdi: "102,0% CDI",
    taxaPercent: 102.0,
    prazoDias: 1,
    prazoTexto: "1 dia (Overnight)",
    status: "Aceita",
    minha: false,
    impactoLimite: 15,
    salva: true,
    hash: "0x3b92f7...81c4",
    bloco: 6542109,
    criadaEm: "2026-09-27T07:30:00",
  },
  {
    id: "#004",
    rawId: "OP-004",
    contraparte: "Banco E",
    valor: 40000000,
    taxaCdi: "101,2% CDI",
    taxaPercent: 101.2,
    prazoDias: 7,
    prazoTexto: "7 dias",
    status: "Liquidada",
    minha: false,
    impactoLimite: 8,
    salva: false,
    hash: "0x8f3ac1e7d904b321...c21d",
    bloco: 6541890,
    criadaEm: "2026-09-26T16:20:00",
  },
  {
    id: "#005",
    rawId: "OP-005",
    contraparte: "Banco A (Sua oferta)",
    valor: 25000000,
    taxaCdi: "101,5% CDI",
    taxaPercent: 101.5,
    prazoDias: 1,
    prazoTexto: "1 dia (Overnight)",
    status: "Ofertada",
    minha: true,
    impactoLimite: 5,
    salva: false,
    hash: null,
    bloco: null,
    criadaEm: "2026-09-27T09:00:00",
  },
  {
    id: "#006",
    rawId: "OP-006",
    contraparte: "Banco F",
    valor: 35000000,
    taxaCdi: "101,7% CDI",
    taxaPercent: 101.7,
    prazoDias: 1,
    prazoTexto: "1 dia (Overnight)",
    status: "Ofertada",
    minha: false,
    impactoLimite: 7,
    salva: false,
    hash: null,
    bloco: null,
    criadaEm: "2026-09-27T09:12:00",
  },
  {
    id: "#007",
    rawId: "OP-007",
    contraparte: "Banco G",
    valor: 60000000,
    taxaCdi: "102,2% CDI",
    taxaPercent: 102.2,
    prazoDias: 2,
    prazoTexto: "2 dias",
    status: "Cancelada",
    minha: true,
    impactoLimite: 12,
    salva: false,
    hash: null,
    bloco: null,
    criadaEm: "2026-09-26T11:15:00",
  },
  {
    id: "#008",
    rawId: "OP-008",
    contraparte: "Banco H",
    valor: 45000000,
    taxaCdi: "101,4% CDI",
    taxaPercent: 101.4,
    prazoDias: 1,
    prazoTexto: "1 dia (Overnight)",
    status: "Liquidada",
    minha: false,
    impactoLimite: 9,
    salva: false,
    hash: "0x7a4bc81290e5...93ff",
    bloco: 6540112,
    criadaEm: "2026-09-25T14:40:00",
  },
  {
    id: "#009",
    rawId: "OP-009",
    contraparte: "Banco I",
    valor: 20000000,
    taxaCdi: "101,9% CDI",
    taxaPercent: 101.9,
    prazoDias: 3,
    prazoTexto: "3 dias",
    status: "Liquidada",
    minha: false,
    impactoLimite: 4,
    salva: false,
    hash: "0x12dca849f2...847b",
    bloco: 6539201,
    criadaEm: "2026-09-25T10:05:00",
  },
  {
    id: "#010",
    rawId: "OP-010",
    contraparte: "Banco J",
    valor: 80000000,
    taxaCdi: "102,1% CDI",
    taxaPercent: 102.1,
    prazoDias: 1,
    prazoTexto: "1 dia (Overnight)",
    status: "Cancelada",
    minha: false,
    impactoLimite: 16,
    salva: false,
    hash: null,
    bloco: null,
    criadaEm: "2026-09-24T15:30:00",
  },
];

export function formatarMoeda(valor) {
  if (valor === undefined || valor === null || isNaN(valor)) return "R$ 0,00";
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatarData(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatarDataHora(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const data = d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const hora = d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${data} às ${hora}`;
}

export function gerarHashFicticio() {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 40; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${hash.slice(0, 10)}...${hash.slice(-4)}`;
}

export function gerarHashCompleto() {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}
