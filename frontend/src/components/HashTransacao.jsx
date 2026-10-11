import { useEffect, useState } from "react";
import { CheckCheck, Copy, ExternalLink } from "lucide-react";
import { abreviarHash, urlExplorerEndereco, urlExplorerTx } from "../utils/formatadores";

// Hash abreviado (6 + 4) com link para o explorer da Sepolia e botão de copiar.
// tipo="endereco" usa a rota /address do explorer.
export default function HashTransacao({ valor, tipo = "tx", className = "" }) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return undefined;
    const timer = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(timer);
  }, [copiado]);

  if (!valor) return null;

  const url = tipo === "endereco" ? urlExplorerEndereco(valor) : urlExplorerTx(valor);
  const descricao = tipo === "endereco" ? "endereço" : "transação";

  async function copiar() {
    try {
      await navigator.clipboard?.writeText(valor);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title={valor}
          aria-label={`Abrir ${descricao} ${valor} no explorer da Sepolia`}
          className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 font-mono text-xs text-neutral-900 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inter-orange"
        >
          {abreviarHash(valor)}
          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
        </a>
      ) : (
        <span title={valor} className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-neutral-900">
          {abreviarHash(valor)}
        </span>
      )}
      <button
        type="button"
        onClick={copiar}
        aria-label={copiado ? `${descricao} copiado` : `Copiar ${descricao} completo`}
        title={copiado ? "Copiado" : "Copiar"}
        className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inter-orange"
      >
        {copiado ? (
          <CheckCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {copiado ? "Copiado para a área de transferência" : ""}
      </span>
    </span>
  );
}
