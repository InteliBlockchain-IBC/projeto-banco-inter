import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useOperations } from "../../context/OperationsContext";

export default function NewOfferModal({ isOpen, onClose }) {
  const { publicarNovaOferta, instituicaoAtual } = useOperations();
  const [value, setValue] = useState("");
  const [cdiRate, setCdiRate] = useState("101.5");
  const [termDays, setTermDays] = useState("1");
  const [error, setError] = useState("");

  const terms = [
    { dias: "1", label: "1 dia (Overnight)" },
    { dias: "2", label: "2 dias" },
    { dias: "7", label: "7 dias" },
    { dias: "15", label: "15 dias" },
    { dias: "30", label: "30 dias" },
  ];

  function handleSubmit(e) {
    e.preventDefault();
    const numericValue = parseFloat(value.replace(/\./g, "").replace(",", "."));
    const numericRate = parseFloat(cdiRate.replace(",", "."));

    if (!numericValue || isNaN(numericValue) || numericValue <= 0) {
      setError("Informe um valor válido em reais (R$).");
      return;
    }
    if (!numericRate || isNaN(numericRate) || numericRate <= 0) {
      setError("Informe uma taxa CDI válida.");
      return;
    }

    const termOption = terms.find((p) => p.dias === termDays) || {
      label: `${termDays} dia(s)`,
    };

    publicarNovaOferta({
      value: numericValue,
      cdiRate: numericRate,
      termDays: Number(termDays),
      termLabel: termOption.label,
    });

    onClose();
  }

  function handleValueChange(e) {
    setError("");
    // Apenas números e pontuação
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setValue("");
      return;
    }
    const val = (Number(raw) / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setValue(val);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova oferta de crédito"
      subtitle="Publique uma nova oferta de liquidez na mesa interbancária"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Instituição ofertante
          </label>
          <input
            type="text"
            disabled
            value={`${instituicaoAtual} (Sua instituição)`}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-500 cursor-not-allowed select-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Valor da oferta (R$)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-sm font-medium text-gray-500">
              R$
            </span>
            <input
              type="text"
              placeholder="50.000.000,00"
              value={value}
              onChange={handleValueChange}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-inter-orange focus:outline-none focus:ring-1 focus:ring-inter-orange"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Taxa CDI (% do CDI)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="101,5"
              value={cdiRate}
              onChange={(e) => {
                setError("");
                setCdiRate(e.target.value);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 pr-12 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-inter-orange focus:outline-none focus:ring-1 focus:ring-inter-orange"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-medium text-gray-500">
              % CDI
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Prazo
          </label>
          <select
            value={termDays}
            onChange={(e) => setTermDays(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-inter-orange focus:outline-none focus:ring-1 focus:ring-inter-orange cursor-pointer"
          >
            {terms.map((p) => (
              <option key={p.dias} value={p.dias}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg bg-gray-50 border border-gray-200/80 p-3 text-xs text-gray-600 leading-relaxed">
          A oferta ficará disponível para todas as instituições participantes até o fechamento da grade ou cancelamento.
        </div>

        {error && (
          <div className="text-xs text-rose-600 font-medium">{error}</div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Publicar oferta
          </Button>
        </div>
      </form>
    </Modal>
  );
}
