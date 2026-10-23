// Serviços e mocks do Crédito Interfinanceiro - Banco Inter

export const CURRENT_CDI = 10.65; // % a.a.
export const TOTAL_LIMIT = 500000000; // R$ 500.000.000,00
export const DEFAULT_USED_LIMIT = 125000000; // R$ 125.000.000,00 (25%)
export const OFFERED_VOLUME_24H = 120000000; // R$ 120.000.000,00

export const STATUS_LIST = ["Todas", "Ofertadas", "Aceitas", "Liquidadas", "Negadas", "Canceladas"];

export const RECENT_BANKS = [
  { id: "banco-b", name: "Banco B", cdiRate: "101,5% CDI", limit: 45000000, term: "1 dia", limitPercent: 9 },
  { id: "banco-d", name: "Banco D", cdiRate: "102,0% CDI", limit: 70000000, term: "1 dia", limitPercent: 14 },
  { id: "banco-f", name: "Banco F", cdiRate: "101,8% CDI", limit: 30000000, term: "2 dias", limitPercent: 6 },
];

// Amostras distribuídas ao longo da semana, do mês e do semestre para o gráfico.
const myHistoricalOffers = [
  { number: 13, createdAt: "2026-09-21T09:10:00", status: "Ofertada", value: 22000000, rate: 101.4 },
  { number: 14, createdAt: "2026-09-22T08:40:00", status: "Negada", value: 31000000, rate: 101.7 },
  { number: 15, createdAt: "2026-09-22T15:20:00", status: "Aceita", value: 47000000, rate: 101.5 },
  { number: 16, createdAt: "2026-09-23T09:35:00", status: "Aceita", value: 35000000, rate: 101.8 },
  { number: 17, createdAt: "2026-09-23T11:10:00", status: "Negada", value: 28000000, rate: 102.1 },
  { number: 18, createdAt: "2026-09-23T16:05:00", status: "Aceita", value: 54000000, rate: 101.6 },
  { number: 19, createdAt: "2026-09-24T14:25:00", status: "Aceita", value: 33000000, rate: 101.9 },
  { number: 20, createdAt: "2026-09-24T17:40:00", status: "Ofertada", value: 26000000, rate: 101.3 },
  { number: 21, createdAt: "2026-09-25T10:15:00", status: "Negada", value: 39000000, rate: 102.0 },
  { number: 22, createdAt: "2026-09-25T15:50:00", status: "Aceita", value: 44000000, rate: 101.7 },
  { number: 23, createdAt: "2026-09-26T12:30:00", status: "Negada", value: 37000000, rate: 101.5 },
  { number: 24, createdAt: "2026-09-27T10:25:00", status: "Aceita", value: 29000000, rate: 101.8 },
  { number: 25, createdAt: "2026-04-08T09:20:00", status: "Aceita", value: 32000000, rate: 101.4 },
  { number: 26, createdAt: "2026-04-21T14:10:00", status: "Negada", value: 27000000, rate: 101.9 },
  { number: 27, createdAt: "2026-05-13T11:45:00", status: "Aceita", value: 41000000, rate: 101.6 },
  { number: 28, createdAt: "2026-06-04T08:50:00", status: "Negada", value: 24000000, rate: 102.0 },
  { number: 29, createdAt: "2026-06-22T16:30:00", status: "Aceita", value: 36000000, rate: 101.7 },
  { number: 30, createdAt: "2026-07-17T10:05:00", status: "Negada", value: 30000000, rate: 101.8 },
  { number: 31, createdAt: "2026-08-06T13:15:00", status: "Aceita", value: 49000000, rate: 101.5 },
  { number: 32, createdAt: "2026-08-25T09:55:00", status: "Negada", value: 21000000, rate: 102.1 },
  { number: 33, createdAt: "2026-09-03T09:05:00", status: "Aceita", value: 34000000, rate: 101.4 },
  { number: 34, createdAt: "2026-09-11T15:35:00", status: "Negada", value: 26000000, rate: 101.9 },
  { number: 35, createdAt: "2026-09-17T10:50:00", status: "Aceita", value: 38000000, rate: 101.6 },
].map(({ number, createdAt, status, value, rate }) => ({
  id: `#${String(number).padStart(3, "0")}`,
  rawId: `OP-${String(number).padStart(3, "0")}`,
  counterparty: "Banco A (Sua oferta)",
  value,
  cdiRate: `${rate.toFixed(1).replace(".", ",")}% CDI`,
  ratePercent: rate,
  termDays: 1,
  termLabel: "1 dia (Overnight)",
  status,
  mine: true,
  impactoLimite: Math.round((value / TOTAL_LIMIT) * 100),
  saved: false,
  hash: null,
  blockNumber: null,
  createdAt,
}));

