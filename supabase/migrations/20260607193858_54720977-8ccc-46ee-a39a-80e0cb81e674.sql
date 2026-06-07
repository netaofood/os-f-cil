CREATE POLICY "logos-empresas public read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'logos-empresas');

CREATE POLICY "logos-empresas authenticated insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos-empresas');

CREATE POLICY "logos-empresas authenticated update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'logos-empresas')
  WITH CHECK (bucket_id = 'logos-empresas');

CREATE POLICY "logos-empresas authenticated delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'logos-empresas');