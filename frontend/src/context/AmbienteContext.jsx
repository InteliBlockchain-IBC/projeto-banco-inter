import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buscarDeployment, listarLimitesCredito } from "../services/api";
import { useCarteira } from "./CarteiraContext";

export const CONTRATO_SINTETICO = "0x0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c";
const AmbienteContext = createContext(null);

export function AmbienteProvider({ children }) {
  const { conta } = useCarteira();
  const [estado, setEstado] = useState({ status: "carregando", deployment: null, limites: [], erro: null });
  const [versao, setVersao] = useState(0);
  const [carteiraDemo, setCarteiraDemoState] = useState(() => {
    try { return sessionStorage.getItem("inter-carteira-demo") ?? ""; } catch { return ""; }
  });

  useEffect(() => {
    const controlador = new AbortController();
    Promise.all([
      buscarDeployment({ signal: controlador.signal }),
      listarLimitesCredito({}, { signal: controlador.signal }),
    ]).then(([deployment, limites]) => {
      setEstado({ status: "ok", deployment, limites, erro: null });
    }).catch((erro) => {
      if (!controlador.signal.aborted) setEstado((anterior) => ({ ...anterior, status: "erro", erro }));
    });
    return () => controlador.abort();
  }, [versao]);

  function setCarteiraDemo(wallet) {
    setCarteiraDemoState(wallet);
    try { sessionStorage.setItem("inter-carteira-demo", wallet); } catch { /* Seleção disponível nesta sessão. */ }
  }

  const valor = useMemo(() => {
    const demonstracao = estado.deployment?.data?.contractAddress?.toLowerCase() === CONTRATO_SINTETICO;
    const carteiraAtiva = demonstracao
      ? estado.limites.some((item) => item.wallet.toLowerCase() === carteiraDemo.toLowerCase())
        ? carteiraDemo : estado.limites[0]?.wallet ?? null
      : conta;
    const limiteOperador = estado.limites.find((item) => item.wallet.toLowerCase() === carteiraAtiva?.toLowerCase()) ?? null;
    return {
      ...estado,
      demonstracao,
      carteiraAtiva,
      carteiraDemo,
      setCarteiraDemo,
      limiteOperador,
      recarregar: () => setVersao((atual) => atual + 1),
    };
  }, [estado, carteiraDemo, conta]);

  return <AmbienteContext.Provider value={valor}>{children}</AmbienteContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAmbiente() {
  const contexto = useContext(AmbienteContext);
  if (!contexto) throw new Error("useAmbiente requer AmbienteProvider");
  return contexto;
}
