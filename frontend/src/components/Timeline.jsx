import { Check } from "lucide-react";

const ETAPAS = ["Ofertada", "Aceita", "Liquidada"];

export default function Timeline({ status }) {
  if (status === "Cancelada") {
    return (
      <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200/80 rounded-lg p-2.5 my-3">
        Ciclo interrompido — oferta cancelada antes do aceite.
      </div>
    );
  }

  const indiceAtual = ETAPAS.indexOf(status);

  return (
    <div className="my-5">
      <div className="flex items-center justify-between relative max-w-sm mx-auto">
        <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-gray-200 -z-0" />
        <div
          className="absolute left-4 top-3.5 h-0.5 bg-neutral-900 -z-0 transition-all duration-300"
          style={{
            width:
              indiceAtual === 0 ? "0%" : indiceAtual === 1 ? "50%" : "100%",
          }}
        />

        {ETAPAS.map((etapa, i) => {
          const feita = i <= indiceAtual;
          const atual = i === indiceAtual;
          return (
            <div key={etapa} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shadow-2xs transition-colors ${
                  feita
                    ? "bg-neutral-900 text-white"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
              >
                {feita ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : i + 1}
              </div>
              <span
                className={`text-[11px] mt-1.5 font-medium ${
                  atual
                    ? "text-gray-900 font-bold"
                    : feita
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {etapa}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
