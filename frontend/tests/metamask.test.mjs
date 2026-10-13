import test from "node:test";
import assert from "node:assert/strict";
import { criarConexaoMetaMask, SEPOLIA_CHAIN_ID } from "../src/services/metamask.js";

const CONTA_A = "0x1111111111111111111111111111111111111111";
const CONTA_B = "0x2222222222222222222222222222222222222222";
const drenar = () => new Promise((resolve) => setImmediate(resolve));

function providerMock({ contas = [], chainId = "0x1", handlers = {} } = {}) {
  const eventos = new Map();
  return {
    isMetaMask: true,
    contas,
    chainId,
    chamadas: [],
    on(nome, fn) {
      if (!eventos.has(nome)) eventos.set(nome, new Set());
      eventos.get(nome).add(fn);
    },
    removeListener(nome, fn) { eventos.get(nome)?.delete(fn); },
    emitir(nome, valor) {
      if (nome === "accountsChanged") this.contas = valor;
      if (nome === "chainChanged") this.chainId = valor;
      eventos.get(nome)?.forEach((fn) => fn(valor));
    },
    listeners(nome) { return eventos.get(nome)?.size ?? 0; },
    async request(pedido) {
      this.chamadas.push(pedido);
      if (handlers[pedido.method]) return handlers[pedido.method](pedido, this);
      switch (pedido.method) {
        case "eth_accounts": return this.contas;
        case "eth_chainId": return this.chainId;
        case "eth_requestAccounts":
          this.contas = [CONTA_A];
          this.emitir("accountsChanged", this.contas);
          return this.contas;
        case "wallet_switchEthereumChain":
          this.chainId = pedido.params[0].chainId;
          this.emitir("chainChanged", this.chainId);
          return null;
        case "wallet_addEthereumChain": return null;
        default: throw new Error(`Método inesperado: ${pedido.method}`);
      }
    },
  };
}

function browserMock(provider) {
  const browser = new EventTarget();
  const storage = new Map();
  browser.ethereum = provider;
  browser.sessionStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  return browser;
}

function montar(t, provider = providerMock(), browser = browserMock(provider)) {
  const conexao = criarConexaoMetaMask(browser);
  const parar = conexao.iniciar();
  t.after(parar);
  return { conexao, provider, browser, parar };
}

test("conecta somente por ação do usuário e acompanha conta, rede e revogação", async (t) => {
  const { conexao, provider } = montar(t);
  await drenar();
  assert.equal(conexao.getSnapshot().conta, null);
  assert.equal(provider.chamadas.some(({ method }) => method === "eth_requestAccounts"), false);
  assert.equal(await conexao.conectar(), true);
  assert.equal(conexao.getSnapshot().conta, CONTA_A);
  assert.equal(conexao.getProvider(), provider);
  provider.emitir("accountsChanged", [CONTA_B]);
  provider.emitir("chainChanged", SEPOLIA_CHAIN_ID);
  assert.equal(conexao.getSnapshot().conta, CONTA_B);
  assert.equal(conexao.getSnapshot().chainId, SEPOLIA_CHAIN_ID);
  provider.emitir("accountsChanged", []);
  assert.equal(conexao.getSnapshot().conta, null);
  assert.equal(conexao.getProvider(), null);
  assert.equal(provider.chamadas.some(({ method }) => /sign|sendTransaction/.test(method)), false);
});

test("restaura conta autorizada e não reconecta após desconexão local", async (t) => {
  const provider = providerMock({ contas: [CONTA_A], chainId: SEPOLIA_CHAIN_ID });
  const browser = browserMock(provider);
  const { conexao, parar } = montar(t, provider, browser);
  await drenar();
  assert.equal(conexao.getSnapshot().conta, CONTA_A);
  conexao.desconectar();
  provider.emitir("accountsChanged", [CONTA_B]);
  assert.equal(conexao.getSnapshot().conta, null);
  parar();
  const nova = montar(t, provider, browser).conexao;
  await drenar();
  assert.equal(nova.getSnapshot().conta, null);
  assert.equal(await nova.conectar(), true);
  assert.equal(nova.getSnapshot().conta, CONTA_A);
});

test("seleciona MetaMask por EIP-6963 quando outra carteira ocupa window.ethereum", async (t) => {
  const provider = providerMock({ contas: [CONTA_B] });
  const browser = browserMock({ isMetaMask: false, request() { throw new Error("Carteira errada"); } });
  browser.addEventListener("eip6963:requestProvider", () => {
    browser.dispatchEvent(new CustomEvent("eip6963:announceProvider", { detail: { info: { rdns: "com.outra" }, provider: {} } }));
    browser.dispatchEvent(new CustomEvent("eip6963:announceProvider", { detail: { info: { rdns: "io.metamask" }, provider } }));
  });
  const { conexao } = montar(t, provider, browser);
  await drenar();
  assert.equal(conexao.getSnapshot().conta, CONTA_B);
  assert.equal(conexao.getProvider(), provider);
});

