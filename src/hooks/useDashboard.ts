import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ServiceRow } from "@/types";
import { monthLabel } from "@/lib/utils";

export interface DashboardData {
  inProgressCount: number;
  finishedCount: number;
  monthRevenue: number;
  monthPartsCost: number;
  monthProfit: number;
  revenueSeries: { label: string; value: number }[];
  profitSeries: { label: string; value: number }[];
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<DashboardData> => {
      const { data, error } = await supabase.from("services").select("*");
      if (error) throw new Error(error.message);
      const services = (data ?? []) as ServiceRow[];

      const now = new Date();
      const inProgressCount = services.filter((s) => !["finalizado", "entregue"].includes(s.status)).length;
      const finishedCount = services.filter((s) => ["finalizado", "entregue"].includes(s.status)).length;

      const isSameMonth = (dateStr: string, monthsAgo: number) => {
        const d = new Date(dateStr);
        const target = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
        return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth();
      };

      const currentMonthServices = services.filter((s) => isSameMonth(s.created_at, 0));
      const monthRevenue = currentMonthServices.reduce((sum, s) => sum + Number(s.service_value), 0);
      const monthPartsCost = currentMonthServices.reduce((sum, s) => sum + Number(s.parts_cost), 0);
      const monthProfit = monthRevenue - monthPartsCost;

      const revenueSeries: { label: string; value: number }[] = [];
      const profitSeries: { label: string; value: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthServices = services.filter((s) => isSameMonth(s.created_at, i));
        const revenue = monthServices.reduce((sum, s) => sum + Number(s.service_value), 0);
        const partsCost = monthServices.reduce((sum, s) => sum + Number(s.parts_cost), 0);
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        revenueSeries.push({ label: monthLabel(d.getMonth()), value: revenue });
        profitSeries.push({ label: monthLabel(d.getMonth()), value: revenue - partsCost });
      }

      return { inProgressCount, finishedCount, monthRevenue, monthPartsCost, monthProfit, revenueSeries, profitSeries };
    },
  });
}
