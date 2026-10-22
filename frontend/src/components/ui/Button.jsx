export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  type = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-lg gap-2",
    lg: "px-5 py-2.5 text-base rounded-xl gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-inter-orange text-white hover:bg-inter-orange-hover active:bg-inter-orange-active shadow-xs border border-transparent",
    secondary:
      "bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 border border-gray-200",
    outline:
      "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 active:bg-gray-100",
    details:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-200 hover:border-gray-400 hover:text-gray-900 hover:shadow-sm active:bg-gray-300",
    export:
      "bg-white text-gray-700 border border-gray-300 hover:bg-inter-orange hover:border-inter-orange hover:text-white active:bg-inter-orange-active",
    ghost:
      "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 active:bg-gray-200 border border-transparent",
    destructive:
      "bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 active:bg-rose-100",
    "destructive-solid":
      "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-xs border border-transparent",
    dark:
      "bg-neutral-900 text-white hover:bg-black active:bg-neutral-950 shadow-xs",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
