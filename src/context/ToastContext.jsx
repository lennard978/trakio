// src/context/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    (message, type = "info", duration = 3000, actionText = null, onAction = null) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, type, actionText, onAction }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2 w-[90%] max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={
              "flex items-center justify-between px-4 py-3 rounded-md shadow-md text-sm animate-fade-slide-in transition-all duration-300 " +
              {
                info: "bg-gray-800 text-white",
                success: "bg-green-600 text-white",
                error: "bg-red-600 text-white",
              }[toast.type]
            }
          >
            <span>{toast.message}</span>
            {toast.actionText && toast.onAction && (
              <button
                onClick={toast.onAction}
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

export function useToast() {
  return useContext(ToastContext);
}
