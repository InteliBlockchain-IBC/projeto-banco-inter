// Skeleton genérico: `linhas` blocos pulsando enquanto a API responde.
export default function EstadoCarregando({ linhas = 5, rotulo = "Carregando dados", className = "" }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={`space-y-3 ${className}`}>
      <span className="sr-only">{rotulo}…</span>
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" aria-hidden="true" />
      ))}
    </div>
  );
}
