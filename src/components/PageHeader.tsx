import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}

export function PageHeader({ title, subtitle, back, right }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-lg safe-top">
      <div className="flex items-center gap-2 px-5 pb-4 pt-5">
        {back && (
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="-ml-2.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 active:bg-slate-100 dark:active:bg-slate-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white truncate">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
