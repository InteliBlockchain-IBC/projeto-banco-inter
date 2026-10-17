// Cliente HTTP da API do backend (InteliBlockchain-IBC/backend-banco-inter).
// Sucesso: { data, meta }. Erro: RFC 9457 (application/problem+json).
// Em desenvolvimento, o Vite encaminha /api e /demo-api para backends separados.

import { urlApi } from "./ambienteApi.js";

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

export async function requisitarApi(caminho, { signal, fetchImpl = globalThis.fetch, method = "GET", body, carteira } = {}) {
  let resposta;
  try {
    resposta = await fetchImpl(urlApi(caminho), {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(carteira ? { "X-Wallet-Address": carteira } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
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
      detalhe: corpo?.detail ?? corpo?.title ?? "",
      correlationId: corpo?.correlationId ?? null,
    });
  }

  // Mesmo um HTTP 2xx precisa seguir o envelope da API para não alimentar telas com dados incompletos.
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

export async function buscarHistoricoLimite(carteira, opcoes) {
  const { data } = await requisitarApi(`/api/credit-limits/${encodeURIComponent(carteira)}/history`, opcoes);
  return data;
}

export async function listarLimitesCredito({ excluirCarteira } = {}, opcoes) {
  const params = new URLSearchParams({ registered: "true" });
  if (excluirCarteira) params.set("excludeWallet", excluirCarteira);
  const { data } = await requisitarApi(`/api/credit-limits?${params}`, opcoes);
  return data;
}

export async function buscarDeployment(opcoes) {
  return requisitarApi("/api/deployment", opcoes);
}

export async function criarIntencaoOferta(id, acao, carteira, opcoes) {
  if (!["accept", "cancel", "reject"].includes(acao)) throw new Error("Ação inválida.");
  return requisitarApi(`/api/offers/${encodeURIComponent(id)}/${acao}`, {
    ...opcoes, method: "POST", carteira,
  });
}

export async function criarIntencaoNovaOferta(dados, carteira, opcoes) {
  return requisitarApi("/api/offers", { ...opcoes, method: "POST", carteira, body: dados });
}

export async function criarOfertaDemonstracao(dados, opcoes) {
  const { data } = await requisitarApi("/api/mock/offers", { ...opcoes, method: "POST", body: dados });
  return data;
}

export async function executarAcaoDemonstracao(id, acao, opcoes) {
  if (!["accept", "cancel", "reject"].includes(acao)) throw new Error("Ação inválida.");
  const { data } = await requisitarApi(`/api/mock/offers/${encodeURIComponent(id)}/${acao}`, { ...opcoes, method: "POST" });
  return data;
}

export async function informarHashIntencao(id, hash, carteira, opcoes) {
  return requisitarApi(`/api/transaction-requests/${encodeURIComponent(id)}/submission`, {
    ...opcoes, method: "POST", carteira, body: { txHash: hash },
  });
}

export async function buscarIntencao(id, opcoes) {
  const { data } = await requisitarApi(`/api/transaction-requests/${encodeURIComponent(id)}`, opcoes);
  return data;
}

// Percorre todas as páginas até meta.total.
export async function listarOfertas({ status, wallet, role } = {}, opcoes) {
  const ofertas = [];
  let offset = 0;
  for (;;) {
    const params = new URLSearchParams({ limit: String(TAMANHO_PAGINA), offset: String(offset) });
    if (status) params.set("status", status);
    if (wallet) params.set("wallet", wallet);
    if (role) params.set("role", role);
    const { data, meta } = await requisitarApi(`/api/offers?${params}`, opcoes);
    ofertas.push(...data);
    offset += data.length;
    if (data.length === 0 || offset >= (meta?.total ?? 0)) return ofertas;
  }
}
