"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const value: ToastContextType = {
    success: (title, message) => addToast("success", title, message),
    error: (title, message) => addToast("error", title, message),
    info: (title, message) => addToast("info", title, message),
    warning: (title, message) => addToast("warning", title, message),
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: <FaCheckCircle className="text-amber-400 text-lg flex-shrink-0" />,
    error: <FaTimesCircle className="text-red-400 text-lg flex-shrink-0" />,
    info: <FaInfoCircle className="text-blue-400 text-lg flex-shrink-0" />,
    warning: <FaExclamationTriangle className="text-amber-400 text-lg flex-shrink-0" />,
  };

  const borders: Record<ToastType, string> = {
    success: "border-l-4 border-amber-500",
    error: "border-l-4 border-red-500",
    info: "border-l-4 border-blue-500",
    warning: "border-l-4 border-amber-500",
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`bg-[#1a2332] text-white rounded-xl shadow-2xl p-4 flex items-start gap-3 pointer-events-auto animate-in slide-in-from-right duration-300 ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{toast.title}</p>
              {toast.message && <p className="text-xs text-gray-400 mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
