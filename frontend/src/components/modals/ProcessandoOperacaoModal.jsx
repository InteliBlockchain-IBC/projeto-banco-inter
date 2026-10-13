import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Check, Clock, Copy, CheckCheck, Loader2 } from "lucide-react";

export default function ProcessandoOperacaoModal({
  isOpen,
  onClose,
  dadosProcessando, // { operacao, hash, step }
}) {
  const navigate = useNavigate();
  const [copiado, setCopiado] = useState(false);

  if (!dadosProcessando) return null;

  const { operacao, hash, step = 2 } = dadosProcessando;
  const isFinalizado = step === 3;

  function handleCopiarHash() {
    if (hash) {
      navigator.clipboard?.writeText(hash);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  }

  function handleVerHistorico() {
    onClose();
    navigate("/historico");
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showClose={isFinalizado}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center pt-2">
        {/* Ícone no topo */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${
            isFinalizado
              ? "bg-emerald-100 text-emerald-600"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {isFinalizado ? (
            <Check className="w-7 h-7 stroke-[2.5]" />
          ) : (
            <Clock className="w-7 h-7 stroke-[2] animate-pulse" />
          )}
        </div>

        {/* Título & Subtítulo */}
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          {isFinalizado ? "Operação liquidada com sucesso!" : "Operação em processamento"}
        </h3>
        <p className="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed">
          {isFinalizado
            ? `A operação ${operacao?.id} foi confirmada e liquidada no livro de ordens.`
            : "Os dados estão sendo validados e registrados na rede blockchain."}
        </p>

        {/* Stepper Horizontal */}
        <div className="w-full my-6 px-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-6 right-6 top-4 h-0.5 bg-gray-200 -z-0" />
            <div
              className="absolute left-6 top-4 h-0.5 bg-inter-orange -z-0 transition-all duration-500"
              style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
            />

            {/* Passo 1 */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-medium text-gray-700 mt-2">
                Enviada
              </span>
            </div>

            {/* Passo 2 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-xs transition-colors ${
                  step >= 2
                    ? isFinalizado
                      ? "bg-emerald-500 text-white"
                      : "bg-inter-orange text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step === 2 ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFinalizado ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  "2"
                )}
              </div>
              <span className="text-[11px] font-medium text-gray-700 mt-2">
                Confirmação
              </span>
            </div>

            {/* Passo 3 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-xs transition-colors ${
                  isFinalizado
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isFinalizado ? <Check className="w-4 h-4 stroke-[2.5]" /> : "3"}
              </div>
              <span className="text-[11px] font-medium text-gray-700 mt-2">
                Finalizado
              </span>
            </div>
          </div>
        </div>

        {/* Caixa de Hash da transação */}
        <div className="w-full bg-gray-50 border border-gray-200/90 rounded-xl p-3.5 text-left mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-medium">Hash da transação</span>
            <span className="text-[11px] text-gray-400">Sepolia Testnet</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs text-gray-800 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <span>{hash || "Gerando hash da transação..."}</span>
            <button
              type="button"
              onClick={handleCopiarHash}
              className="text-gray-400 hover:text-gray-700 ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
              title="Copiar Hash"
            >
              {copiado ? (
                <CheckCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
            A confirmação pode levar alguns segundos dependendo do tempo de validação do bloco.
          </p>
        </div>

        {/* Botão de ação */}
        <Button
          variant="primary"
          className="w-full"
          onClick={handleVerHistorico}
        >
          Ver no histórico
        </Button>
      </div>
    </Modal>
  );
}
