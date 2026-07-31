// Roda uma vez por dia (agendado via pg_cron, ver supabase/cron-setup.sql).
// Envia e-mail simples para o advogado responsável 3 dias antes, 1 dia antes e no
// próprio dia em que um prazo não cumprido vence.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendEmail } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

// Nome curto e em maiúsculas para o e-mail, ex.: "CONTESTAÇÃO".
const TIPO_CURTO: Record<string, string> = {
  Audiencia: "AUDIÊNCIA",
  Manifestacao_Parte_Contraria: "MANIFESTAÇÃO DA PARTE CONTRÁRIA",
  Aguardando_Sentenca_Decisao: "SENTENÇA/DECISÃO",
  Contestacao: "CONTESTAÇÃO",
  Replica_Impugnacao: "RÉPLICA/IMPUGNAÇÃO",
  Recurso_Apelacao: "RECURSO",
  Contrarrazoes: "CONTRARRAZÕES",
  Embargos_Declaracao: "EMBARGOS DE DECLARAÇÃO",
  Cumprimento_Sentenca: "CUMPRIMENTO DE SENTENÇA",
  Prazo_Interno_Escritorio: "PRAZO INTERNO",
  Diligencia: "DILIGÊNCIA",
  Pericia: "PERÍCIA",
  Outro: "PRAZO",
};

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Proteção simples: só executa se chamado com o segredo do cron (evita disparo público).
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret && req.headers.get("x-cron-secret") !== cronSecret) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const hoje = new Date();
  const alvos: {
    data: string;
    campo: "notificado_3d" | "notificado_1d" | "notificado_0d";
    dias: number;
  }[] = [
    { data: toISODate(new Date(hoje.getTime() + 3 * 86400000)), campo: "notificado_3d", dias: 3 },
    { data: toISODate(new Date(hoje.getTime() + 1 * 86400000)), campo: "notificado_1d", dias: 1 },
    { data: toISODate(hoje), campo: "notificado_0d", dias: 0 },
  ];

  let enviados = 0;
  let erros = 0;

  for (const { data: alvo, campo, dias } of alvos) {
    const { data: prazos, error } = await supabase
      .from("prazos")
      .select(
        "id, tipo, data, cumprido, notificado_3d, notificado_1d, notificado_0d, processos(numero, advogados(nome, email))",
      )
      .eq("data", alvo)
      .eq("cumprido", false)
      .eq(campo, false);

    if (error) {
      console.error(error.message);
      erros++;
      continue;
    }

    for (const prazo of prazos ?? []) {
      const processo = prazo.processos as unknown as {
        numero: string;
        advogados: { nome: string; email: string | null } | null;
      } | null;
      const advogado = processo?.advogados ?? null;

      if (!advogado?.email || !processo) continue;

      const tipoLabel = TIPO_CURTO[prazo.tipo] ?? prazo.tipo;
      const texto =
        dias === 0
          ? `Processo ${processo.numero} está com um prazo para ${tipoLabel} que vence hoje.`
          : `Processo ${processo.numero} está com um prazo para ${tipoLabel} daqui a ${dias} dia${dias > 1 ? "s" : ""}.`;

      const result = await sendEmail(
        advogado.email,
        dias === 0
          ? `Prazo vence hoje — processo ${processo.numero}`
          : `Prazo em ${dias} dia(s) — processo ${processo.numero}`,
        texto,
      );

      if (result.ok) {
        enviados++;
        await supabase
          .from("prazos")
          .update({ [campo]: true } as never)
          .eq("id", prazo.id);
      } else if (!result.skipped) {
        erros++;
      }
    }
  }

  return new Response(JSON.stringify({ enviados, erros }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
