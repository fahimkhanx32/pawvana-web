import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

const tones = {
  success: { Icon: CircleCheck, cls: 'text-brand' },
  error: { Icon: CircleAlert, cls: 'text-danger' },
  info: { Icon: Info, cls: 'text-accent' },
};

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const id = useRef(0);

  const dismiss = useCallback((i) => setItems((s) => s.filter((t) => t.id !== i)), []);
  const push = useCallback((type, message, ms = 4200) => {
    const i = ++id.current;
    setItems((s) => [...s.slice(-3), { id: i, type, message }]);
    setTimeout(() => dismiss(i), ms);
  }, [dismiss]);

  const api = useMemo(() => ({
    success: (m) => push('success', m),
    error: (m) => push('error', m, 6000),
    info: (m) => push('info', m),
  }), [push]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 bottom-[calc(80px+env(safe-area-inset-bottom))] z-[120] flex flex-col gap-2 md:inset-x-auto md:bottom-6 md:right-6 md:w-[380px]"
      >
        {items.map((t) => {
          const { Icon, cls } = tones[t.type];
          return (
            <div key={t.id} role="status" className="panel pointer-events-auto flex animate-pop items-start gap-3 p-3.5 pr-2.5 !bg-surface">
              <Icon size={20} className={`mt-0.5 shrink-0 ${cls}`} aria-hidden />
              <p className="min-w-0 flex-1 break-words text-[15px] leading-snug">{t.message}</p>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted hover:bg-surface2">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
