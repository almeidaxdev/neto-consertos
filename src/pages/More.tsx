import { useState } from "react";
import { Moon, Sun, Download, Info, LogOut, ChevronRight, Database, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import { Logo } from "@/components/Logo";

function Row({ icon: Icon, label, description, onClick, right }: { icon: typeof Moon; label: string; description?: string; onClick?: () => void; right?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
        {description && <p className="text-xs text-slate-400">{description}</p>}
      </div>
      {right ?? <ChevronRight className="h-4 w-4 text-slate-300" />}
    </button>
  );
}

export default function More() {
  const { theme, toggle } = useTheme();
  const { signOut, user } = useAuth();
  const toast = useToast();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  async function exportData() {
    setExporting(true);
    try {
      const { data: services, error } = await supabase.from("services").select("*").order("os_number");
      if (error) throw error;
      const { data: payments } = await supabase.from("payments").select("*");

      const header = [
        "OS",
        "Cliente",
        "Telefone",
        "Equipamento",
        "Marca",
        "Status",
        "Valor do serviço",
        "Gasto em peças",
        "Lucro",
        "Data",
      ];
      const rows = (services ?? []).map((s) => [
        s.os_number,
        s.client_name,
        s.client_phone,
        s.equipment,
        s.brand ?? "",
        s.status,
        s.service_value,
        s.parts_cost,
        Number(s.service_value) - Number(s.parts_cost),
        formatDate(s.created_at),
      ]);

      const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neto-consertos-servicos-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Exportado! ${services?.length ?? 0} serviços e ${payments?.length ?? 0} pagamentos.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao exportar dados");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="pb-24">
      <PageHeader title="Mais" subtitle="Configurações e informações" />

      <div className="space-y-4 px-5">
        <Card className="p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Conta</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.email}</p>
        </Card>

        <Card className="p-2">
          <Row
            icon={theme === "dark" ? Sun : Moon}
            label="Tema"
            description={theme === "dark" ? "Escuro ativado" : "Claro ativado"}
            onClick={toggle}
            right={
              <div className={`h-6 w-11 rounded-full p-0.5 transition-colors ${theme === "dark" ? "bg-brand-600" : "bg-slate-200"}`}>
                <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`} />
              </div>
            }
          />
        </Card>

        <Card className="p-2">
          <Row icon={Download} label="Exportar dados" description="Baixar serviços em CSV" onClick={exportData} right={exporting ? <span className="text-xs text-slate-400">Exportando...</span> : undefined} />
          <Row icon={Database} label="Backup" description="Seus dados ficam salvos automaticamente no Supabase" />
        </Card>

        <Card className="p-2">
          <Row icon={ShieldCheck} label="Privacidade e segurança" description="Dados protegidos por autenticação e RLS" />
          <Row icon={Info} label="Sobre o Neto Consertos" onClick={() => setAboutOpen(true)} />
        </Card>

        <Card className="p-2">
          <Row icon={LogOut} label="Sair da conta" onClick={() => setLogoutConfirm(true)} />
        </Card>
      </div>

      <Sheet open={aboutOpen} onClose={() => setAboutOpen(false)} title="Sobre">
        <div className="flex flex-col items-center py-2 text-center">
          <Logo variant="stacked" size={56} />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Sistema de gestão para assistências técnicas. Controle serviços, pagamentos e o desempenho financeiro do seu negócio em um só lugar.
          </p>
          <p className="mt-4 text-xs text-slate-400">Versão 1.0.0</p>
        </div>
      </Sheet>

      <Sheet open={logoutConfirm} onClose={() => setLogoutConfirm(false)} title="Sair da conta">
        <p className="text-sm text-slate-500 dark:text-slate-400">Tem certeza que deseja sair?</p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setLogoutConfirm(false)}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={signOut}>
            Sair
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
