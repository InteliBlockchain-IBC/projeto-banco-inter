import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, LayoutGrid, List, Plus, Search } from "lucide-react";
import { useAmbiente } from "../context/AmbienteContext";
import { useOperacoes } from "../context/OperacoesContext";
import { useOfertasApi } from "../hooks/useOfertasApi";
import CarteiraControles from "../components/CarteiraControles";
import EstadoCarregando from "../components/ui/EstadoCarregando";
import EstadoErro from "../components/ui/EstadoErro";
import { resumirOfertas } from "../services/estatisticasOfertas";
import GraficoMinhasOfertas from "../components/GraficoMinhasOfertas";
import OfertaCard from "../components/OfertaCard";
import OfertaRow from "../components/OfertaRow";
import Button from "../components/ui/Button";
import Paginacao, { ITENS_POR_PAGINA } from "../components/ui/Paginacao";

const STATUS_LIST = ["Todas", "Ofertadas", "Liquidadas", "Negadas", "Canceladas", "Expiradas"];

export default function MinhasOfertas() {
  const { carteiraAtiva: conta, demonstracao } = useAmbiente();
  const { setModalNovaOfertaAberto } = useOperacoes();
  const { operacoes, status, erro, recarregar } = useOfertasApi({ wallet: conta, role: "lender", enabled: Boolean(conta) });
  const [filtroStatus, setFiltroStatus] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [datasAbertas, setDatasAbertas] = useState(false);
  const menuDatasRef = useRef(null);
  const [visualizacao, setVisualizacao] = useState("grid");
  const [pagina, setPagina] = useState(1);
  const [periodo, setPeriodo] = useState("semana");

  useEffect(() => {
    if (!datasAbertas) return undefined;
    function fecharAoClicarFora(event) {
      if (!menuDatasRef.current?.contains(event.target)) setDatasAbertas(false);
    }
    function fecharComEscape(event) {
      if (event.key === "Escape") setDatasAbertas(false);
    }
    document.addEventListener("pointerdown", fecharAoClicarFora);
    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.removeEventListener("pointerdown", fecharAoClicarFora);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [datasAbertas]);

  const minhasOfertas = useMemo(() => operacoes
    .filter((operacao) => operacao.ofertante.carteira?.toLowerCase() === conta?.toLowerCase())
    .map((operacao) => ({ ...operacao, minha: true }))
    .sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm)), [operacoes, conta]);
  const dadosGrafico = useMemo(() => resumirOfertas(minhasOfertas, periodo), [minhasOfertas, periodo]);
  const decididas = dadosGrafico.totais.aceitas + dadosGrafico.totais.negadas;
  const taxaAceite = decididas ? Math.round(dadosGrafico.totais.aceitas / decididas * 100) : 0;
  const ofertasAbertas = minhasOfertas.filter((oferta) => oferta.status === "Ofertada").length;
  const contagens = useMemo(() => Object.fromEntries(STATUS_LIST.map((status) => [
    status,
    status === "Todas"
      ? minhasOfertas.length
      : minhasOfertas.filter((oferta) => oferta.status === status.slice(0, -1)).length,
  ])), [minhasOfertas]);

  const ofertasFiltradas = useMemo(() => minhasOfertas.filter((oferta) => {
    if (filtroStatus !== "Todas" && oferta.status !== filtroStatus.slice(0, -1)) return false;
    const dataCriacao = oferta.criadaEm.slice(0, 10);
    if (dataInicial && dataCriacao < dataInicial) return false;
    if (dataFinal && dataCriacao > dataFinal) return false;
    if (!busca.trim()) return true;
    const termo = busca.trim().toLowerCase();
    return [oferta.id, oferta.contraparte, oferta.valor, oferta.taxaCdi]
      .some((valor) => String(valor).toLowerCase().includes(termo));
  }), [minhasOfertas, filtroStatus, dataInicial, dataFinal, busca]);
  const paginaAtual = Math.min(pagina, Math.max(1, Math.ceil(ofertasFiltradas.length / ITENS_POR_PAGINA)));
  const ofertasDaPagina = ofertasFiltradas.slice((paginaAtual - 1) * ITENS_POR_PAGINA, paginaAtual * ITENS_POR_PAGINA);

  function limparFiltros() {
    setBusca("");
    setFiltroStatus("Todas");
    setDataInicial("");
    setDataFinal("");
    setPagina(1);
  }

  return (
    <div className="space-y-7 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Minhas ofertas</h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">Acompanhe o aceite e gerencie as ofertas da sua instituição.</p>
        </div>
        <Button variant="primary" onClick={() => setModalNovaOfertaAberto(true)} className="self-start sm:self-auto"><Plus className="h-4 w-4" />Criar oferta</Button>
      </div>

      {!conta && <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm"><p className="mb-3">Conecte sua carteira para consultar as ofertas associadas a ela.</p><CarteiraControles /></div>}
      {demonstracao && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Exibindo as ofertas da carteira de demonstração selecionada no cabeçalho.</p>}
      {conta && status === "carregando" && <EstadoCarregando linhas={4} rotulo="Carregando minhas ofertas" />}
      {conta && status === "erro" && <EstadoErro titulo="Não foi possível carregar suas ofertas" mensagem={erro?.message} correlationId={erro?.correlationId} onTentarNovamente={recarregar} />}
      {conta && status === "ok" && <>

      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <GraficoMinhasOfertas dados={dadosGrafico} periodo={periodo} onPeriodoChange={setPeriodo} />

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
              <strong className="text-3xl font-bold tabular-nums text-gray-900">{decididas ? `${taxaAceite}%` : "—"}</strong>
              <p className="mt-1 text-xs text-gray-500">{dadosGrafico.totais.aceitas} aceitas de {decididas} decididas</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-inter-orange transition-[width] duration-300" style={{ width: `${taxaAceite}%` }} />
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
              <strong className="text-3xl font-bold tabular-nums text-gray-900">{ofertasAbertas}</strong>
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
              onClick={() => { setFiltroStatus(status); setPagina(1); }}
              aria-pressed={filtroStatus === status}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filtroStatus === status
                  ? "bg-inter-orange font-semibold text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {status} ({contagens[status]})
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
              value={busca}
              onChange={(event) => { setBusca(event.target.value); setPagina(1); }}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/60 py-1.5 pl-9 pr-3.5 text-sm outline-none focus:border-inter-orange focus:ring-1 focus:ring-inter-orange"
            />
          </div>
          <div ref={menuDatasRef} className="relative lg:shrink-0">
            <button
              type="button"
              aria-expanded={datasAbertas}
              aria-controls="filtro-datas-ofertas"
              onClick={() => setDatasAbertas((abertas) => !abertas)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${dataInicial || dataFinal ? "border-inter-orange bg-orange-50 text-inter-orange-hover" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"}`}
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {dataInicial || dataFinal ? "Datas selecionadas" : "Filtrar por data"}
            </button>
            {datasAbertas && (
              <div id="filtro-datas-ofertas" className="absolute right-0 top-full z-30 mt-2 flex w-72 flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                <p className="text-xs font-semibold text-gray-900">Data de criação</p>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  De
                  <input
                    type="date"
                    value={dataInicial}
                    max={dataFinal || undefined}
                    onChange={(event) => { setDataInicial(event.target.value); setPagina(1); }}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-inter-orange focus:ring-1 focus:ring-inter-orange"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  Até
                  <input
                    type="date"
                    value={dataFinal}
                    min={dataInicial || undefined}
                    onChange={(event) => { setDataFinal(event.target.value); setPagina(1); }}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-inter-orange focus:ring-1 focus:ring-inter-orange"
                  />
                </label>
                {(dataInicial || dataFinal) && (
                  <button type="button" onClick={() => { setDataInicial(""); setDataFinal(""); setPagina(1); }} className="self-start cursor-pointer rounded-lg px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                    Limpar datas
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 lg:shrink-0">
            <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-100 p-0.5">
              <button type="button" onClick={() => setVisualizacao("grid")} aria-label="Visualizar em cards" aria-pressed={visualizacao === "grid"} className={`cursor-pointer rounded-md p-1.5 ${visualizacao === "grid" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-400"}`}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setVisualizacao("table")} aria-label="Visualizar em tabela" aria-pressed={visualizacao === "table"} className={`cursor-pointer rounded-md p-1.5 ${visualizacao === "table" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-400"}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {ofertasFiltradas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-sm font-medium text-gray-600">Nenhuma oferta encontrada.</p>
            <p className="mt-1 text-xs text-gray-400">Altere a busca, o status ou o intervalo de datas.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={limparFiltros}>
              Limpar filtros
            </Button>
          </div>
        ) : visualizacao === "grid" ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ofertasDaPagina.map((oferta) => <OfertaCard key={oferta.id} operacao={oferta} mostrarComparacao={false} mostrarSalvar={false} />)}
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
              <tbody>{ofertasDaPagina.map((oferta) => <OfertaRow key={oferta.id} operacao={oferta} mostrarComparacao={false} mostrarSalvar={false} />)}</tbody>
            </table>
          </div>
        )}
        <Paginacao pagina={paginaAtual} totalItens={ofertasFiltradas.length} onPaginaChange={setPagina} />
      </section>
      </>}
    </div>
  );
}