const additionalAvailableOffers = [
  { number: 36, bank: "Banco K", value: 28000000, rate: 101.6, termDays: 1, createdAt: "2026-09-28T08:10:00" },
  { number: 37, bank: "Banco L", value: 42000000, rate: 102.1, termDays: 2, createdAt: "2026-09-28T08:35:00" },
  { number: 38, bank: "Banco M", value: 18000000, rate: 101.3, termDays: 1, createdAt: "2026-09-28T09:05:00" },
  { number: 39, bank: "Banco N", value: 55000000, rate: 102.4, termDays: 3, createdAt: "2026-09-28T09:40:00" },
  { number: 40, bank: "Banco O", value: 32000000, rate: 101.9, termDays: 2, createdAt: "2026-09-28T10:15:00" },
  { number: 41, bank: "Banco P", value: 24000000, rate: 101.7, termDays: 1, createdAt: "2026-09-28T10:50:00" },
].map(({ number, bank, value, rate, termDays, createdAt }) => ({
  id: `#${String(number).padStart(3, "0")}`,
  rawId: `OP-${String(number).padStart(3, "0")}`,
  counterparty: bank,
  value,
  cdiRate: `${rate.toFixed(1).replace(".", ",")}% CDI`,
  ratePercent: rate,
  termDays,
  termLabel: termDays === 1 ? "1 dia (Overnight)" : `${termDays} dias`,
  status: "Ofertada",
  mine: false,
  impactoLimite: Math.round((value / TOTAL_LIMIT) * 100),
  saved: false,
  hash: null,
  blockNumber: null,
  createdAt,
}));

