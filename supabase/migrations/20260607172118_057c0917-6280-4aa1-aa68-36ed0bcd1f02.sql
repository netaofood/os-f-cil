
-- Auto updated_at
DROP TRIGGER IF EXISTS trg_os_updated_at ON public.ordens_servico;
CREATE TRIGGER trg_os_updated_at BEFORE UPDATE ON public.ordens_servico
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Generate next OS number per empresa
CREATE OR REPLACE FUNCTION public.next_os_numero(_empresa_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_next int;
BEGIN
  SELECT COALESCE(MAX(NULLIF(regexp_replace(numero, '\D', '', 'g'), '')::int), 0) + 1
    INTO v_next
  FROM public.ordens_servico WHERE empresa_id = _empresa_id;
  RETURN lpad(v_next::text, 4, '0');
END $$;

GRANT EXECUTE ON FUNCTION public.next_os_numero(uuid) TO authenticated;

-- Recalc OS total from itens
CREATE OR REPLACE FUNCTION public.recalc_os_total()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_os_id uuid;
BEGIN
  v_os_id := COALESCE(NEW.os_id, OLD.os_id);
  UPDATE public.ordens_servico
    SET total = COALESCE((SELECT SUM(total) FROM public.itens_os WHERE os_id = v_os_id), 0)
    WHERE id = v_os_id;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_itens_os_recalc ON public.itens_os;
CREATE TRIGGER trg_itens_os_recalc AFTER INSERT OR UPDATE OR DELETE ON public.itens_os
  FOR EACH ROW EXECUTE FUNCTION public.recalc_os_total();

-- Itens: auto-calc total = qtd*preco
CREATE OR REPLACE FUNCTION public.calc_item_total()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.total := COALESCE(NEW.quantidade,0) * COALESCE(NEW.preco_unitario,0);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_item_total ON public.itens_os;
CREATE TRIGGER trg_item_total BEFORE INSERT OR UPDATE ON public.itens_os
  FOR EACH ROW EXECUTE FUNCTION public.calc_item_total();

-- Log changes to ordens_servico
CREATE OR REPLACE FUNCTION public.log_os_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid;
BEGIN
  SELECT id INTO v_user FROM public.usuarios WHERE auth_user_id = auth.uid() LIMIT 1;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.log_os(os_id, usuario_id, campo_alterado, valor_anterior, valor_novo)
      VALUES (NEW.id, v_user, 'status', OLD.status, NEW.status);
  END IF;
  IF NEW.diagnostico IS DISTINCT FROM OLD.diagnostico THEN
    INSERT INTO public.log_os(os_id, usuario_id, campo_alterado, valor_anterior, valor_novo)
      VALUES (NEW.id, v_user, 'diagnostico', OLD.diagnostico, NEW.diagnostico);
  END IF;
  IF NEW.observacoes IS DISTINCT FROM OLD.observacoes THEN
    INSERT INTO public.log_os(os_id, usuario_id, campo_alterado, valor_anterior, valor_novo)
      VALUES (NEW.id, v_user, 'observacoes', OLD.observacoes, NEW.observacoes);
  END IF;
  IF NEW.forma_pagamento IS DISTINCT FROM OLD.forma_pagamento THEN
    INSERT INTO public.log_os(os_id, usuario_id, campo_alterado, valor_anterior, valor_novo)
      VALUES (NEW.id, v_user, 'forma_pagamento', OLD.forma_pagamento, NEW.forma_pagamento);
  END IF;
  IF NEW.cliente_id IS DISTINCT FROM OLD.cliente_id THEN
    INSERT INTO public.log_os(os_id, usuario_id, campo_alterado, valor_anterior, valor_novo)
      VALUES (NEW.id, v_user, 'cliente_id', OLD.cliente_id::text, NEW.cliente_id::text);
  END IF;
  IF NEW.total IS DISTINCT FROM OLD.total THEN
    INSERT INTO public.log_os(os_id, usuario_id, campo_alterado, valor_anterior, valor_novo)
      VALUES (NEW.id, v_user, 'total', OLD.total::text, NEW.total::text);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_log_os ON public.ordens_servico;
CREATE TRIGGER trg_log_os AFTER UPDATE ON public.ordens_servico
  FOR EACH ROW EXECUTE FUNCTION public.log_os_changes();
