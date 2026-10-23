import { useEffect, useState } from "react";
import { CheckCheck, Copy, ExternalLink } from "lucide-react";
import { shortenHash, addressExplorerUrl, transactionExplorerUrl } from "../utils/formatters";
import { useEnvironment } from "../context/EnvironmentContext";

// Hash abreviado (6 + 4) com link para o explorer da Sepolia e botão de copiar.
// tipo="endereco" usa a rota /address do explorer.
export default function TransactionHash({ value, type = "tx", className = "" }) {
  const { demo } = useEnvironment();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!value) return null;

  const url = demo ? null : type === "endereco" ? addressExplorerUrl(value) : transactionExplorerUrl(value);
  const description = type === "endereco" ? "endereço" : "transação";

  async function copy() {
    try {
      await navigator.clipboard?.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title={value}
          aria-label={`Abrir ${description} ${value} no explorer da Sepolia`}
          className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 font-mono text-xs text-neutral-900 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inter-orange"
        >
          {shortenHash(value)}
          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
        </a>
      ) : (
        <span title={value} className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-neutral-900">
          {shortenHash(value)}
        </span>
      )}
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? `${description} copiado` : `Copiar ${description} completo`}
        title={copied ? "Copiado" : "Copiar"}
        className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inter-orange"
      >
        {copied ? (
          <CheckCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copiado para a área de transferência" : ""}
      </span>
    </span>
  );
}
