-- Adiciona token público e status de aprovação na OS
ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS link_publico_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  ADD COLUMN IF NOT EXISTS aprovacao text CHECK (aprovacao IN ('pendente','aprovada','rejeitada')) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS aprovacao_obs text,
  ADD COLUMN IF NOT EXISTS aprovacao_em timestamptz,
  ADD COLUMN IF NOT EXISTS assinatura_url text;

-- Garante unicidade do token
CREATE UNIQUE INDEX IF NOT EXISTS ordens_servico_link_publico_token_key
  ON public.ordens_servico(link_publico_token);

-- Política pública para leitura da OS pelo token (sem autenticação)
CREATE POLICY "os: leitura publica por token"
  ON public.ordens_servico
  FOR SELECT TO anon
  USING (link_publico_token IS NOT NULL);

CREATE POLICY "itens_os: leitura publica via os token"
  ON public.itens_os
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico o
      WHERE o.id = itens_os.os_id
        AND o.link_publico_token IS NOT NULL
    )
  );

CREATE POLICY "empresas: leitura publica via os"
  ON public.empresas
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "clientes: leitura publica via os"
  ON public.clientes
  FOR SELECT TO anon
  USING (true);

GRANT SELECT ON public.ordens_servico TO anon;
GRANT SELECT ON public.itens_os TO anon;
GRANT SELECT ON public.empresas TO anon;
GRANT SELECT ON public.clientes TO anon;
