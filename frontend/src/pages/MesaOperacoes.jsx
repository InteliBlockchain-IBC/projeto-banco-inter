import { useState, useMemo } from "react";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import OfertaCard from "../components/OfertaCard";
import OfertaRow from "../components/OfertaRow";
import {
  formatarMoeda,
  BANCOS_RECENTES,
  STATUS_LIST,
} from "../services/mockOperacoes";
import { useOperacoes } from "../context/OperacoesContext";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Activity,
  Layers,
  CheckSquare,
} from "lucide-react";

export default function MesaOperacoes() {
  const {
    operacoes,
    limiteTotal,
    cdiVigente,
    volume24h,
    selecionadasComparacao,
    setModalNovaOfertaAberto,
  } = useOperacoes();

  const [filtroStatus, setFiltroStatus] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [visualizacao, setVisualizacao] = useState("grid"); // "grid" | "table"
  const [somenteMinhas, setSomenteMinhas] = useState(false);

  // Contagem para as abas
  const contagens = useMemo(() => {
    return {
      Todas: operacoes.length,
      Ofertadas: operacoes.filter((o) => o.status === "Ofertada").length,
      Aceitas: operacoes.filter((o) => o.status === "Aceita").length,
      Liquidadas: operacoes.filter((o) => o.status === "Liquidada").length,
      Canceladas: operacoes.filter((o) => o.status === "Cancelada").length,
    };
  }, [operacoes]);

  // Lista filtrada
  const operacoesFiltradas = useMemo(() => {
    return operacoes.filter((op) => {
      // Filtro de aba
      if (filtroStatus !== "Todas" && op.status !== filtroStatus.slice(0, -1) && op.status !== filtroStatus) {
        // Tratar plural (Ofertadas -> Ofertada)
        const singular = filtroStatus.endsWith("s")
          ? filtroStatus.slice(0, -1)
          : filtroStatus;
        if (op.status !== singular) return false;
      }

      // Filtro somente minhas
      if (somenteMinhas && !op.minha) return false;

      // Filtro de busca
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const contraparte = op.contraparte.toLowerCase();
        const id = op.id.toLowerCase();
        const valor = op.valor.toString();
        const taxa = op.taxaCdi.toLowerCase();
        return (
          contraparte.includes(termo) ||
          id.includes(termo) ||
          valor.includes(termo) ||
          taxa.includes(termo)
        );
      }

      return true;
    });
  }, [operacoes, filtroStatus, busca, somenteMinhas]);

  // Propostas selecionadas para cálculo do impacto no limite
  const propostasSelecionadas = useMemo(() => {
    return operacoes.filter((o) => selecionadasComparacao.includes(o.id));
  }, [operacoes, selecionadasComparacao]);

  const totalValorSelecionado = useMemo(() => {
    return propostasSelecionadas.reduce((acc, curr) => acc + curr.valor, 0);
  }, [propostasSelecionadas]);

  const totalPercentualComprometido = useMemo(() => {
    return Math.min(100, Math.round((totalValorSelecionado / limiteTotal) * 100));
  }, [totalValorSelecionado, limiteTotal]);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Topo: Título da Página e Botão Nova Oferta */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Mesa de Operações
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Mercado interfinanceiro em tempo real para tomada e cessão de recursos.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setModalNovaOfertaAberto(true)}
          className="self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Nova oferta
        </Button>
      </div>

      {/* 2. Cards de Métricas / KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Limite disponível"
          value={formatarMoeda(limiteTotal)}
          subvalue="Banco A • R$ 125M comprometido"
          icon={TrendingUp}
        />
        <StatCard
          label="Taxa CDI vigente"
          value={`${cdiVigente.toFixed(2).replace(".", ",")}% a.a.`}
          subvalue="Referência B3 atualizada"
          icon={Percent}
        />
        <StatCard
          label="Volume ofertado 24h"
          value={formatarMoeda(volume24h)}
          subvalue="Total de ordens abertas"
          icon={Activity}
        />
        <StatCard
          label="Ofertas ativas"
          value={contagens.Ofertadas + contagens.Aceitas}
          subvalue="Na mesa de liquidez"
          icon={Layers}
        />
      </div>

      {/* 3. Seção "Acessadas recentemente" */}
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">
            Acessadas recentemente
          </h2>
          <p className="text-xs text-gray-500">
            Bancos consultados recentemente na mesa de crédito
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BANCOS_RECENTES.map((banco) => (
            <Card
              key={banco.id}
              className="p-4 flex flex-col justify-between hover:border-gray-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-gray-900 group-hover:text-black transition-colors">
                  {banco.nome}
                </span>
                <span className="text-xs font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                  {banco.taxaCdi}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                Linha disponível: <strong className="text-gray-800">{formatarMoeda(banco.limite)}</strong> ({banco.prazo})
              </div>
              <button
                type="button"
                onClick={() => setBusca(banco.nome)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:text-black transition-colors cursor-pointer self-start"
              >
                <span>Ver novamente</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Seção "Impacto das propostas selecionadas no limite" */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">
              Impacto das propostas selecionadas no limite
            </h2>
            <p className="text-xs text-gray-500">
              Simulação de consumo do limite de crédito caso as propostas marcadas sejam aceitas
            </p>
          </div>
          <div className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full self-start sm:self-auto">
            Total selecionado: <strong className="text-gray-900 font-mono">{formatarMoeda(totalValorSelecionado)}</strong> ({totalPercentualComprometido}%)
          </div>
        </div>

        {/* Barras Comparativas */}
        {propostasSelecionadas.length === 0 ? (
          <div className="py-4 text-center text-xs text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            Nenhuma proposta selecionada. Marque as caixas "Comparar" nos cards para simular o impacto.
          </div>
        ) : (
          <div className="space-y-3">
            {propostasSelecionadas.map((prop) => {
              const perc = Math.min(100, Math.round((prop.valor / limiteTotal) * 100));
              return (
                <div key={prop.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-700">
                      {prop.contraparte} ({prop.id})
                    </span>
                    <span className="font-mono text-gray-900 font-semibold">
                      {formatarMoeda(prop.valor)} • {perc}% do limite
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-neutral-900 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${perc}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* 5. Seção "Propostas de crédito" */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            Propostas de crédito
          </h2>
          <p className="text-xs text-gray-500">
            Ofertas ativas e históricas disponíveis na mesa interbancária
          </p>
        </div>

        {/* Abas de Filtro */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_LIST.map((aba) => {
            const count = contagens[aba] ?? 0;
            const ativa = filtroStatus === aba;
            return (
              <button
                key={aba}
                type="button"
                onClick={() => setFiltroStatus(aba)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  ativa
                    ? "bg-neutral-900 text-white font-semibold shadow-2xs"
                    : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200/80"
                }`}
              >
                {aba} ({count})
              </button>
            );
          })}
        </div>

        {/* Barra de Busca, Filtros, Comparar e Visualização */}
        <div className="bg-white rounded-xl border border-gray-200/90 p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por banco, valor, taxa ou ID..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm rounded-lg border border-gray-200 bg-gray-50/60 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Botão Somente Minhas */}
            <button
              type="button"
              onClick={() => setSomenteMinhas((prev) => !prev)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                somenteMinhas
                  ? "bg-gray-900 text-white border-transparent"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Minhas ofertas
            </button>

            {/* Botão Comparar */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 border border-gray-200 text-gray-800">
              <CheckSquare className="w-3.5 h-3.5 text-gray-500" />
              <span>Comparando ({selecionadasComparacao.length})</span>
            </div>

            {/* Alternador Grid / Tabela */}
            <div className="inline-flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setVisualizacao("grid")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  visualizacao === "grid"
                    ? "bg-white text-neutral-900 shadow-2xs"
                    : "text-gray-400 hover:text-gray-700"
                }`}
                title="Visualização em Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setVisualizacao("table")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  visualizacao === "table"
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
        {operacoesFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-sm font-medium text-gray-600">
              Nenhuma proposta encontrada com os filtros atuais.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Tente alterar os termos de busca ou o status selecionado.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setBusca("");
                setFiltroStatus("Todas");
                setSomenteMinhas(false);
              }}
            >
              Limpar filtros
            </Button>
          </div>
        ) : visualizacao === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {operacoesFiltradas.map((operacao) => (
              <OfertaCard key={operacao.id} operacao={operacao} />
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
                  {operacoesFiltradas.map((operacao) => (
                    <OfertaRow key={operacao.id} operacao={operacao} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
