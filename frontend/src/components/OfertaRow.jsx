import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import Button from "./ui/Button";
import { formatarMoeda } from "../services/mockOperacoes";
import { useOperacoes } from "../context/OperacoesContext";
import { Bookmark } from "lucide-react";

export default function OfertaRow({ operacao, mostrarComparacao = true, mostrarSalvar = true }) {
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

  return (
    <tr className="border-b border-gray-100">
      {mostrarComparacao && <td className="py-3 px-3">
        <input
          type="checkbox"
          checked={isSelecionada}
          onChange={() => alternarSelecaoComparacao(operacao.id)}
          className="compare-checkbox"
        />
      </td>}
      <td className="py-3 px-3 font-mono text-xs font-semibold text-gray-500">
        <div className="flex items-center gap-1.5">
          {mostrarSalvar && <button
            type="button"
            onClick={() => alternarSalvar(operacao.id)}
            className="text-gray-300 hover:text-neutral-900 cursor-pointer"
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${operacao.salva ? "fill-neutral-900 text-neutral-900" : ""}`}
            />
          </button>}
          <span>{operacao.id}</span>
        </div>
      </td>
      <td className="py-3 px-3 text-sm font-medium text-gray-900">
        {operacao.contraparte}
      </td>
      <td className="py-3 px-3 text-sm font-bold text-gray-900">
        {formatarMoeda(operacao.valor)}
      </td>
      <td className="py-3 px-3 text-xs font-mono font-medium text-gray-800">
        {operacao.taxaCdi}
      </td>
      <td className="py-3 px-3 text-xs text-gray-600">
        {operacao.prazoTexto || `${operacao.prazoDias} dia(s)`}
      </td>
      <td className="py-3 px-3">
        <StatusBadge status={operacao.status} size="sm" />
      </td>
      <td className="py-3 px-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {isOfertada && operacao.minha && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => solicitarCancelamentoOferta(operacao)}
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
            >
              Aceitar
            </Button>
          )}

        </div>
      </td>
    </tr>
  );
}
