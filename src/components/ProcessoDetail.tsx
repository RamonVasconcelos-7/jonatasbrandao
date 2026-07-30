import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import {
  formatCurrency,
  formatDate,
  useAddMovimentacao,
  useMovimentacoes,
  type AdvogadoRow,
  type Area,
  type Empresa,
  type Processo,
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

        <div className="flex items-center gap-3">
          <StatusBadge status={processo.status} />
          {canEdit && onEdit && (
            <Button size="sm" variant="outline" onClick={() => onEdit(processo)}>
              Editar processo
            </Button>
          )}
        </div>

        <div className="mt-2 grid grid-cols-2 gap-4">
          <Field label="Classe / Ação" value={processo.classe ?? ""} />
          <Field label="Valor da ação" value={formatCurrency(processo.valor_acao)} />
          <Field label="Parte contrária / Reclamante" value={processo.parte_contraria ?? ""} />
          <Field label="Vara / Órgão julgador" value={processo.vara ?? ""} />
          <Field label="Data de autuação" value={formatDate(processo.data_autuacao)} />
          <Field label="Data de audiência" value={formatDate(processo.data_audiencia)} />
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
