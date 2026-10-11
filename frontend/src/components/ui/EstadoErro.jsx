import { AlertTriangle, RotateCw } from "lucide-react";
import Button from "./Button";

// Mensagem de erro com ação de nova tentativa (doc §3: "Tentar novamente").
export default function EstadoErro({
  titulo,
  mensagem,
  correlationId,
  onTentarNovamente,
  children,
  className = "",
}) {
  return (
    <div
      role="alert"
      className={`mx-auto max-w-lg rounded-xl border border-rose-200 bg-white p-8 text-center ${className}`}
    >
      <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-rose-600" aria-hidden="true" />
      <h2 className="mb-1 text-lg font-bold text-gray-900">{titulo}</h2>
      {mensagem && <p className="text-sm text-gray-600">{mensagem}</p>}
      {correlationId && (
        <p className="mt-2 font-mono text-[11px] text-gray-400">Código de suporte: {correlationId}</p>
      )}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {onTentarNovamente && (
          <Button variant="primary" onClick={onTentarNovamente}>
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Tentar novamente
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
