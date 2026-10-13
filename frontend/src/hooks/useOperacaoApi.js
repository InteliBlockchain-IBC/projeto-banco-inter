import { useCallback, useEffect, useState } from "react";
import { buscarEventosOferta, buscarLimiteCredito, buscarOferta } from "../services/api";
import { eventosParaTransacoes, ofertaApiParaOperacao } from "../services/adaptadorOfertas";

// Enquanto a oferta está aberta, consulta a API periodicamente para refletir
// aceite/cancelamento feito por outro operador (RF04, RNF02 ≤ 30 s).
export const INTERVALO_ATUALIZACAO_MS = 10_000;

const ESTADO_INICIAL = {
  status: "carregando", // "carregando" | "ok" | "erro"
  operacao: null,
  transacoes: [],
  eventosIndisponiveis: false,
  limite: { dados: null, erro: null },
  erro: null,
  erroAtualizacao: null,
  atualizadoEm: null,
};

function ignorarAbort(erro) {
  if (erro?.name === "AbortError") throw erro;
}

async function carregarOperacao(id, signal) {
  const [oferta, eventos] = await Promise.all([
    buscarOferta(id, { signal }),
    // Sem eventos, a tela usa os hashes da própria oferta.
    buscarEventosOferta(id, { signal }).catch((erro) => (ignorarAbort(erro), null)),
  ]);
  const operacao = ofertaApiParaOperacao(oferta);
  const limite = await buscarLimiteCredito(operacao.tomador.carteira, { signal })
    .then((dados) => ({ dados, erro: null }))
    .catch((erro) => (ignorarAbort(erro), { dados: null, erro }));

  return {
    operacao,
    transacoes: eventosParaTransacoes(eventos, operacao),
    eventosIndisponiveis: eventos === null,
    limite,
  };
}

// Use com `key={id}` no componente para reiniciar o estado ao trocar de operação.
export function useOperacaoApi(id) {
  const [estado, setEstado] = useState(ESTADO_INICIAL);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    carregarOperacao(id, controlador.signal)
      .then((resultado) => {
        setEstado({ ...ESTADO_INICIAL, status: "ok", ...resultado, atualizadoEm: new Date() });
      })
      .catch((erro) => {
        if (controlador.signal.aborted) return;
        setEstado((anterior) =>
          anterior.operacao
            ? { ...anterior, erroAtualizacao: erro } // mantém o último dado confirmado
            : { ...ESTADO_INICIAL, status: "erro", erro },
        );
      });
    return () => controlador.abort();
  }, [id, versao]);

  const recarregar = useCallback(() => {
    setEstado((anterior) =>
      anterior.operacao ? anterior : { ...ESTADO_INICIAL, status: "carregando" },
    );
    setVersao((v) => v + 1);
  }, []);

  const aberta = estado.operacao?.statusApi === "offered";

  useEffect(() => {
    if (!aberta) return undefined;
    const atualizarSeVisivel = () => {
      if (document.visibilityState === "visible") setVersao((v) => v + 1);
    };
    const intervalo = setInterval(atualizarSeVisivel, INTERVALO_ATUALIZACAO_MS);
    document.addEventListener("visibilitychange", atualizarSeVisivel);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", atualizarSeVisivel);
    };
  }, [aberta]);

  return { ...estado, recarregar };
}
