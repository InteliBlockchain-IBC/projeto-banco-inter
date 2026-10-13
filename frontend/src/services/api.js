// Cliente HTTP da API do backend (InteliBlockchain-IBC/backend-banco-inter).
// Sucesso: { data, meta }. Erro: RFC 9457 (application/problem+json).
// Em desenvolvimento, VITE_API_URL fica vazio e o proxy do Vite encaminha /api.

const TAMANHO_PAGINA = 100;

export class ErroApi extends Error {
  constructor({ tipo, status = null, detalhe = "", correlationId = null }) {
    super(detalhe || tipo);
    this.name = "ErroApi";
    this.tipo = tipo; // "nao-encontrada" | "invalida" | "indisponivel" | "inesperado"
    this.status = status;
    this.detalhe = detalhe;
    this.correlationId = correlationId;
  }
}

function urlBase() {
  return (import.meta.env?.VITE_API_URL ?? "").replace(/\/$/, "");
}

function tipoPorStatus(status) {
  if (status === 404) return "nao-encontrada";
  if (status === 400) return "invalida";
  if (status >= 500) return "indisponivel";
  return "inesperado";
}

async function lerJson(resposta) {
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

export async function requisitarApi(caminho, { signal, fetchImpl = globalThis.fetch } = {}) {
  let resposta;
  try {
    resposta = await fetchImpl(`${urlBase()}${caminho}`, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (erro) {
    if (erro?.name === "AbortError") throw erro;
    throw new ErroApi({ tipo: "indisponivel", detalhe: "Não foi possível conectar à API." });
  }

  const corpo = await lerJson(resposta);

  if (!resposta.ok) {
    throw new ErroApi({
      tipo: tipoPorStatus(resposta.status),
      status: resposta.status,
      detalhe: corpo?.detail ?? "",
      correlationId: corpo?.correlationId ?? null,
    });
  }

  if (!corpo || !("data" in corpo)) {
    throw new ErroApi({
      tipo: "inesperado",
      status: resposta.status,
      detalhe: "Resposta da API em formato inesperado.",
    });
  }

  return corpo;
}

export async function buscarOferta(id, opcoes) {
  const { data } = await requisitarApi(`/api/offers/${encodeURIComponent(id)}`, opcoes);
  return data;
}

export async function buscarEventosOferta(id, opcoes) {
  const { data } = await requisitarApi(`/api/offers/${encodeURIComponent(id)}/events`, opcoes);
  return data;
}

export async function buscarLimiteCredito(carteira, opcoes) {
  const { data } = await requisitarApi(`/api/credit-limits/${encodeURIComponent(carteira)}`, opcoes);
  return data;
}

// Percorre todas as páginas até meta.total.
export async function listarOfertas({ status } = {}, opcoes) {
  const ofertas = [];
  let offset = 0;
  for (;;) {
    const params = new URLSearchParams({ limit: String(TAMANHO_PAGINA), offset: String(offset) });
    if (status) params.set("status", status);
    const { data, meta } = await requisitarApi(`/api/offers?${params}`, opcoes);
    ofertas.push(...data);
    offset += data.length;
    if (data.length === 0 || offset >= (meta?.total ?? 0)) return ofertas;
  }
}
