import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Pagination, { ITEMS_PER_PAGE } from "../components/ui/Pagination";
import TransactionHash from "../components/TransactionHash";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import { formatDateTime, formatCurrency } from "../services/mockOperations";
import { useOperations } from "../context/OperationsContext";
import { useEnvironment } from "../context/EnvironmentContext";
import { useApiOffers } from "../hooks/useApiOffers";
import {
  Search,
  Download,
  ExternalLink,
  Blocks,
  ArrowUpRight,
  LayoutGrid,
  List,
  Bookmark,
} from "lucide-react";

// "Aceita" não existe na API: aceite e liquidação são a mesma transação (DvP).
const STATUS_LIST = ["Todas", "Ofertadas", "Liquidadas", "Negadas", "Canceladas", "Expiradas"];

function formatValue(op) {
  return op.formattedAmount ?? formatCurrency(op.value);
}

function SettlementHash({ op }) {
  if (op.hash) return <TransactionHash value={op.hash} />;
  return (
    <span className="text-[11px] text-gray-500">
      {op.status === "Ofertada" ? "Aguardando liquidação" : "Sem liquidação"}
    </span>
  );
}

export default function History() {
  const { withSaved, toggleSaved } = useOperations();
  const { demo } = useEnvironment();
  const {
    status: statusLista,
    operations: apiOffers,
    error: erroLista,
    reload,
  } = useApiOffers();
  const operations = useMemo(() => withSaved(apiOffers), [withSaved, apiOffers]);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [viewMode, setViewMode] = useState("grid");
  const [showSaved, setShowSaved] = useState(false);
  const [page, setPage] = useState(1);
  const savedCount = operations.filter((operation) => operation.saved).length;
  // Oferta mais recente de cada instituição ofertante (até 3).
  const recentOffers = useMemo(() => {
    const byInstitution = new Map();
    [...operations]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((offer) => {
        if (!byInstitution.has(offer.counterparty)) byInstitution.set(offer.counterparty, offer);
      });
    return [...byInstitution.entries()]
      .slice(0, 3)
      .map(([name, offer]) => ({ bank: { id: name, name }, offer }));
  }, [operations]);

  const periods = ["Hoje", "7 dias", "30 dias", "Todos"];
  const eligibleOperations = useMemo(() => {
    let filtered = operations;

    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(query) ||
          o.counterparty.toLowerCase().includes(query) ||
          (o.hash && o.hash.toLowerCase().includes(query)) ||
          (o.blockNumber && String(o.blockNumber).includes(query))
      );
    }

    return filtered;
  }, [operations, search]);

  const statusCounts = useMemo(() => Object.fromEntries(STATUS_LIST.map((status) => [
    status,
    status === "Todas"
      ? eligibleOperations.length
      : eligibleOperations.filter((operation) => operation.status === status.slice(0, -1)).length,
  ])), [eligibleOperations]);

  const historyList = useMemo(() => eligibleOperations
    .filter((operation) => showSaved ? operation.saved : statusFilter === "Todas" || operation.status === statusFilter.slice(0, -1))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [eligibleOperations, showSaved, statusFilter]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(historyList.length / ITEMS_PER_PAGE)));
  const pageOperations = historyList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  function handleExport() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Contraparte,Valor,Taxa,Prazo,Status,Data,Hash"]
        .concat(
          historyList.map(
            (o) =>
              `${o.id},"${o.counterparty}",${o.value},"${o.cdiRate}","${o.termLabel}",${o.status},${o.createdAt},${o.hash || ""}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historico-operacoes-inter.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Título do Histórico */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Histórico de Operações
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {demo ? "Ofertas e liquidações simuladas registradas pela API." : "Registros auditáveis e liquidação em blockchain de todas as operações interfinanceiras."}
        </p>
      </div>

      {/* 2. Barra de Filtros, Intervalo e Exportar */}
      <div className="bg-white rounded-xl border border-gray-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por ID, banco, hash ou bloco..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm rounded-lg border border-gray-200 bg-gray-50/60 focus:bg-white focus:outline-none focus:border-inter-orange focus:ring-1 focus:ring-inter-orange placeholder:text-gray-400"
            />
          </div>

          {/* Chips de Intervalo de Tempo */}
          <div className="flex flex-wrap items-center gap-1.5 pb-1 md:pb-0">
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => { setPeriod(p); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  period === p
                    ? "bg-inter-orange text-white font-semibold"
                    : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                {p}
              </button>
            ))}

            {/* Botão Exportar */}
            <Button
              variant="export"
              size="sm"
              onClick={handleExport}
              className="ml-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Banner Informativo Blockchain */}
      <div className="bg-white rounded-xl border border-gray-200/90 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-50 text-inter-orange flex items-center justify-center shrink-0">
            <Blocks className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">
              {demo ? "Rastreabilidade da demonstração" : "Rastreabilidade blockchain"}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
              {demo ? "Os endereços, blocos e hashes exibidos são sintéticos e não representam transações na Sepolia." : "Os registros técnicos das operações ficam centralizados neste Histórico: rede Sepolia, hash, bloco e confirmações."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <Badge variant="neutral" size="md">
            {demo ? "Simulação local" : "Rede: Sepolia"}
          </Badge>
          {!demo && <a
            href="https://sepolia.etherscan.io"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:text-black"
          >
            <span>Explorador Etherscan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>}
        </div>
      </div>

      {/* 4. Seção "Acessadas recentemente" */}
      <div>
        <div className="mb-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Acessadas recentemente
          </h2>
        </div>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-inter-orange" role="region" aria-label="Bancos acessados recentemente" tabIndex={0}>
          {recentOffers.map(({ bank, offer }) => (
            <button key={bank.id} type="button" onClick={() => navigate(`/operacoes/${offer.rawId}`)} className="flex w-[52.5%] min-w-[210px] shrink-0 snap-start cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3.5 text-left shadow-xs transition-colors hover:border-inter-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-inter-orange sm:w-[29.4%] lg:w-[25.2%]">
              <div className="min-w-0">
                <span className="font-bold text-xs text-gray-900 block">
                  {bank.name}
                </span>
                <span className="block truncate text-[11px] text-gray-400">
                  {offer.id} • {offer.cdiRate} • {formatValue(offer)}
                </span>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-neutral-900">
                <span>Ver detalhes</span>
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Seção "Operações" (Grid de Cards de Registros Históricos) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold tracking-tight text-gray-900">
            Operações ({historyList.length})
          </h2>
          <div className="inline-flex shrink-0 items-center rounded-lg border border-gray-200 bg-gray-100 p-0.5" aria-label="Visualização do histórico">
            <button type="button" onClick={() => setViewMode("grid")} aria-label="Visualizar em cards" aria-pressed={viewMode === "grid"} className={`cursor-pointer rounded-md p-1.5 transition-colors ${viewMode === "grid" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-400 hover:text-gray-700"}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setViewMode("table")} aria-label="Visualizar em tabela" aria-pressed={viewMode === "table"} className={`cursor-pointer rounded-md p-1.5 transition-colors ${viewMode === "table" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-400 hover:text-gray-700"}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2" aria-label="Filtrar operações">
          {[STATUS_LIST[0], "Salvas", ...STATUS_LIST.slice(1)].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => { setStatusFilter(status === "Salvas" ? "Todas" : status); setShowSaved(status === "Salvas"); setPage(1); }}
              aria-pressed={status === "Salvas" ? showSaved : !showSaved && statusFilter === status}
              className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${(status === "Salvas" ? showSaved : !showSaved && statusFilter === status) ? "bg-inter-orange font-semibold text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"}`}
            >
              {status === "Salvas" && <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />}
              {status} ({status === "Salvas" ? savedCount : statusCounts[status]})
            </button>
          ))}
        </div>

        {statusLista === "carregando" ? (
          <LoadingState rows={5} label="Carregando histórico" />
        ) : statusLista === "erro" ? (
          <ErrorState
            title="Não foi possível carregar o histórico"
            message={erroLista?.type === "indisponivel" ? "A API está indisponível no momento." : "A consulta ao histórico falhou."}
            correlationId={erroLista?.correlationId}
            onRetry={reload}
          />
        ) : historyList.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-sm font-medium text-gray-600">
              {showSaved ? "Nenhuma proposta salva encontrada." : "Nenhuma operação encontrada com os critérios informados."}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {showSaved ? "Salve propostas na Mesa de Operações ou ajuste os filtros." : "Verifique o status ou os termos da busca."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageOperations.map((op) => (
              <Card
                key={op.id}
                className="p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Topo */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-900">
                      {op.counterparty}
                    </span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => toggleSaved(op.id)} aria-label={op.saved ? `Remover ${op.id} das salvas` : `Salvar ${op.id}`} title={op.saved ? "Remover das salvas" : "Salvar proposta"} className={`cursor-pointer rounded-md p-1 transition-colors ${op.saved ? "text-inter-orange hover:bg-orange-50" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"}`}>
                        <Bookmark className={`h-4 w-4 ${op.saved ? "fill-current" : ""}`} aria-hidden="true" />
                      </button>
                      <StatusBadge status={op.status} size="sm" />
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-400 mb-2">
                    {op.id} • {formatDateTime(op.createdAt)}
                  </div>

                  {/* Valor Principal */}
                  <div className="mb-3">
                    <span className="text-[11px] text-gray-400 block mb-0.5">
                      Valor
                    </span>
                    <div className="text-lg font-bold text-gray-900 font-sans tracking-tight">
                      {formatValue(op)}
                    </div>
                  </div>

                  {/* Taxa e Prazo */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-gray-100 mb-3">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Taxa CDI</span>
                      <span className="font-semibold text-gray-900 font-mono">
                        {op.cdiRate}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Prazo</span>
                      <span className="font-semibold text-gray-900">
                        {op.termLabel || `${op.termDays} dia(s)`}
                      </span>
                    </div>
                  </div>

                  {/* Hash Blockchain se houver */}
                  <div className="mb-3">
                    <span className="text-[11px] text-gray-400 block mb-0.5">
                      Hash da liquidação
                    </span>
                    <SettlementHash op={op} />
                  </div>
                </div>

                {/* Rodapé do Card */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-end">
                  <Button
                    variant="details"
                    size="sm"
                    onClick={() => navigate(`/operacoes/${op.rawId}`)}
                  >
                    Ver detalhes
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-2xs">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-3 py-3">ID</th>
                  <th className="px-3 py-3">Instituição</th>
                  <th className="px-3 py-3">Data</th>
                  <th className="px-3 py-3">Valor</th>
                  <th className="px-3 py-3">Taxa CDI</th>
                  <th className="px-3 py-3">Prazo</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Hash da liquidação</th>
                  <th className="px-3 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pageOperations.map((op) => (
                  <tr key={op.id} className="border-b border-gray-100 text-xs last:border-b-0">
                    <td className="px-3 py-3 font-mono font-semibold text-gray-600">{op.id}</td>
                    <td className="px-3 py-3 font-medium text-gray-900">{op.counterparty}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-600">{formatDateTime(op.createdAt)}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-gray-900">{formatValue(op)}</td>
                    <td className="px-3 py-3 font-mono text-gray-700">{op.cdiRate}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-600">{op.termLabel || `${op.termDays} dia(s)`}</td>
                    <td className="px-3 py-3"><StatusBadge status={op.status} size="sm" /></td>
                    <td className="whitespace-nowrap px-3 py-3"><SettlementHash op={op} /></td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => toggleSaved(op.id)} aria-label={op.saved ? `Remover ${op.id} das salvas` : `Salvar ${op.id}`} title={op.saved ? "Remover das salvas" : "Salvar proposta"} className={`cursor-pointer rounded-md p-1 transition-colors ${op.saved ? "text-inter-orange hover:bg-orange-50" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"}`}>
                          <Bookmark className={`h-4 w-4 ${op.saved ? "fill-current" : ""}`} aria-hidden="true" />
                        </button>
                        <Button variant="details" size="sm" onClick={() => navigate(`/operacoes/${op.rawId}`)}>Ver detalhes</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={currentPage} totalItems={historyList.length} onPageChange={setPage} />
      </div>
    </div>
  );
}
