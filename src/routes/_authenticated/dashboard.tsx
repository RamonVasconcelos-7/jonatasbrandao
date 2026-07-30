import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { ProcessoCard } from "@/components/ProcessoCard";
import { ProcessoDetail } from "@/components/ProcessoDetail";
import {
  daysUntil,
  formatDate,
  sortByPrazo,
  useAdvogados,
  useAreas,
  useEmpresas,
  useProcessos,
  type Processo,
} from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel geral — Gestão Jurídica" },
      {
        name: "description",
        content: "Visão geral dos processos por status, empresa e área, com alertas de audiência.",
      },
      { property: "og:title", content: "Painel geral — Gestão Jurídica" },
      {
        property: "og:description",
        content: "Visão geral dos processos do escritório e audiências próximas.",
      },
    ],
  }),
  component: Dashboard,
});

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${tone ?? "text-foreground"}`}>{value}</p>
    </Card>
  );
}

function Dashboard() {
  const { isAdmin, advogado } = useAuth();
  const { data: processosAll = [] } = useProcessos();
  const { data: empresas = [] } = useEmpresas();
  const { data: areas = [] } = useAreas();
  const { data: advogados = [] } = useAdvogados();
  const [selecionado, setSelecionado] = useState<Processo | null>(null);

  const processos = useMemo(
    () => (isAdmin ? processosAll : processosAll.filter((p) => p.advogado_id === advogado?.id)),
    [processosAll, isAdmin, advogado],
  );

  const porStatus = (s: string) => processos.filter((p) => p.status === s).length;

  const audiencias = useMemo(
    () =>
      [...processos]
        .filter((p) => {
          const d = daysUntil(p.data_audiencia);
          return d !== null && d >= 0 && d <= 15;
        })
        .sort(sortByPrazo),
    [processos],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Painel geral</h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin ? "Todos os processos do escritório" : "Seus processos atribuídos"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total de processos" value={processos.length} />
        <Stat label="Aguardando" value={porStatus("Aguardando")} tone="text-status-aguardando" />
        <Stat label="Em progresso" value={porStatus("Em Progresso")} tone="text-status-progresso" />
        <Stat label="Concluídos" value={porStatus("Concluído")} tone="text-status-concluido" />
      </div>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-foreground">Audiências próximas (15 dias)</h2>
        {audiencias.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma audiência nos próximos dias.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {audiencias.map((p) => {
              const d = daysUntil(p.data_audiencia)!;
              const urgente = d <= 3;
              return (
                <li
                  key={p.id}
                  className={`flex cursor-pointer items-center justify-between rounded-md border p-2.5 text-sm ${
                    urgente
                      ? "border-destructive/40 bg-destructive/5 text-destructive"
                      : "border-border bg-muted/40"
                  }`}
                  onClick={() => setSelecionado(p)}
                >
                  <span className="flex items-center gap-2 font-mono">
                    {urgente && <AlertTriangle className="h-4 w-4" />}
                    {p.numero}
                  </span>
                  <span className="font-medium">
                    {formatDate(p.data_audiencia)} · {d === 0 ? "hoje" : `em ${d} dia(s)`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-foreground">Por empresa</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {empresas.map((e) => (
              <li key={e.id} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: e.cor }}
                    aria-hidden
                  />
                  {e.nome}
                </span>
                <span className="font-semibold">
                  {processos.filter((p) => p.empresa_id === e.id).length}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-foreground">Por empresa e área</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {empresas.flatMap((e) =>
              areas.map((a) => {
                const total = processos.filter(
                  (p) => p.empresa_id === e.id && p.area_id === a.id,
                ).length;
                if (!total) return null;
                return (
                  <li key={`${e.id}-${a.id}`} className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {e.nome} · {a.nome}
                    </span>
                    <span className="font-semibold">{total}</span>
                  </li>
                );
              }),
            )}
          </ul>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Prioridade de prazo (índice geral)
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...processos]
            .sort(sortByPrazo)
            .slice(0, 9)
            .map((p) => (
              <ProcessoCard
                key={p.id}
                processo={p}
                empresaNome={empresas.find((e) => e.id === p.empresa_id)?.nome}
                empresaCor={empresas.find((e) => e.id === p.empresa_id)?.cor}
                areaNome={areas.find((a) => a.id === p.area_id)?.nome}
                advogadoNome={advogados.find((a) => a.id === p.advogado_id)?.nome}
                onClick={() => setSelecionado(p)}
              />
            ))}
        </div>
        {processos.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum processo cadastrado ainda.
          </p>
        )}
      </div>

      <ProcessoDetail
        processo={selecionado}
        empresas={empresas}
        areas={areas}
        advogados={advogados}
        canEdit={isAdmin || selecionado?.advogado_id === advogado?.id}
        onClose={() => setSelecionado(null)}
      />
    </div>
  );
}
