export type ServiceStatus =
  | "recebido"
  | "em_andamento"
  | "aguardando_peca"
  | "finalizado"
  | "entregue";

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  recebido: "Recebido",
  em_andamento: "Em andamento",
  aguardando_peca: "Aguardando peça",
  finalizado: "Finalizado",
  entregue: "Entregue",
};

export const STATUS_COLORS: Record<ServiceStatus, { bg: string; text: string; dot: string }> = {
  recebido: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-300", dot: "bg-slate-400" },
  em_andamento: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  aguardando_peca: { bg: "bg-orange-50 dark:bg-orange-950", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500" },
  finalizado: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  entregue: { bg: "bg-green-50 dark:bg-green-950", text: "text-green-700 dark:text-green-400", dot: "bg-green-700" },
};

export const STATUS_ORDER: ServiceStatus[] = [
  "recebido",
  "em_andamento",
  "aguardando_peca",
  "finalizado",
  "entregue",
];

export type PaymentMethod = "pix" | "dinheiro" | "cartao" | "transferencia";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  transferencia: "Transferência",
};

export interface ServiceRow {
  id: string;
  os_number: number;
  client_name: string;
  client_phone: string;
  equipment: string;
  brand: string | null;
  reported_issue: string;
  service_value: number;
  parts_cost: number;
  down_payment: number;
  status: ServiceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  finished_at: string | null;
}

export interface PaymentRow {
  id: string;
  service_id: string;
  amount: number;
  method: PaymentMethod;
  paid_at: string;
  note: string | null;
  created_at: string;
}

export interface ServiceWithPayments extends ServiceRow {
  payments: PaymentRow[];
}

export interface ServiceFormInput {
  client_name: string;
  has_phone: boolean;
  client_phone?: string;
  equipment: string;
  brand?: string;
  reported_issue: string;
  service_value: number;
  parts_cost: number;
  status: ServiceStatus;
  notes?: string;
}

export interface PaymentFormInput {
  amount: number;
  method: PaymentMethod;
  paid_at: string;
  note?: string;
}
