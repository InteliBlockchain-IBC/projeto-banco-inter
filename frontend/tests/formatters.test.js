import { test } from "node:test";
import assert from "node:assert/strict";
import {
  shortenHash,
  formatCents,
  formatTerm,
  formatCdiRate,
  addressExplorerUrl,
  transactionExplorerUrl,
} from "../src/utils/formatters.js";

const HASH = "0x700000000000000000000000000000000000000000000000000000000000000b";

test("formatarCentavos formata em pt-BR sem perder precisão", () => {
  assert.equal(formatCents("5000000000"), "R$ 50.000.000,00");
  assert.equal(formatCents("1"), "R$ 0,01");
  assert.equal(formatCents(150n), "R$ 1,50");
  assert.equal(formatCents("0"), "R$ 0,00");
  // Acima de Number.MAX_SAFE_INTEGER: nenhum dígito pode ser perdido.
  assert.equal(formatCents("123456789012345678"), "R$ 1.234.567.890.123.456,78");
});

test("formatarCentavos devolve travessão para entrada inválida", () => {
  assert.equal(formatCents(null), "—");
  assert.equal(formatCents(""), "—");
  assert.equal(formatCents("abc"), "—");
});

test("formatarTaxaCdi converte basis points em % do CDI", () => {
  assert.equal(formatCdiRate(10000), "100% CDI");
  assert.equal(formatCdiRate(10500), "105% CDI");
  assert.equal(formatCdiRate(10150), "101,5% CDI");
  assert.equal(formatCdiRate(10255), "102,55% CDI");
  assert.equal(formatCdiRate(10005), "100,05% CDI");
  assert.equal(formatCdiRate(-1), "—");
  assert.equal(formatCdiRate(10.5), "—");
});

test("formatarPrazo destaca overnight", () => {
  assert.equal(formatTerm(1), "1 dia (overnight)");
  assert.equal(formatTerm(7), "7 dias");
  assert.equal(formatTerm(0), "—");
});

test("abreviarHash usa 6 + 4 caracteres", () => {
  assert.equal(shortenHash(HASH), "0x7000…000b");
  assert.equal(shortenHash("0x12"), "0x12");
  assert.equal(shortenHash(null), "");
});

test("links do explorer apontam só para a Sepolia e validam o formato", () => {
  assert.equal(transactionExplorerUrl(HASH), `https://sepolia.etherscan.io/tx/${HASH}`);
  assert.equal(transactionExplorerUrl("0x7000…000b"), null);
  assert.equal(transactionExplorerUrl("javascript:alert(1)"), null);
  const wallet = "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1";
  assert.equal(addressExplorerUrl(wallet), `https://sepolia.etherscan.io/address/${wallet}`);
  assert.equal(addressExplorerUrl("0x123"), null);
});
