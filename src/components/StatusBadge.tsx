import { cn } from "@/lib/utils";
import type { Status } from "@/lib/data";

const map: Record<Status, string> = {
  Aguardando: "bg-status-aguardando/15 text-status-aguardando border-status-aguardando/30",
  "Em Progresso": "bg-status-progresso/15 text-status-progresso border-status-progresso/30",
  Concluído: "bg-status-concluido/15 text-status-concluido border-status-concluido/30",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        map[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
