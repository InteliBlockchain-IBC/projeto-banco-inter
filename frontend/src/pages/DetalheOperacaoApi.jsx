import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock3,
  Info,
  RotateCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import Timeline from "../components/Timeline";
import HashTransacao from "../components/HashTransacao";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EstadoCarregando from "../components/ui/EstadoCarregando";
import EstadoErro from "../components/ui/EstadoErro";
import { useOperacoes } from "../context/OperacoesContext";
import { INTERVALO_ATUALIZACAO_MS, useOperacaoApi } from "../hooks/useOperacaoApi";
import { MENSAGEM_ASSINATURA_PENDENTE } from "../services/adaptadorOfertas";
import {
  SEPOLIA_CHAIN_ID,
  formatarCentavos,
  formatarDataHoraIso,
  formatarHora,
} from "../utils/formatadores";

function Linha({ rotulo, children }) {
  return (
    <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-xs font-medium text-gray-500">{rotulo}</dt>
      <dd className="text-sm font-semibold text-gray-900 sm:text-right">{children}</dd>
    </div>
  );
}

function Parte({ parte }) {
  return (
    <span className="inline-flex flex-col items-start gap-1 sm:items-end">
      <span>{parte.nome ?? "Instituição não identificada"}</span>
      <HashTransacao valor={parte.carteira} tipo="endereco" />
    </span>
  );
}

function Aviso({ tom, icone: Icone, titulo, children }) {
  const tons = {
    info: "border-blue-200 bg-blue-50 text-blue-700",
    sucesso: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
  return (
    <div className={`mt-4 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs ${tons[tom]}`}>
      <Icone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>
        {titulo && <strong className="block text-sm">{titulo}</strong>}
        {children}
      </div>
    </div>
  );
}

// Cancelada, Negada e Expirada já têm a explicação na Timeline.
function AvisoStatus({ operacao }) {
  switch (operacao.status) {
    case "Ofertada":
      return (
        <Aviso tom="info" icone={Clock3} titulo="Aguardando aceite da contraparte">
          A tela consulta a API a cada {INTERVALO_ATUALIZACAO_MS / 1000} s e mostra a liquidação assim que ela
          for confirmada on-chain.
        </Aviso>
      );
    case "Liquidada":
      return (
        <Aviso tom="sucesso" icone={CheckCircle2} titulo="Liquidação confirmada on-chain">
          Aceite e liquidação (DvP) ocorreram na mesma transação, no bloco{" "}
          {operacao.liquidacao.bloco.toLocaleString("pt-BR")}, em{" "}
          {formatarDataHoraIso(operacao.liquidacao.liquidadaEm)}.
        </Aviso>
      );
    default:
      return null;
  }
}

function TransacoesOnchain({ operacao, transacoes, eventosIndisponiveis }) {
  return (
    <Card className="p-6">
      <h2 className="text-base font-bold text-gray-900">Transações on-chain</h2>
      <p className="mt-1 text-xs text-gray-500">
        Cada etapa registrada no contrato, com link para o explorer da Sepolia.
      </p>
      {eventosIndisponiveis && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
          Histórico de eventos indisponível no momento. Exibindo os hashes registrados na própria oferta.
        </p>
      )}
      <ol className="mt-4 divide-y divide-gray-100">
        {transacoes.map((tx) => (
          <li key={tx.txHash} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="block text-sm font-semibold text-gray-900">{tx.etapa}</span>
              <span className="text-xs text-gray-500">
                {formatarDataHoraIso(tx.data)}
                {tx.bloco != null && ` · bloco ${tx.bloco.toLocaleString("pt-BR")}`}
              </span>
            </div>
            <HashTransacao valor={tx.txHash} />
          </li>
        ))}
        {operacao.status === "Ofertada" && (
          <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold text-gray-400">Aceite e liquidação (DvP)</span>
            <span className="text-xs text-gray-500">Aguardando liquidação on-chain</span>
          </li>
        )}
      </ol>
    </Card>
  );
}

