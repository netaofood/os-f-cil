
CREATE OR REPLACE FUNCTION public.next_fatura_numero(_empresa_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_next int;
BEGIN
  SELECT COALESCE(MAX(NULLIF(regexp_replace(numero, '\D', '', 'g'), '')::int), 0) + 1
    INTO v_next FROM public.faturas WHERE empresa_id = _empresa_id;
  RETURN 'FAT-' || lpad(v_next::text, 4, '0');
END $$;

GRANT EXECUTE ON FUNCTION public.next_fatura_numero(uuid) TO authenticated;

-- Public read for signatures (public link uses these)
CREATE POLICY "assinaturas public read"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'assinaturas');

-- Allow uploads from anyone (signature capture happens on public link)
CREATE POLICY "assinaturas public upload"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'assinaturas');
