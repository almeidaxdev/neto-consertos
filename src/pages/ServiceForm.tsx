import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Input, Textarea, Select } from "@/components/ui/Field";
import { CurrencyField } from "@/components/CurrencyField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { serviceSchema, ServiceSchema } from "@/lib/validations";
import { useCreateService, useService, useUpdateService } from "@/hooks/useServices";
import { STATUS_LABELS, STATUS_ORDER } from "@/types";
import { formatPhoneInput } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function ServiceForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const { data: existing, isLoading: loadingExisting } = useService(id);
  const createService = useCreateService();
  const updateService = useUpdateService(id ?? "");

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ServiceSchema>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      client_name: "",
      client_phone: "",
      equipment: "",
      brand: "",
      reported_issue: "",
      service_value: 0,
      parts_cost: 0,
      down_payment: 0,
      status: "recebido",
      notes: "",
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        client_name: existing.client_name,
        client_phone: existing.client_phone,
        equipment: existing.equipment,
        brand: existing.brand ?? "",
        reported_issue: existing.reported_issue,
        service_value: Number(existing.service_value),
        parts_cost: Number(existing.parts_cost),
        down_payment: Number(existing.down_payment),
        status: existing.status,
        notes: existing.notes ?? "",
      });
    }
  }, [existing, reset]);

  const serviceValue = watch("service_value") || 0;
  const partsCost = watch("parts_cost") || 0;
  const profit = serviceValue - partsCost;

  async function onSubmit(values: ServiceSchema) {
    try {
      if (isEdit && id) {
        await updateService.mutateAsync(values);
        toast.success("Serviço atualizado com sucesso!");
        navigate(`/servicos/${id}`);
      } else {
        const created = await createService.mutateAsync(values);
        toast.success(`OS #${created.os_number} cadastrada com sucesso!`);
        navigate(`/servicos/${created.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar serviço");
    }
  }

  if (isEdit && loadingExisting) {
    return (
      <div className="pb-24">
        <PageHeader title="Editar serviço" back />
        <div className="px-5 text-sm text-slate-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <PageHeader title={isEdit ? "Editar serviço" : "Novo serviço"} subtitle={isEdit ? undefined : "OS gerada automaticamente"} back />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-5">
        <Card className="space-y-4 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Cliente</p>
          <Input label="Nome do cliente" required placeholder="Ex: Maria Silva" error={errors.client_name?.message} {...register("client_name")} />
          <Controller
            control={control}
            name="client_phone"
            render={({ field }) => (
              <Input
                label="Telefone"
                required
                placeholder="(00) 00000-0000"
                inputMode="numeric"
                value={field.value}
                onChange={(e) => field.onChange(formatPhoneInput(e.target.value))}
                error={errors.client_phone?.message}
              />
            )}
          />
        </Card>

        <Card className="space-y-4 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Equipamento</p>
          <Input label="Equipamento" required placeholder="Ex: iPhone 12" error={errors.equipment?.message} {...register("equipment")} />
          <Input label="Marca" placeholder="Ex: Apple" error={errors.brand?.message} {...register("brand")} />
          <Textarea label="Defeito informado" required placeholder="Descreva o problema relatado pelo cliente" error={errors.reported_issue?.message} {...register("reported_issue")} />
        </Card>

        <Card className="space-y-4 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Financeiro</p>
          <CurrencyField control={control} name="service_value" label="Valor do serviço" required error={errors.service_value?.message} />
          <CurrencyField control={control} name="parts_cost" label="Valor gasto em peças" required error={errors.parts_cost?.message} />
          <CurrencyField control={control} name="down_payment" label="Valor de entrada" hint="Opcional" error={errors.down_payment?.message} />

          <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950 px-4 py-3">
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Lucro estimado</span>
            <span className={`font-display text-base font-bold ${profit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-500"}`}>
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(profit)}
            </span>
          </div>
        </Card>

        <Card className="space-y-4 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Status</p>
          <Select label="Status do serviço" required error={errors.status?.message} {...register("status")}>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Textarea label="Observações" placeholder="Anotações internas (opcional)" error={errors.notes?.message} {...register("notes")} />
        </Card>

        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg px-5 py-3 safe-bottom">
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            {isEdit ? "Salvar alterações" : "Cadastrar serviço"}
          </Button>
        </div>
      </form>
    </div>
  );
}
