import test from "node:test";
import assert from "node:assert/strict";
import { createMetaMaskConnection, SEPOLIA_CHAIN_ID } from "../src/services/metamask.js";

const CONTA_A = "0x1111111111111111111111111111111111111111";
const CONTA_B = "0x2222222222222222222222222222222222222222";
const drenar = () => new Promise((resolve) => setImmediate(resolve));

function providerMock({ accounts = [], chainId = "0x1", handlers = {} } = {}) {
  const events = new Map();
  return {
    isMetaMask: true,
    accounts,
    chainId,
    chamadas: [],
    on(name, fn) {
      if (!events.has(name)) events.set(name, new Set());
      events.get(name).add(fn);
    },
    removeListener(name, fn) { events.get(name)?.delete(fn); },
    emitir(name, value) {
      if (name === "accountsChanged") this.accounts = value;
      if (name === "chainChanged") this.chainId = value;
      events.get(name)?.forEach((fn) => fn(value));
    },
    listeners(name) { return events.get(name)?.size ?? 0; },
    async request(pedido) {
      this.chamadas.push(pedido);
      if (handlers[pedido.method]) return handlers[pedido.method](pedido, this);
      switch (pedido.method) {
        case "eth_accounts": return this.accounts;
        case "eth_chainId": return this.chainId;
        case "eth_requestAccounts":
          this.accounts = [CONTA_A];
          this.emitir("accountsChanged", this.accounts);
          return this.accounts;
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
  const connection = createMetaMaskConnection(browser);
  const parar = connection.start();
  t.after(parar);
  return { connection, provider, browser, parar };
}

test("conecta somente por ação do usuário e acompanha conta, rede e revogação", async (t) => {
  const { connection, provider } = montar(t);
  await drenar();
  assert.equal(connection.getSnapshot().account, null);
  assert.equal(provider.chamadas.some(({ method }) => method === "eth_requestAccounts"), false);
  assert.equal(await connection.connect(), true);
  assert.equal(connection.getSnapshot().account, CONTA_A);
  assert.equal(connection.getProvider(), provider);
  provider.emitir("accountsChanged", [CONTA_B]);
  provider.emitir("chainChanged", SEPOLIA_CHAIN_ID);
  assert.equal(connection.getSnapshot().account, CONTA_B);
  assert.equal(connection.getSnapshot().chainId, SEPOLIA_CHAIN_ID);
  provider.emitir("accountsChanged", []);
  assert.equal(connection.getSnapshot().account, null);
  assert.equal(connection.getProvider(), null);
  assert.equal(provider.chamadas.some(({ method }) => /sign|sendTransaction/.test(method)), false);
});

test("restaura conta autorizada e não reconecta após desconexão local", async (t) => {
  const provider = providerMock({ accounts: [CONTA_A], chainId: SEPOLIA_CHAIN_ID });
  const browser = browserMock(provider);
  const { connection, parar } = montar(t, provider, browser);
  await drenar();
  assert.equal(connection.getSnapshot().account, CONTA_A);
  connection.disconnect();
  provider.emitir("accountsChanged", [CONTA_B]);
  assert.equal(connection.getSnapshot().account, null);
  parar();
  const nova = montar(t, provider, browser).connection;
  await drenar();
  assert.equal(nova.getSnapshot().account, null);
  assert.equal(await nova.connect(), true);
  assert.equal(nova.getSnapshot().account, CONTA_A);
});

test("seleciona MetaMask por EIP-6963 quando outra carteira ocupa window.ethereum", async (t) => {
  const provider = providerMock({ accounts: [CONTA_B] });
  const browser = browserMock({ isMetaMask: false, request() { throw new Error("Carteira errada"); } });
  browser.addEventListener("eip6963:requestProvider", () => {
    browser.dispatchEvent(new CustomEvent("eip6963:announceProvider", { detail: { info: { rdns: "com.outra" }, provider: {} } }));
    browser.dispatchEvent(new CustomEvent("eip6963:announceProvider", { detail: { info: { rdns: "io.metamask" }, provider } }));
  });
  const { connection } = montar(t, provider, browser);
  await drenar();
  assert.equal(connection.getSnapshot().account, CONTA_B);
  assert.equal(connection.getProvider(), provider);
});

test("informa ausência da extensão e detecta injeção tardia", async (t) => {
  const { connection, browser } = montar(t, undefined, browserMock());
  assert.equal(await connection.connect(), false);
  assert.match(connection.getSnapshot().error, /não encontrada/);
  browser.ethereum = providerMock();
  browser.dispatchEvent(new Event("ethereum#initialized"));
  await drenar();
  assert.equal(connection.getSnapshot().available, true);
  assert.equal(await connection.connect(), true);
});

for (const [code, message] of [[4001, /recusada/], [-32002, /pendente/]]) {
  test(`trata o erro ${code} sem exibir conta fictícia`, async (t) => {
    const provider = providerMock({ handlers: { eth_requestAccounts: () => { throw { code }; } } });
    const { connection } = montar(t, provider);
    await drenar();
    assert.equal(await connection.connect(), false);
    assert.match(connection.getSnapshot().error, message);
    assert.equal(connection.getSnapshot().account, null);
    assert.equal(connection.getSnapshot().pending, null);
  });
}

test("evita solicitações duplicadas e ignora resposta depois de desconectar", async (t) => {
  let concluir;
  const provider = providerMock({ handlers: { eth_requestAccounts: () => new Promise((resolve) => { concluir = resolve; }) } });
  const { connection } = montar(t, provider);
  await drenar();
  const primeira = connection.connect();
  assert.equal(connection.getSnapshot().pending, "conectar");
  assert.equal(await connection.connect(), false);
  assert.equal(provider.chamadas.filter(({ method }) => method === "eth_requestAccounts").length, 1);
  connection.disconnect();
  provider.accounts = [CONTA_A];
  concluir(provider.accounts);
  assert.equal(await primeira, false);
  provider.emitir("accountsChanged", provider.accounts);
  assert.equal(connection.getSnapshot().account, null);
});

test("adiciona Sepolia quando necessário e solicita a troca novamente", async (t) => {
  let tentativas = 0;
  const provider = providerMock({ accounts: [CONTA_A], handlers: {
    wallet_switchEthereumChain: (pedido, current) => {
      tentativas += 1;
      if (tentativas === 1) throw { data: { originalError: { code: 4902 } } };
      current.chainId = pedido.params[0].chainId;
      current.emitir("chainChanged", current.chainId);
      return null;
    },
  } });
  const { connection } = montar(t, provider);
  await drenar();
  assert.equal(await connection.switchToSepolia(), true);
  assert.equal(connection.getSnapshot().chainId, SEPOLIA_CHAIN_ID);
  const adicionar = provider.chamadas.find(({ method }) => method === "wallet_addEthereumChain");
  assert.equal(adicionar.params[0].chainId, SEPOLIA_CHAIN_ID);
  assert.equal(tentativas, 2);
});

test("recusar a troca de rede preserva a rede real", async (t) => {
  const provider = providerMock({ accounts: [CONTA_A], handlers: { wallet_switchEthereumChain: () => { throw { code: 4001 }; } } });
  const { connection } = montar(t, provider);
  await drenar();
  assert.equal(await connection.switchToSepolia(), false);
  assert.equal(connection.getSnapshot().chainId, "0x1");
  assert.match(connection.getSnapshot().error, /recusada/);
});

test("limpa os listeners no unmount e funciona após reinício do StrictMode", async (t) => {
  const { connection, provider, parar } = montar(t, providerMock({ accounts: [CONTA_A] }));
  await drenar();
  assert.equal(provider.listeners("accountsChanged"), 1);
  parar();
  assert.equal(provider.listeners("accountsChanged"), 0);
  const pararNovamente = connection.start();
  t.after(pararNovamente);
  await drenar();
  assert.equal(provider.listeners("accountsChanged"), 1);
  assert.equal(connection.getSnapshot().account, CONTA_A);
  provider.emitir("disconnect");
  assert.equal(connection.getSnapshot().account, null);
  assert.match(connection.getSnapshot().error, /Recarregue/);
});

test("eventos durante a restauração não deixam a conta sem a rede nem sobrescrevem a conta nova", async (t) => {
  let primeira = true;
  let concluirLeitura;
  const provider = providerMock({ accounts: [CONTA_A], chainId: SEPOLIA_CHAIN_ID, handlers: {
    eth_accounts: (_pedido, current) => {
      if (!primeira) return current.accounts;
      primeira = false;
      return new Promise((resolve) => { concluirLeitura = resolve; });
    },
  } });
  const { connection } = montar(t, provider);
  provider.emitir("accountsChanged", [CONTA_B]);
  await drenar();
  assert.equal(connection.getSnapshot().account, CONTA_B);
  assert.equal(connection.getSnapshot().chainId, SEPOLIA_CHAIN_ID);
  concluirLeitura([CONTA_A]);
  await drenar();
  assert.equal(connection.getSnapshot().account, CONTA_B);
});
