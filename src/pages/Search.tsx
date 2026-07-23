import { useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { Skeleton } from "@/components/ui/Badge";
import { useSearchServices } from "@/hooks/useServices";

export default function Search() {
  const [term, setTerm] = useState("");
  const { data: results, isLoading, isFetching } = useSearchServices(term);

  return (
    <div className="pb-24">
      <PageHeader title="Pesquisar" subtitle="Cliente, telefone, OS ou equipamento" />

      <div className="px-5">
        <div className="relative mb-4">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Digite para pesquisar..."
            className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-11 pr-10 text-[15px] outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          />
          {term && (
            <button onClick={() => setTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {term.trim() === "" ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-500">
              <SearchIcon className="h-7 w-7" />
            </div>
            <p className="font-display font-bold text-slate-700 dark:text-slate-200">Busca instantânea</p>
            <p className="mt-1 text-sm text-slate-400">Comece a digitar para ver os resultados.</p>
          </div>
        ) : isLoading || isFetching ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : results && results.length > 0 ? (
          <div className="space-y-3">
            {results.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center text-center">
            <p className="font-display font-bold text-slate-700 dark:text-slate-200">Nada encontrado</p>
            <p className="mt-1 text-sm text-slate-400">Tente pesquisar com outro termo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
