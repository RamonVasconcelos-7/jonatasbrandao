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

export const Route = createFileRoute("/_authenticated/advogados")({
  head: () => ({
    meta: [
      { title: "Área dos advogados — Jônatas Brandão" },
      {
        name: "description",
        content:
          "Processos de cada advogado agrupados por tipo de processo, com filtro por empresa.",
      },
      { property: "og:title", content: "Área dos advogados — Jônatas Brandão" },
      {
        property: "og:description",
        content: "Carteira de processos de cada advogado do escritório.",
      },
    ],
  }),
  component: AdvogadosPage,
});

function AdvogadosPage() {
  const { isAdmin, advogado: meuAdvogado } = useAuth();
  const { data: empresas = [] } = useEmpresas();
  const { data: areas = [] } = useAreas();
  const { data: advogados = [] } = useAdvogados();
  const { data: processos = [] } = useProcessos();
  const [filtros, setFiltros] = useState<FiltroState>(filtroInicial);
  const [selecionado, setSelecionado] = useState<Processo | null>(null);
  const [editando, setEditando] = useState<Processo | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const visiveis = isAdmin ? advogados : advogados.filter((a) => a.id === meuAdvogado?.id);

  const base = useMemo(() => aplicarFiltros(processos, filtros), [processos, filtros]);

  if (visiveis.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum advogado cadastrado ou vinculado ao seu usuário.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Área dos advogados</h1>
        <p className="text-sm text-muted-foreground">
          Processos atribuídos, agrupados por tipo de processo.
        </p>
      </div>

      <Filtros
        value={filtros}
        onChange={setFiltros}
        empresas={empresas}
        areas={areas}
        advogados={advogados}
        hide={["advogado"]}
      />

      <Tabs defaultValue={visiveis[0].id}>
        <TabsList className="flex-wrap">
          {visiveis.map((a) => (
            <TabsTrigger key={a.id} value={a.id}>
              {a.nome}
            </TabsTrigger>
          ))}
        </TabsList>

        {visiveis.map((adv) => {
          const meus = base.filter((p) => p.advogado_id === adv.id);
          const semArea = meus.filter((p) => !p.area_id);
          return (
            <TabsContent key={adv.id} value={adv.id} className="space-y-6 pt-4">
              <p className="text-xs text-muted-foreground">
                OAB {adv.oab || "não informada"} · {meus.length} processo(s)
              </p>
              {meus.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum processo para os filtros atuais.
                </p>
              )}
              {areas.map((area) => {
                const lista = meus.filter((p) => p.area_id === area.id);
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
                          empresaNome={empresas.find((e) => e.id === p.empresa_id)?.nome}
                          empresaCor={empresas.find((e) => e.id === p.empresa_id)?.cor}
                          areaNome={area.nome}
                          advogadoNome={adv.nome}
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
                        empresaNome={empresas.find((e) => e.id === p.empresa_id)?.nome}
                        empresaCor={empresas.find((e) => e.id === p.empresa_id)?.cor}
                        advogadoNome={adv.nome}
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
        canEdit={isAdmin || selecionado?.advogado_id === meuAdvogado?.id}
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
