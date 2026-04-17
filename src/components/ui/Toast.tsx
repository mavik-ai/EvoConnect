'use client';

import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return { toasts, showToast, removeToast: (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)) };
};

export const ToastContainer: React.FC<{ toasts: Toast[], removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 1000 }}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => removeToast(toast.id)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
      ))}
      <style jsx>{`
        .toast {
          padding: 12px 20px;
          border-radius: 12px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          min-width: 300px;
          animation: slideIn 0.3s ease-out;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .toast-success { background: rgba(16, 185, 129, 0.9); }
        .toast-error { background: rgba(239, 68, 68, 0.9); }
        .toast-info { background: rgba(59, 130, 246, 0.9); }
        
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
