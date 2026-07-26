import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { ServiceFormInput, ServiceRow, ServiceStatus, ServiceWithPayments } from "@/types";

const SERVICES_KEY = ["services"];

export function useServices(filters?: { status?: ServiceStatus }) {
  return useQuery({
    queryKey: [...SERVICES_KEY, filters],
    queryFn: async (): Promise<ServiceRow[]> => {
      let query = supabase.from("services").select("*").order("created_at", { ascending: false });
      if (filters?.status) query = query.eq("status", filters.status);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

export function useService(id: string | undefined) {
  return useQuery({
    queryKey: ["service", id],
    enabled: !!id,
    queryFn: async (): Promise<ServiceWithPayments> => {
      const { data: service, error } = await supabase.from("services").select("*").eq("id", id).single();
      if (error) throw new Error(error.message);

      const { data: payments, error: payErr } = await supabase
        .from("payments")
        .select("*")
        .eq("service_id", id)
        .order("paid_at", { ascending: false });
      if (payErr) throw new Error(payErr.message);

      return { ...service, payments: payments ?? [] };
    },
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: ServiceFormInput) => {
      const { data, error } = await supabase
        .from("services")
        .insert({
          owner_id: user?.id,
          client_name: input.client_name,
          client_phone: input.has_phone ? (input.client_phone ?? "") : "",
          equipment: input.equipment,
          brand: input.brand?.trim() || null,
          reported_issue: input.reported_issue,
          service_value: input.service_value,
          parts_cost: input.parts_cost,
          down_payment: 0,
          status: input.status,
          notes: input.notes || null,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as ServiceRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SERVICES_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateService(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<ServiceFormInput>) => {
      const { has_phone, client_phone, brand, notes, ...rest } = input;
      const { data, error } = await supabase
        .from("services")
        .update({
          ...rest,
          ...(has_phone !== undefined && { client_phone: has_phone ? (client_phone ?? "") : "" }),
          ...(brand !== undefined && { brand: brand?.trim() || null }),
          ...(notes !== undefined && { notes: notes || null }),
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as ServiceRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SERVICES_KEY });
      qc.invalidateQueries({ queryKey: ["service", id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SERVICES_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useSearchServices(term: string) {
  return useQuery({
    queryKey: ["services-search", term],
    enabled: term.trim().length > 0,
    queryFn: async (): Promise<ServiceRow[]> => {
      const like = `%${term.trim()}%`;
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .or(`client_name.ilike.${like},client_phone.ilike.${like},equipment.ilike.${like}`)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);

      // também permite buscar pelo número da OS quando o termo é numérico
      let results = data ?? [];
      const osNumber = Number(term.trim());
      if (!Number.isNaN(osNumber) && term.trim() !== "") {
        const { data: byOs } = await supabase.from("services").select("*").eq("os_number", osNumber);
        if (byOs && byOs.length > 0) {
          const ids = new Set(results.map((r) => r.id));
          results = [...byOs.filter((r) => !ids.has(r.id)), ...results];
        }
      }
      return results;
    },
  });
}
