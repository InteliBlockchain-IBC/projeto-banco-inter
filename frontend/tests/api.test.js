import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ApiError,
  getOffer,
  createOfferActionIntent,
  createDemoOffer,
  executeDemoAction,
  listOffers,
  requestApi,
} from "../src/services/api.js";
import { openOffer, settledOffer } from "./fixtures/offers.js";

function response(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (payload === undefined) throw new SyntaxError("Unexpected end of JSON input");
      return payload;
    },
  };
}

function fetchFalso(...respostas) {
  const chamadas = [];
  const fetchImpl = async (url, init) => {
    chamadas.push({ url, init });
    const next = respostas.shift();
    if (next instanceof Error) throw next;
    return next;
  };
  return { fetchImpl, chamadas };
}

test("devolve data do envelope em caso de sucesso", async () => {
  const { fetchImpl, chamadas } = fetchFalso(response(200, { data: settledOffer, meta: { source: "mock" } }));
  const offer = await getOffer(settledOffer.id, { fetchImpl });
  assert.deepEqual(offer, settledOffer);
  assert.equal(chamadas[0].url, `/api/offers/${settledOffer.id}`);
});

test("404 problem+json vira erro nao-encontrada com correlationId", async () => {
  const { fetchImpl } = fetchFalso(response(404, {
    type: "https://api.example.invalid/problems/not-found",
    title: "Recurso não encontrado",
    status: 404,
    detail: "A oferta não existe.",
    correlationId: "req-3",
  }));
  await assert.rejects(getOffer("a0000000-0000-4000-8000-000000000099", { fetchImpl }), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.type, "nao-encontrada");
    assert.equal(error.status, 404);
    assert.equal(error.detail, "A oferta não existe.");
    assert.equal(error.correlationId, "req-3");
    return true;
  });
});

test("400 vira erro invalida", async () => {
  const { fetchImpl } = fetchFalso(response(400, { status: 400, detail: "A validação da requisição falhou." }));
  await assert.rejects(getOffer("abc", { fetchImpl }), { type: "invalida" });
});

test("503 e 500 viram erro indisponivel", async () => {
  for (const status of [500, 503]) {
    const { fetchImpl } = fetchFalso(response(status, { status, detail: "Banco indisponível." }));
    await assert.rejects(requestApi("/api/offers", { fetchImpl }), { type: "indisponivel", status });
  }
});

test("falha de rede vira erro indisponivel", async () => {
  const { fetchImpl } = fetchFalso(new TypeError("Failed to fetch"));
  await assert.rejects(requestApi("/api/offers", { fetchImpl }), { type: "indisponivel", status: null });
});

test("cancelamento (AbortError) é repassado sem conversão", async () => {
  const abort = new DOMException("Aborted", "AbortError");
  const { fetchImpl } = fetchFalso(abort);
  await assert.rejects(requestApi("/api/offers", { fetchImpl }), { name: "AbortError" });
});

test("corpo sem envelope ou JSON inválido vira erro inesperado", async () => {
  const semEnvelope = fetchFalso(response(200, { foo: 1 }));
  await assert.rejects(requestApi("/api/offers", { fetchImpl: semEnvelope.fetchImpl }), { type: "inesperado" });
  const jsonInvalido = fetchFalso(response(200, undefined));
  await assert.rejects(requestApi("/api/offers", { fetchImpl: jsonInvalido.fetchImpl }), { type: "inesperado" });
});

test("listarOfertas percorre páginas até meta.total", async () => {
  const pagina1 = Array.from({ length: 100 }, () => openOffer);
  const { fetchImpl, chamadas } = fetchFalso(
    response(200, { data: pagina1, meta: { source: "mock", total: 101, limit: 100, offset: 0 } }),
    response(200, { data: [settledOffer], meta: { source: "mock", total: 101, limit: 100, offset: 100 } }),
  );
  const offers = await listOffers({ status: "offered" }, { fetchImpl });
  assert.equal(offers.length, 101);
  assert.equal(chamadas.length, 2);
  assert.equal(chamadas[0].url, "/api/offers?limit=100&offset=0&status=offered");
  assert.equal(chamadas[1].url, "/api/offers?limit=100&offset=100&status=offered");
});

test("listarOfertas para em página vazia", async () => {
  const { fetchImpl, chamadas } = fetchFalso(response(200, { data: [], meta: { source: "mock", total: 5 } }));
  assert.deepEqual(await listOffers({}, { fetchImpl }), []);
  assert.equal(chamadas.length, 1);
});

test("intenção de aceite envia carteira sem Content-Type quando não há body", async () => {
  const wallet = "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2";
  const { fetchImpl, chamadas } = fetchFalso(response(202, { data: { id: "pedido" } }));
  await createOfferActionIntent(openOffer.id, "accept", wallet, { fetchImpl });
  assert.equal(chamadas[0].init.method, "POST");
  assert.equal(chamadas[0].init.headers["X-Wallet-Address"], wallet);
  assert.equal(chamadas[0].init.headers["Content-Type"], undefined);
  assert.equal(chamadas[0].init.body, undefined);
});

test("consulta minhas ofertas filtra carteira e papel no backend", async () => {
  const wallet = "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2";
  const { fetchImpl, chamadas } = fetchFalso(response(200, { data: [], meta: { total: 0 } }));
  await listOffers({ wallet: wallet, role: "lender" }, { fetchImpl });
  assert.match(chamadas[0].url, /wallet=0x/);
  assert.match(chamadas[0].url, /role=lender/);
});

test("ações de demonstração usam os endpoints persistidos e retornam hash do backend", async () => {
  const nova = { lenderWallet: "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1", borrowerWallet: "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2", amountCents: "10000", rateCdiBps: 10500, termDays: 1, validitySeconds: 3600 };
  const { fetchImpl, chamadas } = fetchFalso(
    response(201, { data: { offer: { id: openOffer.id, createTxHash: "0xhash" }, operation: null } }),
    response(200, { data: { offer: { id: openOffer.id, status: "settled" }, operation: { txHash: "0xhash2" } } }),
  );
  const criada = await createDemoOffer(nova, { fetchImpl });
  const aceita = await executeDemoAction(openOffer.id, "accept", { fetchImpl });
  assert.equal(criada.offer.createTxHash, "0xhash");
  assert.equal(aceita.operation.txHash, "0xhash2");
  assert.equal(chamadas[0].url, "/api/mock/offers");
  assert.deepEqual(JSON.parse(chamadas[0].init.body), nova);
  assert.equal(chamadas[1].url, `/api/mock/offers/${openOffer.id}/accept`);
  assert.equal(chamadas[1].init.headers["Content-Type"], undefined);
});
