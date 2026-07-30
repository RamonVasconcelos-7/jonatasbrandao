import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { daysUntil, formatDate, type Processo } from "@/lib/data";

type Props = {
  processo: Processo;
  empresaNome?: string;
  empresaCor?: string;
  areaNome?: string;
  advogadoNome?: string;
  onClick: () => void;
};

export function ProcessoCard({
  processo,
  empresaNome,
  empresaCor,
  areaNome,
  advogadoNome,
  onClick,
}: Props) {
  const dias = daysUntil(processo.data_audiencia);
  const urgente = dias !== null && dias >= 0 && dias <= 3;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "relative cursor-pointer overflow-hidden p-4 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        urgente && "border-destructive/50",
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: empresaCor ?? "var(--muted-foreground)" }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-semibold text-foreground">
            {processo.numero}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {[empresaNome, areaNome].filter(Boolean).join(" · ") || "Sem classificação"}
          </p>
          {advogadoNome ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{advogadoNome}</p>
          ) : (
            <p className="mt-0.5 text-xs font-medium text-gold">Não distribuído</p>
          )}
        </div>
        <StatusBadge status={processo.status} />
      </div>
      {processo.data_audiencia && (
        <div
          className={cn(
            "mt-3 flex items-center gap-1.5 pl-2 text-xs",
            urgente ? "font-semibold text-destructive" : "text-muted-foreground",
          )}
        >
          <CalendarClock className="h-3.5 w-3.5" />
          Audiência {formatDate(processo.data_audiencia)}
          {dias !== null && dias >= 0 && ` (${dias === 0 ? "hoje" : `em ${dias}d`})`}
        </div>
      )}
    </Card>
  );
}
