import { useState } from "react";
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
import TransactionHash from "../components/TransactionHash";
import PendingIndexingNotice from "../components/PendingIndexingNotice";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import { useOperations } from "../context/OperationsContext";
import { useWallet } from "../context/WalletContext";
import { useEnvironment } from "../context/EnvironmentContext";
import WalletControls from "../components/WalletControls";
import BrltAuthorization from "../components/BrltAuthorization";
import { REFRESH_INTERVAL_MS, useApiOperation } from "../hooks/useApiOperation";
import { executeOfferAction, transactionErrorMessage } from "../services/transactions";
import { getOfferEvents, executeDemoAction } from "../services/api";
import {
  SEPOLIA_CHAIN_ID,
  formatCents,
  formatIsoDateTime,
  formatTime,
} from "../utils/formatters";

function DetailRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="text-sm font-semibold text-gray-900 sm:text-right">{children}</dd>
    </div>
  );
}

function Party({ party }) {
  return (
    <span className="inline-flex flex-col items-start gap-1 sm:items-end">
      <span>{party.name ?? "Instituição não identificada"}</span>
      <TransactionHash value={party.wallet} type="endereco" />
    </span>
  );
}

function Notice({ tone, icon: Icone, title, children }) {
  const tones = {
    info: "border-blue-200 bg-blue-50 text-blue-700",
    sucesso: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
  return (
    <div className={`mt-4 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs ${tones[tone]}`}>
      <Icone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>
        {title && <strong className="block text-sm">{title}</strong>}
        {children}
      </div>
    </div>
  );
}

// Cancelada, Negada e Expirada já têm a explicação na Timeline.
function StatusNotice({ operation }) {
  const { demo } = useEnvironment();
  switch (operation.status) {
    case "Ofertada":
      return (
        <Notice tone="info" icon={Clock3} title="Aguardando aceite da contraparte">
          A tela consulta a API a cada {REFRESH_INTERVAL_MS / 1000} s e mostra a liquidação assim que ela
          for {demo ? "registrada no backend" : "confirmada on-chain"}.
        </Notice>
      );
    case "Liquidada":
      return (
        <Notice tone="sucesso" icon={CheckCircle2} title={demo ? "Liquidação de demonstração registrada" : "Liquidação confirmada on-chain"}>
          Aceite e liquidação (DvP) ocorreram na mesma transação, no bloco{" "}
          {operation.settlement.blockNumber.toLocaleString("pt-BR")}, em{" "}
          {formatIsoDateTime(operation.settlement.settledAt)}.
        </Notice>
      );
    default:
      return null;
  }
}

function OnchainTransactions({ operation, transactions, eventsUnavailable }) {
  const { demo } = useEnvironment();
  return (
    <Card className="p-6">
      <h2 className="text-base font-bold text-gray-900">{demo ? "Eventos de demonstração" : "Transações on-chain"}</h2>
      <p className="mt-1 text-xs text-gray-500">
        {demo ? "Etapas registradas no backend com hashes sintéticos." : "Cada etapa registrada no contrato, com link para o explorer da Sepolia."}
      </p>
      {eventsUnavailable && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
          Histórico de eventos indisponível no momento. Exibindo os hashes registrados na própria oferta.
        </p>
      )}
      <ol className="mt-4 divide-y divide-gray-100">
        {transactions.map((tx) => (
          <li key={tx.txHash} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="block text-sm font-semibold text-gray-900">{tx.stage}</span>
              <span className="text-xs text-gray-500">
                {formatIsoDateTime(tx.data)}
                {tx.blockNumber != null && ` · bloco ${tx.blockNumber.toLocaleString("pt-BR")}`}
              </span>
            </div>
            <TransactionHash value={tx.txHash} />
          </li>
        ))}
        {operation.status === "Ofertada" && (
          <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold text-gray-400">Aceite e liquidação (DvP)</span>
            <span className="text-xs text-gray-500">{demo ? "Aguardando aceite na demonstração" : "Aguardando liquidação on-chain"}</span>
          </li>
        )}
      </ol>
    </Card>
  );
}

