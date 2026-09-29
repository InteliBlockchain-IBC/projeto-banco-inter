import DropdownSelect from "./ui/DropdownSelect";

export default function GraficoMinhasOfertas({ dados, periodo, onPeriodoChange }) {
  const { colunas, totais, descricao } = dados;
  const maiorValor = Math.max(1, totais.aceitas, totais.negadas);

  const series = [
    { chave: "aceitas", nome: "Aceitas", cor: "bg-inter-orange" },
    { chave: "negadas", nome: "Negadas", cor: "bg-gray-400" },
  ];

  return (
    <section className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 text-gray-900 shadow-2xs sm:p-6" aria-labelledby="titulo-grafico-ofertas">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="titulo-grafico-ofertas" className="text-base font-semibold">Evolução das ofertas</h2>
          <p className="mt-1 text-xs text-gray-500">{descricao}</p>
        </div>
        <DropdownSelect
          label="Período do gráfico"
          value={periodo}
          onChange={onPeriodoChange}
          options={[
            { value: "semana", label: "Semana" },
            { value: "mes", label: "Mês" },
            { value: "semestre", label: "Semestre" },
          ]}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-4 sm:gap-6">
        <div className="min-w-14">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="h-2 w-2 rounded-full bg-gray-900" />
            Feitas
          </div>
          <strong className="mt-1 block text-xl font-semibold tabular-nums">{totais.feitas}</strong>
        </div>
        {series.map(({ chave, nome, cor }) => (
          <div key={chave} className="min-w-14">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={`h-2 w-2 rounded-full ${cor}`} />
              {nome}
            </div>
            <strong className="mt-1 block text-xl font-semibold tabular-nums">{totais[chave]}</strong>
          </div>
        ))}
      </div>

      <div
        className="mt-auto grid items-end gap-2 pt-5 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${colunas.length}, minmax(0, 1fr))` }}
        aria-label={`Gráfico ${descricao.toLowerCase()}: ${totais.feitas} ofertas feitas, ${totais.negadas} negadas e ${totais.aceitas} aceitas.`}
      >
        {colunas.map((coluna) => (
          <div key={coluna.label} className="min-w-0">
            <div className="flex h-36 items-end justify-center gap-1 border-b border-gray-200 sm:h-44">
              {series.map(({ chave, nome, cor }) => (
                <div
                  key={chave}
                  className={`group/bar relative w-3 max-w-5 flex-1 rounded-t-md transition-[height] duration-500 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 ${cor}`}
                  style={{ height: coluna[chave] ? `${coluna[chave] / maiorValor * 100}%` : "0%" }}
                  tabIndex={0}
                  aria-label={`Até ${coluna.label}: ${coluna[chave]} ofertas ${nome.toLowerCase()}`}
                >
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover/bar:opacity-100 group-focus/bar:opacity-100">
                    {coluna.label}: {coluna[chave]} {nome.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2 text-center text-[10px] tabular-nums text-gray-500 sm:text-xs">{coluna.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
