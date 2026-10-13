import test from "node:test";
import assert from "node:assert/strict";
import { decodeFunctionData, encodeFunctionResult, parseAbi } from "viem";
import { aprovarBrlt } from "../src/services/brlt.js";

const abi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]);
const carteira = "0x1111111111111111111111111111111111111111";
const deployment = {
  brlTokenAddress: "0x2222222222222222222222222222222222222222",
  contractAddress: "0x3333333333333333333333333333333333333333",
};
const hash = `0x${"a".repeat(64)}`;

function providerDeTeste({ saldo = 200n, autorizado = 0n, recibo = { status: "0x1" } } = {}) {
  const envios = [];
  const provider = { request: async ({ method, params }) => {
    if (method === "eth_chainId") return "0xaa36a7";
    if (method === "eth_accounts") return [carteira];
    if (method === "eth_call") {
      assert.equal(params[0].to, deployment.brlTokenAddress);
      const chamada = decodeFunctionData({ abi, data: params[0].data });
      return encodeFunctionResult({ abi, functionName: chamada.functionName,
        result: chamada.functionName === "balanceOf" ? saldo : autorizado });
    }
    if (method === "eth_sendTransaction") { envios.push(params[0]); return hash; }
    if (method === "eth_getTransactionReceipt") return recibo;
    throw new Error(`Método inesperado: ${method}`);
  } };
  return { provider, envios };
}

test("aprova apenas o valor necessário e aguarda recibo antes de liberar a oferta", async () => {
  const { provider, envios } = providerDeTeste();
  const fases = [];
  const resultado = await aprovarBrlt({ provider, carteira, deployment, valor: "100",
    aoAtualizar: (estado) => fases.push(estado.fase) });
  assert.equal(resultado.hash, hash);
  assert.deepEqual(fases, ["assinando", "confirmando", "confirmada"]);
  assert.equal(envios.length, 1);
  assert.equal(envios[0].from, carteira);
  assert.equal(envios[0].to, deployment.brlTokenAddress);
  const chamada = decodeFunctionData({ abi, data: envios[0].data });
  assert.equal(chamada.functionName, "approve");
  assert.deepEqual(chamada.args, [deployment.contractAddress, 100n]);
});

test("não envia nova aprovação quando allowance já cobre a oferta", async () => {
  const { provider, envios } = providerDeTeste({ autorizado: 150n });
  assert.deepEqual(await aprovarBrlt({ provider, carteira, deployment, valor: "100" }),
    { aprovado: true, hash: null });
  assert.equal(envios.length, 0);
});

test("saldo insuficiente ou aprovação revertida impedem publicação", async () => {
  const semSaldo = providerDeTeste({ saldo: 99n });
  await assert.rejects(aprovarBrlt({ provider: semSaldo.provider, carteira, deployment, valor: "100" }), /Saldo de BRLt insuficiente/);
  assert.equal(semSaldo.envios.length, 0);

  const revertida = providerDeTeste({ recibo: { status: "0x0" } });
  await assert.rejects(aprovarBrlt({ provider: revertida.provider, carteira, deployment, valor: "100" }),
    (erro) => erro.hash === hash && /aprovação de BRLt falhou/.test(erro.message));
});