export const initialOperations = [
  {
    id: "#001",
    rawId: "OP-001",
    counterparty: "Banco B",
    value: 50000000,
    cdiRate: "101,5% CDI",
    ratePercent: 101.5,
    termDays: 1,
    termLabel: "1 dia (Overnight)",
    status: "Ofertada",
    mine: false,
    impactoLimite: 10,
    saved: true,
    hash: null,
    blockNumber: null,
    createdAt: "2026-09-27T08:15:00",
  },
  {
    id: "#002",
    rawId: "OP-002",
    counterparty: "Banco C",
    value: 30000000,
    cdiRate: "101,8% CDI",
    ratePercent: 101.8,
    termDays: 2,
    termLabel: "2 dias",
    status: "Ofertada",
    mine: false,
    impactoLimite: 6,
    saved: false,
    hash: null,
    blockNumber: null,
    createdAt: "2026-09-27T08:45:00",
  },
  {
    id: "#003",
    rawId: "OP-003",
    counterparty: "Banco D",
    value: 75000000,
    cdiRate: "102,0% CDI",
    ratePercent: 102.0,
    termDays: 1,
    termLabel: "1 dia (Overnight)",
    status: "Aceita",
    mine: false,
    impactoLimite: 15,
    saved: true,
    hash: "0x3b92f7...81c4",
    blockNumber: 6542109,
    createdAt: "2026-09-27T07:30:00",
  },
  {
    id: "#004",
    rawId: "OP-004",
    counterparty: "Banco E",
    value: 40000000,
    cdiRate: "101,2% CDI",
    ratePercent: 101.2,
    termDays: 7,
    termLabel: "7 dias",
    status: "Liquidada",
    mine: false,
    impactoLimite: 8,
    saved: false,
    hash: "0x8f3ac1e7d904b321...c21d",
    blockNumber: 6541890,
    createdAt: "2026-09-26T16:20:00",
  },
  {
    id: "#005",
    rawId: "OP-005",
    counterparty: "Banco A (Sua oferta)",
    value: 25000000,
    cdiRate: "101,5% CDI",
    ratePercent: 101.5,
    termDays: 1,
    termLabel: "1 dia (Overnight)",
    status: "Ofertada",
    mine: true,
    impactoLimite: 5,
    saved: false,
    hash: null,
    blockNumber: null,
    createdAt: "2026-09-27T09:00:00",
  },
  {
    id: "#006",
    rawId: "OP-006",
    counterparty: "Banco F",
    value: 35000000,
    cdiRate: "101,7% CDI",
    ratePercent: 101.7,
    termDays: 1,
    termLabel: "1 dia (Overnight)",
    status: "Ofertada",
    mine: false,
    impactoLimite: 7,
    saved: false,
    hash: null,
    blockNumber: null,
    createdAt: "2026-09-27T09:12:00",
  },
  {
    id: "#007",
    rawId: "OP-007",
    counterparty: "Banco G",
    value: 60000000,
    cdiRate: "102,2% CDI",
    ratePercent: 102.2,
    termDays: 2,
    termLabel: "2 dias",
    status: "Cancelada",
    mine: true,
    impactoLimite: 12,
    saved: false,
    hash: null,
    blockNumber: null,
    createdAt: "2026-09-26T11:15:00",
  },
  {
    id: "#008",
    rawId: "OP-008",
    counterparty: "Banco H",
    value: 45000000,
    cdiRate: "101,4% CDI",
    ratePercent: 101.4,
    termDays: 1,
    termLabel: "1 dia (Overnight)",
    status: "Liquidada",
    mine: false,
    impactoLimite: 9,
    saved: false,
    hash: "0x7a4bc81290e5...93ff",
    blockNumber: 6540112,
    createdAt: "2026-09-25T14:40:00",
  },
  {
    id: "#009",
    rawId: "OP-009",
    counterparty: "Banco I",
    value: 20000000,
    cdiRate: "101,9% CDI",
    ratePercent: 101.9,
    termDays: 3,
    termLabel: "3 dias",
    status: "Liquidada",
    mine: false,
    impactoLimite: 4,
    saved: false,
    hash: "0x12dca849f2...847b",
    blockNumber: 6539201,
    createdAt: "2026-09-25T10:05:00",
  },
  {
    id: "#010",
    rawId: "OP-010",
    counterparty: "Banco J",
    value: 80000000,
    cdiRate: "102,1% CDI",
    ratePercent: 102.1,
    termDays: 1,
    termLabel: "1 dia (Overnight)",
    status: "Cancelada",
    mine: false,
    impactoLimite: 16,
    saved: false,
    hash: null,
    blockNumber: null,
    createdAt: "2026-09-24T15:30:00",
  },
  {
    id: "#011",
    rawId: "OP-011",
    counterparty: "Banco A (Sua oferta)",
    value: 42000000,
    cdiRate: "101,6% CDI",
    ratePercent: 101.6,
    termDays: 2,
    termLabel: "2 dias",
    status: "Aceita",
    mine: true,
    impactoLimite: 8,
    saved: false,
    hash: null,
    blockNumber: null,
    createdAt: "2026-09-25T09:30:00",
  },
  {
    id: "#012",
    rawId: "OP-012",
    counterparty: "Banco A (Sua oferta)",
    value: 18000000,
    cdiRate: "101,3% CDI",
    ratePercent: 101.3,
    termDays: 1,
    termLabel: "1 dia (Overnight)",
    status: "Negada",
    mine: true,
    impactoLimite: 4,
    saved: false,
    hash: null,
    blockNumber: null,
    createdAt: "2026-09-24T10:40:00",
  },
  ...myHistoricalOffers,
  ...additionalAvailableOffers,
];

export function formatCurrency(value) {
  if (value === undefined || value === null || isNaN(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const data = d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${data} às ${time}`;
}

export function createMockHash() {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 40; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${hash.slice(0, 10)}...${hash.slice(-4)}`;
}

export function createFullHash() {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}
