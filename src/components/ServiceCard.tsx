import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Smartphone, User } from "lucide-react";
import { ServiceRow } from "@/types";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/utils";

export function ServiceCard({ service }: { service: ServiceRow }) {
  const navigate = useNavigate();
  const profit = service.service_value - service.parts_cost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="cursor-pointer p-[18px] transition-shadow hover:shadow-card active:scale-[0.99]"
        onClick={() => navigate(`/servicos/${service.id}`)}
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              <Smartphone className="h-[22px] w-[22px]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400">OS #{service.os_number}</p>
              <p className="truncate font-display text-base font-bold text-slate-900 dark:text-white leading-tight">
                {service.equipment}
              </p>
              <p className="flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <User className="h-3 w-3 shrink-0" /> {service.client_name}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <StatusBadge status={service.status} />
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3.5">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Valor do serviço</p>
            <p className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
              {formatCurrency(service.service_value)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium text-slate-400">Lucro</p>
            <p className={`font-display text-[15px] font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {formatCurrency(profit)}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
