export const SEPOLIA_CHAIN_ID = "0xaa36a7";
export const METAMASK_DOWNLOAD_URL = "https://metamask.io/download/";

const DISCONNECTED_KEY = "inter-wallet-disconnected";

export function shortenAddress(endereco) {
  return endereco ? `${endereco.slice(0, 6)}…${endereco.slice(-4)}` : "Não conectada";
}

export function networkName(chainId) {
  if (!chainId) return "Sem conexão";
  if (chainId === SEPOLIA_CHAIN_ID) return "Sepolia";
  if (chainId === "0x1") return "Ethereum Mainnet";
  return `Rede ${Number.parseInt(chainId, 16)}`;
}

function errorCode(error) {
  return Number(error?.data?.originalError?.code ?? error?.code);
}

function errorMessage(error) {
  switch (errorCode(error)) {
    case 4001: return "Solicitação recusada na MetaMask. Você pode tentar novamente.";
    case -32002: return "Há uma solicitação pendente. Abra a MetaMask para concluir ou cancelar.";
    case 4100: return "Autorize o acesso à sua conta na MetaMask.";
    case 4900:
    case 4901: return "A MetaMask perdeu a conexão com a rede. Recarregue a página e tente novamente.";
    default: return "Não foi possível concluir a solicitação. Confira a MetaMask e tente novamente.";
  }
}

// Mantém conta e rede sincronizadas com a extensão. A assinatura das operações
// usa o provider diretamente, sem armazenar chaves no frontend.
export function createMetaMaskConnection(browser = window) {
  let state = { account: null, chainId: null, available: false, pending: null, error: null };
  let provider = null;
  let active = false;
  let generation = 0;
  let readVersion = 0;
  let removeEventListeners = () => {};
  const subscribers = new Set();
  let locallyDisconnected = false;
  try {
    locallyDisconnected = browser.sessionStorage.getItem(DISCONNECTED_KEY) === "true";
  } catch { /* A conexão também funciona com o armazenamento desativado. */ }

  function update(data) {
    state = { ...state, ...data };
    subscribers.forEach((subscriber) => subscriber());
  }

  function rememberDisconnect(value) {
    locallyDisconnected = value;
    try {
      if (value) browser.sessionStorage.setItem(DISCONNECTED_KEY, "true");
      else browser.sessionStorage.removeItem(DISCONNECTED_KEY);
    } catch { /* Preferência mantida em memória. */ }
  }

  async function sync() {
    if (!provider || locallyDisconnected) return;
    const current = provider;
    const version = ++readVersion;
    const ciclo = generation;
    try {
      const [accounts, chainId] = await Promise.all([
        current.request({ method: "eth_accounts" }),
        current.request({ method: "eth_chainId" }),
      ]);
      if (active && current === provider && ciclo === generation && version === readVersion) {
        update({ account: accounts[0] ?? null, chainId, error: null });
      }
    } catch (error) {
      if (active && current === provider && ciclo === generation && version === readVersion) {
        update({ account: null, chainId: null, error: errorMessage(error) });
      }
    }
  }

  function selectProvider(novo) {
    if (!novo?.request || (provider === novo && state.available)) return;
    // Não substitui uma carteira em uso por um anúncio tardio.
    if (provider && (state.account || state.pending)) return;
    removeEventListeners();
    readVersion += 1;
    provider = novo;
    const events = {
      accountsChanged: (accounts) => {
        readVersion += 1;
        if (!locallyDisconnected) update({ account: accounts[0] ?? null, error: null });
        void sync();
      },
      chainChanged: (chainId) => {
        readVersion += 1;
        update({ chainId, error: null });
        void sync();
      },
      connect: () => { void sync(); },
      disconnect: () => {
        generation += 1;
        readVersion += 1;
        update({ account: null, chainId: null, pending: null, error: "A MetaMask perdeu a conexão com a rede. Recarregue a página para reconectar." });
      },
    };
    Object.entries(events).forEach(([name, handler]) => novo.on?.(name, handler));
    removeEventListeners = () => Object.entries(events).forEach(([name, handler]) => novo.removeListener?.(name, handler));
    update({ available: true });
    void sync();
  }

  function detectLegacyProvider() {
    const injetado = browser.ethereum;
    const metaMask = injetado?.providers?.find((item) => item.isMetaMask)
      ?? (injetado?.isMetaMask ? injetado : null);
    if (metaMask && !provider) selectProvider(metaMask);
  }

  function handleProviderAnnouncement(event) {
    if (event.detail?.info?.rdns === "io.metamask") selectProvider(event.detail.provider);
  }

  function start() {
    active = true;
    generation += 1;
    // EIP-6963 seleciona a MetaMask mesmo quando há outras extensões instaladas.
    browser.addEventListener("eip6963:announceProvider", handleProviderAnnouncement);
    browser.addEventListener("ethereum#initialized", detectLegacyProvider);
    browser.dispatchEvent(new Event("eip6963:requestProvider"));
    detectLegacyProvider();
    return () => {
      active = false;
      generation += 1;
      readVersion += 1;
      browser.removeEventListener("eip6963:announceProvider", handleProviderAnnouncement);
      browser.removeEventListener("ethereum#initialized", detectLegacyProvider);
      removeEventListeners();
      provider = null;
      update({ available: false, pending: null });
    };
  }

  async function execute(type, action) {
    if (state.pending) return false;
    browser.dispatchEvent(new Event("eip6963:requestProvider"));
    detectLegacyProvider();
    if (!provider) {
      update({ error: "MetaMask não encontrada. Instale ou habilite a extensão neste navegador e recarregue a página." });
      return false;
    }
    const ciclo = generation;
    readVersion += 1;
    update({ pending: type, error: null });
    try {
      await action(provider);
      if (!active || ciclo !== generation) return false;
      if (type === "conectar") rememberDisconnect(false);
      await sync();
      return active && ciclo === generation && !state.error;
    } catch (error) {
      if (active && ciclo === generation) update({ error: errorMessage(error) });
      return false;
    } finally {
      if (active && ciclo === generation) update({ pending: null });
    }
  }

  return {
    start,
    getSnapshot: () => state,
    subscribe: (subscriber) => {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
    getProvider: () => state.account ? provider : null,
    connect: () => execute("conectar", async (current) => {
      const accounts = await current.request({ method: "eth_requestAccounts" });
      if (!accounts.length) throw new Error("Nenhuma conta autorizada");
    }),
    switchToSepolia: () => execute("rede", async (current) => {
      try {
        await current.request({ method: "wallet_switchEthereumChain", params: [{ chainId: SEPOLIA_CHAIN_ID }] });
      } catch (error) {
        if (errorCode(error) !== 4902) throw error;
        await current.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: SEPOLIA_CHAIN_ID,
            chainName: "Sepolia",
            nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          }],
        });
        await current.request({ method: "wallet_switchEthereumChain", params: [{ chainId: SEPOLIA_CHAIN_ID }] });
      }
    }),
    disconnect: () => {
      generation += 1;
      readVersion += 1;
      rememberDisconnect(true);
      update({ account: null, chainId: null, pending: null, error: null });
    },
    clearError: () => update({ error: null }),
  };
}
