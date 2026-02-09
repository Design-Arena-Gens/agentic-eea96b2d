"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useToastStore } from "../lib/stores/toast-store";

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    const timerIds = toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), toast.duration ?? 4000)
    );
    return () => timerIds.forEach(clearTimeout);
  }, [toasts, removeToast]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900/90 px-4 py-3 shadow-lg backdrop-blur"
        >
          <p className="text-sm font-semibold text-slate-100">{toast.title}</p>
          {toast.description ? (
            <p className="mt-1 text-xs text-slate-300">{toast.description}</p>
          ) : null}
        </div>
      ))}
    </div>,
    document.body
  );
}
