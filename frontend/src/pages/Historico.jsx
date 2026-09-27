import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import {
  formatarDataHora,
  formatarMoeda,
  BANCOS_RECENTES,
} from "../services/mockOperacoes";
import { useOperacoes } from "../context/OperacoesContext";
import {
  Search,
  Download,
  ExternalLink,
  Blocks,
  ArrowUpRight,
} from "lucide-react";

export default function Historico() {
  const { operacoes } = useOperacoes();
  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState("Todos");
  const [statusFiltro, setStatusFiltro] = useState("Todos os status");

  const periodos = ["Hoje", "7 dias", "30 dias", "Todos"];
  const statusOpcoes = [
    "Todos os status",
    "Liquidada",
    "Aceita",
    "Ofertada",
    "Cancelada",
  ];

  // Ordenadas da mais recente para a mais antiga
  const listaHistorico = useMemo(() => {
    let filtradas = [...operacoes].sort(
      (a, b) => new Date(b.criadaEm) - new Date(a.criadaEm)
    );

    if (statusFiltro !== "Todos os status") {
      filtradas = filtradas.filter((o) => o.status === statusFiltro);
    }

    if (busca.trim()) {
      const termo = busca.toLowerCase();
      filtradas = filtradas.filter(
        (o) =>
          o.id.toLowerCase().includes(termo) ||
          o.contraparte.toLowerCase().includes(termo) ||
          (o.hash && o.hash.toLowerCase().includes(termo)) ||
          (o.bloco && String(o.bloco).includes(termo))
      );
    }

    return filtradas;
  }, [operacoes, statusFiltro, busca]);

  function handleExportar() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Contraparte,Valor,Taxa,Prazo,Status,Data,Hash"]
        .concat(
          listaHistorico.map(
            (o) =>
              `${o.id},"${o.contraparte}",${o.valor},"${o.taxaCdi}","${o.prazoTexto}",${o.status},${o.criadaEm},${o.hash || ""}`
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
          Registros auditáveis e liquidação em blockchain de todas as operações interfinanceiras.
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
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm rounded-lg border border-gray-200 bg-gray-50/60 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-400"
            />
          </div>

          {/* Chips de Intervalo de Tempo */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {periodos.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodo(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  periodo === p
                    ? "bg-neutral-900 text-white font-semibold"
                    : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                {p}
              </button>
            ))}

            {/* Select Status */}
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 border border-transparent text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              {statusOpcoes.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Botão Exportar */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportar}
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
          <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <Blocks className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">
              Rastreabilidade blockchain
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
              Os registros técnicos das operações ficam centralizados neste Histórico: rede Sepolia, hash, bloco e confirmações.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <Badge variant="neutral" size="md">
            Rede: Sepolia
          </Badge>
          <a
            href="https://sepolia.etherscan.io"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:text-black"
          >
            <span>Explorador Etherscan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 4. Seção "Acessadas recentemente" */}
      <div>
        <div className="mb-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Acessadas recentemente
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BANCOS_RECENTES.map((banco) => (
            <Card key={banco.id} className="p-3.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-gray-900 block">
                  {banco.nome}
                </span>
                <span className="text-[11px] text-gray-400">
                  {banco.taxaCdi} • {formatarMoeda(banco.limite)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBusca(banco.nome)}
                className="text-xs font-medium text-neutral-900 hover:text-black flex items-center gap-1 cursor-pointer"
              >
                <span>Filtrar</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </Card>
          ))}
        </div>
      </div>

      {/* 5. Seção "Operações" (Grid de Cards de Registros Históricos) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            Operações ({listaHistorico.length})
          </h2>
          <p className="text-xs text-gray-500">
            Livro de ordens auditado e registros de liquidação financeira
          </p>
        </div>

        {listaHistorico.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-sm font-medium text-gray-600">
              Nenhuma operação encontrada com os critérios informados.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Verifique o status ou os termos da busca.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listaHistorico.map((op) => (
              <Card
                key={op.id}
                className="p-4 flex flex-col justify-between hover:border-gray-300 transition-all"
              >
                <div>
                  {/* Topo */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-900">
                      {op.contraparte}
                    </span>
                    <StatusBadge status={op.status} size="sm" />
                  </div>

                  <div className="text-[11px] text-gray-400 mb-2">
                    {op.id} • {formatarDataHora(op.criadaEm)}
                  </div>

                  {/* Valor Principal */}
                  <div className="mb-3">
                    <span className="text-[11px] text-gray-400 block mb-0.5">
                      Valor
                    </span>
                    <div className="text-lg font-bold text-gray-900 font-sans tracking-tight">
                      {formatarMoeda(op.valor)}
                    </div>
                  </div>

                  {/* Taxa e Prazo */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-gray-100 mb-3">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Taxa CDI</span>
                      <span className="font-semibold text-gray-900 font-mono">
                        {op.taxaCdi}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Prazo</span>
                      <span className="font-semibold text-gray-900">
                        {op.prazoTexto || `${op.prazoDias} dia(s)`}
                      </span>
                    </div>
                  </div>

                  {/* Hash Blockchain se houver */}
                  <div className="mb-3">
                    <span className="text-[11px] text-gray-400 block mb-0.5">
                      Hash do Bloco
                    </span>
                    <span className="text-[11px] font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded block truncate border border-gray-100">
                      {op.hash || "Pendente de confirmação"}
                    </span>
                  </div>
                </div>

                {/* Rodapé do Card */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/operacoes/${op.id}`)}
                  >
                    Ver detalhes
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
