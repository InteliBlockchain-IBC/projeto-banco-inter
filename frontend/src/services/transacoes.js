import { encodeFunctionData, parseAbi } from "viem";
import { buscarDeployment, criarIntencaoOferta, criarIntencaoNovaOferta, informarHashIntencao, buscarIntencao } from "./api.js";
import { SEPOLIA_CHAIN_ID } from "./metamask.js";

const ABI = parseAbi([
  "function acceptOffer(uint256 offerId)",
  "function cancelOffer(uint256 offerId)",
  "function rejectOffer(uint256 offerId)",
  "function createOffer(address borrower, uint256 amount, uint256 rateCDI, uint256 term, uint256 validity)",
]);
const FUNCOES = { accept: "acceptOffer", cancel: "cancelOffer", reject: "rejectOffer" };
const PAUSA_MS = 4000;
const TENTATIVAS = 45;

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function mensagemErroTransacao(erro) {
  const codigo = Number(erro?.data?.originalError?.code ?? erro?.data?.code ?? erro?.code);
  if (codigo === 4001 || erro?.code === "ACTION_REJECTED") {
    return "A solicitação foi recusada na MetaMask. Confira a carteira e tente novamente se quiser continuar.";
  }
  if (codigo === 4100) {
    return "A MetaMask não autorizou esta conta. Conecte a carteira novamente e tente de novo.";
  }
  if (codigo === -32002) {
    return "Já há uma solicitação pendente. Abra a MetaMask para confirmar ou cancelar antes de tentar novamente.";
  }
  if (codigo === 4900 || codigo === 4901) {
    return "A MetaMask perdeu a conexão com a Sepolia. Verifique a rede e tente novamente.";
  }

  const descricao = [erro?.shortMessage, erro?.reason, erro?.data?.message,
    erro?.data?.originalError?.message, erro?.message].filter(Boolean).join(" ");
  if (/insufficient funds|not enough (?:eth|funds) for gas/i.test(descricao)) {
    return "A carteira não tem ETH de teste suficiente para pagar a taxa da transação na Sepolia.";
  }
  if (/allowance|insufficient (?:token|brlt)|transfer amount exceeds balance/i.test(descricao)) {
    return "O contrato recusou a operação por saldo ou permissão de BRLt insuficiente. Confira a carteira antes de tentar novamente.";
  }
  if (/execution reverted|revert(?:ed)?|CALL_EXCEPTION/i.test(descricao)) {
    return "O contrato recusou a transação. Confira o limite, o estado da oferta e os requisitos da carteira antes de tentar novamente.";
  }
  if (/timeout|timed out|network error|disconnected|failed to fetch/i.test(descricao)) {
    return erro?.hash
      ? "Não foi possível consultar a Sepolia. Verifique a conexão e consulte o hash antes de tentar enviar outra transação."
      : "Não foi possível consultar a Sepolia. Verifique a conexão com a MetaMask e tente novamente.";
  }

  if (erro?.detail) return erro.detail;
  // Erros escritos pelo próprio aplicativo já descrevem uma ação para o operador.
  if (/^(Conecte|Troque|A conta conectada|Somente|O contrato|A intenção|Transação enviada|A transação falhou|Saldo de BRLt|A aprovação|Não foi possível consultar)/.test(erro?.message ?? "")) {
    return erro.message;
  }
  return "Não foi possível concluir a transação. Confira a MetaMask e tente novamente.";
}

async function verificarCarteira(carteira, provider) {
  if (!provider || !carteira) throw new Error("Conecte sua carteira MetaMask.");
  const chainId = await provider.request({ method: "eth_chainId" });
  if (chainId !== SEPOLIA_CHAIN_ID) throw new Error("Troque a carteira para a rede Sepolia.");
  const contas = await provider.request({ method: "eth_accounts" });
  if (!contas.some((conta) => conta.toLowerCase() === carteira.toLowerCase())) {
    throw new Error("A conta conectada mudou. Conecte a carteira novamente.");
  }
}

async function verificarContrato(provider, endereco, deploymentRecebido) {
  const deployment = deploymentRecebido ?? await buscarDeployment();
  if (deployment.meta?.source === "mock") {
    throw new Error("O backend está em modo mock. Configure um contrato real na Sepolia e o listener antes de assinar.");
  }
  if (deployment.data?.contractAddress?.toLowerCase() !== endereco?.toLowerCase()) {
    throw new Error("O contrato da oferta não corresponde ao deployment ativo.");
  }
  const codigo = await provider.request({ method: "eth_getCode", params: [endereco, "latest"] });
  if (!codigo || codigo === "0x" || codigo === "0x0") {
    throw new Error("O contrato informado pela API não existe na Sepolia.");
  }
}

