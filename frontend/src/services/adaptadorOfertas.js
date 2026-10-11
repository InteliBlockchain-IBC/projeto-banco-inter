// Converte o payload `Offer` da API no view-model usado pelas telas
// (mesmos nomes de campo dos mocks: id, rawId, contraparte, valor, taxaCdi...).

import {
  SEPOLIA_CHAIN_ID,
  abreviarEndereco,
  formatarCentavos,
  formatarPrazo,
  formatarTaxaCdi,
} from "../utils/formatadores.js";

// Ações que exigem assinatura na carteira ainda não estão ligadas ao contrato.
export const MENSAGEM_ASSINATURA_PENDENTE =
  "Assinatura na carteira será habilitada na integração com o contrato.";

// Aceite e liquidação ocorrem na mesma transação (DvP): "Aceita" nunca é persistido.
export const STATUS_API_PARA_UI = {
  offered: "Ofertada",
  settled: "Liquidada",
  cancelled: "Cancelada",
  rejected: "Negada",
  expired: "Expirada",
};

const ETAPA_POR_EVENTO = {
  OfferCreated: "Criação da oferta",
  OfferAccepted: "Aceite e liquidação (DvP)",
  OfferSettled: "Aceite e liquidação (DvP)",
  OfferCancelled: "Cancelamento",
  OfferRejected: "Rejeição",
  OfferExpired: "Expiração",
};

function parte(party) {
  return {
    carteira: party?.wallet ?? null,
    nome: party?.institution?.name ?? null,
    rotulo: party?.institution?.name ?? abreviarEndereco(party?.wallet ?? ""),
  };
}

export function ofertaApiParaOperacao(offer) {
  if (offer.chainId !== SEPOLIA_CHAIN_ID) {
    throw new Error(`Rede inesperada (chainId ${offer.chainId}). Apenas Sepolia é suportada.`);
  }

  const valorCentavos = BigInt(offer.amountCents);
  const ofertante = parte(offer.lender);
  const tomador = parte(offer.borrower);
  const liquidacao = offer.settlement
    ? {
        txHash: offer.settlement.txHash,
        bloco: offer.settlement.blockNumber,
        tokenPosicao: offer.settlement.positionTokenId,
        liquidadaEm: offer.settlement.settledAt,
      }
    : null;

  return {
    origem: "api",
    id: `#${offer.onchainOfferId}`,
    rawId: offer.id,
    idOnchain: offer.onchainOfferId,
    contraparte: ofertante.rotulo,
    ofertante,
    tomador,
    valorCentavos,
    // Apenas para barras e gráficos; a exibição usa valorCentavos.
    valor: Number(valorCentavos) / 100,
    valorFormatado: formatarCentavos(valorCentavos),
    taxaBps: offer.rateCdiBps,
    taxaPercent: offer.rateCdiBps / 100,
    taxaCdi: formatarTaxaCdi(offer.rateCdiBps),
    prazoDias: offer.termDays,
    prazoTexto: formatarPrazo(offer.termDays),
    statusApi: offer.status,
    status: STATUS_API_PARA_UI[offer.status] ?? offer.status,
    minha: false,
    hash: liquidacao?.txHash ?? null,
    bloco: liquidacao?.bloco ?? null,
    hashCriacao: offer.createTxHash,
    blocoCriacao: offer.createdBlock,
    liquidacao,
    criadaEm: offer.createdAt,
    expiraEm: offer.expiresAt,
    contrato: offer.contractAddress,
    chainId: offer.chainId,
  };
}

// Agrupa eventos por transação. OfferAccepted e OfferSettled têm o mesmo hash.
export function eventosParaTransacoes(eventos, operacao) {
  if (!Array.isArray(eventos)) return transacoesDeFallback(operacao);

  const porHash = new Map();
  for (const evento of eventos) {
    const etapa = ETAPA_POR_EVENTO[evento.eventName];
    if (!etapa || porHash.has(evento.txHash)) continue;
    porHash.set(evento.txHash, {
      etapa,
      txHash: evento.txHash,
      bloco: evento.blockNumber,
      data: evento.blockTimestamp,
    });
  }
  return [...porHash.values()];
}

// Usado quando /events falha: hashes que já vêm na própria oferta.
export function transacoesDeFallback(operacao) {
  const transacoes = [];
  if (operacao?.hashCriacao) {
    transacoes.push({
      etapa: ETAPA_POR_EVENTO.OfferCreated,
      txHash: operacao.hashCriacao,
      bloco: operacao.blocoCriacao,
      data: operacao.criadaEm,
    });
  }
  if (operacao?.liquidacao) {
    transacoes.push({
      etapa: ETAPA_POR_EVENTO.OfferSettled,
      txHash: operacao.liquidacao.txHash,
      bloco: operacao.liquidacao.bloco,
      data: operacao.liquidacao.liquidadaEm,
    });
  }
  return transacoes;
}