function LimitCard({ operation, limit }) {
  const { demo } = useEnvironment();
  const { data, error } = limit;
  const title = `Limite disponível — ${operation.borrower.label}`;

  if (error || !data) {
    return (
      <Card className="p-5">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">{title}</span>
        <p className="mt-2 text-sm text-gray-600">Limite indisponível no momento.</p>
      </Card>
    );
  }

  const available = BigInt(data.availableLimitCents);
  const exceedsLimit = operation.amountCentsBigInt > available;
  const isOpen = operation.status === "Ofertada";

  return (
    <Card className="p-5">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">{title}</span>
      <div className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{formatCents(available)}</div>
      <p className="mt-1 text-[11px] text-gray-500">
        Observado no bloco {data.observedBlock.toLocaleString("pt-BR")} · {formatIsoDateTime(data.observedAt)}
      </p>

      <div className="mt-4 space-y-2.5 border-t border-gray-100 pt-3 text-xs text-gray-600">
        <div className="flex justify-between gap-3">
          <span>Valor desta operação:</span>
          <strong className="text-right tabular-nums text-gray-900">{operation.formattedAmount}</strong>
        </div>
        {isOpen && (
          <div className="flex justify-between gap-3 border-t border-gray-100 pt-2 font-medium">
            <span>Disponível após o aceite:</span>
            <strong className={`text-right tabular-nums ${exceedsLimit ? "text-rose-700" : "text-emerald-700"}`}>
              {exceedsLimit ? "Insuficiente" : formatCents(available - operation.amountCentsBigInt)}
            </strong>
          </div>
        )}
      </div>

      {!data.isRegistered ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Tomador não está registrado {demo ? "no backend" : "no contrato"}. O aceite será rejeitado.</span>
        </div>
      ) : isOpen && exceedsLimit ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Valor acima do limite disponível do tomador. O aceite será rejeitado.</span>
        </div>
      ) : isOpen ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-[11px] text-gray-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>Limite suficiente para esta oferta. A validação final é feita {demo ? "pelo backend" : "pelo contrato"} no aceite.</span>
        </div>
      ) : null}
    </Card>
  );
}

