import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { PaymentFormInput, PaymentRow, ServiceRow } from "@/types";

export interface ServicePaymentSummary {
  service: ServiceRow;
  totalPaid: number;
  remaining: number;
  status: "pago" | "parcial" | "pendente";
  payments: PaymentRow[];
}

export function useAllPayments() {
  return useQuery({
    queryKey: ["payments-overview"],
    queryFn: async (): Promise<ServicePaymentSummary[]> => {
      const { data: services, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);

      const { data: payments, error: payErr } = await supabase.from("payments").select("*");
      if (payErr) throw new Error(payErr.message);

      return (services ?? []).map((service) => {
        const servicePayments = (payments ?? []).filter((p) => p.service_id === service.id);
        const totalPaid = service.down_payment + servicePayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const remaining = Math.max(service.service_value - totalPaid, 0);
        const status: ServicePaymentSummary["status"] =
          totalPaid <= 0 ? "pendente" : totalPaid >= service.service_value ? "pago" : "parcial";
        return { service, totalPaid, remaining, status, payments: servicePayments };
      });
    },
  });
}

export function useCreatePayment(serviceId: string) {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: PaymentFormInput) => {
      const { data, error } = await supabase
        .from("payments")
        .insert({
          service_id: serviceId,
          owner_id: user?.id,
          amount: input.amount,
          method: input.method,
          paid_at: input.paid_at,
          note: input.note || null,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as PaymentRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service", serviceId] });
      qc.invalidateQueries({ queryKey: ["payments-overview"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeletePayment(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase.from("payments").delete().eq("id", paymentId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service", serviceId] });
      qc.invalidateQueries({ queryKey: ["payments-overview"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
