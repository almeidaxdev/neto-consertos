import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

// Rotas onde o atalho flutuante de "nova OS" não deve aparecer
// (o próprio formulário de cadastro, edição e a tela de detalhes já têm o contexto).
const HIDE_FAB_PREFIXES = ["/servicos/novo", "/servicos/"];

function shouldHideFab(pathname: string) {
  if (pathname === "/servicos") return false;
  return HIDE_FAB_PREFIXES.some((p) => pathname.startsWith(p));
}

// O formulário de cadastro/edição tem sua própria barra de ação fixa no rodapé
// (botão "Cadastrar"/"Salvar"). Ocultamos a navegação inferior nessas telas para
// evitar que os dois elementos fixos se sobreponham.
function isFullScreenFormRoute(pathname: string) {
  return pathname === "/servicos/novo" || /^\/servicos\/[^/]+\/editar$/.test(pathname);
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideFab = shouldHideFab(location.pathname);
  const hideBottomNav = isFullScreenFormRoute(location.pathname);

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-surface-light dark:bg-surface-dark">
      <main className={hideBottomNav ? "pb-4" : "pb-24"}>
        <Outlet />
      </main>

      {!hideFab && !hideBottomNav && (
        <button
          onClick={() => navigate("/servicos/novo")}
          aria-label="Nova ordem de serviço"
          className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/30 transition-transform active:scale-90"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>
      )}

      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
