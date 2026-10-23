const MODE_KEY = "inter-modo-api";
const SYNTHETIC_CONTRACT = "0x0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c";

// TODO: ligar a escolha do ambiente a um controle na interface e recarregar os dados após salvar o modo.
export function currentApiMode() {
  try {
    return globalThis.sessionStorage?.getItem(MODE_KEY) === "demo" ? "demo" : "real";
  } catch {
    return "real";
  }
}

export function apiUrl(path, mode = currentApiMode()) {
  const base = mode === "demo"
    ? (import.meta.env?.VITE_DEMO_API_URL || "/demo-api")
    : (import.meta.env?.VITE_API_URL || "");
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function verifyApiMode(mode, fetchImpl = globalThis.fetch) {
  // Confere o deployment antes de trocar de API para evitar assinar sobre dados sintéticos.
  let response;
  try {
    response = await fetchImpl(apiUrl("/api/deployment", mode), { headers: { Accept: "application/json" } });
  } catch {
    throw new Error(`A API do ambiente ${mode === "demo" ? "de demonstração" : "real"} não está disponível.`);
  }
  if (!response.ok) {
    throw new Error(`A API do ambiente ${mode === "demo" ? "de demonstração" : "real"} respondeu com erro (${response.status}).`);
  }
  let deployment;
  try {
    deployment = await response.json();
  } catch {
    throw new Error("A API escolhida não retornou um deployment válido.");
  }
  const synthetic = deployment?.data?.contractAddress?.toLowerCase() === SYNTHETIC_CONTRACT;
  if (!deployment?.data?.contractAddress || (mode === "demo") !== synthetic) {
    throw new Error(mode === "demo"
      ? "A API de demonstração não está servindo o contrato sintético. Confira a porta 3001."
      : "A API real ainda está servindo dados de demonstração. Confira o listener da Sepolia.");
  }
}

export function saveApiMode(mode) {
  if (!["real", "demo"].includes(mode)) throw new Error("Ambiente inválido.");
  globalThis.sessionStorage.setItem(MODE_KEY, mode);
}
