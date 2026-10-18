import { useEnvironment } from "../context/EnvironmentContext";
import { useWallet } from "../context/WalletContext";
import { shortenAddress } from "../services/metamask";

export default function DataSourceNotice() {
  const { demo, status, operatorLimit } = useEnvironment();
  const { account } = useWallet();
  if (status !== "ok") return null;
  if (!demo && account && !operatorLimit?.isRegistered) {
    return (
      <div role="alert" className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
        <strong>Cadastro ainda não localizado.</strong> A API ainda não encontrou a conta {shortenAddress(account)}. Se o cadastro foi recente, aguarde a sincronização da Sepolia; caso contrário, confirme o endereço com o administrador.
      </div>
    );
  }
  if (!demo) return null;
  return (
    <div role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
      Ambiente de demonstração: endereços, blocos e hashes são sintéticos. As ações são registradas pela API; não há assinatura na Sepolia.
    </div>
  );
}
