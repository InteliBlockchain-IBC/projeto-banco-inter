export default function Card({ children, className = "", onClick, hoverable = false, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200/90 shadow-xs p-5 ${
        hoverable ? "hover:border-gray-300 hover:shadow-md transition-all duration-150 cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