export default function ApiOperationDetails({ id }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { withSaved, toggleSaved, notify } = useOperations();
  const { account, isSepolia, getProvider } = useWallet();
  const { demo, activeWallet, reload: recarregarAmbiente } = useEnvironment();
  const [transaction, setTransaction] = useState({ phase: "idle", hash: null, error: null });
  const [indexingNoticeClosed, setIndexingNoticeClosed] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const {
    status,
    operation: apiOperation,
    transactions,
    eventsUnavailable,
    limit,
    error,
    refreshError,
    atualizadoEm,
    reload,
  } = useApiOperation(id);

  async function confirmTransaction(action, operation) {
    setConfirmAction(null);
    setIndexingNoticeClosed(false);
    setTransaction({ phase: "preparando", hash: null, error: null });
    try {
      // A demo recebe um hash sintético da API; o fluxo real envia pela carteira.
      if (demo) {
        const result = await executeDemoAction(operation.rawId, action);
        const events = await getOfferEvents(operation.rawId).catch(() => []);
        const hash = result.operation?.txHash ?? events.at(-1)?.txHash ?? null;
        setTransaction({ phase: "confirmada", hash, error: null, demo: true });
        notify(`Oferta ${operation.id} ${action === "accept" ? "liquidada" : "cancelada"} na demonstração.`, "sucesso", operation.rawId);
        reload();
        recarregarAmbiente();
        window.dispatchEvent(new Event("inter:ofertas-atualizadas"));
        return;
      }
      const result = await executeOfferAction({
        operation, action, wallet: account, provider: getProvider(),
        onUpdate: (update) => setTransaction((previous) => ({ ...previous, ...update, error: null })),
      });
      if (!result.pending) reload();
      notify(`Transação de ${operation.id} enviada à Sepolia.`, "info", operation.rawId);
    } catch (transactionError) {
      setTransaction((previous) => ({
        ...previous, phase: "erro", hash: transactionError.hash ?? previous.hash,
        error: transactionErrorMessage(transactionError),
      }));
    }
  }

  // Volta para a tela de origem; acesso direto pela URL volta para a mesa.
  const goBack = () => (location.key !== "default" ? navigate(-1) : navigate("/mesa"));

  const header = (
    <>
      <div>
        <button
          type="button"
          onClick={goBack}
          className="group inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          <span>Voltar</span>
        </button>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Detalhe da Operação</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Dados da oferta, estado atual e rastreabilidade {demo ? "no backend de demonstração" : "on-chain na Sepolia"}.
        </p>
      </div>
    </>
  );

  if (status === "carregando" && !apiOperation) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 pb-12">
        {header}
        <Card className="p-6">
          <LoadingState rows={6} label="Carregando operação" />
        </Card>
      </div>
    );
  }

  if (status === "erro") {
    const notFound = error?.type === "nao-encontrada" || error?.type === "invalida";
    return (
      <div className="mx-auto max-w-6xl space-y-6 pb-12">
        {header}
        {notFound ? (
          <ErrorState
            title="Operação não encontrada"
            message="A operação solicitada não existe ou o identificador é inválido."
          >
            <Button variant="outline" onClick={() => navigate("/mesa")}>Voltar para a mesa</Button>
          </ErrorState>
        ) : (
          <ErrorState
            title={error?.type === "indisponivel" ? "API indisponível" : "Não foi possível carregar a operação"}
            message={
              error?.type === "indisponivel"
                ? "Não conseguimos falar com o servidor da Mesa. Nenhum dado foi alterado."
                : error?.message || "A resposta da API não pôde ser interpretada."
            }
            correlationId={error?.correlationId}
            onRetry={() => reload()}
          >
            <Button variant="outline" onClick={() => navigate("/mesa")}>Voltar para a mesa</Button>
          </ErrorState>
        )}
      </div>
    );
  }

  const [operation] = withSaved([apiOperation]);
  const isOpen = operation.status === "Ofertada";
  const mine = activeWallet?.toLowerCase() === operation.lender.wallet?.toLowerCase();
  const isBorrower = activeWallet?.toLowerCase() === operation.borrower.wallet?.toLowerCase();
  const processing = ["preparando", "assinando", "confirmando"].includes(transaction.phase);
  const signatureDisabled = processing || Boolean(transaction.hash) || (!demo && !isSepolia);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {header}

      {refreshError && (
        <div role="status" className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Não foi possível atualizar agora. Exibindo o último dado confirmado às {formatTime(atualizadoEm)}.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-6">
            <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xl font-bold text-gray-900">Operação {operation.id}</span>
                <StatusBadge status={operation.status} size="lg" />
              </div>
              <span className="text-xs text-gray-400">Criada em {formatIsoDateTime(operation.createdAt)}</span>
            </div>

            <StatusNotice operation={operation} />
            <Timeline status={operation.status} />

            <dl className="divide-y divide-gray-100">
              <DetailRow label="Instituição ofertante">
                <Party party={operation.lender} />
              </DetailRow>
              <DetailRow label="Instituição tomadora">
                <Party party={operation.borrower} />
              </DetailRow>
              <DetailRow label="Valor da operação">
                <span className="text-base font-bold tabular-nums">{operation.formattedAmount}</span>
              </DetailRow>
              <DetailRow label="Taxa">
                <span className="font-mono font-bold">{operation.cdiRate}</span>
              </DetailRow>
              <DetailRow label="Prazo">{operation.termLabel}</DetailRow>
              <DetailRow label={isOpen ? "Válida até" : "Validade da oferta"}>
                {formatIsoDateTime(operation.expiresAt)}
              </DetailRow>
              {operation.settlement && (
                <>
                  <DetailRow label="Liquidada em">{formatIsoDateTime(operation.settlement.settledAt)}</DetailRow>
                  <DetailRow label="Token de posição">
                    <span className="font-mono">CDIP #{operation.settlement.positionTokenId}</span>
                  </DetailRow>
                </>
              )}
              <DetailRow label={demo ? "ID da oferta simulada" : "ID da oferta no contrato"}>
                <span className="font-mono">{operation.onchainOfferId}</span>
              </DetailRow>
              <DetailRow label={demo ? "Contrato sintético" : "Contrato"}>
                <TransactionHash value={operation.contrato} type="endereco" />
              </DetailRow>
              <DetailRow label={demo ? "Ambiente" : "Rede de liquidação"}>
                <span className="font-mono text-xs text-gray-700">
                  {demo ? "Simulação local, sem transação na Sepolia" : `Ethereum Sepolia Testnet (chainId ${SEPOLIA_CHAIN_ID})`}
                </span>
              </DetailRow>
            </dl>
          </Card>

          <OnchainTransactions
            operation={operation}
            transactions={transactions}
            eventsUnavailable={eventsUnavailable}
          />
        </div>

        <div className="space-y-4">
          <LimitCard operation={operation} limit={limit} />

          {!demo && isOpen && mine && isSepolia && <BrltAuthorization amountCentsBigInt={operation.amountCentsBigInt} />}

          {(isOpen || transaction.phase === "confirmada" || transaction.hash || transaction.error) && (
            <Card className="space-y-3 p-4 text-xs text-gray-600">
              <strong className="block text-sm text-gray-900">{demo ? "Operação de demonstração" : "Assinatura da operação"}</strong>
              {demo ? <p>O backend registrará a transição com hash sintético. Nenhuma assinatura será solicitada.</p> : !account ? <><p>Conecte a carteira participante para assinar.</p><WalletControls /></> :
                !isSepolia ? <><p>Selecione a rede Sepolia na carteira.</p><WalletControls /></> :
                !mine && !isBorrower ? <p>Esta carteira não é ofertante nem tomadora desta oferta.</p> :
                <p>Carteira: {account}. A MetaMask solicitará a assinatura e o envio da transação.</p>}
              {confirmAction && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p>Confirma {confirmAction === "accept" ? "o aceite e a liquidação" : "o cancelamento"} de {operation.id}?</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" onClick={() => confirmTransaction(confirmAction, operation)}>{demo ? "Confirmar simulação" : "Confirmar na carteira"}</Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmAction(null)}>Voltar</Button>
                  </div>
                </div>
              )}
              {processing && <p role="status">{transaction.phase === "assinando" ? "Aguardando assinatura na MetaMask..." : transaction.phase === "confirmando" ? "Transação enviada. Aguardando confirmação na Sepolia..." : "Preparando operação..."}</p>}
              {transaction.phase === "confirmada" && <p role="status" className="text-emerald-700">{demo ? "Operação registrada no backend de demonstração." : `Transação confirmada na Sepolia. ${transaction.sincronizando ? "Aguardando indexação pelo backend." : "Dados atualizados."}`}</p>}
              {transaction.phase === "pendente" && <p role="status" className="text-amber-800">Transação enviada, ainda sem confirmação. Consulte o hash antes de tentar novamente.</p>}
              {transaction.error && <p role="alert" className="text-rose-700">{transaction.error}</p>}
              {transaction.hash && <div>Hash da transação: <TransactionHash value={transaction.hash} /></div>}
            </Card>
          )}

          <div className={`grid gap-3 ${isOpen || operation.status === "Liquidada" ? "grid-cols-[44px_minmax(0,1fr)]" : "grid-cols-1"}`}>
            <button
              type="button"
              onClick={() => toggleSaved(operation.id)}
              aria-pressed={operation.saved}
              aria-label={operation.saved ? "Remover oferta das salvas" : "Salvar oferta"}
              title={operation.saved ? "Remover das salvas" : "Salvar oferta"}
              className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-gray-100 transition-colors hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inter-orange ${operation.saved ? "text-inter-orange" : "text-gray-500"}`}
            >
              <Bookmark className={`h-4 w-4 transition-[fill,transform] duration-200 ${operation.saved ? "scale-110 fill-current" : ""}`} aria-hidden="true" />
            </button>
            {isOpen && isBorrower && <Button variant="primary" className="h-11 w-full whitespace-nowrap" disabled={signatureDisabled} onClick={() => setConfirmAction("accept")}>Aceitar oferta</Button>}
            {isOpen && mine && <Button variant="destructive" className="h-11 w-full whitespace-nowrap" disabled={signatureDisabled} onClick={() => setConfirmAction("cancel")}>Cancelar oferta</Button>}
            {operation.status === "Liquidada" && (
              <Button variant="outline" className="h-11 w-full" onClick={() => navigate("/historico")}>
                Ver no histórico
              </Button>
            )}
          </div>
          {isOpen && <p className="flex items-start gap-2 text-[11px] leading-relaxed text-gray-500"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span>{demo ? "Selecione no cabeçalho o banco de demonstração correspondente. A ação não movimenta ativos." : "A assinatura exige um contrato real na Sepolia e uma carteira participante."}</span></p>}

          <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500">
            <span aria-live="polite">Atualizado às {formatTime(atualizadoEm)}</span>
            <button
              type="button"
              onClick={reload}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
              Atualizar
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={transaction.phase === "confirmada" && Boolean(transaction.sincronizando) && !indexingNoticeClosed}
        onClose={() => setIndexingNoticeClosed(true)}
        title="Transação confirmada"
        subtitle="Aguardando atualização da operação"
        maxWidth="max-w-md"
      >
        <PendingIndexingNotice hash={transaction.hash} onClose={() => setIndexingNoticeClosed(true)} />
      </Modal>
    </div>
  );
}
