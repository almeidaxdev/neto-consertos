import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";

export function AppLayout() {
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-surface-light dark:bg-surface-dark">
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
