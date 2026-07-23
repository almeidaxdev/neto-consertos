import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-card-light dark:bg-card-dark rounded-xl2 shadow-soft border border-slate-100 dark:border-slate-800/60",
        className
      )}
      {...props}
    />
  );
}
