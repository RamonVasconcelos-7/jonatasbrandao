// Envio de e-mail via Resend (https://resend.com).
// Requer os secrets RESEND_API_KEY e NOTIFY_FROM_EMAIL configurados no projeto Supabase:
//   supabase secrets set RESEND_API_KEY=re_xxx NOTIFY_FROM_EMAIL="Jônatas Brandão <notificacoes@seudominio.com.br>"
export async function sendEmail(to: string, subject: string, text: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("NOTIFY_FROM_EMAIL");
  if (!apiKey || !from) {
    console.error("RESEND_API_KEY ou NOTIFY_FROM_EMAIL não configurados — e-mail não enviado.");
    return { ok: false, skipped: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    // Corpo simples (texto puro), como pedido — sem template visual.
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) {
    console.error("Falha ao enviar e-mail:", await res.text());
    return { ok: false };
  }
  return { ok: true };
}
