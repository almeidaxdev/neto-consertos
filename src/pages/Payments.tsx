import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Badge";
import { Badge } from "@/components/ui/Badge";
import { useAllPayments } from "@/hooks/usePayments";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type FilterStatus = "todos" | "pago" | "parcial" | "pendente";

const statusStyles: Record<Exclude<FilterStatus, "todos">, string> = {
  pago: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
  parcial: "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400",
  pendente: "bg-slate-100 dark:bg-slate-800 text-slate-500",
};

const statusLabels: Record<Exclude<FilterStatus, "todos">, string> = {
  pago: "Pago",
  parcial: "Parcial",
  pendente: "Pendente",
};

export default function Payments() {
  const { data, isLoading } = useAllPayments();
  const [filter, setFilter] = useState<FilterStatus>("todos");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === "todos") return data;
    return data.filter((d) => d.status === filter);
  }, [data, filter]);

  const totals = useMemo(() => {
    if (!data) return { totalValue: 0, totalPaid: 0, totalRemaining: 0 };
    return data.reduce(
      (acc, d) => ({
        totalValue: acc.totalValue + Number(d.service.service_value),
        totalPaid: acc.totalPaid + d.totalPaid,
        totalRemaining: acc.totalRemaining + d.remaining,
      }),
      { totalValue: 0, totalPaid: 0, totalRemaining: 0 }
    );
  }, [data]);

  return (
    <div className="pb-24">
      <PageHeader title="Pagamentos" subtitle="Controle financeiro por serviço" />

      <div className="px-5">
        <div className="grid grid-cols-3 gap-2.5">
          <Card className="p-3 text-center">
            <p className="text-[11px] text-slate-400">Total</p>
            <p className="font-display text-sm font-bold text-slate-900 dark:text-white truncate" title={formatCurrency(totals.totalValue)}>
              {formatCurrency(totals.totalValue)}
            </p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-[11px] text-slate-400">Pago</p>
            <p className="font-display text-sm font-bold text-emerald-600 truncate" title={formatCurrency(totals.totalPaid)}>
              {formatCurrency(totals.totalPaid)}
            </p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-[11px] text-slate-400">Restante</p>
            <p className="font-display text-sm font-bold text-orange-500 truncate" title={formatCurrency(totals.totalRemaining)}>
              {formatCurrency(totals.totalRemaining)}
            </p>
          </Card>
        </div>

        <div className="no-scrollbar mt-4 mb-3 flex gap-2 overflow-x-auto">
          {(["todos", "pago", "parcial", "pendente"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold capitalize transition-colors",
                filter === f ? "bg-brand-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(({ service, totalPaid, remaining, status }) => (
              <Card
                key={service.id}
                className="cursor-pointer p-4"
                onClick={() => navigate(`/servicos/${service.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-400">OS #{service.os_number}</p>
                    <p className="truncate font-semibold text-slate-900 dark:text-white">{service.client_name}</p>
                    <p className="truncate text-xs text-slate-400">{service.equipment}</p>
                  </div>
                  <Badge className={statusStyles[status]}>{statusLabels[status]}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800 pt-2 text-sm">
                  <div>
                    <span className="text-xs text-slate-400">Pago </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Restante </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(remaining)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-500">
              <Wallet className="h-7 w-7" />
            </div>
            <p className="font-display font-bold text-slate-700 dark:text-slate-200">Nenhum resultado</p>
            <p className="mt-1 text-sm text-slate-400">Nenhum serviço encontrado com esse filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
}
