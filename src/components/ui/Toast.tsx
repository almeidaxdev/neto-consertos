import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  show: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
  error: <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
  info: <Info className="h-5 w-5 text-brand-500 shrink-0" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type: ToastType, message: string) => {
      const id = crypto.randomUUID();
      setItems((prev) => [...prev, { id, type, message }]);
      setTimeout(() => remove(id), 3200);
    },
    [remove]
  );

  const value: ToastContextValue = {
    show,
    success: (m) => show("success", m),
    error: (m) => show("error", m),
    info: (m) => show("info", m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-0 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pt-safe pointer-events-none safe-top" style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-2xl border bg-white dark:bg-slate-900 px-4 py-3 shadow-lg",
                t.type === "success" && "border-emerald-200 dark:border-emerald-900",
                t.type === "error" && "border-red-200 dark:border-red-900",
                t.type === "info" && "border-brand-200 dark:border-brand-900"
              )}
            >
              {icons[t.type]}
              <p className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
