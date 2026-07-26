import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Wallet, CheckCircle2, Phone, Trash2, Smartphone, Tag } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { Sheet } from "@/components/ui/Sheet";
import { Select, Input, Textarea } from "@/components/ui/Field";
import { CurrencyField } from "@/components/CurrencyField";
import { useService, useUpdateService, useDeleteService } from "@/hooks/useServices";
import { useCreatePayment, useDeletePayment } from "@/hooks/usePayments";
import { paymentSchema, PaymentSchema } from "@/lib/validations";
import { PAYMENT_METHOD_LABELS, PaymentMethod } from "@/types";
import { formatCurrency, formatDate, todayISODate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Badge";

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: service, isLoading } = useService(id);
  const updateService = useUpdateService(id ?? "");
  const deleteService = useDeleteService();
  const createPayment = useCreatePayment(id ?? "");
  const deletePayment = useDeletePayment(id ?? "");

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentSchema>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: 0, method: "pix", paid_at: todayISODate(), note: "" },
  });

  if (isLoading || !service) {
    return (
      <div className="px-5 pb-24">
        <PageHeader title="Detalhes" back />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const totalPaid = Number(service.down_payment) + service.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Math.max(Number(service.service_value) - totalPaid, 0);
  const profit = Number(service.service_value) - Number(service.parts_cost);
  const paymentStatus = totalPaid <= 0 ? "Pendente" : remaining <= 0 ? "Pago" : "Parcial";
  const paymentStatusColor =
    paymentStatus === "Pago" ? "text-emerald-600" : paymentStatus === "Parcial" ? "text-orange-500" : "text-slate-500";

  async function onSubmitPayment(values: PaymentSchema) {
    try {
      await createPayment.mutateAsync(values);
      toast.success("Pagamento registrado com sucesso!");
      reset({ amount: 0, method: "pix", paid_at: todayISODate(), note: "" });
      setPaymentOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar pagamento");
    }
  }

  async function handleFinish() {
    try {
      await updateService.mutateAsync({ status: "finalizado" });
      toast.success("Serviço finalizado!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao finalizar serviço");
    }
  }

  async function handleDeliver() {
    try {
      await updateService.mutateAsync({ status: "entregue" });
      toast.success("Serviço marcado como entregue!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar serviço");
    }
  }

  async function handleDelete() {
    if (!id) return;
    try {
      await deleteService.mutateAsync(id);
      toast.success("Serviço excluído.");
      navigate("/servicos");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir serviço");
    }
  }

  async function handleRemovePayment(paymentId: string) {
    try {
      await deletePayment.mutateAsync(paymentId);
      toast.success("Pagamento removido.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover pagamento");
    }
  }

  return (
    <div className="pb-28">
      <PageHeader
        title={`OS #${service.os_number}`}
        subtitle={formatDate(service.created_at)}
        back
        right={
          <button
            onClick={() => navigate(`/servicos/${id}/editar`)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand-600 active:bg-brand-50 dark:active:bg-brand-950"
          >
            <Pencil className="h-5 w-5" />
          </button>
        }
      />

      <div className="space-y-4 px-5">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <StatusBadge status={service.status} />
            <button onClick={() => setConfirmDelete(true)} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 active:bg-red-50 active:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{service.equipment}</p>
              {service.brand && (
                <p className="flex items-center gap-1 text-xs text-slate-400">
                  <Tag className="h-3 w-3" /> {service.brand}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
            <p className="text-xs font-semibold text-slate-400">Defeito informado</p>
            <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-200">{service.reported_issue}</p>
          </div>

          {service.notes && (
            <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-xs font-semibold text-slate-400">Observações</p>
              <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-200">{service.notes}</p>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Cliente</p>
          <p className="font-semibold text-slate-900 dark:text-white">{service.client_name}</p>
          {service.client_phone ? (
            <a
              href={`tel:${service.client_phone}`}
              className="-ml-1 mt-1 inline-flex items-center gap-1.5 rounded-lg px-1 py-2 text-sm font-medium text-brand-600 active:bg-brand-50 dark:active:bg-brand-950"
            >
              <Phone className="h-3.5 w-3.5" /> {service.client_phone}
            </a>
          ) : (
            <p className="mt-1 text-xs text-slate-400">Telefone não informado</p>
          )}
        </Card>

        <Card className="p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Financeiro</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-400">Valor do serviço</p>
              <p className="font-display font-bold text-slate-900 dark:text-white">{formatCurrency(service.service_value)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Peças</p>
              <p className="font-display font-bold text-slate-900 dark:text-white">{formatCurrency(service.parts_cost)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Lucro</p>
              <p className={`font-display font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>{formatCurrency(profit)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Status pagamento</p>
              <p className={`font-display font-bold ${paymentStatusColor}`}>{paymentStatus}</p>
            </div>
          </div>

          <div className="mt-4 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Pago</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Restante</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(remaining)}</span>
            </div>
          </div>

          {service.payments.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <p className="text-xs font-semibold text-slate-400">Pagamentos registrados</p>
              {service.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-slate-400">
                      {PAYMENT_METHOD_LABELS[p.method as PaymentMethod]} · {formatDate(p.paid_at)}
                    </p>
                  </div>
                  <button onClick={() => handleRemovePayment(p.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 active:bg-red-50 active:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => setPaymentOpen(true)}>
            <Wallet className="h-4 w-4" /> Registrar pagamento
          </Button>
          {service.status !== "entregue" ? (
            <Button onClick={service.status === "finalizado" ? handleDeliver : handleFinish} loading={updateService.isPending}>
              <CheckCircle2 className="h-4 w-4" /> {service.status === "finalizado" ? "Marcar entregue" : "Finalizar serviço"}
            </Button>
          ) : (
            <div className="flex items-center justify-center rounded-2xl bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 text-sm font-semibold">
              Entregue
            </div>
          )}
        </div>
      </div>

      <Sheet open={paymentOpen} onClose={() => setPaymentOpen(false)} title="Registrar pagamento">
        <form onSubmit={handleSubmit(onSubmitPayment)} className="space-y-4">
          <CurrencyField control={control} name="amount" label="Valor pago" required error={errors.amount?.message} />
          <Select label="Forma de pagamento" required error={errors.method?.message} {...register("method")}>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input type="date" label="Data" required error={errors.paid_at?.message} {...register("paid_at")} />
          <Textarea label="Observação" placeholder="Opcional" error={errors.note?.message} {...register("note")} />
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            Salvar pagamento
          </Button>
        </form>
      </Sheet>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir serviço">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tem certeza que deseja excluir a OS #{service.os_number}? Essa ação não pode ser desfeita e removerá também os pagamentos vinculados.
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(false)}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete} loading={deleteService.isPending}>
            Excluir
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
