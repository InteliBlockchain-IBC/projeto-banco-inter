import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useOperacoes } from "../../context/OperacoesContext";

export default function NovaOfertaModal({ isOpen, onClose }) {
  const { publicarNovaOferta, instituicaoAtual } = useOperacoes();
  const [valor, setValor] = useState("");
  const [taxaCdi, setTaxaCdi] = useState("101.5");
  const [prazoDias, setPrazoDias] = useState("1");
  const [erro, setErro] = useState("");

  const prazos = [
    { dias: "1", label: "1 dia (Overnight)" },
    { dias: "2", label: "2 dias" },
    { dias: "7", label: "7 dias" },
    { dias: "15", label: "15 dias" },
    { dias: "30", label: "30 dias" },
  ];

  function handleSubmit(e) {
    e.preventDefault();
    const numValor = parseFloat(valor.replace(/\./g, "").replace(",", "."));
    const numTaxa = parseFloat(taxaCdi.replace(",", "."));

    if (!numValor || isNaN(numValor) || numValor <= 0) {
      setErro("Informe um valor válido em reais (R$).");
      return;
    }
    if (!numTaxa || isNaN(numTaxa) || numTaxa <= 0) {
      setErro("Informe uma taxa CDI válida.");
      return;
    }

    const prazoObj = prazos.find((p) => p.dias === prazoDias) || {
      label: `${prazoDias} dia(s)`,
    };

    publicarNovaOferta({
      valor: numValor,
      taxaCdi: numTaxa,
      prazoDias: Number(prazoDias),
      prazoTexto: prazoObj.label,
    });

    onClose();
  }

  function handleValorChange(e) {
    setErro("");
    // Apenas números e pontuação
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setValor("");
      return;
    }
    const val = (Number(raw) / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setValor(val);
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
              value={valor}
              onChange={handleValorChange}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
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
              value={taxaCdi}
              onChange={(e) => {
                setErro("");
                setTaxaCdi(e.target.value);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 pr-12 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
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
            value={prazoDias}
            onChange={(e) => setPrazoDias(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
          >
            {prazos.map((p) => (
              <option key={p.dias} value={p.dias}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg bg-gray-50 border border-gray-200/80 p-3 text-xs text-gray-600 leading-relaxed">
          A oferta ficará disponível para todas as instituições participantes até o fechamento da grade ou cancelamento.
        </div>

        {erro && (
          <div className="text-xs text-rose-600 font-medium">{erro}</div>
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