function CardLimite({ operacao, limite }) {
  const { dados, erro } = limite;
  const titulo = `Limite disponível — ${operacao.tomador.rotulo}`;

  if (erro || !dados) {
    return (
      <Card className="p-5">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">{titulo}</span>
        <p className="mt-2 text-sm text-gray-600">Limite indisponível no momento.</p>
      </Card>
    );
  }

  const disponivel = BigInt(dados.availableLimitCents);
  const excede = operacao.valorCentavos > disponivel;
  const aberta = operacao.status === "Ofertada";

  return (
    <Card className="p-5">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">{titulo}</span>
      <div className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{formatarCentavos(disponivel)}</div>
      <p className="mt-1 text-[11px] text-gray-500">
        Observado no bloco {dados.observedBlock.toLocaleString("pt-BR")} · {formatarDataHoraIso(dados.observedAt)}
      </p>

      <div className="mt-4 space-y-2.5 border-t border-gray-100 pt-3 text-xs text-gray-600">
        <div className="flex justify-between gap-3">
          <span>Valor desta operação:</span>
          <strong className="text-right tabular-nums text-gray-900">{operacao.valorFormatado}</strong>
        </div>
        {aberta && (
          <div className="flex justify-between gap-3 border-t border-gray-100 pt-2 font-medium">
            <span>Disponível após o aceite:</span>
            <strong className={`text-right tabular-nums ${excede ? "text-rose-700" : "text-emerald-700"}`}>
              {excede ? "Insuficiente" : formatarCentavos(disponivel - operacao.valorCentavos)}
            </strong>
          </div>
        )}
      </div>

      {!dados.isRegistered ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Tomador não está registrado no contrato. O aceite será rejeitado.</span>
        </div>
      ) : aberta && excede ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Valor acima do limite disponível do tomador. O contrato rejeitará o aceite.</span>
        </div>
      ) : aberta ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-[11px] text-gray-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>Limite suficiente para esta oferta. A validação final é feita pelo contrato no aceite.</span>
        </div>
      ) : null}
    </Card>
  );
}

