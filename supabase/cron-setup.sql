-- Este arquivo NÃO é uma migration (não é aplicado automaticamente).
-- Rode manualmente no SQL Editor do Supabase, depois de:
--   1) fazer o deploy da função send-prazo-reminders
--   2) configurar os secrets da função (ver supabase/functions/README.md)
--   3) substituir <PROJECT_REF> e <CRON_SECRET> abaixo pelos valores reais

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'send-prazo-reminders-daily',
  '0 9 * * *', -- todos os dias às 09:00 UTC (~06:00 em Natal/RN)
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-prazo-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', '<CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Para conferir os jobs agendados:
-- select * from cron.job;
-- Para remover, se precisar:
-- select cron.unschedule('send-prazo-reminders-daily');
