import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Status = "Aguardando" | "Em Progresso" | "Concluído";
export const STATUS_LIST: Status[] = ["Aguardando", "Em Progresso", "Concluído"];

export type Empresa = { id: string; nome: string; cor: string };
export type Area = { id: string; nome: string };
export type AdvogadoRow = { id: string; nome: string; oab: string | null; user_id: string | null };

export type Processo = {
  id: string;
  empresa_id: string | null;
  advogado_id: string | null;
  area_id: string | null;
  numero: string;
  data_autuacao: string | null;
  classe: string | null;
  parte_contraria: string | null;
  vara: string | null;
  status: Status;
  data_audiencia: string | null;
  observacoes: string | null;
  valor_acao: number | null;
  ultima_movimentacao_data: string | null;
  ultima_movimentacao_texto: string | null;
  created_at: string;
  updated_at: string;
};

export type Movimentacao = {
  id: string;
  processo_id: string;
  data: string;
  descricao: string;
};

export function useEmpresas() {
  return useQuery({
    queryKey: ["empresas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("empresas").select("*").order("nome");
      if (error) throw error;
      return data as Empresa[];
    },
  });
}

export function useAreas() {
  return useQuery({
    queryKey: ["areas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("areas").select("*").order("nome");
      if (error) throw error;
      return data as Area[];
    },
  });
}

export function useAdvogados() {
  return useQuery({
    queryKey: ["advogados"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advogados")
        .select("id, nome, oab, user_id")
        .order("nome");
      if (error) throw error;
      return data as AdvogadoRow[];
    },
  });
}

export function useProcessos() {
  return useQuery({
    queryKey: ["processos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Processo[];
    },
  });
}

export function useMovimentacoes(processoId: string | null) {
  return useQuery({
    queryKey: ["movimentacoes", processoId],
    enabled: !!processoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movimentacoes")
        .select("*")
        .eq("processo_id", processoId!)
        .order("data", { ascending: false });
      if (error) throw error;
      return data as Movimentacao[];
    },
  });
}

export function useInvalidate() {
  const qc = useQueryClient();
  return (keys: string[]) => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
}

export function useSaveProcesso() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Record<string, unknown> }) => {
      if (id) {
        const { error } = await supabase.from("processos").update(values).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("processos").insert(values as never);
        if (error) throw error;
      }
    },
    onSuccess: () => invalidate(["processos"]),
  });
}

export function useAddMovimentacao() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({
      processo_id,
      data,
      descricao,
    }: {
      processo_id: string;
      data: string;
      descricao: string;
    }) => {
      const { error } = await supabase
        .from("movimentacoes")
        .insert({ processo_id, data, descricao } as never);
      if (error) throw error;
      const { error: upErr } = await supabase
        .from("processos")
        .update({ ultima_movimentacao_data: data, ultima_movimentacao_texto: descricao })
        .eq("id", processo_id);
      if (upErr) throw upErr;
    },
    onSuccess: () => invalidate(["movimentacoes", "processos"]),
  });
}

export function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(value: string | null) {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return `${d}/${m}/${y}`;
}

export function daysUntil(value: string | null) {
  if (!value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${value}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function sortByPrazo(a: Processo, b: Processo) {
  const da = daysUntil(a.data_audiencia);
  const db = daysUntil(b.data_audiencia);
  const va = da === null || da < 0 ? Number.MAX_SAFE_INTEGER : da;
  const vb = db === null || db < 0 ? Number.MAX_SAFE_INTEGER : db;
  if (va !== vb) return va - vb;
  return a.numero.localeCompare(b.numero);
}
