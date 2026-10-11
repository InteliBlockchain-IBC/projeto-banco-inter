import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import Button from "./ui/Button";
import { formatarMoeda } from "../services/mockOperacoes";
import { useOperacoes } from "../context/OperacoesContext";
import { Bookmark } from "lucide-react";
import { MENSAGEM_ASSINATURA_PENDENTE } from "../services/adaptadorOfertas";

export default function OfertaCard({ operacao, mostrarComparacao = true, mostrarSalvar = true }) {
  const navigate = useNavigate();
  const {
    solicitarAceiteOferta,
    solicitarCancelamentoOferta,
    alternarSalvar,
    selecionadasComparacao,
    alternarSelecaoComparacao,
  } = useOperacoes();

  const isSelecionada = selecionadasComparacao.includes(operacao.id);
  const isOfertada = operacao.status === "Ofertada";
  // Dados reais da API: aceitar/cancelar só com assinatura on-chain (ainda não integrada).
  const assinaturaPendente = operacao.origem === "api";

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs p-5 flex flex-col justify-between">
      {/* Topo do Card */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">
              {operacao.contraparte}
            </span>
            <span className="text-xs font-mono font-medium text-gray-400">
              {operacao.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {mostrarSalvar && <button
              type="button"
              onClick={() => alternarSalvar(operacao.id)}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                operacao.salva
                  ? "text-neutral-900 bg-gray-100"
                  : "text-gray-300 hover:text-gray-600 hover:bg-gray-50"
              }`}
              title={operacao.salva ? "Salva nos favoritos" : "Salvar proposta"}
            >
              <Bookmark
                className={`w-4 h-4 ${
                  operacao.salva ? "fill-current" : ""
                }`}
              />
            </button>}
            <StatusBadge status={operacao.status} size="sm" />
          </div>
        </div>

        {/* Valor Principal */}
        <div className="mb-4">
          <span className="text-xs font-medium text-gray-400 block mb-0.5">
            Valor ofertado
          </span>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 font-sans tracking-tight">
            {operacao.valorFormatado ?? formatarMoeda(operacao.valor)}
          </div>
        </div>

        {/* Taxa e Prazo */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 mb-4 text-xs">
          <div>
            <span className="text-gray-400 block mb-0.5">Taxa CDI</span>
            <span className="font-bold text-gray-900 font-mono">
              {operacao.taxaCdi}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Prazo</span>
            <span className="font-bold text-gray-900">
              {operacao.prazoTexto || `${operacao.prazoDias} dia(s)`}
            </span>
          </div>
        </div>

        {/* Impacto no limite & checkbox de simulação */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500 font-medium">Impacto no limite</span>
            <span className="font-semibold text-gray-900 font-mono">
              {operacao.impactoLimite || 10}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-inter-orange h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, operacao.impactoLimite || 10)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rodapé de Ações */}
      <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
        {mostrarComparacao && <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isSelecionada}
            onChange={() => alternarSelecaoComparacao(operacao.id)}
            className="compare-checkbox"
          />
          <span className="text-[11px]">Comparar</span>
        </label>}

        <div className={`flex items-center gap-2 ${mostrarComparacao ? "" : "ml-auto"}`}>
          {isOfertada && operacao.minha && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => solicitarCancelamentoOferta(operacao)}
              disabled={assinaturaPendente}
              title={assinaturaPendente ? MENSAGEM_ASSINATURA_PENDENTE : undefined}
            >
              Cancelar
            </Button>
          )}

          <Button
            variant="details"
            size="sm"
            onClick={() => navigate(`/operacoes/${operacao.rawId}`)}
          >
            Ver detalhes
          </Button>

          {isOfertada && !operacao.minha && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => solicitarAceiteOferta(operacao)}
              disabled={assinaturaPendente}
              title={assinaturaPendente ? MENSAGEM_ASSINATURA_PENDENTE : undefined}
            >
              Aceitar
            </Button>
          )}

        </div>
      </div>
    </div>
  );
}