async function enviarIntencao({ intencao, carteira, provider, aoAtualizar, argumentos }) {
  const chamada = intencao.contractCall;
  aoAtualizar?.({ fase: "assinando", hash: null, intencaoId: intencao.id });
  const data = encodeFunctionData({ abi: ABI, functionName: chamada.functionName, args: argumentos });
  const hash = await provider.request({ method: "eth_sendTransaction", params: [{ from: carteira, to: chamada.contractAddress, data }] });
  aoAtualizar?.({ fase: "confirmando", hash, intencaoId: intencao.id });
  try {
    await informarHashIntencao(intencao.id, hash, carteira);
  } catch (erro) {
    throw Object.assign(new Error(`Transação enviada, mas o backend não registrou o hash: ${mensagemErroTransacao(erro)}`), { hash });
  }

  for (let tentativa = 0; tentativa < TENTATIVAS; tentativa += 1) {
    let recibo;
    try {
      recibo = await provider.request({ method: "eth_getTransactionReceipt", params: [hash] });
    } catch (erro) {
      throw Object.assign(erro, { hash });
    }
    if (recibo) {
      if (recibo.status !== "0x1") {
        throw Object.assign(new Error("A transação falhou na Sepolia. Consulte o hash para ver os detalhes e confira os requisitos da operação antes de tentar novamente."), { hash });
      }
      const atual = await buscarIntencao(intencao.id).catch(() => null);
      aoAtualizar?.({ fase: "confirmada", hash, intencaoId: intencao.id, sincronizando: atual?.status !== "confirmed" });
      return { hash, intencaoId: intencao.id };
    }
    await esperar(PAUSA_MS);
  }
  aoAtualizar?.({ fase: "pendente", hash, intencaoId: intencao.id });
  return { hash, intencaoId: intencao.id, pendente: true };
}

// O backend prepara a chamada; somente a carteira do operador assina e envia.
// O seed do backend usa um contrato sintético, portanto nunca é enviado à rede.
export async function executarAcaoOferta({ operacao, acao, carteira, provider, aoAtualizar }) {
  await verificarCarteira(carteira, provider);
  const parteEsperada = acao === "cancel" ? operacao.ofertante : operacao.tomador;
  if (parteEsperada?.carteira?.toLowerCase() !== carteira.toLowerCase()) {
    throw new Error(acao === "cancel" ? "Somente o ofertante pode cancelar." : "Somente o tomador pode aceitar.");
  }

  await verificarContrato(provider, operacao.contrato);

  aoAtualizar?.({ fase: "preparando", hash: null });
  const { data: intencao } = await criarIntencaoOferta(operacao.rawId, acao, carteira);
  const chamada = intencao.contractCall;
  if (chamada.chainId !== 11155111 ||
      chamada.contractAddress.toLowerCase() !== operacao.contrato.toLowerCase() ||
      chamada.functionName !== FUNCOES[acao] ||
      String(chamada.args?.[0]) !== String(operacao.idOnchain)) {
    throw new Error("A intenção retornada pela API não corresponde à operação exibida.");
  }

  return enviarIntencao({ intencao, carteira, provider, aoAtualizar, argumentos: [BigInt(chamada.args[0])] });
}

export async function executarCriacaoOferta({ dados, carteira, provider, aoAtualizar }) {
  await verificarCarteira(carteira, provider);
  const deployment = await buscarDeployment();
  await verificarContrato(provider, deployment.data?.contractAddress, deployment);
  aoAtualizar?.({ fase: "preparando", hash: null });
  const { data: intencao } = await criarIntencaoNovaOferta(dados, carteira);
  const chamada = intencao.contractCall;
  const esperados = [dados.borrowerWallet, dados.amountCents, dados.rateCdiBps, dados.termDays, dados.validitySeconds];
  if (chamada.chainId !== 11155111 ||
      chamada.contractAddress.toLowerCase() !== deployment.data.contractAddress.toLowerCase() ||
      chamada.functionName !== "createOffer" ||
      chamada.args?.length !== 5 ||
      !chamada.args.every((valor, indice) => String(valor).toLowerCase() === String(esperados[indice]).toLowerCase())) {
    throw new Error("A intenção retornada pela API não corresponde à oferta informada.");
  }
  return enviarIntencao({
    intencao, carteira, provider, aoAtualizar,
    argumentos: [dados.borrowerWallet, BigInt(dados.amountCents), BigInt(dados.rateCdiBps), BigInt(dados.termDays), BigInt(dados.validitySeconds)],
  });
}
