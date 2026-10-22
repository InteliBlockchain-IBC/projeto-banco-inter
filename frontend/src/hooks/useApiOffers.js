import { useCallback, useEffect, useState } from "react";
import { listOffers } from "../services/api";
import { mapApiOfferToOperation } from "../services/offerAdapter";

export function useApiOffers({ status, wallet, role, enabled = true } = {}) {
  const [state, setState] = useState({ status: "carregando", operations: [], error: null });
  const [version, setVersion] = useState(0);

  // Cada consulta recebe um AbortController para ignorar respostas de filtros antigos.
  useEffect(() => {
    const controller = new AbortController();
    if (!enabled) return () => controller.abort();
    listOffers({ status, wallet, role }, { signal: controller.signal })
      .then((offers) => {
        setState({ status: "ok", operations: offers.map(mapApiOfferToOperation), error: null });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({ status: "erro", operations: [], error });
      });
    return () => controller.abort();
  }, [status, wallet, role, enabled, version]);

  // Atualiza apenas com a aba visível; ações locais também disparam o evento abaixo.
  useEffect(() => {
    if (!enabled) return undefined;
    const update = () => { if (document.visibilityState === "visible") setVersion((v) => v + 1); };
    const interval = setInterval(update, 15_000);
    window.addEventListener("inter:ofertas-atualizadas", update);
    return () => {
      clearInterval(interval);
      window.removeEventListener("inter:ofertas-atualizadas", update);
    };
  }, [enabled]);

  const reload = useCallback(() => {
    setState({ status: "carregando", operations: [], error: null });
    setVersion((v) => v + 1);
  }, []);

  return { ...state, reload };
}
