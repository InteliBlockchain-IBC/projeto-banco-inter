import { useAmbiente } from "../context/AmbienteContext";

export default function FonteDadosAviso() {
  const { demonstracao, status } = useAmbiente();
  if (status !== "ok" || !demonstracao) return null;
  return (
    <div role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
      Ambiente de demonstração com PostgreSQL: endereços, blocos e hashes são sintéticos. As ações são gravadas pela API; não há assinatura na Sepolia.
    </div>
  );
}
