import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Phone } from "lucide-react";
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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceSchema>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      client_name: "",
      has_phone: true,
      client_phone: "",
      equipment: "",
      brand: "",
      reported_issue: "",
      service_value: 0,
      parts_cost: 0,
      status: "recebido",
      notes: "",
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        client_name: existing.client_name,
        has_phone: !!existing.client_phone,
        client_phone: existing.client_phone ?? "",
        equipment: existing.equipment,
        brand: existing.brand ?? "",
        reported_issue: existing.reported_issue,
        service_value: Number(existing.service_value),
        parts_cost: Number(existing.parts_cost),
        status: existing.status,
        notes: existing.notes ?? "",
      });
    }
  }, [existing, reset]);

  const hasPhone = watch("has_phone");

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

          <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Cliente possui telefone</p>
                <p className="text-xs text-slate-400">Desative se não tiver o contato</p>
              </div>
            </div>
            <Controller
              control={control}
              name="has_phone"
              render={({ field }) => (
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  onClick={() => {
                    const next = !field.value;
                    field.onChange(next);
                    if (!next) setValue("client_phone", "");
                  }}
                  className={`h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${field.value ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-600"}`}
                >
                  <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${field.value ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              )}
            />
          </div>

          {hasPhone && (
            <Controller
              control={control}
              name="client_phone"
              render={({ field }) => (
                <Input
                  label="Telefone"
                  required
                  placeholder="(00) 00000-0000"
                  inputMode="numeric"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(formatPhoneInput(e.target.value))}
                  error={errors.client_phone?.message}
                />
              )}
            />
          )}
        </Card>

        <Card className="space-y-4 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Equipamento</p>
          <Input label="Equipamento" required placeholder="Ex: iPhone 12" error={errors.equipment?.message} {...register("equipment")} />
          <Controller
            control={control}
            name="brand"
            render={({ field }) => (
              <Input
                label="Marca"
                placeholder="Ex: Apple"
                error={errors.brand?.message}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={() => field.onChange(field.value?.trim() ?? "")}
              />
            )}
          />
          <Textarea label="Defeito informado" required placeholder="Descreva o problema relatado pelo cliente" error={errors.reported_issue?.message} {...register("reported_issue")} />
        </Card>

        <Card className="space-y-4 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Financeiro</p>
          <CurrencyField control={control} name="service_value" label="Valor do serviço" required error={errors.service_value?.message} />
          <CurrencyField control={control} name="parts_cost" label="Valor gasto em peças" required error={errors.parts_cost?.message} />

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
