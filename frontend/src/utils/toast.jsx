import React, { createContext, useContext, useState, useCallback } from 'react';

// Toast Context
const ToastContext = createContext(null);

// useToast Hook
// Call addToast({ message, type }) from any component wrapped by
// <ToastProvider>.
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// Toast Styles (inline — no external CSS needed)
const TOAST_COLORS = {
  success: { bg: '#059669', icon: '✅' },
  error:   { bg: '#dc2626', icon: '❌' },
  info:    { bg: '#2563eb', icon: 'ℹ️' },
  warning: { bg: '#d97706', icon: '⚠️' },
};

const containerStyle = {
  position: 'fixed',
  top: 20,
  right: 20,
  zIndex: 99999,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  pointerEvents: 'none',
};

const toastStyle = (type) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 20px',
  borderRadius: 10,
  background: TOAST_COLORS[type]?.bg || TOAST_COLORS.info.bg,
  color: '#fff',
  fontSize: 14,
  fontWeight: 500,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
  animation: 'toast-slide-in 0.35s ease forwards',
  pointerEvents: 'auto',
  maxWidth: 380,
  wordBreak: 'break-word',
});

const closeBtnStyle = {
  marginLeft: 'auto',
  background: 'none',
  border: 'none',
  color: '#fff',
  fontSize: 18,
  cursor: 'pointer',
  padding: '0 0 0 12px',
  lineHeight: 1,
  opacity: 0.8,
};

// Inject a keyframe animation once.
if (typeof document !== 'undefined') {
  const id = '__toast_keyframes__';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes toast-slide-in {
        from { opacity: 0; transform: translateX(80px); }
        to   { opacity: 1; transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
  }
}

// ToastProvider
let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    // Auto-dismiss after `duration` ms.
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container rendered at root level */}
      <div style={containerStyle}>
        {toasts.map((t) => (
          <div key={t.id} style={toastStyle(t.type)}>
            <span>{TOAST_COLORS[t.type]?.icon}</span>
            <span>{t.message}</span>
            <button style={closeBtnStyle} onClick={() => removeToast(t.id)} aria-label="Close">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
