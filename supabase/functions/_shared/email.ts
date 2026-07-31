// Envio de e-mail via Resend (https://resend.com).
// Requer os secrets RESEND_API_KEY e NOTIFY_FROM_EMAIL configurados no projeto Supabase:
//   supabase secrets set RESEND_API_KEY=re_xxx NOTIFY_FROM_EMAIL="Jônatas Brandão <notificacoes@seudominio.com.br>"
export async function sendEmail(to: string, subject: string, html: string) {
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
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    console.error("Falha ao enviar e-mail:", await res.text());
    return { ok: false };
  }
  return { ok: true };
}

export function baseTemplate(title: string, bodyHtml: string) {
  return `
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
    <div style="background:#1e2a3a; padding: 20px 24px;">
      <span style="color:#e8c976; font-size: 18px; letter-spacing: 0.5px;">Jônatas Brandão Advogados</span>
    </div>
    <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
      <h1 style="font-size: 18px; margin: 0 0 12px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
        Esta é uma notificação automática do sistema de gestão de processos do escritório.
      </p>
    </div>
  </div>`;
}
