ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS link_publico_token text DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text),
  ADD COLUMN IF NOT EXISTS aprovacao text,
  ADD COLUMN IF NOT EXISTS aprovacao_obs text,
  ADD COLUMN IF NOT EXISTS aprovacao_em timestamp with time zone,
  ADD COLUMN IF NOT EXISTS assinatura_url text;

CREATE UNIQUE INDEX IF NOT EXISTS ordens_servico_link_publico_token_idx ON public.ordens_servico(link_publico_token);