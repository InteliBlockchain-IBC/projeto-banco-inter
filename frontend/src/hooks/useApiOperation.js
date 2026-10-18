import { useCallback, useEffect, useState } from "react";
import { getOfferEvents, getCreditLimit, getOffer } from "../services/api";
import { mapEventsToTransactions, mapApiOfferToOperation } from "../services/offerAdapter";

// Enquanto a oferta está aberta, consulta a API periodicamente para refletir
// aceite/cancelamento feito por outro operador (RF04, RNF02 ≤ 30 s).
export const REFRESH_INTERVAL_MS = 10_000;

const INITIAL_STATE = {
  status: "carregando", // "carregando" | "ok" | "erro"
  operation: null,
  transactions: [],
  eventsUnavailable: false,
  limit: { data: null, error: null },
  error: null,
  refreshError: null,
  atualizadoEm: null,
};

function isAbortError(error) {
  if (error?.name === "AbortError") throw error;
}

async function loadOperation(id, signal) {
  const [offer, events] = await Promise.all([
    getOffer(id, { signal }),
    // Sem eventos, a tela usa os hashes da própria oferta.
    getOfferEvents(id, { signal }).catch((error) => (isAbortError(error), null)),
  ]);
  const operation = mapApiOfferToOperation(offer);
  const limit = await getCreditLimit(operation.borrower.wallet, { signal })
    .then((data) => ({ data, error: null }))
    .catch((error) => (isAbortError(error), { data: null, error }));

  return {
    operation,
    transactions: mapEventsToTransactions(events, operation),
    eventsUnavailable: events === null,
    limit,
  };
}

// Use com `key={id}` no componente para reiniciar o estado ao trocar de operação.
export function useApiOperation(id) {
  const [state, setState] = useState(INITIAL_STATE);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    loadOperation(id, controller.signal)
      .then((result) => {
        setState({ ...INITIAL_STATE, status: "ok", ...result, atualizadoEm: new Date() });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState((previous) =>
          previous.operation
            ? { ...previous, refreshError: error } // mantém o último dado confirmado
            : { ...INITIAL_STATE, status: "erro", error },
        );
      });
    return () => controller.abort();
  }, [id, version]);

  const reload = useCallback(() => {
    setState((previous) =>
      previous.operation ? previous : { ...INITIAL_STATE, status: "carregando" },
    );
    setVersion((v) => v + 1);
  }, []);

  const isOpen = state.operation?.apiStatus === "offered";

  useEffect(() => {
    if (!isOpen) return undefined;
    const atualizarSeVisivel = () => {
      if (document.visibilityState === "visible") setVersion((v) => v + 1);
    };
    const interval = setInterval(atualizarSeVisivel, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", atualizarSeVisivel);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", atualizarSeVisivel);
    };
  }, [isOpen]);

  return { ...state, reload };
}
