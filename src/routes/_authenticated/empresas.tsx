import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filtros, filtroInicial, type FiltroState } from "@/components/Filtros";
import { ProcessoCard } from "@/components/ProcessoCard";
import { ProcessoDetail } from "@/components/ProcessoDetail";
import { ProcessoForm } from "@/components/ProcessoForm";
import { aplicarFiltros } from "@/lib/filtros";
import { useAuth } from "@/lib/auth";
import { useAdvogados, useAreas, useEmpresas, useProcessos, type Processo } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/empresas")({
  head: () => ({
    meta: [
      { title: "Processos por empresa — Jônatas Brandão" },
      {
        name: "description",
        content: "Abas por empresa cliente com os processos organizados por área de atuação.",
      },
      { property: "og:title", content: "Processos por empresa — Jônatas Brandão" },
      {
        property: "og:description",
        content: "Processos de cada empresa cliente agrupados por área.",
      },
    ],
  }),
  component: EmpresasPage,
});

function EmpresasPage() {
  const { isAdmin, advogado } = useAuth();
  const { data: empresas = [] } = useEmpresas();
  const { data: areas = [] } = useAreas();
  const { data: advogados = [] } = useAdvogados();
  const { data: processos = [] } = useProcessos();
  const [filtros, setFiltros] = useState<FiltroState>(filtroInicial);
  const [selecionado, setSelecionado] = useState<Processo | null>(null);
  const [editando, setEditando] = useState<Processo | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const base = useMemo(() => aplicarFiltros(processos, filtros), [processos, filtros]);

  if (empresas.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada.</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Processos por empresa</h1>
        <p className="text-sm text-muted-foreground">
          Cada aba mostra os processos da empresa organizados por área.
        </p>
      </div>

      <Filtros
        value={filtros}
        onChange={setFiltros}
        empresas={empresas}
        areas={areas}
        advogados={advogados}
        hide={["empresa"]}
      />

      <Tabs defaultValue={empresas[0].id}>
        <TabsList>
          {empresas.map((e) => (
            <TabsTrigger key={e.id} value={e.id}>
              {e.nome}
            </TabsTrigger>
          ))}
        </TabsList>

        {empresas.map((empresa) => {
          const daEmpresa = base.filter((p) => p.empresa_id === empresa.id);
          const semArea = daEmpresa.filter((p) => !p.area_id);
          return (
            <TabsContent key={empresa.id} value={empresa.id} className="space-y-6 pt-4">
              {daEmpresa.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum processo para os filtros atuais.
                </p>
              )}
              {areas.map((area) => {
                const lista = daEmpresa.filter((p) => p.area_id === area.id);
                if (lista.length === 0) return null;
                return (
                  <section key={area.id}>
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {area.nome} ({lista.length})
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {lista.map((p) => (
                        <ProcessoCard
                          key={p.id}
                          processo={p}
                          empresaNome={empresa.nome}
                          empresaCor={empresa.cor}
                          areaNome={area.nome}
                          advogadoNome={advogados.find((a) => a.id === p.advogado_id)?.nome}
                          onClick={() => setSelecionado(p)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
              {semArea.length > 0 && (
                <section>
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Sem área definida ({semArea.length})
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {semArea.map((p) => (
                      <ProcessoCard
                        key={p.id}
                        processo={p}
                        empresaNome={empresa.nome}
                        empresaCor={empresa.cor}
                        advogadoNome={advogados.find((a) => a.id === p.advogado_id)?.nome}
                        onClick={() => setSelecionado(p)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <ProcessoDetail
        processo={selecionado}
        empresas={empresas}
        areas={areas}
        advogados={advogados}
        canEdit={isAdmin || selecionado?.advogado_id === advogado?.id}
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
