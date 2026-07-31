// Dispara um e-mail simples para o advogado responsável quando um processo é
// cadastrado/distribuído a ele. Chamado pelo frontend logo após o insert em `processos`
// e também quando o campo advogado_id de um processo já existente é alterado
// (ver useSaveProcesso e o "Atribuir" da tela de Distribuição).
import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendEmail } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { processo_id } = await req.json();
    if (!processo_id) {
      return new Response(JSON.stringify({ error: "processo_id é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: processo, error } = await supabase
      .from("processos")
      .select("numero, advogados(nome, email)")
      .eq("id", processo_id)
      .maybeSingle();

    if (error || !processo) {
      return new Response(JSON.stringify({ error: error?.message ?? "Processo não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const advogado = processo.advogados as unknown as { nome: string; email: string | null } | null;

    if (!advogado?.email) {
      return new Response(JSON.stringify({ ok: true, skipped: "advogado sem e-mail cadastrado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await sendEmail(
      advogado.email,
      `Processo ${processo.numero} atribuído a você`,
      `Processo ${processo.numero} foi cadastrado e atribuído a você.`,
    );

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
