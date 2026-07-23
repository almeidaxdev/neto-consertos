import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { FieldWrapper } from "@/components/ui/Field";
import { maskCurrencyInput, centsToNumber, numberToCentsDigits } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CurrencyFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

export function CurrencyField<T extends FieldValues>({ control, name, label, error, required, hint }: CurrencyFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const digits = numberToCentsDigits(Number(field.value) || 0);
        const display = maskCurrencyInput(digits);
        return (
          <FieldWrapper label={label} error={error} required={required} hint={hint}>
            <input
              inputMode="numeric"
              value={display}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                field.onChange(centsToNumber(raw));
              }}
              className={cn(
                "w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-[15px] font-semibold text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
                error && "border-red-400 focus:border-red-500 focus:ring-red-500/10"
              )}
              placeholder="R$ 0,00"
            />
          </FieldWrapper>
        );
      }}
    />
  );
}
