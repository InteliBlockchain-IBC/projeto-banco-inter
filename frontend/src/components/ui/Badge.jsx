export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  className = "",
  dot = false,
}) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const variantStyles = {
    neutral: "bg-gray-100 text-gray-700 border border-gray-200/80",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    accepted: "bg-emerald-50 text-emerald-700 border border-transparent",
    danger: "bg-rose-50 text-rose-700 border border-transparent",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
    dark: "bg-neutral-900 text-white border border-transparent",
  };

  const dotColors = {
    neutral: "bg-gray-500",
    success: "bg-emerald-500",
    danger: "bg-rose-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
    dark: "bg-gray-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dotColors[variant] || dotColors.neutral
          }`}
        />
      )}
      {children}
    </span>
  );
}
