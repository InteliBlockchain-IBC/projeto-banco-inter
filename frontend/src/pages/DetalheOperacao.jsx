import { useNavigate, useParams, Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import Timeline from "../components/Timeline";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import {
  formatarMoeda,
  formatarDataHora,
  LIMITE_TOTAL,
  LIMITE_UTILIZADO_PADRAO,
} from "../services/mockOperacoes";
import { useOperacoes } from "../context/OperacoesContext";
import {
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Bookmark,
} from "lucide-react";

export default function DetalheOperacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    operacoes,
    solicitarAceiteOferta,
    solicitarCancelamentoOferta,
    alternarSalvar,
  } = useOperacoes();

  const operacao = operacoes.find(
    (o) => o.id === id || o.rawId === id || o.id === `#${id}`
  );

  if (!operacao) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-lg mx-auto my-12">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Operação não encontrada
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          A operação solicitada não existe ou foi removida da mesa.
        </p>
        <Button variant="primary" onClick={() => navigate("/mesa")}>
          Voltar para a mesa
        </Button>
      </div>
    );
  }

  const isMinha = operacao.minha;
  const isOfertada = operacao.status === "Ofertada";
  const isLiquidada = operacao.status === "Liquidada";
  const isCancelada = operacao.status === "Cancelada";
  const isNegada = operacao.status === "Negada";
  const rotaRetorno = isMinha ? "/minhas-ofertas" : "/mesa";

  const percentualOperacao = Math.min(
    100,
    Math.round((operacao.valor / LIMITE_TOTAL) * 100)
  );
  const limiteDisponivelApos = Math.max(
    0,
    LIMITE_TOTAL - LIMITE_UTILIZADO_PADRAO - (isCancelada || isNegada ? 0 : operacao.valor)
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Link de Retorno */}
      <div>
        <button
          type="button"
          onClick={() => navigate(rotaRetorno)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>{isMinha ? "Voltar para minhas ofertas" : "Voltar para a mesa"}</span>
        </button>
      </div>

      {/* Título e Subtítulo */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {isMinha ? "Detalhe da Minha Oferta" : "Detalhe da Operação"}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {isMinha
            ? "Acompanhe o status da sua oferta e as ações disponíveis."
            : "Confira as informações da oferta e tome uma decisão."}
        </p>
      </div>

      {/* Grid Principal: 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Coluna Esquerda: Informações da Operação (2/3) */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            {/* Cabeçalho do Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-gray-900 font-mono">
                  Operação {operacao.id}
                </span>
                <StatusBadge status={operacao.status} />
              </div>
              <span className="text-xs text-gray-400">
                Criada em {formatarDataHora(operacao.criadaEm)}
              </span>
            </div>

            {isMinha && isOfertada && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
                <strong className="block text-sm">Aguardando aceite</strong>
                Sua oferta está publicada e ainda não foi aceita. Você pode cancelá-la enquanto estiver neste status.
              </div>
            )}
            {isMinha && operacao.status === "Aceita" && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
                <strong className="block text-sm">Oferta aceita</strong>
                A contraparte aceitou esta oferta. O cancelamento não está mais disponível.
              </div>
            )}
            {isMinha && isNegada && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
                <div>
                  <strong className="block text-sm">Oferta negada</strong>
                  Esta oferta não foi aceita pela contraparte e não está mais disponível na mesa.
                </div>
              </div>
            )}

            {/* Ciclo de Vida da Operação */}
            <Timeline status={operacao.status} />

            {/* Tabela Chave-Valor */}
            <div className="divide-y divide-gray-100 text-sm">
              <div className="py-3.5 flex justify-between items-center">
                <span className="text-gray-500 text-xs font-medium">
                  Instituição ofertante
                </span>
                <span className="font-semibold text-gray-900">
                  {operacao.contraparte}
                </span>
              </div>

              <div className="py-3.5 flex justify-between items-center">
                <span className="text-gray-500 text-xs font-medium">
                  Valor da operação
                </span>
                <span className="font-bold text-gray-900 text-base font-sans">
                  {formatarMoeda(operacao.valor)}
                </span>
              </div>

              <div className="py-3.5 flex justify-between items-center">
                <span className="text-gray-500 text-xs font-medium">
                  Taxa CDI
                </span>
                <span className="font-bold text-gray-900 font-mono">
                  {operacao.taxaCdi}
                </span>
              </div>

              <div className="py-3.5 flex justify-between items-center">
                <span className="text-gray-500 text-xs font-medium">
                  Prazo
                </span>
                <span className="font-semibold text-gray-900">
                  {operacao.prazoTexto || `${operacao.prazoDias} dia(s)`}
                </span>
              </div>

              <div className="py-3.5 flex justify-between items-center">
                <span className="text-gray-500 text-xs font-medium">
                  Status atual
                </span>
                <div>
                  <StatusBadge status={operacao.status} size="sm" />
                </div>
              </div>

              <div className="py-3.5 flex justify-between items-center">
                <span className="text-gray-500 text-xs font-medium">
                  Rastreabilidade
                </span>
                <Link
                  to="/historico"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:text-black underline underline-offset-2"
                >
                  <span>Consultar no Histórico</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="py-3.5 flex justify-between items-center">
                <span className="text-gray-500 text-xs font-medium">
                  Rede de Liquidação
                </span>
                <span className="font-mono text-xs text-gray-700">
                  Ethereum Sepolia Testnet
                </span>
              </div>

              {operacao.hash && (
                <div className="py-3.5 flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-medium">
                    Hash Blockchain
                  </span>
                  <span className="font-mono text-xs text-neutral-900 bg-gray-100 px-2 py-1 rounded">
                    {operacao.hash}
                  </span>
                </div>
              )}
            </div>

            {/* Alerta de Status se Liquidada ou Cancelada */}
            {isLiquidada && (
              <div className="mt-4 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Operação totalmente liquidada na rede Sepolia. Os recursos foram transferidos para as contas de reserva.
                </span>
              </div>
            )}

            {isCancelada && (
              <div className="mt-4 p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Esta oferta foi cancelada e não está mais disponível para negociação na mesa interfinanceira.
                </span>
              </div>
            )}
          </Card>

        </div>

        {/* Coluna Direita: Card Lateral de Limite Disponível (1/3) */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-4">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Limite disponível - Banco A
              </span>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatarMoeda(LIMITE_TOTAL)}
              </div>
            </div>

            {/* Barra Comparativa Utilizado vs Disponível */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Utilizado (25%)</span>
                <span>Disponível (75%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
                <div className="bg-inter-orange h-2 w-1/4" title="Utilizado" />
                <div className="bg-gray-200 h-2 w-3/4" title="Disponível" />
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-gray-100 text-xs text-gray-600">
              <div className="flex justify-between gap-3">
                <span>Limite Total:</span>
                <strong className="text-right tabular-nums text-gray-900">{formatarMoeda(LIMITE_TOTAL)}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span>Utilizado Atual:</span>
                <span className="text-right tabular-nums text-gray-700">{formatarMoeda(LIMITE_UTILIZADO_PADRAO)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Impacto desta operação:</span>
                <strong className="text-right tabular-nums text-gray-900">
                  {isCancelada || isNegada
                    ? "0%"
                    : `-${percentualOperacao}% (${formatarMoeda(operacao.valor)})`}
                </strong>
              </div>
              <div className="flex justify-between gap-3 border-t border-gray-100 pt-2 font-medium">
                <span>Disponível projetado:</span>
                <strong className="text-right tabular-nums text-emerald-700">
                  {formatarMoeda(limiteDisponivelApos)}
                </strong>
              </div>
            </div>

            {/* Compliance Note */}
            <div className="mt-5 p-3 rounded-lg bg-gray-50 border border-gray-100 flex items-start gap-2 text-[11px] text-gray-500 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Operação elegível conforme as políticas de risco de contraparte vigentes na Mesa de Operações.
              </span>
            </div>
          </Card>
          <div className={`grid gap-3 ${!isMinha && (isOfertada || isLiquidada) ? "grid-cols-[44px_minmax(0,1fr)]" : "grid-cols-1"}`}>
            {!isMinha && (
              <button
                type="button"
                onClick={() => alternarSalvar(operacao.id)}
                aria-pressed={operacao.salva}
                aria-label={operacao.salva ? "Remover oferta das salvas" : "Salvar oferta"}
                title={operacao.salva ? "Remover das salvas" : "Salvar oferta"}
                className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-gray-100 transition-colors hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inter-orange ${operacao.salva ? "text-inter-orange" : "text-gray-500"}`}
              >
                <Bookmark className={`h-4 w-4 transition-[fill,transform] duration-200 ${operacao.salva ? "fill-current scale-110" : ""}`} aria-hidden="true" />
              </button>
            )}
            {isOfertada && !isMinha && (
              <Button variant="primary" className="h-11 w-full whitespace-nowrap" onClick={() => solicitarAceiteOferta(operacao)}>
                Aceitar oferta
              </Button>
            )}
            {isOfertada && isMinha && (
              <Button variant="destructive" className="h-11 w-full" onClick={() => solicitarCancelamentoOferta(operacao)}>
                Cancelar oferta
              </Button>
            )}
            {isLiquidada && (
              <Button variant="outline" className="h-11 w-full" onClick={() => navigate("/historico")}>
                Ver no histórico
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
