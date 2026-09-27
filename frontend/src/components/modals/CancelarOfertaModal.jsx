import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { formatarMoeda } from "../../services/mockOperacoes";
import { AlertCircle } from "lucide-react";

export default function CancelarOfertaModal({
  operacao,
  isOpen,
  onClose,
  onConfirmar,
}) {
  if (!operacao) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancelar oferta?"
      subtitle="Confirme o cancelamento da oferta publicada na mesa"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-xl text-rose-800 text-xs leading-relaxed">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            Você está prestes a cancelar a oferta <strong>{operacao.id}</strong>. Esta ação não poderá ser desfeita e a oferta sairá da mesa de negociações imediatamente.
          </div>
        </div>

        {/* Resumo em destaque */}
        <div className="bg-gray-50 border border-gray-200/90 rounded-xl p-4 text-center">
          <span className="text-xs font-medium text-gray-500 block mb-1">
            Identificação e Valor da Oferta
          </span>
          <div className="text-lg font-bold text-gray-900 font-mono">
            {operacao.id} — {formatarMoeda(operacao.valor)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Taxa: {operacao.taxaCdi} • Prazo: {operacao.prazoTexto || `${operacao.prazoDias} dia(s)`}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>
            Voltar
          </Button>
          <Button
            variant="primary"
            onClick={() => onConfirmar(operacao)}
          >
            Confirmar cancelamento
          </Button>
        </div>
      </div>
    </Modal>
  );
}
