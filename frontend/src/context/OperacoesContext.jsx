import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  operacoesIniciais,
  gerarHashFicticio,
  LIMITE_TOTAL,
  LIMITE_UTILIZADO_PADRAO,
  CDI_VIGENTE,
  VOLUME_OFERTADO_24H,
} from "../services/mockOperacoes";

const OperacoesContext = createContext(null);

let proximoIdNumero = 42;

export function OperacoesProvider({ children }) {
  const [operacoes, setOperacoes] = useState(operacoesIniciais);
  // Favoritos ficam fora das operações para valer também para as que vêm da API.
  const [idsSalvos, setIdsSalvos] = useState(() => operacoesIniciais.filter((o) => o.salva).map((o) => o.id));
  const [instituicaoAtual, setInstituicaoAtual] = useState("Banco A");
  const [perfilContato, setPerfilContato] = useState({ responsavel: "Mesa de Operações", email: "operacoes@bancoa.com.br" });
  const [selecionadasComparacao, setSelecionadasComparacao] = useState(["#001", "#003"]);
  const [notificacoes, setNotificacoes] = useState(() => ["Aceita", "Negada", "Cancelada"].map((status) => {
    const oferta = operacoesIniciais
      .filter((item) => item.minha && item.status === status)
      .sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm))[0];
    if (!oferta) return null;
    const acao = { Aceita: "aceita", Negada: "negada", Cancelada: "cancelada" }[status];
    const tipo = { Aceita: "sucesso", Negada: "negada", Cancelada: "aviso" }[status];
    return { id: `inicial-${status}`, mensagem: `Sua oferta ${oferta.id} foi ${acao}.`, tipo, hora: oferta.criadaEm, rawId: oferta.rawId, lida: false };
  }).filter(Boolean));
  
  // Modais globais
  const [modalNovaOfertaAberto, setModalNovaOfertaAberto] = useState(false);
  const [modalConfirmarOperacao, setModalConfirmarOperacao] = useState(null); // operacao ou null
  const [modalProcessando, setModalProcessando] = useState(null); // { operacao, hash, step } ou null
  const [modalCancelar, setModalCancelar] = useState(null); // operacao ou null

  function notificar(mensagem, tipo = "info", rawId = null) {
    const id = `${Date.now()}-${Math.random()}`;
    setNotificacoes((prev) => [{ id, mensagem, tipo, hora: new Date().toISOString(), rawId, lida: false }, ...prev].slice(0, 10));
  }

  function marcarNotificacoesComoLidas() {
    setNotificacoes((prev) => prev.map((item) => item.lida ? item : { ...item, lida: true }));
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
    notificar(`Oferta ${nova.id} publicada com sucesso na mesa.`, "sucesso", nova.rawId);
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
    notificar(`Oferta ${operacao.id} foi aceita e enviada para validação.`, "sucesso", operacao.rawId);

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
      notificar(`Operação ${operacao.id} liquidada com sucesso no bloco Sepolia!`, "sucesso", operacao.rawId);
    }, 2800);
  }

  // Iniciar fluxo de cancelamento -> abre modal de cancelamento
  function solicitarCancelamentoOferta(operacao) {
    const atual = operacoes.find((oferta) => oferta.id === operacao.id);
    if (atual?.minha && atual.status === "Ofertada") {
      setModalCancelar(atual);
    }
  }

  // Confirmar cancelamento
  function confirmarCancelamentoOferta(operacao) {
    const atual = operacoes.find((oferta) => oferta.id === operacao.id);
    if (!atual?.minha || atual.status !== "Ofertada") {
      setModalCancelar(null);
      return;
    }
    setOperacoes((prev) =>
      prev.map((o) => (o.id === operacao.id && o.minha && o.status === "Ofertada"
        ? { ...o, status: "Cancelada" }
        : o))
    );
    notificar(`Oferta ${operacao.id} foi cancelada e removida da mesa.`, "aviso", operacao.rawId);
    setModalCancelar(null);
  }

  // Alternar Salvar / Favoritar
  function alternarSalvar(id) {
    setIdsSalvos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  // Marca `salva` em qualquer lista de operações (mock ou API).
  const comSalvas = useCallback(
    (lista) => lista.map((o) => ({ ...o, salva: idsSalvos.includes(o.id) })),
    [idsSalvos]
  );
  const operacoesComSalvas = useMemo(() => comSalvas(operacoes), [comSalvas, operacoes]);

  // Alternar seleção para comparação de limite
  function alternarSelecaoComparacao(id) {
    setSelecionadasComparacao((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  return (
    <OperacoesContext.Provider
      value={{
        operacoes: operacoesComSalvas,
        comSalvas,
        instituicaoAtual,
        setInstituicaoAtual,
        perfilContato,
        setPerfilContato,
        selecionadasComparacao,
        alternarSelecaoComparacao,
        notificacoes,
        notificar,
        marcarNotificacoesComoLidas,
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
