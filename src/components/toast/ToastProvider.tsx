import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  createToast,
  type ToastItem,
} from './toastState';
import { ToastContext } from './toastContext';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, duration?: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const nextToast = createToast(message, duration);
    setToast(nextToast);
    timeoutRef.current = setTimeout(() => setToast(null), nextToast.duration);
  }, []);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <div
          key={toast.id}
          role="status"
          className="fixed bottom-8 left-1/2 z-[100] flex min-h-10 w-[min(342px,calc(100vw-48px))] -translate-x-1/2 items-center justify-center rounded-xl bg-[#1c1c1c] px-4 py-3 text-center text-[13px] leading-[1.3] font-medium text-[#f9f9f9] shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
        >
          {toast.message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}
