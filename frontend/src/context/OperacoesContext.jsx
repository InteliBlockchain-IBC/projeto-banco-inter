import { createContext, useCallback, useContext, useMemo, useState } from "react";

const OperacoesContext = createContext(null);
const CHAVE_SALVAS = "inter-ofertas-salvas";

export function OperacoesProvider({ children }) {
  const [idsSalvos, setIdsSalvos] = useState(() => {
    try {
      const salvas = JSON.parse(localStorage.getItem(CHAVE_SALVAS) ?? "[]");
      return Array.isArray(salvas) ? salvas : [];
    } catch { return []; }
  });
  const [selecionadasComparacao, setSelecionadasComparacao] = useState([]);
  const [modalNovaOfertaAberto, setModalNovaOfertaAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);

  function alternarSalvar(id) {
    setIdsSalvos((anteriores) => {
      const proximos = anteriores.includes(id)
        ? anteriores.filter((item) => item !== id)
        : [...anteriores, id];
      try { localStorage.setItem(CHAVE_SALVAS, JSON.stringify(proximos)); } catch { /* Favoritos mantidos em memória. */ }
      return proximos;
    });
  }

  const comSalvas = useCallback(
    (lista) => lista.map((operacao) => ({ ...operacao, salva: idsSalvos.includes(operacao.id) })),
    [idsSalvos],
  );

  function alternarSelecaoComparacao(id) {
    setSelecionadasComparacao((anteriores) => anteriores.includes(id)
      ? anteriores.filter((item) => item !== id)
      : [...anteriores, id]);
  }

  function notificar(mensagem, tipo = "info", rawId = null) {
    setNotificacoes((anteriores) => [{
      id: `${Date.now()}-${Math.random()}`, mensagem, tipo,
      hora: new Date().toISOString(), rawId, lida: false,
    }, ...anteriores].slice(0, 10));
  }

  function marcarNotificacoesComoLidas() {
    setNotificacoes((anteriores) => anteriores.map((item) => ({ ...item, lida: true })));
  }

  const valor = useMemo(() => ({
    comSalvas, alternarSalvar, selecionadasComparacao, alternarSelecaoComparacao,
    modalNovaOfertaAberto, setModalNovaOfertaAberto,
    notificacoes, notificar, marcarNotificacoesComoLidas,
  }), [comSalvas, selecionadasComparacao, modalNovaOfertaAberto, notificacoes]);

  return <OperacoesContext.Provider value={valor}>{children}</OperacoesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOperacoes() {
  const contexto = useContext(OperacoesContext);
  if (!contexto) throw new Error("useOperacoes requer OperacoesProvider");
  return contexto;
}
