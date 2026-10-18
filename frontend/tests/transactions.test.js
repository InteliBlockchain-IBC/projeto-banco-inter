import test from "node:test";
import assert from "node:assert/strict";
import { executeOfferAction, executeOfferCreation, transactionErrorMessage } from "../src/services/transactions.js";

test("falhas da carteira e do contrato recebem orientação compreensível", () => {
  const casos = [
    [{ code: 4001 }, /recusada na MetaMask/],
    [{ data: { originalError: { code: -32002 } } }, /solicitação pendente/],
    [{ code: 4100 }, /Conecte a carteira novamente/],
    [{ code: 4900 }, /perdeu a conexão/],
    [{ message: "insufficient funds for gas * price + value" }, /ETH de teste suficiente/],
    [{ data: { message: "ERC20: insufficient allowance" } }, /permissão de BRLt insuficiente/],
    [{ shortMessage: "execution reverted" }, /contrato recusou/],
    [{ message: "network error" }, /Verifique a conexão com a MetaMask/],
    [{ message: "network error", hash: `0x${"a".repeat(64)}` }, /consulte o hash/],
    [{ message: "Internal JSON-RPC error: -32603" }, /Confira a MetaMask/],
  ];
  for (const [error, expected] of casos) {
    assert.match(transactionErrorMessage(error), expected);
  }
  assert.equal(transactionErrorMessage({ detail: "Limite insuficiente para esta oferta." }), "Limite insuficiente para esta oferta.");
  assert.equal(transactionErrorMessage(new Error("Conecte sua carteira MetaMask.")), "Conecte sua carteira MetaMask.");
});

const wallet = "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2";
const operation = {
  rawId: "a0000000-0000-4000-8000-000000000008",
  onchainOfferId: "8",
  contrato: "0x0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c",
  borrower: { wallet },
  lender: { wallet: "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1" },
};

test("backend mock impede envio de transação à carteira", async () => {
  const originalFetch = globalThis.fetch;
  const chamadas = [];
  globalThis.fetch = async (url, options) => {
    chamadas.push({ url, options });
    return new Response(JSON.stringify({ data: { contractAddress: operation.contrato }, meta: { source: "mock" } }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  };
  const provider = {
    request: async ({ method }) => {
      if (method === "eth_chainId") return "0xaa36a7";
      if (method === "eth_accounts") return [wallet];
      throw new Error(`Chamada inesperada: ${method}`);
    },
  };
  try {
    await assert.rejects(
      executeOfferAction({ operation, action: "accept", wallet, provider }),
      /modo mock/,
    );
    assert.deepEqual(chamadas.map((contractCall) => contractCall.url), ["/api/deployment"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("carteira de outra conta não inicia intenção", async () => {
  const provider = { request: async ({ method }) => method === "eth_chainId" ? "0xaa36a7" : ["0x1111111111111111111111111111111111111111"] };
  await assert.rejects(executeOfferAction({ operation, action: "accept", wallet, provider }), /conta conectada mudou/);
});

test("criação também bloqueia contrato sintético sem criar intenção", async () => {
  const originalFetch = globalThis.fetch;
  const chamadas = [];
  globalThis.fetch = async (url) => {
    chamadas.push(url);
    return new Response(JSON.stringify({ data: { contractAddress: operation.contrato }, meta: { source: "mock" } }), { status: 200 });
  };
  const provider = {
    request: async ({ method }) => {
      if (method === "eth_chainId") return "0xaa36a7";
      if (method === "eth_accounts") return [wallet];
      throw new Error(`Chamada inesperada: ${method}`);
    },
  };
  try {
    await assert.rejects(executeOfferCreation({ data: {}, wallet, provider }), /modo mock/);
    assert.deepEqual(chamadas, ["/api/deployment"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("contrato real envia pela carteira, registra hash e espera recibo", async () => {
  const originalFetch = globalThis.fetch;
  const contrato = "0x1234567890123456789012345678901234567890";
  const hash = `0x${"a".repeat(64)}`;
  const envios = [];
  globalThis.fetch = async (url, options) => {
    if (url === "/api/deployment") return new Response(JSON.stringify({ data: { contractAddress: contrato }, meta: { source: "postgres" } }), { status: 200 });
    if (url === `/api/offers/${operation.rawId}/accept`) {
      assert.equal(options.method, "POST");
      return new Response(JSON.stringify({ data: { id: "pedido", contractCall: { chainId: 11155111, contractAddress: contrato, functionName: "acceptOffer", args: ["8"] } } }), { status: 202 });
    }
    if (url === "/api/transaction-requests/pedido/submission") {
      assert.equal(JSON.parse(options.body).txHash, hash);
      return new Response(JSON.stringify({ data: { status: "submitted" } }), { status: 200 });
    }
    if (url === "/api/transaction-requests/pedido") return new Response(JSON.stringify({ data: { status: "confirmed" } }), { status: 200 });
    throw new Error(`Rota inesperada: ${url}`);
  };
  const provider = { request: async ({ method, params }) => {
    if (method === "eth_chainId") return "0xaa36a7";
    if (method === "eth_accounts") return [wallet];
    if (method === "eth_getCode") return "0x6000";
    if (method === "eth_sendTransaction") { envios.push(params[0]); return hash; }
    if (method === "eth_getTransactionReceipt") return { status: "0x1" };
    throw new Error(`Método inesperado: ${method}`);
  } };
  try {
    const fases = [];
    const result = await executeOfferAction({
      operation: { ...operation, contrato }, action: "accept", wallet, provider,
      onUpdate: (state) => fases.push(state.phase),
    });
    assert.equal(result.hash, hash);
    assert.equal(envios[0].to, contrato);
    assert.match(envios[0].data, /^0x[0-9a-f]+$/);
    assert.deepEqual(fases, ["preparando", "assinando", "confirmando", "confirmada"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
