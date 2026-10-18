import { decodeFunctionResult, encodeFunctionData, parseAbi } from "viem";
import { SEPOLIA_CHAIN_ID } from "./metamask.js";

const ABI = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]);

async function readContract(provider, token, functionName, args) {
  const data = encodeFunctionData({ abi: ABI, functionName, args });
  const result = await provider.request({ method: "eth_call", params: [{ to: token, data }, "latest"] });
  return decodeFunctionResult({ abi: ABI, functionName, data: result });
}

export async function readBrlt({ provider, wallet, deployment }) {
  if (!provider || !wallet || !deployment?.brlTokenAddress || !deployment?.contractAddress) {
    throw new Error("Conecte a carteira e aguarde os endereços dos contratos.");
  }
  if (await provider.request({ method: "eth_chainId" }) !== SEPOLIA_CHAIN_ID) {
    throw new Error("Troque a carteira para a rede Sepolia.");
  }
  const accounts = await provider.request({ method: "eth_accounts" });
  if (!accounts.some((account) => account.toLowerCase() === wallet.toLowerCase())) {
    throw new Error("A conta conectada mudou. Conecte a carteira novamente.");
  }
  const [balance, approved] = await Promise.all([
    readContract(provider, deployment.brlTokenAddress, "balanceOf", [wallet]),
    readContract(provider, deployment.brlTokenAddress, "allowance", [wallet, deployment.contractAddress]),
  ]);
  return { balance, approved };
}

export async function approveBrlt({ provider, wallet, deployment, value, onUpdate }) {
  const required = BigInt(value);
  const { balance, approved } = await readBrlt({ provider, wallet, deployment });
  if (balance < required) {
    throw new Error("Saldo de BRLt insuficiente para esta oferta. Solicite tokens de teste ao administrador.");
  }
  if (approved >= required) return { aprovado: true, hash: null };

  onUpdate?.({ phase: "assinando", hash: null });
  const data = encodeFunctionData({
    abi: ABI, functionName: "approve", args: [deployment.contractAddress, required],
  });
  const hash = await provider.request({
    method: "eth_sendTransaction",
    params: [{ from: wallet, to: deployment.brlTokenAddress, data }],
  });
  onUpdate?.({ phase: "confirmando", hash });

  // O approve só é útil depois de confirmado. Nunca envie a oferta se a
  // confirmação for desconhecida ou se o recibo indicar reversão.
  for (let tentativa = 0; tentativa < 45; tentativa += 1) {
    let recibo;
    try {
      recibo = await provider.request({ method: "eth_getTransactionReceipt", params: [hash] });
    } catch {
      throw Object.assign(new Error("Não foi possível consultar a Sepolia. Confira o hash da aprovação antes de tentar novamente."), { hash });
    }
    if (recibo) {
      if (recibo.status !== "0x1") {
        throw Object.assign(new Error("A aprovação de BRLt falhou na Sepolia."), { hash });
      }
      onUpdate?.({ phase: "confirmada", hash });
      return { aprovado: true, hash };
    }
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }
  throw Object.assign(new Error("A aprovação ainda não foi confirmada. Consulte o hash antes de tentar novamente."), { hash });
}
