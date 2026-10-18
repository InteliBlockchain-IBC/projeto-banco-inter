import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, LayoutGrid, List, Plus, Search } from "lucide-react";
import { useEnvironment } from "../context/EnvironmentContext";
import { useOperations } from "../context/OperationsContext";
import { useApiOffers } from "../hooks/useApiOffers";
import WalletControls from "../components/WalletControls";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import { summarizeOffers } from "../services/offerStatistics";
import MyOffersChart from "../components/MyOffersChart";
import OfferCard from "../components/OfferCard";
import OfferRow from "../components/OfferRow";
import Button from "../components/ui/Button";
import Pagination, { ITEMS_PER_PAGE } from "../components/ui/Pagination";

const STATUS_LIST = ["Todas", "Ofertadas", "Liquidadas", "Negadas", "Canceladas", "Expiradas"];

export default function MyOffers() {
  const { activeWallet: account, demo } = useEnvironment();
  const { setNewOfferModalOpen } = useOperations();
  const { operations, status, error, reload } = useApiOffers({ wallet: account, role: "lender", enabled: Boolean(account) });
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const dateMenuRef = useRef(null);
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState("semana");

  useEffect(() => {
    if (!dateMenuOpen) return undefined;
    function closeOnOutsideClick(event) {
      if (!dateMenuRef.current?.contains(event.target)) setDateMenuOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") setDateMenuOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [dateMenuOpen]);

  const myOffers = useMemo(() => operations
    .filter((operation) => operation.lender.wallet?.toLowerCase() === account?.toLowerCase())
    .map((operation) => ({ ...operation, mine: true }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [operations, account]);
  const chartData = useMemo(() => summarizeOffers(myOffers, period), [myOffers, period]);
  const decidedOffers = chartData.totals.accepted + chartData.totals.rejected;
  const acceptanceRate = decidedOffers ? Math.round(chartData.totals.accepted / decidedOffers * 100) : 0;
  const openOffers = myOffers.filter((offer) => offer.status === "Ofertada").length;
  const counts = useMemo(() => Object.fromEntries(STATUS_LIST.map((status) => [
    status,
    status === "Todas"
      ? myOffers.length
      : myOffers.filter((offer) => offer.status === status.slice(0, -1)).length,
  ])), [myOffers]);

  const filteredOffers = useMemo(() => myOffers.filter((offer) => {
    if (statusFilter !== "Todas" && offer.status !== statusFilter.slice(0, -1)) return false;
    const creationDate = offer.createdAt.slice(0, 10);
    if (startDate && creationDate < startDate) return false;
    if (endDate && creationDate > endDate) return false;
    if (!search.trim()) return true;
    const query = search.trim().toLowerCase();
    return [offer.id, offer.counterparty, offer.value, offer.cdiRate]
      .some((value) => String(value).toLowerCase().includes(query));
  }), [myOffers, statusFilter, startDate, endDate, search]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filteredOffers.length / ITEMS_PER_PAGE)));
  const pageOffers = filteredOffers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  function clearFilters() {
    setSearch("");
    setStatusFilter("Todas");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }

  return (
    <div className="space-y-7 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Minhas ofertas</h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">Acompanhe o aceite e gerencie as ofertas da sua instituição.</p>
        </div>
        <Button variant="primary" onClick={() => setNewOfferModalOpen(true)} className="self-start sm:self-auto"><Plus className="h-4 w-4" />Criar oferta</Button>
      </div>

      {!account && <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm"><p className="mb-3">Conecte sua carteira para consultar as ofertas associadas a ela.</p><WalletControls /></div>}
      {demo && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Exibindo as ofertas da carteira de demonstração selecionada no cabeçalho.</p>}
      {account && status === "carregando" && <LoadingState rows={4} label="Carregando minhas ofertas" />}
      {account && status === "erro" && <ErrorState title="Não foi possível carregar suas ofertas" message={error?.message} correlationId={error?.correlationId} onRetry={reload} />}
      {account && status === "ok" && <>

      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <MyOffersChart data={chartData} period={period} onPeriodChange={setPeriod} />

        <div className="grid grid-rows-2 gap-4">
          <section className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs sm:p-6" aria-labelledby="titulo-taxa-aceite">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="titulo-taxa-aceite" className="text-sm font-semibold text-gray-700">Taxa de aceite</h2>
                <p className="mt-1 text-xs text-gray-500">Entre as ofertas decididas no período</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-inter-orange" aria-hidden="true" />
            </div>
            <div>
              <strong className="text-3xl font-bold tabular-nums text-gray-900">{decidedOffers ? `${acceptanceRate}%` : "—"}</strong>
              <p className="mt-1 text-xs text-gray-500">{chartData.totals.accepted} aceitas de {decidedOffers} decididas</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-inter-orange transition-[width] duration-300" style={{ width: `${acceptanceRate}%` }} />
              </div>
            </div>
          </section>

          <section className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs sm:p-6" aria-labelledby="titulo-ofertas-abertas">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="titulo-ofertas-abertas" className="text-sm font-semibold text-gray-700">Ofertas abertas</h2>
                <p className="mt-1 text-xs text-gray-500">Aguardando aceite neste momento</p>
              </div>
              <Clock3 className="h-5 w-5 text-gray-500" aria-hidden="true" />
            </div>
            <div>
              <strong className="text-3xl font-bold tabular-nums text-gray-900">{openOffers}</strong>
              <p className="mt-1 text-xs text-gray-500">Ainda disponíveis para negociação ou cancelamento</p>
            </div>
          </section>
        </div>
      </div>

      <section className="space-y-4" aria-labelledby="titulo-lista-minhas-ofertas">
        <div>
          <h2 id="titulo-lista-minhas-ofertas" className="text-base font-bold text-gray-900">Ofertas criadas</h2>
          </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2">
          {STATUS_LIST.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => { setStatusFilter(status); setPage(1); }}
              aria-pressed={statusFilter === status}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-inter-orange font-semibold text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {status} ({counts[status]})
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-2xs lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="search"
              aria-label="Buscar nas minhas ofertas"
              placeholder="Buscar por banco, valor, taxa ou ID..."
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/60 py-1.5 pl-9 pr-3.5 text-sm outline-none focus:border-inter-orange focus:ring-1 focus:ring-inter-orange"
            />
          </div>
          <div ref={dateMenuRef} className="relative lg:shrink-0">
            <button
              type="button"
              aria-expanded={dateMenuOpen}
              aria-controls="filtro-datas-ofertas"
              onClick={() => setDateMenuOpen((abertas) => !abertas)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${startDate || endDate ? "border-inter-orange bg-orange-50 text-inter-orange-hover" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"}`}
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {startDate || endDate ? "Datas selecionadas" : "Filtrar por data"}
            </button>
            {dateMenuOpen && (
              <div id="filtro-datas-ofertas" className="absolute right-0 top-full z-30 mt-2 flex w-72 flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                <p className="text-xs font-semibold text-gray-900">Data de criação</p>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  De
                  <input
                    type="date"
                    value={startDate}
                    max={endDate || undefined}
                    onChange={(event) => { setStartDate(event.target.value); setPage(1); }}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-inter-orange focus:ring-1 focus:ring-inter-orange"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  Até
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(event) => { setEndDate(event.target.value); setPage(1); }}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-inter-orange focus:ring-1 focus:ring-inter-orange"
                  />
                </label>
                {(startDate || endDate) && (
                  <button type="button" onClick={() => { setStartDate(""); setEndDate(""); setPage(1); }} className="self-start cursor-pointer rounded-lg px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                    Limpar datas
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 lg:shrink-0">
            <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-100 p-0.5">
              <button type="button" onClick={() => setViewMode("grid")} aria-label="Visualizar em cards" aria-pressed={viewMode === "grid"} className={`cursor-pointer rounded-md p-1.5 ${viewMode === "grid" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-400"}`}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setViewMode("table")} aria-label="Visualizar em tabela" aria-pressed={viewMode === "table"} className={`cursor-pointer rounded-md p-1.5 ${viewMode === "table" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-400"}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {filteredOffers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-sm font-medium text-gray-600">Nenhuma oferta encontrada.</p>
            <p className="mt-1 text-xs text-gray-400">Altere a busca, o status ou o intervalo de datas.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pageOffers.map((offer) => <OfferCard key={offer.id} operation={offer} showComparison={false} showSave={false} />)}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-2xs">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-3 py-3">ID</th><th className="px-3 py-3">Instituição</th>
                  <th className="px-3 py-3">Valor</th><th className="px-3 py-3">Taxa CDI</th><th className="px-3 py-3">Prazo</th>
                  <th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>{pageOffers.map((offer) => <OfferRow key={offer.id} operation={offer} showComparison={false} showSave={false} />)}</tbody>
            </table>
          </div>
        )}
        <Pagination page={currentPage} totalItems={filteredOffers.length} onPageChange={setPage} />
      </section>
      </>}
    </div>
  );
}
