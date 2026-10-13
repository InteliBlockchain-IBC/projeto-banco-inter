import { useCallback, useEffect, useState } from "react";
import { listarOfertas } from "../services/api";
import { ofertaApiParaOperacao } from "../services/adaptadorOfertas";

export function useOfertasApi({ status, wallet, role, enabled = true } = {}) {
  const [estado, setEstado] = useState({ status: "carregando", operacoes: [], erro: null });
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    if (!enabled) return () => controlador.abort();
    listarOfertas({ status, wallet, role }, { signal: controlador.signal })
      .then((ofertas) => {
        setEstado({ status: "ok", operacoes: ofertas.map(ofertaApiParaOperacao), erro: null });
      })
      .catch((erro) => {
        if (controlador.signal.aborted) return;
        setEstado({ status: "erro", operacoes: [], erro });
      });
    return () => controlador.abort();
  }, [status, wallet, role, enabled, versao]);

  useEffect(() => {
    if (!enabled) return undefined;
    const atualizar = () => { if (document.visibilityState === "visible") setVersao((v) => v + 1); };
    const intervalo = setInterval(atualizar, 15_000);
    window.addEventListener("inter:ofertas-atualizadas", atualizar);
    return () => {
      clearInterval(intervalo);
      window.removeEventListener("inter:ofertas-atualizadas", atualizar);
    };
  }, [enabled]);

  const recarregar = useCallback(() => {
    setEstado({ status: "carregando", operacoes: [], erro: null });
    setVersao((v) => v + 1);
  }, []);

  return { ...estado, recarregar };
}
