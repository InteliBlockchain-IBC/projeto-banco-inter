import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function DropdownSelect({ value, options, onChange, label, className = "" }) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef(null);
  const opcoes = useRef([]);
  const selecionada = options.findIndex((opcao) => opcao.value === value);
  const atual = options[selecionada]?.label ?? value;

  useEffect(() => {
    if (!aberto) return undefined;

    function fecharAoClicarFora(event) {
      if (!raiz.current?.contains(event.target)) setAberto(false);
    }

    document.addEventListener("pointerdown", fecharAoClicarFora);
    return () => document.removeEventListener("pointerdown", fecharAoClicarFora);
  }, [aberto]);

  function selecionar(opcao) {
    onChange(opcao.value);
    setAberto(false);
    raiz.current?.querySelector("button")?.focus();
  }

  function aoTeclar(event) {
    if (event.key === "Escape") {
      setAberto(false);
      raiz.current?.querySelector("button")?.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direcao = event.key === "ArrowDown" ? 1 : -1;
      const indiceAtual = opcoes.current.indexOf(document.activeElement);
      if (!aberto) {
        setAberto(true);
        requestAnimationFrame(() => opcoes.current[selecionada >= 0 ? selecionada : 0]?.focus());
      } else {
        const proximo = (indiceAtual + direcao + options.length) % options.length;
        opcoes.current[proximo]?.focus();
      }
    }
  }

  return (
    <div ref={raiz} className={`relative shrink-0 ${className}`} onKeyDown={aoTeclar}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((anterior) => !anterior)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-inter-orange focus:outline-none focus:ring-2 focus:ring-inter-orange/30"
      >
        <span className="whitespace-nowrap">{atual}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform ${aberto ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {aberto && (
        <div role="menu" aria-label={label} className="absolute right-0 top-full z-30 mt-1 min-w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          {options.map((opcao, indice) => (
            <button
              key={opcao.value}
              ref={(elemento) => { opcoes.current[indice] = elemento; }}
              type="button"
              role="menuitemradio"
              aria-checked={opcao.value === value}
              onClick={() => selecionar(opcao)}
              className={`block w-full cursor-pointer whitespace-nowrap rounded-md px-3 py-2 text-left text-xs transition-colors focus:outline-none focus:bg-orange-50 ${opcao.value === value ? "bg-orange-50 font-semibold text-inter-orange" : "text-gray-700 hover:bg-gray-50"}`}
            >
              {opcao.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
