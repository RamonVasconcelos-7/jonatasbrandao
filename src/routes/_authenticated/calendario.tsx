import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProcessoDetail } from "@/components/ProcessoDetail";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  TIPO_PRAZO_LABEL,
  useAdvogados,
  useAllPrazos,
  useAreas,
  useEmpresas,
  useProcessos,
  type Processo,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário — Jônatas Brandão" },
      {
        name: "description",
        content: "Calendário mensal de prazos e diligências dos processos do escritório.",
      },
      { property: "og:title", content: "Calendário — Jônatas Brandão" },
      { property: "og:description", content: "Prazos e diligências organizados por mês." },
    ],
  }),
  component: CalendarioPage,
});

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function CalendarioPage() {
  const { isAdmin, advogado } = useAuth();
  const { data: prazos = [] } = useAllPrazos();
  const { data: processosAll = [] } = useProcessos();
  const { data: empresas = [] } = useEmpresas();
  const { data: areas = [] } = useAreas();
  const { data: advogados = [] } = useAdvogados();
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return { ano: t.getFullYear(), mes: t.getMonth() };
  });
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<Processo | null>(null);

  const meusPrazos = useMemo(
    () =>
      prazos.filter((p) => {
        if (!p.processos) return false;
        if (!isAdmin && p.processos.advogado_id !== advogado?.id) return false;
        return true;
      }),
    [prazos, isAdmin, advogado],
  );

  const porDia = useMemo(() => {
    const map = new Map<string, typeof meusPrazos>();
    for (const p of meusPrazos) {
      const lista = map.get(p.data) ?? [];
      lista.push(p);
      map.set(p.data, lista);
    }
    return map;
  }, [meusPrazos]);

  const { ano, mes } = cursor;
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const celulas: (number | null)[] = [
    ...Array.from({ length: primeiroDiaSemana }, () => null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);

  const hojeKey = toKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const listaDoDia = diaSelecionado ? (porDia.get(diaSelecionado) ?? []) : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-foreground">Calendário</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "Prazos e diligências de todos os processos." : "Seus prazos e diligências."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() =>
              setCursor((c) =>
                c.mes === 0 ? { ano: c.ano - 1, mes: 11 } : { ano: c.ano, mes: c.mes - 1 },
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="w-36 text-center text-sm font-semibold text-foreground">
            {MESES[mes]} {ano}
          </span>
          <Button
            size="icon"
            variant="outline"
            onClick={() =>
              setCursor((c) =>
                c.mes === 11 ? { ano: c.ano + 1, mes: 0 } : { ano: c.ano, mes: c.mes + 1 },
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-3">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {celulas.map((dia, idx) => {
            if (dia === null) return <div key={idx} className="aspect-square rounded-md" />;
            const key = toKey(ano, mes, dia);
            const eventos = porDia.get(key) ?? [];
            const pendentes = eventos.filter((e) => !e.cumprido);
            const isHoje = key === hojeKey;
            return (
              <button
                key={idx}
                onClick={() => setDiaSelecionado(key)}
                className={cn(
                  "flex aspect-square flex-col items-start gap-0.5 rounded-md border p-1.5 text-left transition-colors hover:bg-accent",
                  isHoje ? "border-primary" : "border-border",
                  diaSelecionado === key && "bg-accent",
                )}
              >
                <span className={cn("text-xs", isHoje && "font-bold text-primary")}>{dia}</span>
                {pendentes.length > 0 && (
                  <span className="mt-auto inline-flex items-center rounded-full bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                    {pendentes.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {diaSelecionado && (
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-foreground">
            Prazos em {diaSelecionado.split("-").reverse().join("/")}
          </h2>
          {listaDoDia.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Nenhum prazo nesse dia.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {listaDoDia.map((pr) => (
                <li
                  key={pr.id}
                  className={cn(
                    "cursor-pointer rounded-md border p-2.5 text-sm",
                    pr.cumprido
                      ? "border-border bg-muted/30 opacity-70"
                      : "border-border bg-muted/40",
                  )}
                  onClick={() => {
                    const proc = processosAll.find((x) => x.id === pr.processo_id);
                    if (proc) setSelecionado(proc);
                  }}
                >
                  <p className="font-mono font-semibold">{pr.processos?.numero}</p>
                  <p className="text-xs text-muted-foreground">
                    {TIPO_PRAZO_LABEL[pr.tipo]}
                    {pr.descricao ? ` · ${pr.descricao}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

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
