import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  variant?: "mark" | "full" | "stacked";
}

/**
 * Identidade visual Neto Consertos.
 * O monograma "N" e "C" compartilham uma diagonal comum, formando um único
 * traço contínuo que remete a um circuito/ferramenta sendo "consertada" —
 * a diagonal também funciona como uma seta ascendente (progresso/reparo).
 */
export function LogoMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="48" height="48" rx="13" fill="url(#nc-grad)" />
      <path
        d="M14 33V15.6c0-.9 1.1-1.35 1.74-.71L30 29.2"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30 15v18"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M35 24.5l-5-5.2v10.4l5-5.2z"
        fill="white"
      />
      <defs>
        <linearGradient id="nc-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({ className, size = 40, variant = "full" }: LogoProps) {
  if (variant === "mark") return <LogoMark size={size} className={className} />;

  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <LogoMark size={size} />
        <div className="text-center">
          <p className="font-display text-xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
            Neto Consertos
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
            Assistência Técnica
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <div className="leading-none">
        <p className="font-display text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">
          Neto Consertos
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
          Assistência Técnica
        </p>
      </div>
    </div>
  );
}
