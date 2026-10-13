import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { formatarMoeda } from "../../services/mockOperacoes";
import { Wallet } from "lucide-react";
import { useCarteira } from "../../context/CarteiraContext";
import { abreviarEndereco } from "../../services/metamask";
import CarteiraControles from "../CarteiraControles";
import CarteiraAviso from "../CarteiraAviso";

export default function ConfirmarOperacaoModal({
  operacao,
  isOpen,
  onClose,
  onConfirmar,
}) {
  const { conta, conectada, rede, naSepolia } = useCarteira();
  if (!operacao) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar operação"
      subtitle="Confira os termos da tomada de recursos"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Resumo da operação */}
        <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-4 divide-y divide-gray-200/60 text-sm">
          <div className="flex justify-between py-2 first:pt-0">
            <span className="text-gray-500 font-medium text-xs">Operação</span>
            <span className="font-semibold text-gray-900">{operacao.id}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500 font-medium text-xs">Contraparte</span>
            <span className="font-semibold text-gray-900">{operacao.contraparte}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500 font-medium text-xs">Valor do crédito</span>
            <span className="font-bold text-gray-900">{formatarMoeda(operacao.valor)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500 font-medium text-xs">Taxa negociada</span>
            <span className="font-semibold text-gray-900">{operacao.taxaCdi}</span>
          </div>
          <div className="flex justify-between py-2 last:pb-0">
            <span className="text-gray-500 font-medium text-xs">Prazo de liquidação</span>
            <span className="font-semibold text-gray-900">{operacao.prazoTexto || `${operacao.prazoDias} dia(s)`}</span>
          </div>
        </div>

        {/* Assinatura Digital e Carteira */}
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-800">
                Carteira MetaMask
              </span>
            </div>
            <Badge variant={conectada ? "success" : "neutral"} size="sm" dot>
              {conectada ? "Conectada" : "Não conectada"}
            </Badge>
          </div>
          <div className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            <span className="font-mono text-xs text-gray-600" title={conta || undefined}>
              {abreviarEndereco(conta)}
            </span>
            <span className="text-[11px] text-gray-400 font-medium">{conectada ? rede : "Sem conexão"}</span>
          </div>
          {(!conectada || !naSepolia) && <CarteiraControles />}
          <CarteiraAviso />
          <p className="text-[11px] text-gray-500 pt-1">Este aceite é uma simulação. Nenhuma assinatura ou transação será solicitada à MetaMask.</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => onConfirmar(operacao)}>
            Simular aceite
          </Button>
        </div>
      </div>
    </Modal>
  );
}
