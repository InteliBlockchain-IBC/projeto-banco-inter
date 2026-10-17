export const SEPOLIA_CHAIN_ID = "0xaa36a7";
export const METAMASK_DOWNLOAD_URL = "https://metamask.io/download/";

const DISCONNECTED_KEY = "inter-wallet-disconnected";

export function abreviarEndereco(endereco) {
  return endereco ? `${endereco.slice(0, 6)}…${endereco.slice(-4)}` : "Não conectada";
}

export function nomeRede(chainId) {
  if (!chainId) return "Sem conexão";
  if (chainId === SEPOLIA_CHAIN_ID) return "Sepolia";
  if (chainId === "0x1") return "Ethereum Mainnet";
  return `Rede ${Number.parseInt(chainId, 16)}`;
}

function codigoErro(erro) {
  return Number(erro?.data?.originalError?.code ?? erro?.code);
}

function mensagemErro(erro) {
  switch (codigoErro(erro)) {
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
export function criarConexaoMetaMask(browser = window) {
  let estado = { conta: null, chainId: null, disponivel: false, pendente: null, erro: null };
  let provider = null;
  let ativa = false;
  let geracao = 0;
  let leitura = 0;
  let removerEventos = () => {};
  const assinantes = new Set();
  let desconectadaLocalmente = false;
  try {
    desconectadaLocalmente = browser.sessionStorage.getItem(DISCONNECTED_KEY) === "true";
  } catch { /* A conexão também funciona com o armazenamento desativado. */ }

  function atualizar(dados) {
    estado = { ...estado, ...dados };
    assinantes.forEach((assinante) => assinante());
  }

  function lembrarDesconexao(valor) {
    desconectadaLocalmente = valor;
    try {
      if (valor) browser.sessionStorage.setItem(DISCONNECTED_KEY, "true");
      else browser.sessionStorage.removeItem(DISCONNECTED_KEY);
    } catch { /* Preferência mantida em memória. */ }
  }

  async function sincronizar() {
    if (!provider || desconectadaLocalmente) return;
    const atual = provider;
    const versao = ++leitura;
    const ciclo = geracao;
    try {
      const [contas, chainId] = await Promise.all([
        atual.request({ method: "eth_accounts" }),
        atual.request({ method: "eth_chainId" }),
      ]);
      if (ativa && atual === provider && ciclo === geracao && versao === leitura) {
        atualizar({ conta: contas[0] ?? null, chainId, erro: null });
      }
    } catch (erro) {
      if (ativa && atual === provider && ciclo === geracao && versao === leitura) {
        atualizar({ conta: null, chainId: null, erro: mensagemErro(erro) });
      }
    }
  }

  function selecionarProvider(novo) {
    if (!novo?.request || (provider === novo && estado.disponivel)) return;
    // Não substitui uma carteira em uso por um anúncio tardio.
    if (provider && (estado.conta || estado.pendente)) return;
    removerEventos();
    leitura += 1;
    provider = novo;
    const eventos = {
      accountsChanged: (contas) => {
        leitura += 1;
        if (!desconectadaLocalmente) atualizar({ conta: contas[0] ?? null, erro: null });
        void sincronizar();
      },
      chainChanged: (chainId) => {
        leitura += 1;
        atualizar({ chainId, erro: null });
        void sincronizar();
      },
      connect: () => { void sincronizar(); },
      disconnect: () => {
        geracao += 1;
        leitura += 1;
        atualizar({ conta: null, chainId: null, pendente: null, erro: "A MetaMask perdeu a conexão com a rede. Recarregue a página para reconectar." });
      },
    };
    Object.entries(eventos).forEach(([nome, handler]) => novo.on?.(nome, handler));
    removerEventos = () => Object.entries(eventos).forEach(([nome, handler]) => novo.removeListener?.(nome, handler));
    atualizar({ disponivel: true });
    void sincronizar();
  }

  function detectarLegado() {
    const injetado = browser.ethereum;
    const metaMask = injetado?.providers?.find((item) => item.isMetaMask)
      ?? (injetado?.isMetaMask ? injetado : null);
    if (metaMask && !provider) selecionarProvider(metaMask);
  }

  function anunciar(evento) {
    if (evento.detail?.info?.rdns === "io.metamask") selecionarProvider(evento.detail.provider);
  }

  function iniciar() {
    ativa = true;
    geracao += 1;
    // EIP-6963 seleciona a MetaMask mesmo quando há outras extensões instaladas.
    browser.addEventListener("eip6963:announceProvider", anunciar);
    browser.addEventListener("ethereum#initialized", detectarLegado);
    browser.dispatchEvent(new Event("eip6963:requestProvider"));
    detectarLegado();
    return () => {
      ativa = false;
      geracao += 1;
      leitura += 1;
      browser.removeEventListener("eip6963:announceProvider", anunciar);
      browser.removeEventListener("ethereum#initialized", detectarLegado);
      removerEventos();
      provider = null;
      atualizar({ disponivel: false, pendente: null });
    };
  }

  async function executar(tipo, acao) {
    if (estado.pendente) return false;
    browser.dispatchEvent(new Event("eip6963:requestProvider"));
    detectarLegado();
    if (!provider) {
      atualizar({ erro: "MetaMask não encontrada. Instale ou habilite a extensão neste navegador e recarregue a página." });
      return false;
    }
    const ciclo = geracao;
    leitura += 1;
    atualizar({ pendente: tipo, erro: null });
    try {
      await acao(provider);
      if (!ativa || ciclo !== geracao) return false;
      if (tipo === "conectar") lembrarDesconexao(false);
      await sincronizar();
      return ativa && ciclo === geracao && !estado.erro;
    } catch (erro) {
      if (ativa && ciclo === geracao) atualizar({ erro: mensagemErro(erro) });
      return false;
    } finally {
      if (ativa && ciclo === geracao) atualizar({ pendente: null });
    }
  }

  return {
    iniciar,
    getSnapshot: () => estado,
    subscribe: (assinante) => {
      assinantes.add(assinante);
      return () => assinantes.delete(assinante);
    },
    getProvider: () => estado.conta ? provider : null,
    conectar: () => executar("conectar", async (atual) => {
      const contas = await atual.request({ method: "eth_requestAccounts" });
      if (!contas.length) throw new Error("Nenhuma conta autorizada");
    }),
    trocarParaSepolia: () => executar("rede", async (atual) => {
      try {
        await atual.request({ method: "wallet_switchEthereumChain", params: [{ chainId: SEPOLIA_CHAIN_ID }] });
      } catch (erro) {
        if (codigoErro(erro) !== 4902) throw erro;
        await atual.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: SEPOLIA_CHAIN_ID,
            chainName: "Sepolia",
            nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          }],
        });
        await atual.request({ method: "wallet_switchEthereumChain", params: [{ chainId: SEPOLIA_CHAIN_ID }] });
      }
    }),
    desconectar: () => {
      geracao += 1;
      leitura += 1;
      lembrarDesconexao(true);
      atualizar({ conta: null, chainId: null, pendente: null, erro: null });
    },
    limparErro: () => atualizar({ erro: null }),
  };
}