test("informa ausência da extensão e detecta injeção tardia", async (t) => {
  const { conexao, browser } = montar(t, undefined, browserMock());
  assert.equal(await conexao.conectar(), false);
  assert.match(conexao.getSnapshot().erro, /não encontrada/);
  browser.ethereum = providerMock();
  browser.dispatchEvent(new Event("ethereum#initialized"));
  await drenar();
  assert.equal(conexao.getSnapshot().disponivel, true);
  assert.equal(await conexao.conectar(), true);
});

for (const [code, mensagem] of [[4001, /recusada/], [-32002, /pendente/]]) {
  test(`trata o erro ${code} sem exibir conta fictícia`, async (t) => {
    const provider = providerMock({ handlers: { eth_requestAccounts: () => { throw { code }; } } });
    const { conexao } = montar(t, provider);
    await drenar();
    assert.equal(await conexao.conectar(), false);
    assert.match(conexao.getSnapshot().erro, mensagem);
    assert.equal(conexao.getSnapshot().conta, null);
    assert.equal(conexao.getSnapshot().pendente, null);
  });
}

test("evita solicitações duplicadas e ignora resposta depois de desconectar", async (t) => {
  let concluir;
  const provider = providerMock({ handlers: { eth_requestAccounts: () => new Promise((resolve) => { concluir = resolve; }) } });
  const { conexao } = montar(t, provider);
  await drenar();
  const primeira = conexao.conectar();
  assert.equal(conexao.getSnapshot().pendente, "conectar");
  assert.equal(await conexao.conectar(), false);
  assert.equal(provider.chamadas.filter(({ method }) => method === "eth_requestAccounts").length, 1);
  conexao.desconectar();
  provider.contas = [CONTA_A];
  concluir(provider.contas);
  assert.equal(await primeira, false);
  provider.emitir("accountsChanged", provider.contas);
  assert.equal(conexao.getSnapshot().conta, null);
});

test("adiciona Sepolia quando necessário e solicita a troca novamente", async (t) => {
  let tentativas = 0;
  const provider = providerMock({ contas: [CONTA_A], handlers: {
    wallet_switchEthereumChain: (pedido, atual) => {
      tentativas += 1;
      if (tentativas === 1) throw { data: { originalError: { code: 4902 } } };
      atual.chainId = pedido.params[0].chainId;
      atual.emitir("chainChanged", atual.chainId);
      return null;
    },
  } });
  const { conexao } = montar(t, provider);
  await drenar();
  assert.equal(await conexao.trocarParaSepolia(), true);
  assert.equal(conexao.getSnapshot().chainId, SEPOLIA_CHAIN_ID);
  const adicionar = provider.chamadas.find(({ method }) => method === "wallet_addEthereumChain");
  assert.equal(adicionar.params[0].chainId, SEPOLIA_CHAIN_ID);
  assert.equal(tentativas, 2);
});

test("recusar a troca de rede preserva a rede real", async (t) => {
  const provider = providerMock({ contas: [CONTA_A], handlers: { wallet_switchEthereumChain: () => { throw { code: 4001 }; } } });
  const { conexao } = montar(t, provider);
  await drenar();
  assert.equal(await conexao.trocarParaSepolia(), false);
  assert.equal(conexao.getSnapshot().chainId, "0x1");
  assert.match(conexao.getSnapshot().erro, /recusada/);
});

test("limpa os listeners no unmount e funciona após reinício do StrictMode", async (t) => {
  const { conexao, provider, parar } = montar(t, providerMock({ contas: [CONTA_A] }));
  await drenar();
  assert.equal(provider.listeners("accountsChanged"), 1);
  parar();
  assert.equal(provider.listeners("accountsChanged"), 0);
  const pararNovamente = conexao.iniciar();
  t.after(pararNovamente);
  await drenar();
  assert.equal(provider.listeners("accountsChanged"), 1);
  assert.equal(conexao.getSnapshot().conta, CONTA_A);
  provider.emitir("disconnect");
  assert.equal(conexao.getSnapshot().conta, null);
  assert.match(conexao.getSnapshot().erro, /Recarregue/);
});

test("eventos durante a restauração não deixam a conta sem a rede nem sobrescrevem a conta nova", async (t) => {
  let primeira = true;
  let concluirLeitura;
  const provider = providerMock({ contas: [CONTA_A], chainId: SEPOLIA_CHAIN_ID, handlers: {
    eth_accounts: (_pedido, atual) => {
      if (!primeira) return atual.contas;
      primeira = false;
      return new Promise((resolve) => { concluirLeitura = resolve; });
    },
  } });
  const { conexao } = montar(t, provider);
  provider.emitir("accountsChanged", [CONTA_B]);
  await drenar();
  assert.equal(conexao.getSnapshot().conta, CONTA_B);
  assert.equal(conexao.getSnapshot().chainId, SEPOLIA_CHAIN_ID);
  concluirLeitura([CONTA_A]);
  await drenar();
  assert.equal(conexao.getSnapshot().conta, CONTA_B);
});
