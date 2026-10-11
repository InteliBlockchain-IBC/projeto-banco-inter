import { test } from "node:test";
import assert from "node:assert/strict";
import {
  STATUS_API_PARA_UI,
  eventosParaTransacoes,
  ofertaApiParaOperacao,
  transacoesDeFallback,
} from "../src/services/adaptadorOfertas.js";
import {
  eventosCancelada,
  eventosLiquidada,
  ofertaAberta,
  ofertaCancelada,
  ofertaLiquidada,
} from "./fixtures/ofertas.js";

test("oferta liquidada vira view-model com hash de liquidação", () => {
  const op = ofertaApiParaOperacao(ofertaLiquidada);
  assert.equal(op.origem, "api");
  assert.equal(op.id, "#1");
  assert.equal(op.rawId, ofertaLiquidada.id);
  assert.equal(op.status, "Liquidada");
  assert.equal(op.contraparte, "Banco Alfa S.A. (fictício)");
  assert.equal(op.tomador.nome, "Banco Beta S.A. (fictício)");
  assert.equal(op.valorCentavos, 5000000000n);
  assert.equal(op.valor, 50000000);
  assert.equal(op.valorFormatado, "R$ 50.000.000,00");
  assert.equal(op.taxaCdi, "102,5% CDI");
  assert.equal(op.prazoTexto, "1 dia (overnight)");
  assert.equal(op.hash, ofertaLiquidada.settlement.txHash);
  assert.equal(op.bloco, ofertaLiquidada.settlement.blockNumber);
  assert.equal(op.liquidacao.tokenPosicao, "1");
  assert.equal(op.hashCriacao, ofertaLiquidada.createTxHash);
});

test("oferta aberta não tem hash de liquidação", () => {
  const op = ofertaApiParaOperacao(ofertaAberta);
  assert.equal(op.status, "Ofertada");
  assert.equal(op.hash, null);
  assert.equal(op.liquidacao, null);
  assert.ok(op.hashCriacao);
});

test("todos os status da API têm rótulo em português", () => {
  const esperado = {
    offered: "Ofertada",
    settled: "Liquidada",
    cancelled: "Cancelada",
    rejected: "Negada",
    expired: "Expirada",
  };
  assert.deepEqual(STATUS_API_PARA_UI, esperado);
  for (const [statusApi, rotulo] of Object.entries(esperado)) {
    assert.equal(ofertaApiParaOperacao({ ...ofertaAberta, status: statusApi }).status, rotulo);
  }
});

test("instituição ausente cai para o endereço abreviado", () => {
  const op = ofertaApiParaOperacao({
    ...ofertaAberta,
    lender: { wallet: "0xf43e354e808be694903c49bd052aa8cd7ff594e9", institution: null },
  });
  assert.equal(op.contraparte, "0xf43e…94e9");
  assert.equal(op.ofertante.nome, null);
});

test("rejeita oferta de outra rede que não a Sepolia", () => {
  assert.throws(() => ofertaApiParaOperacao({ ...ofertaAberta, chainId: 1 }), /Sepolia/);
});

test("eventos de aceite e liquidação viram uma única transação", () => {
  const op = ofertaApiParaOperacao(ofertaLiquidada);
  const transacoes = eventosParaTransacoes(eventosLiquidada, op);
  assert.equal(transacoes.length, 2);
  assert.equal(transacoes[0].etapa, "Criação da oferta");
  assert.equal(transacoes[1].etapa, "Aceite e liquidação (DvP)");
  assert.equal(transacoes[1].txHash, ofertaLiquidada.settlement.txHash);
});

test("cancelamento aparece como etapa própria", () => {
  const op = ofertaApiParaOperacao(ofertaCancelada);
  const etapas = eventosParaTransacoes(eventosCancelada, op).map((t) => t.etapa);
  assert.deepEqual(etapas, ["Criação da oferta", "Cancelamento"]);
});

test("sem eventos usa os hashes da própria oferta", () => {
  const op = ofertaApiParaOperacao(ofertaLiquidada);
  const transacoes = eventosParaTransacoes(null, op);
  assert.deepEqual(transacoes, transacoesDeFallback(op));
  assert.deepEqual(
    transacoes.map((t) => t.txHash),
    [ofertaLiquidada.createTxHash, ofertaLiquidada.settlement.txHash],
  );
});
