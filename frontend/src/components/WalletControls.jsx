import { Link } from "react-router-dom";
import { LoaderCircle, Wallet } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { shortenAddress } from "../services/metamask";
import Button from "./ui/Button";

export default function WalletControls({ compact = false }) {
  const { account, connected, isSepolia, pending, connect, disconnect, switchToSepolia } = useWallet();

  if (compact && connected) {
    return (
      <Link to="/perfil" title={`Carteira ${account}`} aria-label={`Ver carteira ${account}`} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-inter-orange">
        <Wallet className="h-4 w-4" aria-hidden="true" />
        <span className="hidden xl:inline">{shortenAddress(account)}</span>
        <span className={`h-2 w-2 rounded-full ${isSepolia ? "bg-emerald-500" : "bg-amber-500"}`} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!connected ? (
        <Button size="sm" onClick={connect} disabled={Boolean(pending)} aria-busy={Boolean(pending)} aria-label={pending ? "Conectando MetaMask" : "Conectar MetaMask"} title="Conectar MetaMask" className={compact ? "px-2 xl:px-3" : ""}>
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Wallet className="h-4 w-4" aria-hidden="true" />}
          <span className={compact ? "hidden xl:inline" : ""}>{pending ? "Conectando..." : "Conectar MetaMask"}</span>
        </Button>
      ) : (
        <>
          {!isSepolia && (
            <Button size="sm" onClick={switchToSepolia} disabled={Boolean(pending)} aria-busy={Boolean(pending)}>
              {pending && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {pending ? "Aguardando MetaMask..." : "Trocar para Sepolia"}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={disconnect} disabled={Boolean(pending)}>Desconectar do app</Button>
        </>
      )}
    </div>
  );
}
