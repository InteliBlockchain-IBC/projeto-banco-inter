export const ITENS_POR_PAGINA = 12;

export default function Paginacao({ pagina, totalItens, onPaginaChange, mostrarSempre = false }) {
  const totalPaginas = Math.ceil(totalItens / ITENS_POR_PAGINA);
  if (totalItens === 0 || (totalPaginas <= 1 && !mostrarSempre)) return null;

  const inicio = (pagina - 1) * ITENS_POR_PAGINA + 1;
  const fim = Math.min(pagina * ITENS_POR_PAGINA, totalItens);

  return (
    <nav aria-label="Paginação" className="grid grid-cols-1 items-center justify-items-center gap-2 pt-2 lg:grid-cols-[1fr_auto_1fr]">
      <span className="text-xs text-gray-500 lg:justify-self-start">Mostrando {inicio}–{fim} de {totalItens}</span>
      <div className="flex flex-wrap items-center justify-center gap-1">
        <button type="button" onClick={() => onPaginaChange(pagina - 1)} disabled={pagina === 1} className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40">Anterior</button>
        {Array.from({ length: totalPaginas }, (_, index) => index + 1).map((numero) => (
          <button key={numero} type="button" onClick={() => onPaginaChange(numero)} aria-label={`Página ${numero}`} aria-current={pagina === numero ? "page" : undefined} className={`min-w-8 cursor-pointer rounded-lg px-2 py-1.5 text-xs font-semibold ${pagina === numero ? "bg-inter-orange text-white" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"}`}>{numero}</button>
        ))}
        <button type="button" onClick={() => onPaginaChange(pagina + 1)} disabled={pagina === totalPaginas} className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40">Próxima</button>
      </div>
      <span aria-hidden="true" />
    </nav>
  );
}
