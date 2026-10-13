import { useCallback, useEffect, useState } from "react";
import { listarOfertas } from "../services/api";
import { ofertaApiParaOperacao } from "../services/adaptadorOfertas";

export function useOfertasApi({ status } = {}) {
  const [estado, setEstado] = useState({ status: "carregando", operacoes: [], erro: null });
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    listarOfertas({ status }, { signal: controlador.signal })
      .then((ofertas) => {
        setEstado({ status: "ok", operacoes: ofertas.map(ofertaApiParaOperacao), erro: null });
      })
      .catch((erro) => {
        if (controlador.signal.aborted) return;
        setEstado({ status: "erro", operacoes: [], erro });
      });
    return () => controlador.abort();
  }, [status, versao]);

  const recarregar = useCallback(() => {
    setEstado({ status: "carregando", operacoes: [], erro: null });
    setVersao((v) => v + 1);
  }, []);

  return { ...estado, recarregar };
}
