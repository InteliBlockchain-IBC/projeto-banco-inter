import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import Button from "./ui/Button";
import { formatCurrency } from "../services/mockOperations";
import { useOperations } from "../context/OperationsContext";
import { Bookmark } from "lucide-react";

export default function OfferRow({ operation, showComparison = true, showSave = true }) {
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
    <tr className="border-b border-gray-100">
      {showComparison && <td className="py-3 px-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleComparisonSelection(operation.id)}
          className="compare-checkbox"
        />
      </td>}
      <td className="py-3 px-3 font-mono text-xs font-semibold text-gray-500">
        <div className="flex items-center gap-1.5">
          {showSave && <button
            type="button"
            onClick={() => toggleSaved(operation.id)}
            className="text-gray-300 hover:text-neutral-900 cursor-pointer"
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${operation.saved ? "fill-neutral-900 text-neutral-900" : ""}`}
            />
          </button>}
          <span>{operation.id}</span>
        </div>
      </td>
      <td className="py-3 px-3 text-sm font-medium text-gray-900">
        {operation.counterparty}
      </td>
      <td className="py-3 px-3 text-sm font-bold text-gray-900">
        {operation.formattedAmount ?? formatCurrency(operation.value)}
      </td>
      <td className="py-3 px-3 text-xs font-mono font-medium text-gray-800">
        {operation.cdiRate}
      </td>
      <td className="py-3 px-3 text-xs text-gray-600">
        {operation.termLabel || `${operation.termDays} dia(s)`}
      </td>
      <td className="py-3 px-3">
        <StatusBadge status={operation.status} size="sm" />
      </td>
      <td className="py-3 px-3 text-right">
        <div className="flex items-center justify-end gap-2">
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
      </td>
    </tr>
  );
}
