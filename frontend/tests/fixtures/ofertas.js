// Payloads capturados de GET /api/offers/:id e /events do backend-banco-inter v0.4.0
// (fixtures sintéticas do próprio backend, modo mock). Mantidos idênticos à API.

export const ofertaLiquidada = {
  "amountCents": "5000000000",
  "borrower": {
    "institution": {
      "id": "b0000000-0000-4000-8000-000000000002",
      "name": "Banco Beta S.A. (fictício)"
    },
    "wallet": "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2"
  },
  "chainId": 11155111,
  "contractAddress": "0x0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c",
  "createTxHash": "0x700000000000000000000000000000000000000000000000000000000000000a",
  "createdAt": "2026-10-08T21:18:24.000Z",
  "createdBlock": 9178400,
  "expiresAt": "2026-10-08T22:18:24.000Z",
  "id": "a0000000-0000-4000-8000-000000000001",
  "lender": {
    "institution": {
      "id": "b0000000-0000-4000-8000-000000000001",
      "name": "Banco Alfa S.A. (fictício)"
    },
    "wallet": "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1"
  },
  "onchainOfferId": "1",
  "onchainStatusCode": 2,
  "rateCdiBps": 10250,
  "settlement": {
    "blockNumber": 9178460,
    "positionTokenId": "1",
    "settledAt": "2026-10-08T21:30:24.000Z",
    "txHash": "0x700000000000000000000000000000000000000000000000000000000000000b"
  },
  "status": "settled",
  "termDays": 1
};

export const ofertaAberta = {
  "amountCents": "4000000000",
  "borrower": {
    "institution": {
      "id": "b0000000-0000-4000-8000-000000000002",
      "name": "Banco Beta S.A. (fictício)"
    },
    "wallet": "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2"
  },
  "chainId": 11155111,
  "contractAddress": "0x0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c",
  "createTxHash": "0x7000000000000000000000000000000000000000000000000000000000000017",
  "createdAt": "2026-10-11T21:08:24.000Z",
  "createdBlock": 9199950,
  "expiresAt": "2026-10-11T22:08:24.000Z",
  "id": "a0000000-0000-4000-8000-000000000008",
  "lender": {
    "institution": {
      "id": "b0000000-0000-4000-8000-000000000001",
      "name": "Banco Alfa S.A. (fictício)"
    },
    "wallet": "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1"
  },
  "onchainOfferId": "8",
  "onchainStatusCode": 0,
  "rateCdiBps": 10500,
  "settlement": null,
  "status": "offered",
  "termDays": 1
};

export const ofertaCancelada = {
  "amountCents": "1000000000",
  "borrower": {
    "institution": {
      "id": "b0000000-0000-4000-8000-000000000003",
      "name": "Banco Gama S.A. (fictício)"
    },
    "wallet": "0xc3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3"
  },
  "chainId": 11155111,
  "contractAddress": "0x0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c",
  "createTxHash": "0x700000000000000000000000000000000000000000000000000000000000000e",
  "createdAt": "2026-10-10T15:18:24.000Z",
  "createdBlock": 9191000,
  "expiresAt": "2026-10-10T16:18:24.000Z",
  "id": "a0000000-0000-4000-8000-000000000003",
  "lender": {
    "institution": {
      "id": "b0000000-0000-4000-8000-000000000002",
      "name": "Banco Beta S.A. (fictício)"
    },
    "wallet": "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2"
  },
  "onchainOfferId": "3",
  "onchainStatusCode": 3,
  "rateCdiBps": 10300,
  "settlement": null,
  "status": "cancelled",
  "termDays": 1
};

export const eventosLiquidada = [
  {
    "args": {
      "amount": "5000000000",
      "borrower": "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2",
      "expiresAt": "1791497904",
      "lender": "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
      "offerId": "1",
      "rateCDI": "10250",
      "term": "1"
    },
    "blockHash": "0xb0000000000000000000000000000000000000000000000000000000008c0d20",
    "blockNumber": 9178400,
    "blockTimestamp": "2026-10-08T21:18:24.000Z",
    "eventName": "OfferCreated",
    "logIndex": 0,
    "offerId": "a0000000-0000-4000-8000-000000000001",
    "txHash": "0x700000000000000000000000000000000000000000000000000000000000000a"
  },
  {
    "args": {
      "borrower": "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2",
      "offerId": "1",
      "timestamp": "1791495024"
    },
    "blockHash": "0xb0000000000000000000000000000000000000000000000000000000008c0d5c",
    "blockNumber": 9178460,
    "blockTimestamp": "2026-10-08T21:30:24.000Z",
    "eventName": "OfferAccepted",
    "logIndex": 0,
    "offerId": "a0000000-0000-4000-8000-000000000001",
    "txHash": "0x700000000000000000000000000000000000000000000000000000000000000b"
  },
  {
    "args": {
      "amount": "5000000000",
      "borrower": "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2",
      "lender": "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
      "offerId": "1",
      "positionTokenId": "1",
      "rateCDI": "10250",
      "term": "1",
      "timestamp": "1791495024"
    },
    "blockHash": "0xb0000000000000000000000000000000000000000000000000000000008c0d5c",
    "blockNumber": 9178460,
    "blockTimestamp": "2026-10-08T21:30:24.000Z",
    "eventName": "OfferSettled",
    "logIndex": 1,
    "offerId": "a0000000-0000-4000-8000-000000000001",
    "txHash": "0x700000000000000000000000000000000000000000000000000000000000000b"
  }
];

export const eventosCancelada = [
  {
    "args": {
      "amount": "1000000000",
      "borrower": "0xc3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3",
      "expiresAt": "1791649104",
      "lender": "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2",
      "offerId": "3",
      "rateCDI": "10300",
      "term": "1"
    },
    "blockHash": "0xb0000000000000000000000000000000000000000000000000000000008c3e58",
    "blockNumber": 9191000,
    "blockTimestamp": "2026-10-10T15:18:24.000Z",
    "eventName": "OfferCreated",
    "logIndex": 0,
    "offerId": "a0000000-0000-4000-8000-000000000003",
    "txHash": "0x700000000000000000000000000000000000000000000000000000000000000e"
  },
  {
    "args": {
      "offerId": "3",
      "timestamp": "1791646704"
    },
    "blockHash": "0xb0000000000000000000000000000000000000000000000000000000008c3ebc",
    "blockNumber": 9191100,
    "blockTimestamp": "2026-10-10T15:38:24.000Z",
    "eventName": "OfferCancelled",
    "logIndex": 0,
    "offerId": "a0000000-0000-4000-8000-000000000003",
    "txHash": "0x700000000000000000000000000000000000000000000000000000000000000f"
  }
];
