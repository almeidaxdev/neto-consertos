import { NavLink } from "react-router-dom";
import { LayoutGrid, Wrench, Wallet, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Início", icon: LayoutGrid, end: true },
  { to: "/servicos", label: "Serviços", icon: Wrench },
  { to: "/pagamentos", label: "Pagamentos", icon: Wallet },
  { to: "/pesquisa", label: "Pesquisar", icon: Search },
  { to: "/mais", label: "Mais", icon: Menu },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400 dark:text-slate-500"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn("rounded-xl p-1.5 transition-colors", isActive && "bg-brand-50 dark:bg-brand-950")}>
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                </div>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
