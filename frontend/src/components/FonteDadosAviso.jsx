import { useAmbiente } from "../context/AmbienteContext";
import { useCarteira } from "../context/CarteiraContext";
import { abreviarEndereco } from "../services/metamask";

export default function FonteDadosAviso() {
  const { demonstracao, status, limiteOperador } = useAmbiente();
  const { conta } = useCarteira();
  if (status !== "ok") return null;
  if (!demonstracao && conta && !limiteOperador?.isRegistered) {
    return (
      <div role="alert" className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
        <strong>Carteira não cadastrada.</strong> A conta {abreviarEndereco(conta)} não está habilitada como instituição neste contrato. Solicite o cadastro ao administrador para operar na Sepolia.
      </div>
    );
  }
  if (!demonstracao) return null;
  return (
    <div role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
      Ambiente de demonstração: endereços, blocos e hashes são sintéticos. As ações são registradas pela API; não há assinatura na Sepolia.
    </div>
  );
}
