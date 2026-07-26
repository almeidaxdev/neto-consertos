import { z } from "zod";

export const serviceSchema = z
  .object({
    client_name: z.string().min(2, "Informe o nome do cliente").max(120),
    has_phone: z.boolean().default(true),
    client_phone: z.string().max(20, "Telefone inválido").optional().or(z.literal("")),
    equipment: z.string().min(2, "Informe o equipamento").max(120),
    brand: z.string().trim().max(60).optional().or(z.literal("")),
    reported_issue: z.string().min(3, "Descreva o defeito informado").max(500),
    service_value: z.coerce.number().min(0, "Valor não pode ser negativo"),
    parts_cost: z.coerce.number().min(0, "Valor não pode ser negativo"),
    status: z.enum(["recebido", "em_andamento", "aguardando_peca", "finalizado", "entregue"]),
    notes: z.string().max(1000).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.has_phone && (!data.client_phone || data.client_phone.replace(/\D/g, "").length < 10)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["client_phone"],
        message: "Informe um telefone válido ou desative esta opção",
      });
    }
  });

export type ServiceSchema = z.infer<typeof serviceSchema>;

export const paymentSchema = z.object({
  amount: z.coerce.number().positive("Informe um valor maior que zero"),
  method: z.enum(["pix", "dinheiro", "cartao", "transferencia"]),
  paid_at: z.string().min(1, "Informe a data"),
  note: z.string().max(300).optional().or(z.literal("")),
});

export type PaymentSchema = z.infer<typeof paymentSchema>;

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
