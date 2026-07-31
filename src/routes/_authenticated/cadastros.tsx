import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  EMPRESA_TIPO_LABEL,
  EMPRESA_TIPO_LIST,
  useAdvogados,
  useAreas,
  useEmpresas,
  useInvalidate,
  type EmpresaTipo,
} from "@/lib/data";

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
      { title: "Cadastros — Jônatas Brandão" },
      {
        name: "description",
        content: "Cadastro de empresas clientes, áreas de atuação e advogados do escritório.",
      },
      { property: "og:title", content: "Cadastros — Jônatas Brandão" },
      { property: "og:description", content: "Gerencie empresas, áreas e advogados." },
    ],
  }),
  component: CadastrosPage,
});

function AdvogadoEmailField({ id, emailAtual }: { id: string; emailAtual: string | null }) {
  const invalidate = useInvalidate();
  const [email, setEmail] = useState(emailAtual ?? "");
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    setSalvando(true);
    const { error } = await supabase
      .from("advogados")
      .update({ email: email.trim() || null } as never)
      .eq("id", id);
    setSalvando(false);
    if (error) return toast.error(error.message);
    invalidate(["advogados"]);
    toast.success("E-mail de notificação atualizado");
  };

  return (
    <div className="flex gap-1.5">
      <Input
        type="email"
        placeholder="e-mail para notificações"
        className="h-7 text-xs"
        value={email}
        maxLength={120}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-2 text-xs"
        disabled={salvando}
        onClick={salvar}
      >
        Salvar
      </Button>
    </div>
  );
}

function CadastrosPage() {
  const invalidate = useInvalidate();
  const { data: empresas = [] } = useEmpresas();
  const { data: areas = [] } = useAreas();
  const { data: advogados = [] } = useAdvogados();

  const [empresaNome, setEmpresaNome] = useState("");
  const [empresaCor, setEmpresaCor] = useState("#1e3a5f");
  const [empresaTipo, setEmpresaTipo] = useState<EmpresaTipo>("Empresa");
  const [areaNome, setAreaNome] = useState("");
  const [advNome, setAdvNome] = useState("");
  const [advOab, setAdvOab] = useState("");
  const [advLoginEmail, setAdvLoginEmail] = useState("");

  const criarEmpresa = async () => {
    if (!empresaNome.trim()) return;
    const { error } = await supabase
      .from("empresas")
      .insert({ nome: empresaNome.trim(), cor: empresaCor, tipo: empresaTipo } as never);
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
    if (advLoginEmail.trim()) {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", advLoginEmail.trim().toLowerCase())
        .maybeSingle();
      if (!data) {
        toast.error(
          "Nenhum usuário cadastrado com esse e-mail. Peça para ele criar a conta antes.",
        );
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
    setAdvLoginEmail("");
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
          <div className="space-y-2">
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
            </div>
            <div className="flex gap-2">
              <Select value={empresaTipo} onValueChange={(v) => setEmpresaTipo(v as EmpresaTipo)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPRESA_TIPO_LIST.map((t) => (
                    <SelectItem key={t} value={t}>
                      {EMPRESA_TIPO_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={criarEmpresa}>Add</Button>
            </div>
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
                  <span className="text-xs text-muted-foreground">
                    ({EMPRESA_TIPO_LABEL[e.tipo]})
                  </span>
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
              <Label htmlFor="advloginemail">
                E-mail de login (opcional, vincula a uma conta já criada)
              </Label>
              <Input
                id="advloginemail"
                type="email"
                className="mt-1"
                maxLength={120}
                value={advLoginEmail}
                onChange={(e) => setAdvLoginEmail(e.target.value)}
              />
            </div>
            <Button onClick={criarAdvogado} className="w-full">
              Cadastrar advogado
            </Button>
          </div>
          <ul className="space-y-2 text-sm">
            {advogados.map((a) => (
              <li
                key={a.id}
                className="space-y-1 border-b border-border pb-2 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between">
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
                </div>
                <AdvogadoEmailField id={a.id} emailAtual={a.email} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
