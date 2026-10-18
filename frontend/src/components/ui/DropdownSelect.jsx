import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function DropdownSelect({ value, options, onChange, label, className = "" }) {
  const [isOpen, setOpen] = useState(false);
  const root = useRef(null);
  const optionRefs = useRef([]);
  const selected = options.findIndex((option) => option.value === value);
  const current = options[selected]?.label ?? value;

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeOnOutsideClick(event) {
      if (!root.current?.contains(event.target)) setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [isOpen]);

  function select(option) {
    onChange(option.value);
    setOpen(false);
    root.current?.querySelector("button")?.focus();
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setOpen(false);
      root.current?.querySelector("button")?.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const currentIndex = optionRefs.current.indexOf(document.activeElement);
      if (!isOpen) {
        setOpen(true);
        requestAnimationFrame(() => optionRefs.current[selected >= 0 ? selected : 0]?.focus());
      } else {
        const next = (currentIndex + direction + options.length) % options.length;
        optionRefs.current[next]?.focus();
      }
    }
  }

  return (
    <div ref={root} className={`relative shrink-0 ${className}`} onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-inter-orange focus:outline-none focus:ring-2 focus:ring-inter-orange/30"
      >
        <span className="whitespace-nowrap">{current}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {isOpen && (
        <div role="menu" aria-label={label} className="absolute right-0 top-full z-30 mt-1 min-w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(element) => { optionRefs.current[index] = element; }}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value}
              onClick={() => select(option)}
              className={`block w-full cursor-pointer whitespace-nowrap rounded-md px-3 py-2 text-left text-xs transition-colors focus:outline-none focus:bg-orange-50 ${option.value === value ? "bg-orange-50 font-semibold text-inter-orange" : "text-gray-700 hover:bg-gray-50"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
