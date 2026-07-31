// Roda uma vez por dia (agendado via pg_cron, ver migration 20260731010100_cron_prazo_reminders.sql).
// Envia e-mail para o advogado responsável 3 dias e 1 dia antes de cada prazo fatal não cumprido.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { baseTemplate, sendEmail } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
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
  const em3dias = toISODate(new Date(hoje.getTime() + 3 * 86400000));
  const em1dia = toISODate(new Date(hoje.getTime() + 1 * 86400000));

  let enviados = 0;
  let erros = 0;

  for (const { data: alvo, campo } of [
    { data: em3dias, campo: "notificado_3d" as const },
    { data: em1dia, campo: "notificado_1d" as const },
  ]) {
    const { data: prazos, error } = await supabase
      .from("prazos")
      .select(
        "id, tipo, data, descricao, cumprido, notificado_3d, notificado_1d, processos(numero, advogados(nome, email))",
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

      if (!advogado?.email) continue;

      const diasRestantes = campo === "notificado_3d" ? 3 : 1;
      const html = baseTemplate(
        `Prazo em ${diasRestantes} dia${diasRestantes > 1 ? "s" : ""}`,
        `<p>Olá, ${advogado.nome}.</p>
         <p>O processo <strong>${processo?.numero}</strong> tem um prazo vencendo em
         <strong>${diasRestantes} dia${diasRestantes > 1 ? "s" : ""}</strong> (${prazo.data}).</p>
         <p>Tipo: ${prazo.tipo}</p>
         ${prazo.descricao ? `<p>${prazo.descricao}</p>` : ""}`,
      );

      const result = await sendEmail(
        advogado.email,
        `Prazo em ${diasRestantes} dia(s) — processo ${processo?.numero}`,
        html,
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
