import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  TIPO_PRAZO_LABEL,
  TIPO_PRAZO_LIST,
  daysUntil,
  formatCurrency,
  formatDate,
  useAddMovimentacao,
  useDeletePrazo,
  useDeleteProcesso,
  useMovimentacoes,
  usePrazos,
  useSavePrazo,
  type AdvogadoRow,
  type Area,
  type Empresa,
  type Processo,
  type TipoPrazo,
} from "@/lib/data";

type Props = {
  processo: Processo | null;
  empresas: Empresa[];
  areas: Area[];
  advogados: AdvogadoRow[];
  canEdit: boolean;
  onClose: () => void;
  onEdit?: (p: Processo) => void;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}

function NovoPrazoForm({ processoId }: { processoId: string }) {
  const save = useSavePrazo();
  const [tipo, setTipo] = useState<TipoPrazo>("Outro");
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) {
      toast.error("Informe a data do prazo");
      return;
    }
    save.mutate(
      { values: { processo_id: processoId, tipo, data, descricao: descricao.trim() || null } },
      {
        onSuccess: () => {
          toast.success("Prazo adicionado");
          setData("");
          setDescricao("");
          setTipo("Outro");
        },
        onError: (err: unknown) => toast.error((err as Error).message ?? "Erro ao salvar prazo"),
      },
    );
  };

  return (
    <form onSubmit={submit} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
      <Select value={tipo} onValueChange={(v) => setTipo(v as TipoPrazo)}>
        <SelectTrigger className="sm:col-span-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIPO_PRAZO_LIST.map((t) => (
            <SelectItem key={t} value={t}>
              {TIPO_PRAZO_LABEL[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
      <div className="flex gap-2">
        <Input
          placeholder="Descrição (opcional)"
          value={descricao}
          maxLength={200}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <Button type="submit" disabled={save.isPending}>
          Add
        </Button>
      </div>
    </form>
  );
}

function PrazosSection({ processo, canEdit }: { processo: Processo; canEdit: boolean }) {
  const { data: prazos = [] } = usePrazos(processo.id);
  const savePrazo = useSavePrazo();
  const deletePrazo = useDeletePrazo();

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">Prazos</h3>
      <div className="mt-3 space-y-2">
        {prazos.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum prazo cadastrado para este processo.
          </p>
        )}
        {prazos.map((pr) => {
          const dias = daysUntil(pr.data);
          const urgente = !pr.cumprido && dias !== null && dias >= 0 && dias <= 3;
          const vencido = !pr.cumprido && dias !== null && dias < 0;
          return (
            <div
              key={pr.id}
              className={`flex items-start justify-between gap-3 rounded-md border p-2.5 text-sm ${
                pr.cumprido
                  ? "border-border bg-muted/30 opacity-70"
                  : urgente || vencido
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-border bg-muted/40"
              }`}
            >
              <div className="flex items-start gap-2">
                {canEdit && (
                  <Checkbox
                    checked={pr.cumprido}
                    className="mt-0.5"
                    onCheckedChange={(v) =>
                      savePrazo.mutate({ id: pr.id, values: { cumprido: !!v } })
                    }
                  />
                )}
                <div>
                  <p className={`font-medium ${pr.cumprido ? "line-through" : ""}`}>
                    {TIPO_PRAZO_LABEL[pr.tipo]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(pr.data)}
                    {!pr.cumprido && dias !== null && (
                      <> · {dias < 0 ? "vencido" : dias === 0 ? "hoje" : `em ${dias} dia(s)`}</>
                    )}
                    {pr.descricao ? ` · ${pr.descricao}` : ""}
                  </p>
                </div>
              </div>
              {canEdit && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => deletePrazo.mutate(pr.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
      {canEdit && <NovoPrazoForm processoId={processo.id} />}
    </div>
  );
}

export function ProcessoDetail({
  processo,
  empresas,
  areas,
  advogados,
  canEdit,
  onClose,
  onEdit,
}: Props) {
  const { data: movs } = useMovimentacoes(processo?.id ?? null);
  const addMov = useAddMovimentacao();
  const deleteProcesso = useDeleteProcesso();
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));

  if (!processo) return null;

  const empresa = empresas.find((e) => e.id === processo.empresa_id);
  const area = areas.find((a) => a.id === processo.area_id);
  const advogado = advogados.find((a) => a.id === processo.advogado_id);

  return (
    <Dialog open={!!processo} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-base">{processo.numero}</DialogTitle>
          <DialogDescription>
            {[empresa?.nome, area?.nome, advogado?.nome ?? "Não distribuído"]
              .filter(Boolean)
              .join(" · ")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={processo.status} />
          {canEdit && onEdit && (
            <Button size="sm" variant="outline" onClick={() => onEdit(processo)}>
              Editar processo
            </Button>
          )}
          {canEdit && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Apagar processo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apagar processo {processo.numero}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação remove o processo, suas movimentações e prazos cadastrados. Não pode
                    ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() =>
                      deleteProcesso.mutate(processo.id, {
                        onSuccess: () => {
                          toast.success("Processo apagado");
                          onClose();
                        },
                        onError: (err: unknown) =>
                          toast.error((err as Error).message ?? "Erro ao apagar"),
                      })
                    }
                  >
                    Apagar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="mt-2 grid grid-cols-2 gap-4">
          <Field label="Classe / Ação" value={processo.classe ?? ""} />
          <Field label="Valor da ação" value={formatCurrency(processo.valor_acao)} />
          <Field label="Parte contrária / Reclamante" value={processo.parte_contraria ?? ""} />
          <Field label="Vara / Órgão julgador" value={processo.vara ?? ""} />
          <Field label="Data de autuação" value={formatDate(processo.data_autuacao)} />
          <Field
            label="Última movimentação"
            value={
              processo.ultima_movimentacao_texto
                ? `${formatDate(processo.ultima_movimentacao_data)} — ${processo.ultima_movimentacao_texto}`
                : ""
            }
          />
          <Field label="Observações" value={processo.observacoes ?? ""} />
        </div>

        <Separator className="my-2" />

        <PrazosSection processo={processo} canEdit={canEdit} />

        <Separator className="my-2" />

        <div>
          <h3 className="text-sm font-semibold text-foreground">Histórico de movimentações</h3>
          <div className="mt-3 space-y-2">
            {(movs ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
            )}
            {(movs ?? []).map((m) => (
              <div key={m.id} className="rounded-md border border-border bg-muted/40 p-2.5">
                <p className="text-xs font-medium text-muted-foreground">{formatDate(m.data)}</p>
                <p className="text-sm text-foreground">{m.descricao}</p>
              </div>
            ))}
          </div>

          {canEdit && (
            <form
              className="mt-4 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!descricao.trim()) return;
                addMov.mutate(
                  { processo_id: processo.id, data, descricao: descricao.trim() },
                  {
                    onSuccess: () => {
                      setDescricao("");
                      toast.success("Movimentação registrada");
                    },
                    onError: (err: unknown) =>
                      toast.error((err as Error).message ?? "Erro ao registrar"),
                  },
                );
              }}
            >
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-40"
                />
                <Button type="submit" disabled={addMov.isPending}>
                  Adicionar
                </Button>
              </div>
              <Textarea
                placeholder="Descrição da movimentação"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                maxLength={1000}
              />
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
