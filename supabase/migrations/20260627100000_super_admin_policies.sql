-- Super admin precisa ler contagens de OS e usuários de todas as empresas
-- As policies de super_admin já existem nas tabelas principais.
-- Garantir que super_admin pode ler ordens_servico e usuarios de todas as empresas
-- (as policies existentes usam is_super_admin(), que já cobre isso)

-- RPC para super admin: resumo de todas as empresas
CREATE OR REPLACE FUNCTION public.super_admin_empresas_resumo()
RETURNS TABLE (
  id uuid,
  nome text,
  cnpj text,
  cidade text,
  estado text,
  email text,
  telefone text,
  cor_destaque text,
  created_at timestamptz,
  total_usuarios bigint,
  total_os bigint
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  SELECT
    e.id, e.nome, e.cnpj, e.cidade, e.estado, e.email, e.telefone,
    e.cor_destaque, e.created_at,
    COUNT(DISTINCT u.id) AS total_usuarios,
    COUNT(DISTINCT o.id) AS total_os
  FROM public.empresas e
  LEFT JOIN public.usuarios u ON u.empresa_id = e.id
  LEFT JOIN public.ordens_servico o ON o.empresa_id = e.id
  GROUP BY e.id
  ORDER BY e.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.super_admin_empresas_resumo() TO authenticated;
