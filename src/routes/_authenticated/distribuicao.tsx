import { useMemo, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, User } from "lucide-react";
import { toast } from "sonner";
import { Filtros, filtroInicial, type FiltroState } from "@/components/Filtros";
import { ProcessoCard } from "@/components/ProcessoCard";
import { ProcessoDetail } from "@/components/ProcessoDetail";
import { ProcessoForm } from "@/components/ProcessoForm";
import { aplicarFiltros } from "@/lib/filtros";
import { supabase } from "@/integrations/supabase/client";
import {
  useAdvogados,
  useAreas,
  useEmpresas,
  useInvalidate,
  useProcessos,
  type Processo,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/distribuicao")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", (context as { user: { id: string } }).user.id);
    if (!(data ?? []).some((r) => r.role === "admin")) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Distribuição de processos — Jônatas Brandão" },
      {
        name: "description",
        content: "Cadastro de novos processos e distribuição para advogados e áreas.",
      },
      { property: "og:title", content: "Distribuição de processos — Jônatas Brandão" },
      {
        property: "og:description",
        content: "Abastecimento e atribuição de processos do escritório.",
      },
    ],
  }),
  component: DistribuicaoPage,
});

function Atribuir({
  processo,
  advogados,
  areas,
}: {
  processo: Processo;
  advogados: { id: string; nome: string }[];
  areas: { id: string; nome: string }[];
}) {
  const invalidate = useInvalidate();

  const update = async (patch: Record<string, string | null>) => {
    const { error } = await supabase
      .from("processos")
      .update(patch as never)
      .eq("id", processo.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Processo atualizado");
      invalidate(["processos"]);
      if (patch.advogado_id) {
        supabase.functions
          .invoke("notify-processo-atribuido", { body: { processo_id: processo.id } })
          .catch(() => {});
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Select
        value={processo.advogado_id ?? "none"}
        onValueChange={(v) => update({ advogado_id: v === "none" ? null : v })}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Advogado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Não distribuído</SelectItem>
          {advogados.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> {a.nome}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={processo.area_id ?? "none"}
        onValueChange={(v) => update({ area_id: v === "none" ? null : v })}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Área" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sem área</SelectItem>
          {areas.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DistribuicaoPage() {
  const { data: empresas = [] } = useEmpresas();
  const { data: areas = [] } = useAreas();
  const { data: advogados = [] } = useAdvogados();
  const { data: processos = [] } = useProcessos();
  const [filtros, setFiltros] = useState<FiltroState>(filtroInicial);
  const [selecionado, setSelecionado] = useState<Processo | null>(null);
  const [editando, setEditando] = useState<Processo | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const filtrados = useMemo(() => aplicarFiltros(processos, filtros), [processos, filtros]);
  const naoDistribuidos = filtrados.filter((p) => !p.advogado_id);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-foreground">Distribuição / Abastecimento</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre processos e distribua para advogados e áreas.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditando(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Novo processo
        </Button>
      </div>

      <Card className="border-gold/40 bg-gold/5 p-4">
        <h2 className="text-sm font-semibold text-foreground">
          Processos não distribuídos ({naoDistribuidos.length})
        </h2>
        <div className="mt-3 space-y-3">
          {naoDistribuidos.length === 0 && (
            <p className="text-sm text-muted-foreground">Todos os processos estão distribuídos.</p>
          )}
          {naoDistribuidos.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-3"
            >
              <button
                className="text-left font-mono text-sm hover:underline"
                onClick={() => setSelecionado(p)}
              >
                {p.numero}
                <span className="ml-2 font-sans text-xs text-muted-foreground">
                  {empresas.find((e) => e.id === p.empresa_id)?.nome ?? "Sem empresa"}
                </span>
              </button>
              <Atribuir processo={p} advogados={advogados} areas={areas} />
            </div>
          ))}
        </div>
      </Card>

      <Filtros
        value={filtros}
        onChange={setFiltros}
        empresas={empresas}
        areas={areas}
        advogados={advogados}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((p) => (
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

      <ProcessoDetail
        processo={selecionado}
        empresas={empresas}
        areas={areas}
        advogados={advogados}
        canEdit
        onClose={() => setSelecionado(null)}
        onEdit={(p) => {
          setSelecionado(null);
          setEditando(p);
          setFormOpen(true);
        }}
      />

      <ProcessoForm
        open={formOpen}
        processo={editando}
        empresas={empresas}
        areas={areas}
        advogados={advogados}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditando(null);
        }}
      />
    </div>
  );
}
