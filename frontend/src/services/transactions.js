import { encodeFunctionData, parseAbi } from "viem";
import { getDeployment, createOfferActionIntent, createOfferIntent, submitIntentHash, getTransactionRequest } from "./api.js";
import { SEPOLIA_CHAIN_ID } from "./metamask.js";

const ABI = parseAbi([
  "function acceptOffer(uint256 offerId)",
  "function cancelOffer(uint256 offerId)",
  "function rejectOffer(uint256 offerId)",
  "function createOffer(address borrower, uint256 amount, uint256 rateCDI, uint256 term, uint256 validity)",
]);
const CONTRACT_FUNCTIONS = { accept: "acceptOffer", cancel: "cancelOffer", reject: "rejectOffer" };
const POLL_INTERVAL_MS = 4000;
const MAX_ATTEMPTS = 45;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function transactionErrorMessage(error) {
  const code = Number(error?.data?.originalError?.code ?? error?.data?.code ?? error?.code);
  if (code === 4001 || error?.code === "ACTION_REJECTED") {
    return "A solicitação foi recusada na MetaMask. Confira a carteira e tente novamente se quiser continuar.";
  }
  if (code === 4100) {
    return "A MetaMask não autorizou esta conta. Conecte a carteira novamente e tente de novo.";
  }
  if (code === -32002) {
    return "Já há uma solicitação pendente. Abra a MetaMask para confirmar ou cancelar antes de tentar novamente.";
  }
  if (code === 4900 || code === 4901) {
    return "A MetaMask perdeu a conexão com a Sepolia. Verifique a rede e tente novamente.";
  }

  const description = [error?.shortMessage, error?.reason, error?.data?.message,
    error?.data?.originalError?.message, error?.message].filter(Boolean).join(" ");
  if (/insufficient funds|not enough (?:eth|funds) for gas/i.test(description)) {
    return "A carteira não tem ETH de teste suficiente para pagar a taxa da transação na Sepolia.";
  }
  if (/allowance|insufficient (?:token|brlt)|transfer amount exceeds balance/i.test(description)) {
    return "O contrato recusou a operação por saldo ou permissão de BRLt insuficiente. Confira a carteira antes de tentar novamente.";
  }
  if (/execution reverted|revert(?:ed)?|CALL_EXCEPTION/i.test(description)) {
    return "O contrato recusou a transação. Confira o limite, o estado da oferta e os requisitos da carteira antes de tentar novamente.";
  }
  if (/timeout|timed out|network error|disconnected|failed to fetch/i.test(description)) {
    return error?.hash
      ? "Não foi possível consultar a Sepolia. Verifique a conexão e consulte o hash antes de tentar enviar outra transação."
      : "Não foi possível consultar a Sepolia. Verifique a conexão com a MetaMask e tente novamente.";
  }

  if (error?.detail) return error.detail;
  // Erros escritos pelo próprio aplicativo já descrevem uma ação para o operador.
  if (/^(Conecte|Troque|A conta conectada|Somente|O contrato|A intenção|Transação enviada|A transação falhou|Saldo de BRLt|A aprovação|Não foi possível consultar)/.test(error?.message ?? "")) {
    return error.message;
  }
  return "Não foi possível concluir a transação. Confira a MetaMask e tente novamente.";
}

async function verifyWallet(wallet, provider) {
  if (!provider || !wallet) throw new Error("Conecte sua carteira MetaMask.");
  const chainId = await provider.request({ method: "eth_chainId" });
  if (chainId !== SEPOLIA_CHAIN_ID) throw new Error("Troque a carteira para a rede Sepolia.");
  const accounts = await provider.request({ method: "eth_accounts" });
  if (!accounts.some((account) => account.toLowerCase() === wallet.toLowerCase())) {
    throw new Error("A conta conectada mudou. Conecte a carteira novamente.");
  }
}

async function verifyContract(provider, endereco, receivedDeployment) {
  const deployment = receivedDeployment ?? await getDeployment();
  if (deployment.meta?.source === "mock") {
    throw new Error("O backend está em modo mock. Configure um contrato real na Sepolia e o listener antes de assinar.");
  }
  if (deployment.data?.contractAddress?.toLowerCase() !== endereco?.toLowerCase()) {
    throw new Error("O contrato da oferta não corresponde ao deployment ativo.");
  }
  const code = await provider.request({ method: "eth_getCode", params: [endereco, "latest"] });
  if (!code || code === "0x" || code === "0x0") {
    throw new Error("O contrato informado pela API não existe na Sepolia.");
  }
}

