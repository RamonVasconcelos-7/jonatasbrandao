import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, CalendarClock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jônatas Brandão — Controle de processos do escritório" },
      {
        name: "description",
        content:
          "Centralize processos, prazos e audiências por empresa cliente, área e advogado responsável.",
      },
      { property: "og:title", content: "Jônatas Brandão — Controle de processos" },
      {
        property: "og:description",
        content: "Painel de processos, prazos e distribuição para escritórios de advocacia.",
      },
    ],
  }),
  component: Index,
});

const destaques = [
  {
    icon: Building2,
    titulo: "Por empresa cliente",
    texto: "Abas dedicadas para Engpac, Econtecx e Genesis, com processos separados por área.",
  },
  {
    icon: CalendarClock,
    titulo: "Prazos e audiências",
    texto: "Alertas de vencimento próximo e ordenação automática por urgência.",
  },
  {
    icon: ShieldCheck,
    titulo: "Acesso controlado",
    texto: "Administradores distribuem processos; cada advogado vê apenas a sua carteira.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="flex items-center gap-2">
            <img src="/brand/logo.png" alt="Jônatas Brandão" className="h-7 w-auto" />
            <span className="font-serif text-base">Jônatas Brandão</span>
          </span>
          <Button asChild size="sm" variant="secondary">
            <Link to="/auth">Entrar</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-20">
        <h1 className="max-w-2xl font-serif text-4xl leading-tight text-foreground sm:text-5xl">
          O controle completo dos processos do escritório em um só painel.
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Cadastre processos, distribua para os advogados responsáveis e acompanhe prazos,
          audiências e movimentações por empresa cliente.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild size="lg">
            <Link to="/auth">Acessar o sistema</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {destaques.map((d) => (
            <Card key={d.titulo} className="p-5">
              <d.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-sm font-semibold text-foreground">{d.titulo}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{d.texto}</p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
