# E-mails automáticos (prazos e distribuição de processos)

Duas edge functions cuidam dos e-mails automáticos pedidos:

- `notify-processo-atribuido`: dispara um e-mail para o advogado quando um processo novo é
  cadastrado e já distribuído para ele. É chamada automaticamente pelo frontend
  (`useSaveProcesso` em `src/lib/data.ts`) logo depois do cadastro.
- `send-prazo-reminders`: dispara e-mails 3 dias e 1 dia antes de cada prazo fatal não cumprido.
  Precisa rodar uma vez por dia — ver `supabase/cron-setup.sql`.

Ambas usam [Resend](https://resend.com) para o envio. Passos para colocar no ar:

1. **Criar conta no Resend** (ou outro provedor SMTP/API de e-mail) e verificar o domínio do
   escritório (ex.: `jonatasbrandao.adv.br`), para poder enviar como
   `notificacoes@jonatasbrandao.adv.br`.

2. **Configurar os secrets das functions** (via CLI, depois de `supabase link`):

   ```
   supabase secrets set RESEND_API_KEY=re_xxxxxxxx
   supabase secrets set NOTIFY_FROM_EMAIL="Jônatas Brandão <notificacoes@seudominio.com.br>"
   supabase secrets set CRON_SECRET=uma-string-aleatoria-longa
   ```

3. **Fazer o deploy**:

   ```
   supabase functions deploy notify-processo-atribuido
   supabase functions deploy send-prazo-reminders --no-verify-jwt
   ```

   (`--no-verify-jwt` na segunda porque ela é chamada pelo cron, não por um usuário logado —
   a proteção nela é o header `x-cron-secret`.)

4. **Agendar o disparo diário**: abra `supabase/cron-setup.sql`, troque `<PROJECT_REF>` pelo ID
   do seu projeto Supabase e `<CRON_SECRET>` pelo mesmo valor usado no passo 2, e rode o script
   no SQL Editor do painel do Supabase.

5. **Cadastrar os e-mails de cada advogado**: na aba _Cadastros_, em cada advogado tem um campo
   "e-mail para notificações" — é para esse endereço que os avisos são enviados (independente do
   e-mail de login).

Sem os secrets configurados, as funções simplesmente não enviam nada (retornam
`{ skipped: true }`) — não quebram o cadastro de processos nem os prazos.
