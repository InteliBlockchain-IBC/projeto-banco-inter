import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen = true,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-lg",
  showClose = true,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl border border-gray-200/90 shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto flex flex-col transition-transform`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            {showClose && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors cursor-pointer -mr-2 -mt-1"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
