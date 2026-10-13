import { X } from "lucide-react";
import { useCarteira } from "../context/CarteiraContext";
import { METAMASK_DOWNLOAD_URL } from "../services/metamask";

export default function CarteiraAviso() {
  const { erro, disponivel, limparErro } = useCarteira();
  if (!erro) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50" role="alert">
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-3 px-4 py-3 text-xs text-amber-800 sm:px-6 lg:px-8">
        <p>
          {erro}
          {!disponivel && <a href={METAMASK_DOWNLOAD_URL} target="_blank" rel="noreferrer" className="ml-2 font-semibold underline">Instalar MetaMask</a>}
        </p>
        <button type="button" onClick={limparErro} aria-label="Fechar aviso da carteira" className="shrink-0 cursor-pointer rounded p-0.5 hover:bg-amber-100"><X className="h-4 w-4" aria-hidden="true" /></button>
      </div>
    </div>
  );
}
