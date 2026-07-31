import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessoCard } from "@/components/ProcessoCard";
import { ProcessoDetail } from "@/components/ProcessoDetail";
import {
  EMPRESA_TIPO_LABEL,
  EMPRESA_TIPO_LIST,
  TIPO_PRAZO_LABEL,
  daysUntil,
  formatDate,
  sortByPrazo,
  useAdvogados,
  useAllPrazos,
  useAreas,
  useEmpresas,
  useProcessos,
  type Processo,
} from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { AlertTriangle, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel geral — Jônatas Brandão" },
      {
        name: "description",
        content:
          "Visão geral dos processos por status, advogado e categoria de cliente, com alertas de prazo.",
      },
      { property: "og:title", content: "Painel geral — Jônatas Brandão" },
      {
        property: "og:description",
        content: "Visão geral dos processos do escritório e prazos próximos.",
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
  const { data: prazosAll = [] } = useAllPrazos();
  const [selecionado, setSelecionado] = useState<Processo | null>(null);

  const processos = useMemo(
    () => (isAdmin ? processosAll : processosAll.filter((p) => p.advogado_id === advogado?.id)),
    [processosAll, isAdmin, advogado],
  );

  const porStatus = (s: string) => processos.filter((p) => p.status === s).length;

  const meusIds = useMemo(() => new Set(processos.map((p) => p.id)), [processos]);

  const proximosPrazos = useMemo(
    () =>
      prazosAll
        .filter((p) => !p.cumprido && p.processos && meusIds.has(p.processos.id))
        .filter((p) => {
          const d = daysUntil(p.data);
          return d !== null && d >= 0 && d <= 15;
        })
        .sort((a, b) => a.data.localeCompare(b.data)),
    [prazosAll, meusIds],
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
        <h2 className="text-sm font-semibold text-foreground">Prazos próximos (15 dias)</h2>
        {proximosPrazos.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nenhum prazo nos próximos dias.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {proximosPrazos.map((pr) => {
              const d = daysUntil(pr.data)!;
              const urgente = d <= 3;
              const proc = processos.find((p) => p.id === pr.processos?.id);
              return (
                <li
                  key={pr.id}
                  className={`flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-md border p-2.5 text-sm ${
                    urgente
                      ? "border-destructive/40 bg-destructive/5 text-destructive"
                      : "border-border bg-muted/40"
                  }`}
                  onClick={() => proc && setSelecionado(proc)}
                >
                  <span className="flex items-center gap-2">
                    {urgente && <AlertTriangle className="h-4 w-4 shrink-0" />}
                    <span className="font-mono">{pr.processos?.numero}</span>
                    <span className="text-xs text-muted-foreground">
                      {TIPO_PRAZO_LABEL[pr.tipo]}
                    </span>
                  </span>
                  <span className="font-medium">
                    {formatDate(pr.data)} · {d === 0 ? "hoje" : `em ${d} dia(s)`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-foreground">Por advogado</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {advogados.map((a) => {
              const total = processos.filter((p) => p.advogado_id === a.id).length;
              return (
                <Link
                  key={a.id}
                  to="/advogados"
                  className="flex flex-col items-center gap-1.5 rounded-md border border-border p-3 text-center transition-colors hover:bg-accent"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-medium leading-tight text-foreground">
                    {a.nome}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">{total}</span>
                </Link>
              );
            })}
            {advogados.length === 0 && (
              <p className="col-span-full text-sm text-muted-foreground">
                Nenhum advogado cadastrado.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-foreground">Por categoria de cliente</h2>
          <Tabs defaultValue={EMPRESA_TIPO_LIST[0]} className="mt-3">
            <TabsList>
              {EMPRESA_TIPO_LIST.map((t) => (
                <TabsTrigger key={t} value={t}>
                  {EMPRESA_TIPO_LABEL[t]}
                </TabsTrigger>
              ))}
            </TabsList>
            {EMPRESA_TIPO_LIST.map((t) => (
              <TabsContent key={t} value={t} className="pt-3">
                <ul className="space-y-2 text-sm">
                  {empresas
                    .filter((e) => e.tipo === t)
                    .map((e) => (
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
                  {empresas.filter((e) => e.tipo === t).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma empresa cadastrada nessa categoria.
                    </p>
                  )}
                </ul>
              </TabsContent>
            ))}
          </Tabs>
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
          <p className="text-sm text-muted-foreground">Nenhum processo cadastrado ainda.</p>
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
