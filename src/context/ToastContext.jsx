// src/context/ToastContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import PropTypes from "prop-types";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const showToast = useCallback(
    (
      message,
      type = "info",
      duration = 3000,
      actionText = null,
      onAction = null
    ) => {
      if (!message) return;

      const id = `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;

      setToasts((prev) => [
        ...prev,
        { id, message, type, actionText, onAction },
      ]);

      const timeoutId = setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        timersRef.current.delete(id);
      }, duration);

      timersRef.current.set(id, timeoutId);
    },
    []
  );

  /* ------------------------------------------------------------------ */
  /* Cleanup on unmount                                                  */
  /* ------------------------------------------------------------------ */

  React.useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2 w-[90%] max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={
              "flex items-center justify-between px-4 py-3 rounded-md shadow-md text-sm " +
              "animate-fade-slide-in transition-all duration-300 " +
              {
                info: "bg-gray-800 text-white",
                success: "bg-green-600 text-white",
                error: "bg-red-600 text-white",
              }[toast.type]
            }
          >
            <span className="pr-2">{toast.message}</span>

            {toast.actionText && toast.onAction && (
              <button
                onClick={() => {
                  toast.onAction();
                  setToasts((prev) =>
                    prev.filter((t) => t.id !== toast.id)
                  );
                }}
                className="ml-4 underline font-semibold active:scale-95 transition-transform duration-100"
              >
                {toast.actionText}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* PropTypes                                                          */
/* ------------------------------------------------------------------ */

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/* ------------------------------------------------------------------ */
/* Consumer hook                                                       */
/* ------------------------------------------------------------------ */

export function useToast() {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    return {
      showToast: () => { },
    };
  }

  return ctx;
}
