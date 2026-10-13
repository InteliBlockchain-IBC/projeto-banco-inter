export default function Card({ children, className = "", onClick, hoverable = false, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200/90 shadow-xs p-5 ${
        hoverable || onClick ? "transition-all duration-150 hover:border-inter-orange hover:shadow-md cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
