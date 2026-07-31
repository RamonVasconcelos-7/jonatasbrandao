import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  STATUS_LIST,
  useSaveProcesso,
  type AdvogadoRow,
  type Area,
  type Empresa,
  type Processo,
  type Status,
} from "@/lib/data";

const NONE = "__none__";

type Props = {
  open: boolean;
  processo: Processo | null;
  empresas: Empresa[];
  areas: Area[];
  advogados: AdvogadoRow[];
  onOpenChange: (open: boolean) => void;
};

type FormState = {
  numero: string;
  empresa_id: string;
  advogado_id: string;
  area_id: string;
  data_autuacao: string;
  classe: string;
  parte_contraria: string;
  vara: string;
  status: Status;
  data_audiencia: string;
  observacoes: string;
  valor_acao: string;
  ultima_movimentacao_data: string;
  ultima_movimentacao_texto: string;
};

const empty: FormState = {
  numero: "",
  empresa_id: NONE,
  advogado_id: NONE,
  area_id: NONE,
  data_autuacao: "",
  classe: "",
  parte_contraria: "",
  vara: "",
  status: "Aguardando",
  data_audiencia: "",
  observacoes: "",
  valor_acao: "",
  ultima_movimentacao_data: "",
  ultima_movimentacao_texto: "",
};

export function ProcessoForm({ open, processo, empresas, areas, advogados, onOpenChange }: Props) {
  const [form, setForm] = useState<FormState>(empty);
  const save = useSaveProcesso();

  useEffect(() => {
    if (!open) return;
    setForm(
      processo
        ? {
            numero: processo.numero,
            empresa_id: processo.empresa_id ?? NONE,
            advogado_id: processo.advogado_id ?? NONE,
            area_id: processo.area_id ?? NONE,
            data_autuacao: processo.data_autuacao ?? "",
            classe: processo.classe ?? "",
            parte_contraria: processo.parte_contraria ?? "",
            vara: processo.vara ?? "",
            status: processo.status,
            data_audiencia: processo.data_audiencia ?? "",
            observacoes: processo.observacoes ?? "",
            valor_acao: processo.valor_acao != null ? String(processo.valor_acao) : "",
            ultima_movimentacao_data: processo.ultima_movimentacao_data ?? "",
            ultima_movimentacao_texto: processo.ultima_movimentacao_texto ?? "",
          }
        : empty,
    );
  }, [open, processo]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.numero.trim()) {
      toast.error("Informe o número do processo");
      return;
    }
    const values = {
      numero: form.numero.trim(),
      empresa_id: form.empresa_id === NONE ? null : form.empresa_id,
      advogado_id: form.advogado_id === NONE ? null : form.advogado_id,
      area_id: form.area_id === NONE ? null : form.area_id,
      data_autuacao: form.data_autuacao || null,
      classe: form.classe.trim() || null,
      parte_contraria: form.parte_contraria.trim() || null,
      vara: form.vara.trim() || null,
      status: form.status,
      data_audiencia: form.data_audiencia || null,
      observacoes: form.observacoes.trim() || null,
      valor_acao: form.valor_acao ? Number(form.valor_acao) : null,
      ultima_movimentacao_data: form.ultima_movimentacao_data || null,
      ultima_movimentacao_texto: form.ultima_movimentacao_texto.trim() || null,
    };
    save.mutate(
      { id: processo?.id, values },
      {
        onSuccess: () => {
          toast.success(processo ? "Processo atualizado" : "Processo cadastrado");
          onOpenChange(false);
        },
        onError: (err: unknown) => toast.error((err as Error).message ?? "Erro ao salvar"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{processo ? "Editar processo" : "Novo processo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="numero">Número do processo (autos)</Label>
            <Input
              id="numero"
              value={form.numero}
              onChange={(e) => set("numero", e.target.value)}
              maxLength={60}
              className="mt-1 font-mono"
            />
          </div>

          <div>
            <Label>Empresa</Label>
            <Select value={form.empresa_id} onValueChange={(v) => set("empresa_id", v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Sem empresa</SelectItem>
                {empresas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Área / tipo</Label>
            <Select value={form.area_id} onValueChange={(v) => set("area_id", v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Sem área</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Advogado responsável</Label>
            <Select value={form.advogado_id} onValueChange={(v) => set("advogado_id", v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Não distribuído</SelectItem>
                {advogados.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v as Status)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_LIST.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="autuacao">Data de autuação</Label>
            <Input
              id="autuacao"
              type="date"
              className="mt-1"
              value={form.data_autuacao}
              onChange={(e) => set("data_autuacao", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="audiencia">Data de audiência</Label>
            <Input
              id="audiencia"
              type="date"
              className="mt-1"
              value={form.data_audiencia}
              onChange={(e) => set("data_audiencia", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="classe">Classe / tipo de ação</Label>
            <Input
              id="classe"
              className="mt-1"
              maxLength={120}
              value={form.classe}
              onChange={(e) => set("classe", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="valor">Valor da ação (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              className="mt-1"
              value={form.valor_acao}
              onChange={(e) => set("valor_acao", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="parte">Parte contrária / Reclamante</Label>
            <Input
              id="parte"
              className="mt-1"
              maxLength={160}
              value={form.parte_contraria}
              onChange={(e) => set("parte_contraria", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="vara">Vara / Órgão julgador</Label>
            <Input
              id="vara"
              className="mt-1"
              maxLength={160}
              value={form.vara}
              onChange={(e) => set("vara", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="movdata">Última movimentação (data)</Label>
            <Input
              id="movdata"
              type="date"
              className="mt-1"
              value={form.ultima_movimentacao_data}
              onChange={(e) => set("ultima_movimentacao_data", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="movtexto">Última movimentação (descrição)</Label>
            <Input
              id="movtexto"
              className="mt-1"
              maxLength={300}
              value={form.ultima_movimentacao_texto}
              onChange={(e) => set("ultima_movimentacao_texto", e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              className="mt-1"
              maxLength={2000}
              value={form.observacoes}
              onChange={(e) => set("observacoes", e.target.value)}
            />
          </div>

          <DialogFooter className="col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
