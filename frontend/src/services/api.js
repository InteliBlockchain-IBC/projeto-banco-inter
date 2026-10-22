// Cliente HTTP da API do backend (InteliBlockchain-IBC/backend-banco-inter).
// Sucesso: { data, meta }. Erro: RFC 9457 (application/problem+json).
// Em desenvolvimento, o Vite encaminha /api e /demo-api para backends separados.

import { apiUrl } from "./apiEnvironment.js";

const PAGE_SIZE = 100;

export class ApiError extends Error {
  constructor({ type, status = null, detail = "", correlationId = null }) {
    super(detail || type);
    this.name = "ApiError";
    this.type = type; // "nao-encontrada" | "invalida" | "indisponivel" | "inesperado"
    this.status = status;
    this.detail = detail;
    this.correlationId = correlationId;
  }
}

function typeFromStatus(status) {
  if (status === 404) return "nao-encontrada";
  if (status === 400) return "invalida";
  if (status >= 500) return "indisponivel";
  return "inesperado";
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function requestApi(path, { signal, fetchImpl = globalThis.fetch, method = "GET", body, wallet } = {}) {
  let response;
  try {
    response = await fetchImpl(apiUrl(path), {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(wallet ? { "X-Wallet-Address": wallet } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError({ type: "indisponivel", detail: "Não foi possível conectar à API." });
  }

  const payload = await readJson(response);

  if (!response.ok) {
    throw new ApiError({
      type: typeFromStatus(response.status),
      status: response.status,
      detail: payload?.detail ?? payload?.title ?? "",
      correlationId: payload?.correlationId ?? null,
    });
  }

  // Mesmo um HTTP 2xx precisa seguir o envelope da API para não alimentar telas com dados incompletos.
  if (!payload || !("data" in payload)) {
    throw new ApiError({
      type: "inesperado",
      status: response.status,
      detail: "Resposta da API em formato inesperado.",
    });
  }

  return payload;
}

export async function getOffer(id, options) {
  const { data } = await requestApi(`/api/offers/${encodeURIComponent(id)}`, options);
  return data;
}

export async function getOfferEvents(id, options) {
  const { data } = await requestApi(`/api/offers/${encodeURIComponent(id)}/events`, options);
  return data;
}

export async function getCreditLimit(wallet, options) {
  const { data } = await requestApi(`/api/credit-limits/${encodeURIComponent(wallet)}`, options);
  return data;
}

export async function getCreditLimitHistory(wallet, options) {
  const { data } = await requestApi(`/api/credit-limits/${encodeURIComponent(wallet)}/history`, options);
  return data;
}

export async function listCreditLimits({ excludeWallet } = {}, options) {
  const params = new URLSearchParams({ registered: "true" });
  if (excludeWallet) params.set("excludeWallet", excludeWallet);
  const { data } = await requestApi(`/api/credit-limits?${params}`, options);
  return data;
}

export async function getDeployment(options) {
  return requestApi("/api/deployment", options);
}

export async function createOfferActionIntent(id, action, wallet, options) {
  if (!["accept", "cancel", "reject"].includes(action)) throw new Error("Ação inválida.");
  return requestApi(`/api/offers/${encodeURIComponent(id)}/${action}`, {
    ...options, method: "POST", wallet,
  });
}

export async function createOfferIntent(data, wallet, options) {
  return requestApi("/api/offers", { ...options, method: "POST", wallet, body: data });
}

export async function createDemoOffer(data, options) {
  const response = await requestApi("/api/mock/offers", { ...options, method: "POST", body: data });
  return response.data;
}

export async function executeDemoAction(id, action, options) {
  if (!["accept", "cancel", "reject"].includes(action)) throw new Error("Ação inválida.");
  const { data } = await requestApi(`/api/mock/offers/${encodeURIComponent(id)}/${action}`, { ...options, method: "POST" });
  return data;
}

export async function submitIntentHash(id, hash, wallet, options) {
  return requestApi(`/api/transaction-requests/${encodeURIComponent(id)}/submission`, {
    ...options, method: "POST", wallet, body: { txHash: hash },
  });
}

export async function getTransactionRequest(id, options) {
  const { data } = await requestApi(`/api/transaction-requests/${encodeURIComponent(id)}`, options);
  return data;
}

// Percorre todas as páginas até meta.total.
export async function listOffers({ status, wallet, role } = {}, options) {
  const offers = [];
  let offset = 0;
  for (;;) {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
    if (status) params.set("status", status);
    if (wallet) params.set("wallet", wallet);
    if (role) params.set("role", role);
    const { data, meta } = await requestApi(`/api/offers?${params}`, options);
    offers.push(...data);
    offset += data.length;
    if (data.length === 0 || offset >= (meta?.total ?? 0)) return offers;
  }
}
