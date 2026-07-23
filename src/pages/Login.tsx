import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, LoginSchema } from "@/lib/validations";
import { useToast } from "@/components/ui/Toast";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginSchema) {
    setSubmitting(true);
    const { error } = await signIn(values.email, values.password);
    setSubmitting(false);
    if (error) {
      toast.error("E-mail ou senha inválidos.");
      return;
    }
    toast.success("Bem-vindo de volta!");
    const from = (location.state as { from?: string })?.from ?? "/";
    navigate(from, { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-b from-brand-600 via-brand-700 to-slate-900 px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto w-full max-w-sm"
      >
        <div className="mb-10 flex flex-col items-center">
          <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
            <Logo variant="mark" size={56} />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold text-white">Neto Consertos</h1>
          <p className="text-sm font-medium tracking-wide text-brand-100">Assistência Técnica</p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl">
          <h2 className="mb-1 font-display text-lg font-bold text-slate-900 dark:text-white">Entrar</h2>
          <p className="mb-6 text-sm text-slate-400">Acesse sua conta para gerenciar os serviços</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-[42px] h-4 w-4 text-slate-400" />
              <Input
                label="E-mail"
                type="email"
                placeholder="voce@exemplo.com"
                className="pl-10"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-[42px] h-4 w-4 text-slate-400" />
              <Input
                label="Senha"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-[38px] rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" loading={submitting}>
              Entrar
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-brand-100/80">
          Acesso restrito à equipe Neto Consertos.
        </p>
      </motion.div>
    </div>
  );
}
