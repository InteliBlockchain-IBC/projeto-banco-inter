export default function StatCard({
  label,
  value,
  subvalue,
  badge,
  icon: Icon,
  className = "",
}) {
  return (
    <div
      className={`flex min-h-40 min-w-0 flex-col justify-between rounded-xl border border-gray-200/90 bg-white p-5 shadow-xs ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-gray-500">
          {label}
        </span>
        {Icon && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50"><Icon className="h-4 w-4 text-inter-orange" aria-hidden="true" /></span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <strong className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{value}</strong>
        {badge && <span>{badge}</span>}
      </div>
      {subvalue && (
        <div className="text-xs text-gray-500">{subvalue}</div>
      )}
    </div>
  );
}
