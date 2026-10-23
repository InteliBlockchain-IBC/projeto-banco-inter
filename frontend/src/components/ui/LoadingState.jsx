// Skeleton genérico: `linhas` blocos pulsando enquanto a API responde.
export default function LoadingState({ rows = 5, label = "Carregando dados", className = "" }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={`space-y-3 ${className}`}>
      <span className="sr-only">{label}…</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" aria-hidden="true" />
      ))}
    </div>
  );
}
