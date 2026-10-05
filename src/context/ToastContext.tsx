import { AnimatePresence, motion } from 'framer-motion';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ToastCtx = { toast: (msg: string) => void };

const Ctx = createContext<ToastCtx>({ toast: () => undefined });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);

  const toast = useCallback((m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 2200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <AnimatePresence>
        {msg && (
          <motion.div
            key={msg}
            initial={{ opacity: 0, y: 24, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 16, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            style={{
              position: 'fixed',
              left: '50%',
              bottom: 'calc(100px + var(--safe-b))',
              background: 'var(--ink)',
              color: 'var(--bg)',
              padding: '12px 22px',
              borderRadius: 99,
              fontWeight: 700,
              zIndex: 90,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
