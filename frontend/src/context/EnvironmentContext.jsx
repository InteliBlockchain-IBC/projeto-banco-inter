import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getDeployment, listCreditLimits } from "../services/api";
import { useWallet } from "./WalletContext";

export const SYNTHETIC_CONTRACT = "0x0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c";
const EnvironmentContext = createContext(null);

export function EnvironmentProvider({ children }) {
  const { account } = useWallet();
  const [state, setState] = useState({ status: "carregando", deployment: null, limits: [], error: null });
  const [version, setVersion] = useState(0);
  const [demoWallet, setDemoWalletState] = useState(() => {
    try { return sessionStorage.getItem("inter-carteira-demo") ?? ""; } catch { return ""; }
  });

  useEffect(() => {
    // TODO: incluir o modo da API nas dependências quando o seletor de ambiente for conectado à interface.
    const controller = new AbortController();
    Promise.all([
      getDeployment({ signal: controller.signal }),
      listCreditLimits({}, { signal: controller.signal }),
    ]).then(([deployment, limits]) => {
      setState({ status: "ok", deployment, limits, error: null });
    }).catch((error) => {
      if (!controller.signal.aborted) setState((previous) => ({ ...previous, status: "erro", error }));
    });
    return () => controller.abort();
  }, [version]);

  useEffect(() => {
    if (!account || state.status !== "ok" ||
        state.deployment?.data?.contractAddress?.toLowerCase() === SYNTHETIC_CONTRACT ||
        state.limits.some((item) => item.wallet.toLowerCase() === account.toLowerCase() && item.isRegistered)) {
      return undefined;
    }

    const update = () => {
      if (document.visibilityState === "visible") setVersion((current) => current + 1);
    };
    const interval = window.setInterval(update, 15000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [account, state]);

  function setDemoWallet(wallet) {
    setDemoWalletState(wallet);
    try { sessionStorage.setItem("inter-carteira-demo", wallet); } catch { /* Seleção disponível nesta sessão. */ }
  }

  // O endereço sintético vem do backend e determina se as ações usam a API de demonstração.
  const value = useMemo(() => {
    const demo = state.deployment?.data?.contractAddress?.toLowerCase() === SYNTHETIC_CONTRACT;
    const activeWallet = demo
      ? state.limits.some((item) => item.wallet.toLowerCase() === demoWallet.toLowerCase())
        ? demoWallet : state.limits[0]?.wallet ?? null
      : account;
    const operatorLimit = state.limits.find((item) => item.wallet.toLowerCase() === activeWallet?.toLowerCase()) ?? null;
    return {
      ...state,
      demo,
      activeWallet,
      demoWallet,
      setDemoWallet,
      operatorLimit,
      reload: () => setVersion((current) => current + 1),
    };
  }, [state, demoWallet, account]);

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (!context) throw new Error("useEnvironment requer EnvironmentProvider");
  return context;
}
