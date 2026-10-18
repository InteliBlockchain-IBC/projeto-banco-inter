import test from "node:test";
import assert from "node:assert/strict";
import { decodeFunctionData, encodeFunctionResult, parseAbi } from "viem";
import { approveBrlt } from "../src/services/brlt.js";

const abi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]);
const wallet = "0x1111111111111111111111111111111111111111";
const deployment = {
  brlTokenAddress: "0x2222222222222222222222222222222222222222",
  contractAddress: "0x3333333333333333333333333333333333333333",
};
const hash = `0x${"a".repeat(64)}`;

function providerDeTeste({ balance = 200n, approved = 0n, recibo = { status: "0x1" } } = {}) {
  const envios = [];
  const provider = { request: async ({ method, params }) => {
    if (method === "eth_chainId") return "0xaa36a7";
    if (method === "eth_accounts") return [wallet];
    if (method === "eth_call") {
      assert.equal(params[0].to, deployment.brlTokenAddress);
      const contractCall = decodeFunctionData({ abi, data: params[0].data });
      return encodeFunctionResult({ abi, functionName: contractCall.functionName,
        result: contractCall.functionName === "balanceOf" ? balance : approved });
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
  const result = await approveBrlt({ provider, wallet, deployment, value: "100",
    onUpdate: (state) => fases.push(state.phase) });
  assert.equal(result.hash, hash);
  assert.deepEqual(fases, ["assinando", "confirmando", "confirmada"]);
  assert.equal(envios.length, 1);
  assert.equal(envios[0].from, wallet);
  assert.equal(envios[0].to, deployment.brlTokenAddress);
  const contractCall = decodeFunctionData({ abi, data: envios[0].data });
  assert.equal(contractCall.functionName, "approve");
  assert.deepEqual(contractCall.args, [deployment.contractAddress, 100n]);
});

test("não envia nova aprovação quando allowance já cobre a oferta", async () => {
  const { provider, envios } = providerDeTeste({ approved: 150n });
  assert.deepEqual(await approveBrlt({ provider, wallet, deployment, value: "100" }),
    { aprovado: true, hash: null });
  assert.equal(envios.length, 0);
});

test("saldo insuficiente ou aprovação revertida impedem publicação", async () => {
  const semSaldo = providerDeTeste({ balance: 99n });
  await assert.rejects(approveBrlt({ provider: semSaldo.provider, wallet, deployment, value: "100" }), /Saldo de BRLt insuficiente/);
  assert.equal(semSaldo.envios.length, 0);

  const revertida = providerDeTeste({ recibo: { status: "0x0" } });
  await assert.rejects(approveBrlt({ provider: revertida.provider, wallet, deployment, value: "100" }),
    (error) => error.hash === hash && /aprovação de BRLt falhou/.test(error.message));
});
