'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  variant: ToastVariant;
  message: string;
};

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, variant, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const Icon = t.variant === 'success' ? CheckCircle2 : t.variant === 'error' ? XCircle : Info;
          const color =
            t.variant === 'success' ? '#16A34A' : t.variant === 'error' ? '#DC2626' : '#2563EB';
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm backdrop-blur-xl animate-slide-in-right"
              style={{
                background: 'rgba(255, 255, 255, 0.92)',
                border: '1px solid var(--admin-border)',
                boxShadow: 'var(--shadow-pop)',
                minWidth: '260px',
                maxWidth: '380px',
              }}
            >
              <Icon size={16} style={{ color }} />
              <span className="flex-1" style={{ color: 'var(--admin-text)' }}>
                {t.message}
              </span>
              <button
                onClick={() => dismiss(t.id)}
                className="p-0.5 rounded hover:bg-black/[0.05]"
                style={{ color: 'var(--admin-text-faint)' }}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
