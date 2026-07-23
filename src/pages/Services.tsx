import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Wrench } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { Skeleton } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useServices } from "@/hooks/useServices";
import { STATUS_LABELS, STATUS_ORDER, ServiceStatus } from "@/types";
import { cn } from "@/lib/utils";

export default function Services() {
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | undefined>(undefined);
  const { data: services, isLoading } = useServices({ status: statusFilter });
  const navigate = useNavigate();

  return (
    <div className="pb-24">
      <PageHeader title="Serviços" subtitle="Todas as ordens de serviço" />

      <div className="px-5">
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setStatusFilter(undefined)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              !statusFilter ? "bg-brand-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            )}
          >
            Todos
          </button>
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                statusFilter === s ? "bg-brand-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : services && services.length > 0 ? (
          <div className="space-y-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-500">
              <Wrench className="h-7 w-7" />
            </div>
            <p className="font-display font-bold text-slate-700 dark:text-slate-200">Nenhum serviço ainda</p>
            <p className="mt-1 text-sm text-slate-400">Cadastre o primeiro serviço para começar.</p>
            <Button className="mt-4" onClick={() => navigate("/servicos/novo")}>
              <Plus className="h-4 w-4" /> Novo serviço
            </Button>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate("/servicos/novo")}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/30 transition-transform active:scale-90"
        aria-label="Novo serviço"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