export default function DetalheOperacaoApi({ id }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { comSalvas, alternarSalvar } = useOperacoes();
  const {
    status,
    operacao: operacaoApi,
    transacoes,
    eventosIndisponiveis,
    limite,
    erro,
    erroAtualizacao,
    atualizadoEm,
    recarregar,
  } = useOperacaoApi(id);

  // Volta para a tela de origem; acesso direto pela URL volta para a mesa.
  const voltar = () => (location.key !== "default" ? navigate(-1) : navigate("/mesa"));

  const cabecalho = (
    <>
      <div>
        <button
          type="button"
          onClick={voltar}
          className="group inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          <span>Voltar</span>
        </button>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Detalhe da Operação</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Dados da oferta, estado atual e rastreabilidade on-chain na Sepolia.
        </p>
      </div>
    </>
  );

  if (status === "carregando" && !operacaoApi) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 pb-12">
        {cabecalho}
        <Card className="p-6">
          <EstadoCarregando linhas={6} rotulo="Carregando operação" />
        </Card>
      </div>
    );
  }

  if (status === "erro") {
    const naoEncontrada = erro?.tipo === "nao-encontrada" || erro?.tipo === "invalida";
    return (
      <div className="mx-auto max-w-6xl space-y-6 pb-12">
        {cabecalho}
        {naoEncontrada ? (
          <EstadoErro
            titulo="Operação não encontrada"
            mensagem="A operação solicitada não existe ou o identificador é inválido."
          >
            <Button variant="outline" onClick={() => navigate("/mesa")}>Voltar para a mesa</Button>
          </EstadoErro>
        ) : (
          <EstadoErro
            titulo={erro?.tipo === "indisponivel" ? "API indisponível" : "Não foi possível carregar a operação"}
            mensagem={
              erro?.tipo === "indisponivel"
                ? "Não conseguimos falar com o servidor da Mesa. Nenhum dado foi alterado."
                : erro?.message || "A resposta da API não pôde ser interpretada."
            }
            correlationId={erro?.correlationId}
            onTentarNovamente={() => recarregar()}
          >
            <Button variant="outline" onClick={() => navigate("/mesa")}>Voltar para a mesa</Button>
          </EstadoErro>
        )}
      </div>
    );
  }

  const [operacao] = comSalvas([operacaoApi]);
  const aberta = operacao.status === "Ofertada";

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {cabecalho}

      {erroAtualizacao && (
        <div role="status" className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Não foi possível atualizar agora. Exibindo o último dado confirmado às {formatarHora(atualizadoEm)}.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-6">
            <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xl font-bold text-gray-900">Operação {operacao.id}</span>
                <StatusBadge status={operacao.status} size="lg" />
              </div>
              <span className="text-xs text-gray-400">Criada em {formatarDataHoraIso(operacao.criadaEm)}</span>
            </div>

            <AvisoStatus operacao={operacao} />
            <Timeline status={operacao.status} />

            <dl className="divide-y divide-gray-100">
              <Linha rotulo="Instituição ofertante">
                <Parte parte={operacao.ofertante} />
              </Linha>
              <Linha rotulo="Instituição tomadora">
                <Parte parte={operacao.tomador} />
              </Linha>
              <Linha rotulo="Valor da operação">
                <span className="text-base font-bold tabular-nums">{operacao.valorFormatado}</span>
              </Linha>
              <Linha rotulo="Taxa">
                <span className="font-mono font-bold">{operacao.taxaCdi}</span>
              </Linha>
              <Linha rotulo="Prazo">{operacao.prazoTexto}</Linha>
              <Linha rotulo={aberta ? "Válida até" : "Validade da oferta"}>
                {formatarDataHoraIso(operacao.expiraEm)}
              </Linha>
              {operacao.liquidacao && (
                <>
                  <Linha rotulo="Liquidada em">{formatarDataHoraIso(operacao.liquidacao.liquidadaEm)}</Linha>
                  <Linha rotulo="Token de posição">
                    <span className="font-mono">CDIP #{operacao.liquidacao.tokenPosicao}</span>
                  </Linha>
                </>
              )}
              <Linha rotulo="ID da oferta no contrato">
                <span className="font-mono">{operacao.idOnchain}</span>
              </Linha>
              <Linha rotulo="Contrato">
                <HashTransacao valor={operacao.contrato} tipo="endereco" />
              </Linha>
              <Linha rotulo="Rede de liquidação">
                <span className="font-mono text-xs text-gray-700">
                  Ethereum Sepolia Testnet (chainId {SEPOLIA_CHAIN_ID})
                </span>
              </Linha>
            </dl>
          </Card>

          <TransacoesOnchain
            operacao={operacao}
            transacoes={transacoes}
            eventosIndisponiveis={eventosIndisponiveis}
          />
        </div>

        <div className="space-y-4">
          <CardLimite operacao={operacao} limite={limite} />

          <div className={`grid gap-3 ${aberta || operacao.status === "Liquidada" ? "grid-cols-[44px_minmax(0,1fr)]" : "grid-cols-1"}`}>
            <button
              type="button"
              onClick={() => alternarSalvar(operacao.id)}
              aria-pressed={operacao.salva}
              aria-label={operacao.salva ? "Remover oferta das salvas" : "Salvar oferta"}
              title={operacao.salva ? "Remover das salvas" : "Salvar oferta"}
              className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-gray-100 transition-colors hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inter-orange ${operacao.salva ? "text-inter-orange" : "text-gray-500"}`}
            >
              <Bookmark className={`h-4 w-4 transition-[fill,transform] duration-200 ${operacao.salva ? "scale-110 fill-current" : ""}`} aria-hidden="true" />
            </button>
            {aberta && (
              <Button variant="primary" className="h-11 w-full whitespace-nowrap" disabled aria-describedby="aviso-assinatura">
                Aceitar oferta
              </Button>
            )}
            {operacao.status === "Liquidada" && (
              <Button variant="outline" className="h-11 w-full" onClick={() => navigate("/historico")}>
                Ver no histórico
              </Button>
            )}
          </div>
          {aberta && (
            <p id="aviso-assinatura" className="flex items-start gap-2 text-[11px] leading-relaxed text-gray-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{MENSAGEM_ASSINATURA_PENDENTE} Aceite e cancelamento exigem a assinatura do operador.</span>
            </p>
          )}

          <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500">
            <span aria-live="polite">Atualizado às {formatarHora(atualizadoEm)}</span>
            <button
              type="button"
              onClick={recarregar}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
              Atualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
