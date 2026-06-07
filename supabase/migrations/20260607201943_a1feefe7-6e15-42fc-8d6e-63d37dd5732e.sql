ALTER TABLE public.ordens_servico REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ordens_servico;