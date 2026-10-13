import { Link } from "react-router-dom";
import { LoaderCircle, Wallet } from "lucide-react";
import { useCarteira } from "../context/CarteiraContext";
import { abreviarEndereco } from "../services/metamask";
import Button from "./ui/Button";

export default function CarteiraControles({ compacto = false }) {
  const { conta, conectada, naSepolia, pendente, conectar, desconectar, trocarParaSepolia } = useCarteira();

  if (compacto && conectada) {
    return (
      <Link to="/perfil" title={`Carteira ${conta}`} aria-label={`Ver carteira ${conta}`} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-inter-orange">
        <Wallet className="h-4 w-4" aria-hidden="true" />
        <span className="hidden xl:inline">{abreviarEndereco(conta)}</span>
        <span className={`h-2 w-2 rounded-full ${naSepolia ? "bg-emerald-500" : "bg-amber-500"}`} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!conectada ? (
        <Button size="sm" onClick={conectar} disabled={Boolean(pendente)} aria-busy={Boolean(pendente)} aria-label={pendente ? "Conectando MetaMask" : "Conectar MetaMask"} title="Conectar MetaMask" className={compacto ? "px-2 xl:px-3" : ""}>
          {pendente ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Wallet className="h-4 w-4" aria-hidden="true" />}
          <span className={compacto ? "hidden xl:inline" : ""}>{pendente ? "Conectando..." : "Conectar MetaMask"}</span>
        </Button>
      ) : (
        <>
          {!naSepolia && (
            <Button size="sm" onClick={trocarParaSepolia} disabled={Boolean(pendente)} aria-busy={Boolean(pendente)}>
              {pendente && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {pendente ? "Aguardando MetaMask..." : "Trocar para Sepolia"}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={desconectar} disabled={Boolean(pendente)}>Desconectar do app</Button>
        </>
      )}
    </div>
  );
}
