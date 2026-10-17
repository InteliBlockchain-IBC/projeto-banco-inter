const CHAVE_MODO = "inter-modo-api";
const CONTRATO_SINTETICO = "0x0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c";

// TODO: ligar a escolha do ambiente a um controle na interface e recarregar os dados após salvar o modo.
export function modoApiAtual() {
  try {
    return globalThis.sessionStorage?.getItem(CHAVE_MODO) === "demo" ? "demo" : "real";
  } catch {
    return "real";
  }
}

export function urlApi(caminho, modo = modoApiAtual()) {
  const base = modo === "demo"
    ? (import.meta.env?.VITE_DEMO_API_URL || "/demo-api")
    : (import.meta.env?.VITE_API_URL || "");
  return `${base.replace(/\/$/, "")}${caminho}`;
}

export async function verificarModoApi(modo, fetchImpl = globalThis.fetch) {
  // Confere o deployment antes de trocar de API para evitar assinar sobre dados sintéticos.
  let resposta;
  try {
    resposta = await fetchImpl(urlApi("/api/deployment", modo), { headers: { Accept: "application/json" } });
  } catch {
    throw new Error(`A API do ambiente ${modo === "demo" ? "de demonstração" : "real"} não está disponível.`);
  }
  if (!resposta.ok) {
    throw new Error(`A API do ambiente ${modo === "demo" ? "de demonstração" : "real"} respondeu com erro (${resposta.status}).`);
  }
  let deployment;
  try {
    deployment = await resposta.json();
  } catch {
    throw new Error("A API escolhida não retornou um deployment válido.");
  }
  const sintetico = deployment?.data?.contractAddress?.toLowerCase() === CONTRATO_SINTETICO;
  if (!deployment?.data?.contractAddress || (modo === "demo") !== sintetico) {
    throw new Error(modo === "demo"
      ? "A API de demonstração não está servindo o contrato sintético. Confira a porta 3001."
      : "A API real ainda está servindo dados de demonstração. Confira o listener da Sepolia.");
  }
}

export function salvarModoApi(modo) {
  if (!["real", "demo"].includes(modo)) throw new Error("Ambiente inválido.");
  globalThis.sessionStorage.setItem(CHAVE_MODO, modo);
}
