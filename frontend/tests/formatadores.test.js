import { test } from "node:test";
import assert from "node:assert/strict";
import {
  abreviarHash,
  formatarCentavos,
  formatarPrazo,
  formatarTaxaCdi,
  urlExplorerEndereco,
  urlExplorerTx,
} from "../src/utils/formatadores.js";

const HASH = "0x700000000000000000000000000000000000000000000000000000000000000b";

test("formatarCentavos formata em pt-BR sem perder precisão", () => {
  assert.equal(formatarCentavos("5000000000"), "R$ 50.000.000,00");
  assert.equal(formatarCentavos("1"), "R$ 0,01");
  assert.equal(formatarCentavos(150n), "R$ 1,50");
  assert.equal(formatarCentavos("0"), "R$ 0,00");
  // Acima de Number.MAX_SAFE_INTEGER: nenhum dígito pode ser perdido.
  assert.equal(formatarCentavos("123456789012345678"), "R$ 1.234.567.890.123.456,78");
});

test("formatarCentavos devolve travessão para entrada inválida", () => {
  assert.equal(formatarCentavos(null), "—");
  assert.equal(formatarCentavos(""), "—");
  assert.equal(formatarCentavos("abc"), "—");
});

test("formatarTaxaCdi converte basis points em % do CDI", () => {
  assert.equal(formatarTaxaCdi(10000), "100% CDI");
  assert.equal(formatarTaxaCdi(10500), "105% CDI");
  assert.equal(formatarTaxaCdi(10150), "101,5% CDI");
  assert.equal(formatarTaxaCdi(10255), "102,55% CDI");
  assert.equal(formatarTaxaCdi(10005), "100,05% CDI");
  assert.equal(formatarTaxaCdi(-1), "—");
  assert.equal(formatarTaxaCdi(10.5), "—");
});

test("formatarPrazo destaca overnight", () => {
  assert.equal(formatarPrazo(1), "1 dia (overnight)");
  assert.equal(formatarPrazo(7), "7 dias");
  assert.equal(formatarPrazo(0), "—");
});

test("abreviarHash usa 6 + 4 caracteres", () => {
  assert.equal(abreviarHash(HASH), "0x7000…000b");
  assert.equal(abreviarHash("0x12"), "0x12");
  assert.equal(abreviarHash(null), "");
});

test("links do explorer apontam só para a Sepolia e validam o formato", () => {
  assert.equal(urlExplorerTx(HASH), `https://sepolia.etherscan.io/tx/${HASH}`);
  assert.equal(urlExplorerTx("0x7000…000b"), null);
  assert.equal(urlExplorerTx("javascript:alert(1)"), null);
  const carteira = "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1";
  assert.equal(urlExplorerEndereco(carteira), `https://sepolia.etherscan.io/address/${carteira}`);
  assert.equal(urlExplorerEndereco("0x123"), null);
});
