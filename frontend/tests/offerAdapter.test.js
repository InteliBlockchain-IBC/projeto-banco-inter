import { test } from "node:test";
import assert from "node:assert/strict";
import {
  API_STATUS_TO_UI,
  mapEventsToTransactions,
  mapApiOfferToOperation,
  fallbackTransactions,
} from "../src/services/offerAdapter.js";
import {
  cancelledEvents,
  settledEvents,
  openOffer,
  cancelledOffer,
  settledOffer,
} from "./fixtures/offers.js";

test("oferta liquidada vira view-model com hash de liquidação", () => {
  const op = mapApiOfferToOperation(settledOffer);
  assert.equal(op.source, "api");
  assert.equal(op.id, "#1");
  assert.equal(op.rawId, settledOffer.id);
  assert.equal(op.status, "Liquidada");
  assert.equal(op.counterparty, "Banco Alfa S.A. (fictício)");
  assert.equal(op.borrower.name, "Banco Beta S.A. (fictício)");
  assert.equal(op.amountCentsBigInt, 5000000000n);
  assert.equal(op.value, 50000000);
  assert.equal(op.formattedAmount, "R$ 50.000.000,00");
  assert.equal(op.cdiRate, "102,5% CDI");
  assert.equal(op.termLabel, "1 dia (overnight)");
  assert.equal(op.hash, settledOffer.settlement.txHash);
  assert.equal(op.blockNumber, settledOffer.settlement.blockNumber);
  assert.equal(op.settlement.positionTokenId, "1");
  assert.equal(op.createTxHash, settledOffer.createTxHash);
});

test("oferta aberta não tem hash de liquidação", () => {
  const op = mapApiOfferToOperation(openOffer);
  assert.equal(op.status, "Ofertada");
  assert.equal(op.hash, null);
  assert.equal(op.settlement, null);
  assert.ok(op.createTxHash);
});

test("todos os status da API têm rótulo em português", () => {
  const expected = {
    offered: "Ofertada",
    settled: "Liquidada",
    cancelled: "Cancelada",
    rejected: "Negada",
    expired: "Expirada",
  };
  assert.deepEqual(API_STATUS_TO_UI, expected);
  for (const [apiStatus, label] of Object.entries(expected)) {
    assert.equal(mapApiOfferToOperation({ ...openOffer, status: apiStatus }).status, label);
  }
});

test("instituição ausente cai para o endereço abreviado", () => {
  const op = mapApiOfferToOperation({
    ...openOffer,
    lender: { wallet: "0xf43e354e808be694903c49bd052aa8cd7ff594e9", institution: null },
  });
  assert.equal(op.counterparty, "0xf43e…94e9");
  assert.equal(op.lender.name, null);
});

test("rejeita oferta de outra rede que não a Sepolia", () => {
  assert.throws(() => mapApiOfferToOperation({ ...openOffer, chainId: 1 }), /Sepolia/);
});

test("eventos de aceite e liquidação viram uma única transação", () => {
  const op = mapApiOfferToOperation(settledOffer);
  const transactions = mapEventsToTransactions(settledEvents, op);
  assert.equal(transactions.length, 2);
  assert.equal(transactions[0].stage, "Criação da oferta");
  assert.equal(transactions[1].stage, "Aceite e liquidação (DvP)");
  assert.equal(transactions[1].txHash, settledOffer.settlement.txHash);
});

test("cancelamento aparece como etapa própria", () => {
  const op = mapApiOfferToOperation(cancelledOffer);
  const stages = mapEventsToTransactions(cancelledEvents, op).map((t) => t.stage);
  assert.deepEqual(stages, ["Criação da oferta", "Cancelamento"]);
});

test("sem eventos usa os hashes da própria oferta", () => {
  const op = mapApiOfferToOperation(settledOffer);
  const transactions = mapEventsToTransactions(null, op);
  assert.deepEqual(transactions, fallbackTransactions(op));
  assert.deepEqual(
    transactions.map((t) => t.txHash),
    [settledOffer.createTxHash, settledOffer.settlement.txHash],
  );
});
