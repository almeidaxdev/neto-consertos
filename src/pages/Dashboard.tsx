import { AreaChart, Area, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Wrench, CheckCircle2, TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Badge";
import { useDashboard } from "@/hooks/useDashboard";
import { useServices } from "@/hooks/useServices";
import { formatCurrency } from "@/lib/utils";
import { ServiceCard } from "@/components/ServiceCard";
import { useNavigate } from "react-router-dom";

function MetricCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Wrench;
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "negative"
      ? "text-red-500"
      : "text-slate-900 dark:text-white";
  return (
    <Card className="p-4">
      <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={`font-display text-lg font-bold leading-snug truncate ${toneClass}`} title={value}>
        {value}
      </p>
    </Card>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useDashboard();
  const { data: recentServices } = useServices();
  const navigate = useNavigate();

  return (
    <div className="pb-6">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-lg px-5 pb-3 pt-4 safe-top">
        <Logo size={34} />
      </header>

      <div className="px-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="mb-1 text-sm text-slate-400">Visão geral</p>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          </div>
          <button
            onClick={() => navigate("/servicos/novo")}
            className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-card active:scale-[0.97] transition-transform"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Nova OS
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <MetricCard icon={Wrench} label="Em andamento" value={String(data?.inProgressCount ?? 0)} />
            <MetricCard icon={CheckCircle2} label="Finalizados" value={String(data?.finishedCount ?? 0)} />
            <MetricCard icon={DollarSign} label="Faturamento do mês" value={formatCurrency(data?.monthRevenue ?? 0)} />
            <MetricCard
              icon={data && data.monthProfit >= 0 ? TrendingUp : TrendingDown}
              label="Lucro do mês"
              value={formatCurrency(data?.monthProfit ?? 0)}
              tone={data && data.monthProfit >= 0 ? "positive" : "negative"}
            />
          </div>
        )}

        <Card className="mt-4 p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Faturamento mensal</p>
            <p className="text-xs text-slate-400">Últimos 6 meses</p>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueSeries ?? []} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="mt-3 p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Lucro mensal</p>
            <p className="text-xs text-slate-400">Últimos 6 meses</p>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.profitSeries ?? []} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {recentServices && recentServices.length > 0 && (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-base font-bold text-slate-900 dark:text-white">Serviços recentes</p>
              <button onClick={() => navigate("/servicos")} className="text-xs font-semibold text-brand-600">
                Ver todos
              </button>
            </div>
            <div className="space-y-3">
              {recentServices.slice(0, 3).map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
