// Converte o payload `Offer` da API no view-model usado pelas telas
// (mesmos nomes de campo dos mocks: id, rawId, contraparte, valor, taxaCdi...).

import {
  SEPOLIA_CHAIN_ID,
  shortenAddress,
  formatCents,
  formatTerm,
  formatCdiRate,
} from "../utils/formatters.js";

// Aceite e liquidação ocorrem na mesma transação (DvP): "Aceita" nunca é persistido.
export const API_STATUS_TO_UI = {
  offered: "Ofertada",
  settled: "Liquidada",
  cancelled: "Cancelada",
  rejected: "Negada",
  expired: "Expirada",
};

const STAGE_BY_EVENT = {
  OfferCreated: "Criação da oferta",
  OfferAccepted: "Aceite e liquidação (DvP)",
  OfferSettled: "Aceite e liquidação (DvP)",
  OfferCancelled: "Cancelamento",
  OfferRejected: "Rejeição",
  OfferExpired: "Expiração",
};

function mapParty(party) {
  return {
    wallet: party?.wallet ?? null,
    name: party?.institution?.name ?? null,
    label: party?.institution?.name ?? shortenAddress(party?.wallet ?? ""),
  };
}

export function mapApiOfferToOperation(offer) {
  if (offer.chainId !== SEPOLIA_CHAIN_ID) {
    throw new Error(`Rede inesperada (chainId ${offer.chainId}). Apenas Sepolia é suportada.`);
  }

  const amountCentsBigInt = BigInt(offer.amountCents);
  const lender = mapParty(offer.lender);
  const borrower = mapParty(offer.borrower);
  const settlement = offer.settlement
    ? {
        txHash: offer.settlement.txHash,
        blockNumber: offer.settlement.blockNumber,
        positionTokenId: offer.settlement.positionTokenId,
        settledAt: offer.settlement.settledAt,
      }
    : null;

  return {
    source: "api",
    id: `#${offer.onchainOfferId}`,
    rawId: offer.id,
    onchainOfferId: offer.onchainOfferId,
    counterparty: lender.label,
    lender,
    borrower,
    amountCentsBigInt,
    // Apenas para barras e gráficos; a exibição usa valorCentavos.
    value: Number(amountCentsBigInt) / 100,
    formattedAmount: formatCents(amountCentsBigInt),
    rateBps: offer.rateCdiBps,
    ratePercent: offer.rateCdiBps / 100,
    cdiRate: formatCdiRate(offer.rateCdiBps),
    termDays: offer.termDays,
    termLabel: formatTerm(offer.termDays),
    apiStatus: offer.status,
    status: API_STATUS_TO_UI[offer.status] ?? offer.status,
    mine: false,
    hash: settlement?.txHash ?? null,
    blockNumber: settlement?.blockNumber ?? null,
    createTxHash: offer.createTxHash,
    createdBlock: offer.createdBlock,
    settlement,
    createdAt: offer.createdAt,
    expiresAt: offer.expiresAt,
    contrato: offer.contractAddress,
    chainId: offer.chainId,
  };
}

// Agrupa eventos por transação. OfferAccepted e OfferSettled têm o mesmo hash.
export function mapEventsToTransactions(events, operation) {
  if (!Array.isArray(events)) return fallbackTransactions(operation);

  const byHash = new Map();
  for (const event of events) {
    const stage = STAGE_BY_EVENT[event.eventName];
    if (!stage || byHash.has(event.txHash)) continue;
    byHash.set(event.txHash, {
      stage,
      txHash: event.txHash,
      blockNumber: event.blockNumber,
      data: event.blockTimestamp,
    });
  }
  return [...byHash.values()];
}

// Usado quando /events falha: hashes que já vêm na própria oferta.
export function fallbackTransactions(operation) {
  const transactions = [];
  if (operation?.createTxHash) {
    transactions.push({
      stage: STAGE_BY_EVENT.OfferCreated,
      txHash: operation.createTxHash,
      blockNumber: operation.createdBlock,
      data: operation.createdAt,
    });
  }
  if (operation?.settlement) {
    transactions.push({
      stage: STAGE_BY_EVENT.OfferSettled,
      txHash: operation.settlement.txHash,
      blockNumber: operation.settlement.blockNumber,
      data: operation.settlement.settledAt,
    });
  }
  return transactions;
}
