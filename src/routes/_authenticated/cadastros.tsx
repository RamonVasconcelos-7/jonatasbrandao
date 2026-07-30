import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdvogados, useAreas, useEmpresas, useInvalidate } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/cadastros")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", (context as { user: { id: string } }).user.id);
    if (!(data ?? []).some((r) => r.role === "admin")) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Cadastros — Gestão Jurídica" },
      {
        name: "description",
        content: "Cadastro de empresas clientes, áreas de atuação e advogados do escritório.",
      },
      { property: "og:title", content: "Cadastros — Gestão Jurídica" },
      { property: "og:description", content: "Gerencie empresas, áreas e advogados." },
    ],
  }),
  component: CadastrosPage,
});

function CadastrosPage() {
  const invalidate = useInvalidate();
  const { data: empresas = [] } = useEmpresas();
  const { data: areas = [] } = useAreas();
  const { data: advogados = [] } = useAdvogados();

  const [empresaNome, setEmpresaNome] = useState("");
  const [empresaCor, setEmpresaCor] = useState("#1e3a5f");
  const [areaNome, setAreaNome] = useState("");
  const [advNome, setAdvNome] = useState("");
  const [advOab, setAdvOab] = useState("");
  const [advEmail, setAdvEmail] = useState("");

  const criarEmpresa = async () => {
    if (!empresaNome.trim()) return;
    const { error } = await supabase
      .from("empresas")
      .insert({ nome: empresaNome.trim(), cor: empresaCor } as never);
    if (error) return toast.error(error.message);
    setEmpresaNome("");
    invalidate(["empresas"]);
    toast.success("Empresa cadastrada");
  };

  const criarArea = async () => {
    if (!areaNome.trim()) return;
    const { error } = await supabase.from("areas").insert({ nome: areaNome.trim() } as never);
    if (error) return toast.error(error.message);
    setAreaNome("");
    invalidate(["areas"]);
    toast.success("Área cadastrada");
  };

  const criarAdvogado = async () => {
    if (!advNome.trim()) return;
    let userId: string | null = null;
    if (advEmail.trim()) {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", advEmail.trim().toLowerCase())
        .maybeSingle();
      if (!data) {
        toast.error("Nenhum usuário cadastrado com esse e-mail. Peça para ele criar a conta antes.");
        return;
      }
      userId = data.id;
    }
    const { error } = await supabase
      .from("advogados")
      .insert({ nome: advNome.trim(), oab: advOab.trim() || null, user_id: userId } as never);
    if (error) return toast.error(error.message);
    setAdvNome("");
    setAdvOab("");
    setAdvEmail("");
    invalidate(["advogados"]);
    toast.success("Advogado cadastrado");
  };

  const remover = async (table: "empresas" | "areas" | "advogados", id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    invalidate([table]);
    toast.success("Registro removido");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Cadastros</h1>
        <p className="text-sm text-muted-foreground">Empresas, áreas de atuação e advogados.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3 p-4">
          <h2 className="text-sm font-semibold">Empresas</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Nome"
              value={empresaNome}
              maxLength={60}
              onChange={(e) => setEmpresaNome(e.target.value)}
            />
            <Input
              type="color"
              className="w-14 p-1"
              value={empresaCor}
              onChange={(e) => setEmpresaCor(e.target.value)}
            />
            <Button onClick={criarEmpresa}>Add</Button>
          </div>
          <ul className="space-y-1.5 text-sm">
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
                <Button size="sm" variant="ghost" onClick={() => remover("empresas", e.id)}>
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-3 p-4">
          <h2 className="text-sm font-semibold">Áreas / tipos de processo</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Ex.: Criminal"
              value={areaNome}
              maxLength={60}
              onChange={(e) => setAreaNome(e.target.value)}
            />
            <Button onClick={criarArea}>Add</Button>
          </div>
          <ul className="space-y-1.5 text-sm">
            {areas.map((a) => (
              <li key={a.id} className="flex items-center justify-between">
                {a.nome}
                <Button size="sm" variant="ghost" onClick={() => remover("areas", a.id)}>
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-3 p-4">
          <h2 className="text-sm font-semibold">Advogados</h2>
          <div className="space-y-2">
            <div>
              <Label htmlFor="advnome">Nome</Label>
              <Input
                id="advnome"
                className="mt-1"
                maxLength={80}
                value={advNome}
                onChange={(e) => setAdvNome(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="advoab">OAB</Label>
              <Input
                id="advoab"
                className="mt-1"
                maxLength={30}
                value={advOab}
                onChange={(e) => setAdvOab(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="advemail">E-mail do usuário (opcional)</Label>
              <Input
                id="advemail"
                type="email"
                className="mt-1"
                maxLength={120}
                value={advEmail}
                onChange={(e) => setAdvEmail(e.target.value)}
              />
            </div>
            <Button onClick={criarAdvogado} className="w-full">
              Cadastrar advogado
            </Button>
          </div>
          <ul className="space-y-1.5 text-sm">
            {advogados.map((a) => (
              <li key={a.id} className="flex items-center justify-between">
                <span>
                  {a.nome}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {a.oab ? `OAB ${a.oab}` : "sem OAB"}
                    {a.user_id ? " · login vinculado" : ""}
                  </span>
                </span>
                <Button size="sm" variant="ghost" onClick={() => remover("advogados", a.id)}>
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
