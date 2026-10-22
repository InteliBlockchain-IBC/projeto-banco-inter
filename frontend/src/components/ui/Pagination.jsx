export const ITEMS_PER_PAGE = 12;

export default function Pagination({ page, totalItems, onPageChange, alwaysShow = false }) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (totalItems === 0 || (totalPages <= 1 && !alwaysShow)) return null;

  const start = (page - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(page * ITEMS_PER_PAGE, totalItems);

  return (
    <nav aria-label="Paginação" className="grid grid-cols-1 items-center justify-items-center gap-2 pt-2 lg:grid-cols-[1fr_auto_1fr]">
      <span className="text-xs text-gray-500 lg:justify-self-start">Mostrando {start}–{end} de {totalItems}</span>
      <div className="flex flex-wrap items-center justify-center gap-1">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40">Anterior</button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
          <button key={number} type="button" onClick={() => onPageChange(number)} aria-label={`Página ${number}`} aria-current={page === number ? "page" : undefined} className={`min-w-8 cursor-pointer rounded-lg px-2 py-1.5 text-xs font-semibold ${page === number ? "bg-inter-orange text-white" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"}`}>{number}</button>
        ))}
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40">Próxima</button>
      </div>
      <span aria-hidden="true" />
    </nav>
  );
}
