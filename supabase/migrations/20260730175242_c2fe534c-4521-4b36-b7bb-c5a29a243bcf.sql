
CREATE TYPE public.app_role AS ENUM ('admin','advogado');
CREATE TYPE public.processo_status AS ENUM ('Aguardando','Em Progresso','Concluído');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL DEFAULT '',
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN (SELECT count(*) FROM public.user_roles) = 0 THEN 'admin'::public.app_role ELSE 'advogado'::public.app_role END)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  cor text NOT NULL DEFAULT '#1e3a5f',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.empresas TO authenticated;
GRANT ALL ON public.empresas TO service_role;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "empresas_select" ON public.empresas FOR SELECT TO authenticated USING (true);
CREATE POLICY "empresas_admin_write" ON public.empresas FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.areas TO authenticated;
GRANT ALL ON public.areas TO service_role;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "areas_select" ON public.areas FOR SELECT TO authenticated USING (true);
CREATE POLICY "areas_admin_write" ON public.areas FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.advogados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  oab text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.advogados TO authenticated;
GRANT ALL ON public.advogados TO service_role;
ALTER TABLE public.advogados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "advogados_select" ON public.advogados FOR SELECT TO authenticated USING (true);
CREATE POLICY "advogados_admin_write" ON public.advogados FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.advogado_empresas (
  advogado_id uuid NOT NULL REFERENCES public.advogados(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  PRIMARY KEY (advogado_id, empresa_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.advogado_empresas TO authenticated;
GRANT ALL ON public.advogado_empresas TO service_role;
ALTER TABLE public.advogado_empresas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "advemp_select" ON public.advogado_empresas FOR SELECT TO authenticated USING (true);
CREATE POLICY "advemp_admin_write" ON public.advogado_empresas FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.processos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE SET NULL,
  advogado_id uuid REFERENCES public.advogados(id) ON DELETE SET NULL,
  area_id uuid REFERENCES public.areas(id) ON DELETE SET NULL,
  numero text NOT NULL,
  data_autuacao date,
  classe text,
  parte_contraria text,
  vara text,
  status public.processo_status NOT NULL DEFAULT 'Aguardando',
  data_audiencia date,
  observacoes text,
  valor_acao numeric(14,2),
  ultima_movimentacao_data date,
  ultima_movimentacao_texto text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX processos_empresa_idx ON public.processos(empresa_id);
CREATE INDEX processos_advogado_idx ON public.processos(advogado_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.processos TO authenticated;
GRANT ALL ON public.processos TO service_role;
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "processos_select" ON public.processos FOR SELECT TO authenticated USING (true);
CREATE POLICY "processos_admin_all" ON public.processos FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "processos_advogado_update" ON public.processos FOR UPDATE TO authenticated
USING (advogado_id IN (SELECT id FROM public.advogados WHERE user_id = auth.uid()))
WITH CHECK (advogado_id IN (SELECT id FROM public.advogados WHERE user_id = auth.uid()));
CREATE TRIGGER processos_updated_at BEFORE UPDATE ON public.processos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.movimentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  processo_id uuid NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
  data date NOT NULL DEFAULT current_date,
  descricao text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX movimentacoes_processo_idx ON public.movimentacoes(processo_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movimentacoes TO authenticated;
GRANT ALL ON public.movimentacoes TO service_role;
ALTER TABLE public.movimentacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mov_select" ON public.movimentacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "mov_admin_all" ON public.movimentacoes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "mov_advogado_insert" ON public.movimentacoes FOR INSERT TO authenticated
WITH CHECK (processo_id IN (SELECT p.id FROM public.processos p JOIN public.advogados a ON a.id = p.advogado_id WHERE a.user_id = auth.uid()));

INSERT INTO public.empresas (nome, cor) VALUES
  ('Engpac', '#1e3a5f'),
  ('Econtecx', '#0f766e'),
  ('Genesis', '#7c2d12');

INSERT INTO public.areas (nome) VALUES
  ('Cível/Administrativo'),
  ('Trabalhista');
