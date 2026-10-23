import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { formatCurrency } from "../../services/mockOperations";
import { Wallet } from "lucide-react";
import { useWallet } from "../../context/WalletContext";
import { shortenAddress } from "../../services/metamask";
import WalletControls from "../WalletControls";
import WalletNotice from "../WalletNotice";

export default function ConfirmOperationModal({
  operation,
  isOpen,
  onClose,
  onConfirm,
}) {
  const { account, connected, network, isSepolia } = useWallet();
  if (!operation) return null;

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
            <span className="font-semibold text-gray-900">{operation.id}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500 font-medium text-xs">Contraparte</span>
            <span className="font-semibold text-gray-900">{operation.counterparty}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500 font-medium text-xs">Valor do crédito</span>
            <span className="font-bold text-gray-900">{formatCurrency(operation.value)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500 font-medium text-xs">Taxa negociada</span>
            <span className="font-semibold text-gray-900">{operation.cdiRate}</span>
          </div>
          <div className="flex justify-between py-2 last:pb-0">
            <span className="text-gray-500 font-medium text-xs">Prazo de liquidação</span>
            <span className="font-semibold text-gray-900">{operation.termLabel || `${operation.termDays} dia(s)`}</span>
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
            <Badge variant={connected ? "success" : "neutral"} size="sm" dot>
              {connected ? "Conectada" : "Não conectada"}
            </Badge>
          </div>
          <div className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            <span className="font-mono text-xs text-gray-600" title={account || undefined}>
              {shortenAddress(account)}
            </span>
            <span className="text-[11px] text-gray-400 font-medium">{connected ? network : "Sem conexão"}</span>
          </div>
          {(!connected || !isSepolia) && <WalletControls />}
          <WalletNotice />
          <p className="text-[11px] text-gray-500 pt-1">Este aceite é uma simulação. Nenhuma assinatura ou transação será solicitada à MetaMask.</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => onConfirm(operation)}>
            Simular aceite
          </Button>
        </div>
      </div>
    </Modal>
  );
}