async function sendIntent({ intent, wallet, provider, onUpdate, args }) {
  // O backend prepara a intenção; a MetaMask envia a chamada e devolve o hash.
  const contractCall = intent.contractCall;
  onUpdate?.({ phase: "assinando", hash: null, intencaoId: intent.id });
  const data = encodeFunctionData({ abi: ABI, functionName: contractCall.functionName, args: args });
  const hash = await provider.request({ method: "eth_sendTransaction", params: [{ from: wallet, to: contractCall.contractAddress, data }] });
  onUpdate?.({ phase: "confirmando", hash, intencaoId: intent.id });
  try {
    await submitIntentHash(intent.id, hash, wallet);
  } catch (error) {
    throw Object.assign(new Error(`Transação enviada, mas o backend não registrou o hash: ${transactionErrorMessage(error)}`), { hash });
  }

  // O recibo confirma a rede; a atualização da oferta ainda depende do indexador do backend.
  for (let tentativa = 0; tentativa < MAX_ATTEMPTS; tentativa += 1) {
    let recibo;
    try {
      recibo = await provider.request({ method: "eth_getTransactionReceipt", params: [hash] });
    } catch (error) {
      throw Object.assign(error, { hash });
    }
    if (recibo) {
      if (recibo.status !== "0x1") {
        throw Object.assign(new Error("A transação falhou na Sepolia. Consulte o hash para ver os detalhes e confira os requisitos da operação antes de tentar novamente."), { hash });
      }
      const current = await getTransactionRequest(intent.id).catch(() => null);
      onUpdate?.({ phase: "confirmada", hash, intencaoId: intent.id, sincronizando: current?.status !== "confirmed" });
      return { hash, intencaoId: intent.id };
    }
    await sleep(POLL_INTERVAL_MS);
  }
  onUpdate?.({ phase: "pendente", hash, intencaoId: intent.id });
  return { hash, intencaoId: intent.id, pending: true };
}

// O backend prepara a chamada; somente a carteira do operador assina e envia.
// O seed do backend usa um contrato sintético, portanto nunca é enviado à rede.
export async function executeOfferAction({ operation, action, wallet, provider, onUpdate }) {
  await verifyWallet(wallet, provider);
  const expectedParty = action === "cancel" ? operation.lender : operation.borrower;
  if (expectedParty?.wallet?.toLowerCase() !== wallet.toLowerCase()) {
    throw new Error(action === "cancel" ? "Somente o ofertante pode cancelar." : "Somente o tomador pode aceitar.");
  }

  await verifyContract(provider, operation.contrato);

  onUpdate?.({ phase: "preparando", hash: null });
  const { data: intent } = await createOfferActionIntent(operation.rawId, action, wallet);
  const contractCall = intent.contractCall;
  if (contractCall.chainId !== 11155111 ||
      contractCall.contractAddress.toLowerCase() !== operation.contrato.toLowerCase() ||
      contractCall.functionName !== CONTRACT_FUNCTIONS[action] ||
      String(contractCall.args?.[0]) !== String(operation.onchainOfferId)) {
    throw new Error("A intenção retornada pela API não corresponde à operação exibida.");
  }

  return sendIntent({ intent, wallet, provider, onUpdate, args: [BigInt(contractCall.args[0])] });
}

export async function executeOfferCreation({ data, wallet, provider, onUpdate }) {
  await verifyWallet(wallet, provider);
  const deployment = await getDeployment();
  await verifyContract(provider, deployment.data?.contractAddress, deployment);
  onUpdate?.({ phase: "preparando", hash: null });
  const { data: intent } = await createOfferIntent(data, wallet);
  const contractCall = intent.contractCall;
  const expectedArgs = [data.borrowerWallet, data.amountCents, data.rateCdiBps, data.termDays, data.validitySeconds];
  if (contractCall.chainId !== 11155111 ||
      contractCall.contractAddress.toLowerCase() !== deployment.data.contractAddress.toLowerCase() ||
      contractCall.functionName !== "createOffer" ||
      contractCall.args?.length !== 5 ||
      !contractCall.args.every((value, index) => String(value).toLowerCase() === String(expectedArgs[index]).toLowerCase())) {
    throw new Error("A intenção retornada pela API não corresponde à oferta informada.");
  }
  return sendIntent({
    intent, wallet, provider, onUpdate,
    args: [data.borrowerWallet, BigInt(data.amountCents), BigInt(data.rateCdiBps), BigInt(data.termDays), BigInt(data.validitySeconds)],
  });
}
