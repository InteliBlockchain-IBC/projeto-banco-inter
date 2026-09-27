import { createContext, useContext, useState } from "react";
import {
  operacoesIniciais,
  gerarHashFicticio,
  LIMITE_TOTAL,
  LIMITE_UTILIZADO_PADRAO,
  CDI_VIGENTE,
  VOLUME_OFERTADO_24H,
} from "../services/mockOperacoes";

const OperacoesContext = createContext(null);

let proximoIdNumero = 11;

export function OperacoesProvider({ children }) {
  const [operacoes, setOperacoes] = useState(operacoesIniciais);
  const [instituicaoAtual, setInstituicaoAtual] = useState("Banco A");
  const [selecionadasComparacao, setSelecionadasComparacao] = useState(["#001", "#003"]);
  const [notificacoes, setNotificacoes] = useState([]);
  
  // Modais globais
  const [modalNovaOfertaAberto, setModalNovaOfertaAberto] = useState(false);
  const [modalConfirmarOperacao, setModalConfirmarOperacao] = useState(null); // operacao ou null
  const [modalProcessando, setModalProcessando] = useState(null); // { operacao, hash, step } ou null
  const [modalCancelar, setModalCancelar] = useState(null); // operacao ou null

  function notificar(mensagem, tipo = "info") {
    const id = Date.now();
    setNotificacoes((prev) => [{ id, mensagem, tipo, hora: new Date() }, ...prev].slice(0, 10));
  }

  // Publicar nova oferta
  function publicarNovaOferta({ valor, taxaCdi, prazoDias, prazoTexto }) {
    const num = String(proximoIdNumero).padStart(3, "0");
    proximoIdNumero += 1;

    const nova = {
      id: `#${num}`,
      rawId: `OP-${num}`,
      contraparte: `${instituicaoAtual} (Sua oferta)`,
      valor: Number(valor),
      taxaCdi: `${taxaCdi}% CDI`,
      taxaPercent: Number(taxaCdi),
      prazoDias: Number(prazoDias),
      prazoTexto: prazoTexto || `${prazoDias} dia${Number(prazoDias) > 1 ? "s" : ""}`,
      status: "Ofertada",
      minha: true,
      impactoLimite: Math.min(100, Math.round((Number(valor) / LIMITE_TOTAL) * 100)),
      salva: false,
      hash: null,
      bloco: null,
      criadaEm: new Date().toISOString(),
    };

    setOperacoes((prev) => [nova, ...prev]);
    notificar(`Oferta ${nova.id} publicada com sucesso na mesa.`, "sucesso");
    setModalNovaOfertaAberto(false);
    return nova;
  }

  // Iniciar fluxo de aceite -> abre modal de confirmação
  function solicitarAceiteOferta(operacao) {
    setModalConfirmarOperacao(operacao);
  }

  // Confirmar aceite -> abre modal de processamento e depois liquida
  function confirmarAceiteOferta(operacao) {
    const hashGerado = gerarHashFicticio();
    setModalConfirmarOperacao(null);
    setModalProcessando({
      operacao,
      hash: hashGerado,
      step: 2, // 1: enviada, 2: aguardando confirmação, 3: finalizado
    });

    // Atualiza status para "Aceita"
    setOperacoes((prev) =>
      prev.map((o) => (o.id === operacao.id ? { ...o, status: "Aceita" } : o))
    );
    notificar(`Operação ${operacao.id} enviada para validação blockchain...`, "info");

    // Simula confirmação na rede Sepolia (step 3 -> Liquidada)
    setTimeout(() => {
      setModalProcessando((prev) => (prev ? { ...prev, step: 3 } : null));
      setOperacoes((prev) =>
        prev.map((o) =>
          o.id === operacao.id
            ? {
                ...o,
                status: "Liquidada",
                hash: hashGerado,
                bloco: Math.floor(6540000 + Math.random() * 5000),
              }
            : o
        )
      );
      notificar(`Operação ${operacao.id} liquidada com sucesso no bloco Sepolia!`, "sucesso");
    }, 2800);
  }

  // Iniciar fluxo de cancelamento -> abre modal de cancelamento
  function solicitarCancelamentoOferta(operacao) {
    setModalCancelar(operacao);
  }

  // Confirmar cancelamento
  function confirmarCancelamentoOferta(operacao) {
    setOperacoes((prev) =>
      prev.map((o) => (o.id === operacao.id ? { ...o, status: "Cancelada" } : o))
    );
    notificar(`Oferta ${operacao.id} foi cancelada e removida da mesa.`, "aviso");
    setModalCancelar(null);
  }

  // Alternar Salvar / Favoritar
  function alternarSalvar(id) {
    setOperacoes((prev) =>
      prev.map((o) => (o.id === id ? { ...o, salva: !o.salva } : o))
    );
  }

  // Alternar seleção para comparação de limite
  function alternarSelecaoComparacao(id) {
    setSelecionadasComparacao((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  return (
    <OperacoesContext.Provider
      value={{
        operacoes,
        instituicaoAtual,
        setInstituicaoAtual,
        selecionadasComparacao,
        alternarSelecaoComparacao,
        notificacoes,
        notificar,
        publicarNovaOferta,
        solicitarAceiteOferta,
        confirmarAceiteOferta,
        solicitarCancelamentoOferta,
        confirmarCancelamentoOferta,
        alternarSalvar,
        // Modais
        modalNovaOfertaAberto,
        setModalNovaOfertaAberto,
        modalConfirmarOperacao,
        setModalConfirmarOperacao,
        modalProcessando,
        setModalProcessando,
        modalCancelar,
        setModalCancelar,
        // KPIs
        limiteTotal: LIMITE_TOTAL,
        limiteUtilizado: LIMITE_UTILIZADO_PADRAO,
        cdiVigente: CDI_VIGENTE,
        volume24h: VOLUME_OFERTADO_24H,
      }}
    >
      {children}
    </OperacoesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOperacoes() {
  const context = useContext(OperacoesContext);
  if (!context) {
    throw new Error("useOperacoes deve ser usado dentro de um OperacoesProvider");
  }
  return context;
}
