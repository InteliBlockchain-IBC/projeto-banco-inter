import { useState, useMemo } from "react";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import OfferCard from "../components/OfferCard";
import OfferRow from "../components/OfferRow";
import Pagination, { ITEMS_PER_PAGE } from "../components/ui/Pagination";
import {
  formatCurrency,
} from "../services/mockOperations";
import { useOperations } from "../context/OperationsContext";
import { useApiOffers } from "../hooks/useApiOffers";
import { useEnvironment } from "../context/EnvironmentContext";
import { formatCents } from "../utils/formatters";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import {
  Search,
  LayoutGrid,
  List,
  TrendingUp,
  Percent,
  Activity,
  Layers,
  CheckSquare,
} from "lucide-react";

export default function OperationsDesk() {
  const {
    withSaved,
    comparisonSelection,
  } = useOperations();
  const { activeWallet: account, operatorLimit, error: erroAmbiente } = useEnvironment();
  const totalLimit = account && operatorLimit ? Number(operatorLimit.availableLimitCents) / 100 : 0;

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [page, setPage] = useState(1);

  // Ofertas abertas vindas da API. Sem carteira conectada ainda não dá para
  // separar as do próprio banco, então todas as abertas aparecem.
  const {
    status: statusLista,
    operations: apiOffers,
    error: erroLista,
    reload,
  } = useApiOffers({ status: "offered" });

  const availableOffers = useMemo(() => withSaved(apiOffers).filter((op) =>
    !account || op.lender.wallet?.toLowerCase() !== account.toLowerCase()), [withSaved, apiOffers, account]);
  const volume24h = useMemo(() => availableOffers
    .reduce((total, op) => total + op.value, 0), [availableOffers]);

  // A mesa mostra apenas ofertas abertas de outras instituições.
  const filteredOperations = useMemo(() => {
    return availableOffers.filter((op) => {
      // Filtro de busca
      if (search.trim()) {
        const query = search.toLowerCase();
        const counterparty = op.counterparty.toLowerCase();
        const id = op.id.toLowerCase();
        const value = op.value.toString();
        const rate = op.cdiRate.toLowerCase();
        return (
          counterparty.includes(query) ||
          id.includes(query) ||
          value.includes(query) ||
          rate.includes(query)
        );
      }

      return true;
    });
  }, [availableOffers, search]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filteredOperations.length / ITEMS_PER_PAGE)));
  const pageOperations = filteredOperations.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Propostas selecionadas para cálculo do impacto no limite
  const selectedOffers = useMemo(() => {
    return availableOffers.filter((o) => comparisonSelection.includes(o.id));
  }, [availableOffers, comparisonSelection]);

  const selectedTotalValue = useMemo(() => {
    return selectedOffers.reduce((acc, curr) => acc + curr.value, 0);
  }, [selectedOffers]);

  const committedLimitPercent = useMemo(() => {
    return totalLimit ? Math.min(100, Math.round((selectedTotalValue / totalLimit) * 100)) : 0;
  }, [selectedTotalValue, totalLimit]);
  const chartScale = Math.max(10, Math.ceil(Math.max(...selectedOffers.map((prop) => totalLimit ? prop.value / totalLimit * 100 : 0), 0) / 10) * 10);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Topo da página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Mesa de Operações
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Mercado interfinanceiro em tempo real para tomada e cessão de recursos.
          </p>
        </div>

      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-2">
      {/* 2. Cards de Métricas / KPIs */}
      <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Limite disponível"
          value={account && operatorLimit ? formatCents(operatorLimit.availableLimitCents) : "—"}
          subvalue={!account ? "Conecte a carteira" : erroAmbiente ? "Limite indisponível" : operatorLimit?.institution?.name ?? (operatorLimit?.isRegistered ? "Carteira cadastrada" : "Consultando limite")}
          icon={TrendingUp}
        />
        <StatCard
          label="Taxa CDI vigente"
          value="—"
          subvalue="Referência não fornecida pela API"
          icon={Percent}
        />
        <StatCard
          label="Volume de ofertas abertas"
          value={formatCurrency(volume24h)}
          subvalue="Total de ordens abertas"
          icon={Activity}
        />
        <StatCard
          label="Ofertas ativas"
          value={availableOffers.length}
          subvalue="Disponíveis para negociação"
          icon={Layers}
        />
      </div>

      {/* 3. Comparação das propostas selecionadas */}
      <Card className="flex min-w-0 flex-col p-5 sm:p-6">
        <div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Quanto cada oferta ocuparia do limite?
            </h2>

          </div>
          <div className="mt-4 flex flex-wrap gap-5 sm:gap-6">
            <div>
              <div className="text-xs text-gray-500">Valor das ofertas selecionadas</div>
              <strong className="mt-1 block text-xl font-semibold tabular-nums text-gray-900">{formatCurrency(selectedTotalValue)}</strong>
            </div>
            <div>
              <div className="text-xs text-gray-500">Consumo combinado do limite</div>
              <strong className="mt-1 block text-xl font-semibold tabular-nums text-gray-900">{committedLimitPercent}%</strong>
            </div>
          </div>
        </div>

        {/* Colunas comparativas */}
        {selectedOffers.length === 0 ? (
          <div className="py-4 text-center text-xs text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            Nenhuma proposta selecionada. Marque as caixas "Comparar" nos cards para simular o impacto.
          </div>
        ) : (
          <div className="mt-auto min-w-0 pt-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-inter-orange" />Impacto de cada oferta</span>
              <span>Percentual do limite disponível</span>
            </div>
            <div className="overflow-x-auto">
              <div className="flex min-w-max items-start gap-2 pt-5">
                <div className="relative h-40 w-9 shrink-0 text-right text-[10px] tabular-nums text-gray-500" aria-hidden="true">
                  {[1, 0.75, 0.5, 0.25, 0].map((fraction) => (
                    <span key={fraction} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - fraction) * 100}%` }}>
                      {(chartScale * fraction).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-40" aria-hidden="true">
                    {[0, 25, 50, 75, 100].map((posicao) => (
                      <div key={posicao} className="absolute w-full border-t border-gray-200" style={{ top: `${posicao}%` }} />
                    ))}
                  </div>
                  <div className="relative flex items-end gap-3">
                    {selectedOffers.map((prop) => {
                      const percentage = totalLimit ? prop.value / totalLimit * 100 : 0;
                      return (
                        <div key={prop.id} className="w-24 shrink-0 text-center sm:w-28">
                          <div className="flex h-40 items-end justify-center">
                            <div
                              className="relative w-7 rounded-t-md bg-inter-orange transition-[height] duration-300 sm:w-8"
                              style={{ height: `${Math.min(100, percentage / chartScale * 100)}%` }}
                              title={`${prop.counterparty} (${prop.id}): ${formatCurrency(prop.value)} · ${Math.round(percentage)}% do limite`}
                              role="img"
                              aria-label={`${prop.counterparty} (${prop.id}): ${formatCurrency(prop.value)}, ${Math.round(percentage)}% do limite`}
                            >
                              <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-xs font-semibold tabular-nums text-gray-900">{Math.round(percentage)}%</span>
                            </div>
                          </div>
                          <div className="pt-2 text-xs text-gray-500">{prop.counterparty} ({prop.id})</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
      </div>

      {/* 5. Ofertas disponíveis na mesa */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            Ofertas disponíveis ({availableOffers.length})
          </h2>

        </div>

        {/* Barra de Busca, Comparar e Visualização */}
        <div className="bg-white rounded-xl border border-gray-200/90 p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por banco, valor, taxa ou ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm rounded-lg border border-gray-200 bg-gray-50/60 focus:bg-white focus:outline-none focus:border-inter-orange focus:ring-1 focus:ring-inter-orange placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Botão Comparar */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 border border-gray-200 text-gray-800">
              <CheckSquare className="w-3.5 h-3.5 text-gray-500" />
              <span>Comparando ({selectedOffers.length})</span>
            </div>

            {/* Alternador Grid / Tabela */}
            <div className="inline-flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-neutral-900 shadow-2xs"
                    : "text-gray-400 hover:text-gray-700"
                }`}
                title="Visualização em Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-neutral-900 shadow-2xs"
                    : "text-gray-400 hover:text-gray-700"
                }`}
                title="Visualização em Tabela"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Propostas (Cards ou Tabela) */}
        {statusLista === "carregando" ? (
          <LoadingState rows={3} label="Carregando ofertas" />
        ) : statusLista === "erro" ? (
          <ErrorState
            title={erroLista?.type === "indisponivel" ? "API indisponível" : "Não foi possível carregar as ofertas"}
            message="As ofertas da mesa não puderam ser consultadas agora."
            correlationId={erroLista?.correlationId}
            onRetry={reload}
          />
        ) : filteredOperations.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-sm font-medium text-gray-600">
              {search.trim() ? "Nenhuma oferta disponível encontrada." : "Nenhuma oferta aberta no momento."}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {search.trim() ? "Tente alterar os termos de busca." : "Novas ofertas aparecem aqui assim que forem registradas."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
            >
              Limpar filtros
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pageOperations.map((operation) => (
              <OfferCard key={operation.id} operation={operation} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-3 w-8">#</th>
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Instituição</th>
                    <th className="py-3 px-3">Valor</th>
                    <th className="py-3 px-3">Taxa CDI</th>
                    <th className="py-3 px-3">Prazo</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pageOperations.map((operation) => (
                    <OfferRow key={operation.id} operation={operation} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <Pagination page={currentPage} totalItems={filteredOperations.length} onPageChange={setPage} alwaysShow />
      </div>
    </div>
  );
}
