// Dispara um e-mail para o advogado responsável quando um processo é cadastrado/distribuído a ele.
// Chamado pelo frontend logo após o insert em `processos` (ver useSaveProcesso em src/lib/data.ts).
import { createClient } from "jsr:@supabase/supabase-js@2";
import { baseTemplate, sendEmail } from "../_shared/email.ts";

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
      .select("numero, classe, advogados(nome, email), empresas(nome)")
      .eq("id", processo_id)
      .maybeSingle();

    if (error || !processo) {
      return new Response(JSON.stringify({ error: error?.message ?? "Processo não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const advogado = processo.advogados as unknown as { nome: string; email: string | null } | null;
    const empresa = processo.empresas as unknown as { nome: string } | null;

    if (!advogado?.email) {
      return new Response(JSON.stringify({ ok: true, skipped: "advogado sem e-mail cadastrado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = baseTemplate(
      "Novo processo distribuído a você",
      `<p>Olá, ${advogado.nome}.</p>
       <p>O processo <strong>${processo.numero}</strong>${empresa ? ` (${empresa.nome})` : ""} foi cadastrado e distribuído para você.</p>
       ${processo.classe ? `<p>Classe: ${processo.classe}</p>` : ""}
       <p>Acesse o sistema para ver todos os detalhes e prazos.</p>`,
    );

    const result = await sendEmail(advogado.email, `Novo processo: ${processo.numero}`, html);

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
