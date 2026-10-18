import { CheckCircle2, Clock3 } from "lucide-react";
import HashTransacao from "./HashTransacao";
import Button from "./ui/Button";

export default function IndexacaoPendenteAviso({ hash, onClose }) {
  return (
    <div role="status" className="space-y-5 text-sm text-gray-700">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />
        <p>A transação foi confirmada na Sepolia. Agora falta o backend atualizar os dados da aplicação.</p>
      </div>
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950">
        <Clock3 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p>Isso normalmente leva alguns segundos e pode chegar a cerca de 1 minuto, dependendo da frequência com que o backend consulta a blockchain.</p>
      </div>
      {hash && <p className="text-xs">Hash da transação: <HashTransacao valor={hash} /></p>}
      <div className="flex justify-end">
        <Button type="button" onClick={onClose}>Entendi</Button>
      </div>
    </div>
  );
}
