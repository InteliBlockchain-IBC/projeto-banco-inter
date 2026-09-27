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
      className={`bg-white rounded-xl border border-gray-200/90 shadow-xs p-4 flex-1 min-w-[200px] transition-all hover:border-gray-300 ${className}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </span>
        {badge && <span>{badge}</span>}
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
        {value}
      </div>
      {subvalue && (
        <div className="text-xs text-gray-500 mt-1">{subvalue}</div>
      )}
    </div>
  );
}
