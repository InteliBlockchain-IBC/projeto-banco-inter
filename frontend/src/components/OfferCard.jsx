import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import Button from "./ui/Button";
import { formatCurrency } from "../services/mockOperations";
import { useOperations } from "../context/OperationsContext";
import { Bookmark } from "lucide-react";

export default function OfferCard({ operation, showComparison = true, showSave = true }) {
  const navigate = useNavigate();
  const {
    toggleSaved,
    comparisonSelection,
    toggleComparisonSelection,
  } = useOperations();

  const isSelected = comparisonSelection.includes(operation.id);
  const isOffered = operation.status === "Ofertada";
  // Dados reais da API: aceitar/cancelar só com assinatura on-chain (ainda não integrada).

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs p-5 flex flex-col justify-between">
      {/* Topo do Card */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">
              {operation.counterparty}
            </span>
            <span className="text-xs font-mono font-medium text-gray-400">
              {operation.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {showSave && <button
              type="button"
              onClick={() => toggleSaved(operation.id)}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                operation.saved
                  ? "text-neutral-900 bg-gray-100"
                  : "text-gray-300 hover:text-gray-600 hover:bg-gray-50"
              }`}
              title={operation.saved ? "Salva nos favoritos" : "Salvar proposta"}
            >
              <Bookmark
                className={`w-4 h-4 ${
                  operation.saved ? "fill-current" : ""
                }`}
              />
            </button>}
            <StatusBadge status={operation.status} size="sm" />
          </div>
        </div>

        {/* Valor Principal */}
        <div className="mb-4">
          <span className="text-xs font-medium text-gray-400 block mb-0.5">
            Valor ofertado
          </span>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 font-sans tracking-tight">
            {operation.formattedAmount ?? formatCurrency(operation.value)}
          </div>
        </div>

        {/* Taxa e Prazo */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 mb-4 text-xs">
          <div>
            <span className="text-gray-400 block mb-0.5">Taxa CDI</span>
            <span className="font-bold text-gray-900 font-mono">
              {operation.cdiRate}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Prazo</span>
            <span className="font-bold text-gray-900">
              {operation.termLabel || `${operation.termDays} dia(s)`}
            </span>
          </div>
        </div>

        {/* Impacto no limite & checkbox de simulação */}
        {operation.impactoLimite != null && <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500 font-medium">Impacto no limite</span>
            <span className="font-semibold text-gray-900 font-mono">
              {operation.impactoLimite}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-inter-orange h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, operation.impactoLimite)}%` }}
            />
          </div>
        </div>}
      </div>

      {/* Rodapé de Ações */}
      <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
        {showComparison && <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleComparisonSelection(operation.id)}
            className="compare-checkbox"
          />
          <span className="text-[11px]">Comparar</span>
        </label>}

        <div className={`flex items-center gap-2 ${showComparison ? "" : "ml-auto"}`}>
          {isOffered && operation.mine && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => navigate(`/operacoes/${operation.rawId}`)}
            >
              Cancelar
            </Button>
          )}

          <Button
            variant="details"
            size="sm"
            onClick={() => navigate(`/operacoes/${operation.rawId}`)}
          >
            Ver detalhes
          </Button>

          {isOffered && !operation.mine && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/operacoes/${operation.rawId}`)}
            >
              Aceitar
            </Button>
          )}

        </div>
      </div>
    </div>
  );
}
