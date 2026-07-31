import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Status = "Aguardando" | "Em Progresso" | "Concluído";
export const STATUS_LIST: Status[] = ["Aguardando", "Em Progresso", "Concluído"];

export type EmpresaTipo = "Escritorio" | "Empresa" | "Prefeitura";
export const EMPRESA_TIPO_LIST: EmpresaTipo[] = ["Escritorio", "Empresa", "Prefeitura"];
export const EMPRESA_TIPO_LABEL: Record<EmpresaTipo, string> = {
  Escritorio: "Escritório",
  Empresa: "Empresas",
  Prefeitura: "Prefeituras",
};

export type Empresa = { id: string; nome: string; cor: string; tipo: EmpresaTipo };
export type Area = { id: string; nome: string };
export type AdvogadoRow = {
  id: string;
  nome: string;
  oab: string | null;
  user_id: string | null;
  email: string | null;
};

export type TipoPrazo =
  | "Audiencia"
  | "Manifestacao_Parte_Contraria"
  | "Aguardando_Sentenca_Decisao"
  | "Contestacao"
  | "Replica_Impugnacao"
  | "Recurso_Apelacao"
  | "Contrarrazoes"
  | "Embargos_Declaracao"
  | "Cumprimento_Sentenca"
  | "Prazo_Interno_Escritorio"
  | "Diligencia"
  | "Pericia"
  | "Outro";

export const TIPO_PRAZO_LIST: TipoPrazo[] = [
  "Audiencia",
  "Manifestacao_Parte_Contraria",
  "Aguardando_Sentenca_Decisao",
  "Contestacao",
  "Replica_Impugnacao",
  "Recurso_Apelacao",
  "Contrarrazoes",
  "Embargos_Declaracao",
  "Cumprimento_Sentenca",
  "Prazo_Interno_Escritorio",
  "Diligencia",
  "Pericia",
  "Outro",
];

export const TIPO_PRAZO_LABEL: Record<TipoPrazo, string> = {
  Audiencia: "Audiência",
  Manifestacao_Parte_Contraria: "Aguardando manifestação da parte contrária",
  Aguardando_Sentenca_Decisao: "Aguardando sentença/decisão",
  Contestacao: "Prazo para contestação",
  Replica_Impugnacao: "Prazo para réplica/impugnação",
  Recurso_Apelacao: "Prazo recursal (apelação/recurso)",
  Contrarrazoes: "Prazo para contrarrazões",
  Embargos_Declaracao: "Prazo para embargos de declaração",
  Cumprimento_Sentenca: "Cumprimento de sentença",
  Prazo_Interno_Escritorio: "Prazo interno do escritório",
  Diligencia: "Diligência",
  Pericia: "Perícia",
  Outro: "Outro prazo",
};

export type Prazo = {
  id: string;
  processo_id: string;
  tipo: TipoPrazo;
  data: string;
  descricao: string | null;
  cumprido: boolean;
  notificado_3d: boolean;
  notificado_1d: boolean;
  created_at: string;
};

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
        .select("id, nome, oab, user_id, email")
        .order("nome");
      if (error) throw error;
      return data as AdvogadoRow[];
    },
  });
}

export function usePrazos(processoId: string | null) {
  return useQuery({
    queryKey: ["prazos", processoId],
    enabled: !!processoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prazos")
        .select("*")
        .eq("processo_id", processoId!)
        .order("data", { ascending: true });
      if (error) throw error;
      return data as Prazo[];
    },
  });
}

/** Todos os prazos não cumpridos, com os dados do processo, para o calendário e o painel. */
export function useAllPrazos() {
  return useQuery({
    queryKey: ["prazos-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prazos")
        .select("*, processos(id, numero, empresa_id, advogado_id, area_id, status)")
        .order("data", { ascending: true });
      if (error) throw error;
      return data as (Prazo & {
        processos: Pick<
          Processo,
          "id" | "numero" | "empresa_id" | "advogado_id" | "area_id" | "status"
        > | null;
      })[];
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
        const { error } = await supabase
          .from("processos")
          .update(values as never)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("processos")
          .insert(values as never)
          .select("id")
          .single();
        if (error) throw error;
        const advogadoId = (values as { advogado_id?: string | null }).advogado_id;
        if (advogadoId && data) {
          // Dispara e-mail de "processo cadastrado" para o advogado responsável (best-effort).
          supabase.functions
            .invoke("notify-processo-atribuido", { body: { processo_id: data.id } })
            .catch(() => {});
        }
      }
    },

    onSuccess: () => invalidate(["processos"]),
  });
}

export function useDeleteProcesso() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("processos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(["processos", "prazos-all"]),
  });
}

export function useSavePrazo() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Record<string, unknown> }) => {
      if (id) {
        const { error } = await supabase
          .from("prazos")
          .update(values as never)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("prazos").insert(values as never);
        if (error) throw error;
      }
    },
    onSuccess: () => invalidate(["prazos", "prazos-all"]),
  });
}

export function useDeletePrazo() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prazos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(["prazos", "prazos-all"]),
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
