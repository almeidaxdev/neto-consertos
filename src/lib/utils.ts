import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a number (in reais) as BRL currency string. */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0);
}

/** Converts raw digit-only input (cents) into a currency-masked display string. */
export function maskCurrencyInput(digits: string): string {
  const clean = digits.replace(/\D/g, "");
  const cents = clean === "" ? 0 : parseInt(clean, 10);
  return formatCurrency(cents / 100);
}

/** Converts a digit string (cents) into the numeric decimal value. */
export function centsToNumber(digits: string): number {
  const clean = digits.replace(/\D/g, "");
  const cents = clean === "" ? 0 : parseInt(clean, 10);
  return cents / 100;
}

/** Converts a decimal number into a digit-only cents string, for initializing masked inputs. */
export function numberToCentsDigits(value: number): string {
  return Math.round((value || 0) * 100).toString();
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function monthLabel(monthIndex: number): string {
  const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return labels[monthIndex] ?? "";
}

export function formatPhoneInput(digits: string): string {
  const clean = digits.replace(/\D/g, "").slice(0, 11);
  if (clean.length <= 2) return clean;
  if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
}
