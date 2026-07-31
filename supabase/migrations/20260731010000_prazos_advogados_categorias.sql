-- Categoria da empresa/cliente (para separar Escritório / Empresas / Prefeituras no painel)
CREATE TYPE public.empresa_tipo AS ENUM ('Escritorio', 'Empresa', 'Prefeitura');
ALTER TABLE public.empresas ADD COLUMN tipo public.empresa_tipo NOT NULL DEFAULT 'Empresa';

-- E-mail de notificação do advogado (independente do login/conta de acesso)
ALTER TABLE public.advogados ADD COLUMN email text;

-- Tipos de prazo processual, nomeados de acordo com o CPC/CLT/legislação aplicável
CREATE TYPE public.tipo_prazo AS ENUM (
  'Audiencia',
  'Manifestacao_Parte_Contraria',
  'Aguardando_Sentenca_Decisao',
  'Contestacao',
  'Replica_Impugnacao',
  'Recurso_Apelacao',
  'Contrarrazoes',
  'Embargos_Declaracao',
  'Cumprimento_Sentenca',
  'Prazo_Interno_Escritorio',
  'Diligencia',
  'Pericia',
  'Outro'
);

CREATE TABLE public.prazos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  processo_id uuid NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
  tipo public.tipo_prazo NOT NULL DEFAULT 'Outro',
  data date NOT NULL,
  descricao text,
  cumprido boolean NOT NULL DEFAULT false,
  notificado_3d boolean NOT NULL DEFAULT false,
  notificado_1d boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX prazos_processo_idx ON public.prazos(processo_id);
CREATE INDEX prazos_data_idx ON public.prazos(data);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prazos TO authenticated;
GRANT ALL ON public.prazos TO service_role;
ALTER TABLE public.prazos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prazos_select" ON public.prazos FOR SELECT TO authenticated USING (true);
CREATE POLICY "prazos_admin_all" ON public.prazos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "prazos_advogado_write" ON public.prazos FOR ALL TO authenticated
  USING (processo_id IN (
    SELECT p.id FROM public.processos p JOIN public.advogados a ON a.id = p.advogado_id WHERE a.user_id = auth.uid()
  ))
  WITH CHECK (processo_id IN (
    SELECT p.id FROM public.processos p JOIN public.advogados a ON a.id = p.advogado_id WHERE a.user_id = auth.uid()
  ));

-- Migra as audiências já cadastradas em processos.data_audiencia para a nova tabela de prazos
INSERT INTO public.prazos (processo_id, tipo, data, descricao)
SELECT id, 'Audiencia', data_audiencia, 'Audiência (migrada do cadastro do processo)'
FROM public.processos
WHERE data_audiencia IS NOT NULL;

-- Categoriza as empresas já existentes
UPDATE public.empresas SET tipo = 'Empresa' WHERE nome IN ('Engpac', 'Econtecx', 'Genesis');

-- Cadastro inicial dos advogados do escritório (e-mails a preencher depois em Cadastros)
INSERT INTO public.advogados (nome, oab)
SELECT v.nome, v.oab
FROM (VALUES
  ('Jônatas Brandão', 'RN 15780'),
  ('Amanda Gomes', 'RN 23911'),
  ('Jéssica Lacerda', 'RN 14144'),
  ('Manoel Vasconcelos', NULL),
  ('Gerson Lima', NULL)
) AS v(nome, oab)
WHERE NOT EXISTS (
  SELECT 1 FROM public.advogados a WHERE a.nome = v.nome
);
