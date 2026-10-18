import { Check } from "lucide-react";

const STAGES = ["Ofertada", "Aceita", "Liquidada"];

export default function Timeline({ status }) {
  if (status === "Cancelada" || status === "Negada") {
    return (
      <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200/80 rounded-lg p-2.5 my-3">
        {status === "Negada"
          ? "Oferta negada pela contraparte antes do aceite."
          : "Ciclo interrompido — oferta cancelada antes do aceite."}
      </div>
    );
  }

  if (status === "Expirada") {
    return (
      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 my-3">
        Oferta expirou sem aceite — o prazo de validade terminou antes da liquidação.
      </div>
    );
  }

  const currentIndex = STAGES.indexOf(status);

  return (
    <div className="my-5">
      <div className="flex items-center justify-between relative max-w-sm mx-auto">
        <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-gray-200 -z-0" />
        <div
          className="absolute left-4 top-3.5 h-0.5 bg-inter-orange -z-0 transition-all duration-300"
          style={{
            width:
              currentIndex === 0 ? "0%" : currentIndex === 1 ? "50%" : "100%",
          }}
        />

        {STAGES.map((stage, i) => {
          const completed = i <= currentIndex;
          const current = i === currentIndex;
          return (
            <div key={stage} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shadow-2xs transition-colors ${
                  completed
                    ? "bg-inter-orange text-white"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
              >
                {completed ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : i + 1}
              </div>
              <span
                className={`text-[11px] mt-1.5 font-medium ${
                  current
                    ? "text-gray-900 font-bold"
                    : completed
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
