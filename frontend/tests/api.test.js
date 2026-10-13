import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ErroApi,
  buscarOferta,
  criarIntencaoOferta,
  criarOfertaDemonstracao,
  executarAcaoDemonstracao,
  listarOfertas,
  requisitarApi,
} from "../src/services/api.js";
import { ofertaAberta, ofertaLiquidada } from "./fixtures/ofertas.js";

function resposta(status, corpo) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (corpo === undefined) throw new SyntaxError("Unexpected end of JSON input");
      return corpo;
    },
  };
}

function fetchFalso(...respostas) {
  const chamadas = [];
  const fetchImpl = async (url, init) => {
    chamadas.push({ url, init });
    const proxima = respostas.shift();
    if (proxima instanceof Error) throw proxima;
    return proxima;
  };
  return { fetchImpl, chamadas };
}

test("devolve data do envelope em caso de sucesso", async () => {
  const { fetchImpl, chamadas } = fetchFalso(resposta(200, { data: ofertaLiquidada, meta: { source: "mock" } }));
  const oferta = await buscarOferta(ofertaLiquidada.id, { fetchImpl });
  assert.deepEqual(oferta, ofertaLiquidada);
  assert.equal(chamadas[0].url, `/api/offers/${ofertaLiquidada.id}`);
});

test("404 problem+json vira erro nao-encontrada com correlationId", async () => {
  const { fetchImpl } = fetchFalso(resposta(404, {
    type: "https://api.example.invalid/problems/not-found",
    title: "Recurso não encontrado",
    status: 404,
    detail: "A oferta não existe.",
    correlationId: "req-3",
  }));
  await assert.rejects(buscarOferta("a0000000-0000-4000-8000-000000000099", { fetchImpl }), (erro) => {
    assert.ok(erro instanceof ErroApi);
    assert.equal(erro.tipo, "nao-encontrada");
    assert.equal(erro.status, 404);
    assert.equal(erro.detalhe, "A oferta não existe.");
    assert.equal(erro.correlationId, "req-3");
    return true;
  });
});

test("400 vira erro invalida", async () => {
  const { fetchImpl } = fetchFalso(resposta(400, { status: 400, detail: "A validação da requisição falhou." }));
  await assert.rejects(buscarOferta("abc", { fetchImpl }), { tipo: "invalida" });
});

test("503 e 500 viram erro indisponivel", async () => {
  for (const status of [500, 503]) {
    const { fetchImpl } = fetchFalso(resposta(status, { status, detail: "Banco indisponível." }));
    await assert.rejects(requisitarApi("/api/offers", { fetchImpl }), { tipo: "indisponivel", status });
  }
});

test("falha de rede vira erro indisponivel", async () => {
  const { fetchImpl } = fetchFalso(new TypeError("Failed to fetch"));
  await assert.rejects(requisitarApi("/api/offers", { fetchImpl }), { tipo: "indisponivel", status: null });
});

test("cancelamento (AbortError) é repassado sem conversão", async () => {
  const abort = new DOMException("Aborted", "AbortError");
  const { fetchImpl } = fetchFalso(abort);
  await assert.rejects(requisitarApi("/api/offers", { fetchImpl }), { name: "AbortError" });
});

test("corpo sem envelope ou JSON inválido vira erro inesperado", async () => {
  const semEnvelope = fetchFalso(resposta(200, { foo: 1 }));
  await assert.rejects(requisitarApi("/api/offers", { fetchImpl: semEnvelope.fetchImpl }), { tipo: "inesperado" });
  const jsonInvalido = fetchFalso(resposta(200, undefined));
  await assert.rejects(requisitarApi("/api/offers", { fetchImpl: jsonInvalido.fetchImpl }), { tipo: "inesperado" });
});

test("listarOfertas percorre páginas até meta.total", async () => {
  const pagina1 = Array.from({ length: 100 }, () => ofertaAberta);
  const { fetchImpl, chamadas } = fetchFalso(
    resposta(200, { data: pagina1, meta: { source: "mock", total: 101, limit: 100, offset: 0 } }),
    resposta(200, { data: [ofertaLiquidada], meta: { source: "mock", total: 101, limit: 100, offset: 100 } }),
  );
  const ofertas = await listarOfertas({ status: "offered" }, { fetchImpl });
  assert.equal(ofertas.length, 101);
  assert.equal(chamadas.length, 2);
  assert.equal(chamadas[0].url, "/api/offers?limit=100&offset=0&status=offered");
  assert.equal(chamadas[1].url, "/api/offers?limit=100&offset=100&status=offered");
});

test("listarOfertas para em página vazia", async () => {
  const { fetchImpl, chamadas } = fetchFalso(resposta(200, { data: [], meta: { source: "mock", total: 5 } }));
  assert.deepEqual(await listarOfertas({}, { fetchImpl }), []);
  assert.equal(chamadas.length, 1);
});

test("intenção de aceite envia carteira sem Content-Type quando não há body", async () => {
  const carteira = "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2";
  const { fetchImpl, chamadas } = fetchFalso(resposta(202, { data: { id: "pedido" } }));
  await criarIntencaoOferta(ofertaAberta.id, "accept", carteira, { fetchImpl });
  assert.equal(chamadas[0].init.method, "POST");
  assert.equal(chamadas[0].init.headers["X-Wallet-Address"], carteira);
  assert.equal(chamadas[0].init.headers["Content-Type"], undefined);
  assert.equal(chamadas[0].init.body, undefined);
});

test("consulta minhas ofertas filtra carteira e papel no backend", async () => {
  const carteira = "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2";
  const { fetchImpl, chamadas } = fetchFalso(resposta(200, { data: [], meta: { total: 0 } }));
  await listarOfertas({ wallet: carteira, role: "lender" }, { fetchImpl });
  assert.match(chamadas[0].url, /wallet=0x/);
  assert.match(chamadas[0].url, /role=lender/);
});

test("ações de demonstração usam os endpoints persistidos e retornam hash do backend", async () => {
  const nova = { lenderWallet: "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1", borrowerWallet: "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2", amountCents: "10000", rateCdiBps: 10500, termDays: 1, validitySeconds: 3600 };
  const { fetchImpl, chamadas } = fetchFalso(
    resposta(201, { data: { offer: { id: ofertaAberta.id, createTxHash: "0xhash" }, operation: null } }),
    resposta(200, { data: { offer: { id: ofertaAberta.id, status: "settled" }, operation: { txHash: "0xhash2" } } }),
  );
  const criada = await criarOfertaDemonstracao(nova, { fetchImpl });
  const aceita = await executarAcaoDemonstracao(ofertaAberta.id, "accept", { fetchImpl });
  assert.equal(criada.offer.createTxHash, "0xhash");
  assert.equal(aceita.operation.txHash, "0xhash2");
  assert.equal(chamadas[0].url, "/api/mock/offers");
  assert.deepEqual(JSON.parse(chamadas[0].init.body), nova);
  assert.equal(chamadas[1].url, `/api/mock/offers/${ofertaAberta.id}/accept`);
  assert.equal(chamadas[1].init.headers["Content-Type"], undefined);
});
