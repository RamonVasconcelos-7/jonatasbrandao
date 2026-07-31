-- Lembrete de prazo também no dia em que ele vence (além de 3 e 1 dia antes)
ALTER TABLE public.prazos ADD COLUMN IF NOT EXISTS notificado_0d boolean NOT NULL DEFAULT false;

-- Permite que um admin promova/rebaixe outro usuário a admin diretamente pelo app,
-- sem precisar de acesso ao SQL editor. SECURITY DEFINER + checagem manual de admin
-- porque a policy de user_roles hoje só permite SELECT para authenticated.
CREATE OR REPLACE FUNCTION public.set_admin_role(_target_user_id uuid, _is_admin boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar papéis de usuário';
  END IF;

  IF _is_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_target_user_id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _target_user_id AND role = 'admin';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.set_admin_role(uuid, boolean) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.set_admin_role(uuid, boolean) TO authenticated;
