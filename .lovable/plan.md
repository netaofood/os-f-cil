## Diagnóstico
1. **Banco está correto**: OS #0004 tem `aprovacao = 'aprovada'` confirmado via SQL.
2. **Código do ícone está correto**: `src/routes/_authenticated/ordens.index.tsx` linhas 551-571 renderizam `CheckCircle2` quando `o.aprovacao === "aprovada"`, e a query usa `select("*")`, então o campo é retornado.
3. **Causa provável de "não apareceu"**: a tela ficou com o bundle antigo em cache no navegador (o build anterior teve um erro de sintaxe que quebrou o HMR), e/ou a aba ainda mostra o resultado em cache da query antiga — a listagem só rebusca ao montar a rota.
4. **Causa do "status não atualiza em tempo real"**: não há realtime nem refetch ao focar a janela.

## Solução (uma alteração só, resolve os dois)
Habilitar Realtime e melhorar a frescura da listagem.

### Migração SQL
```sql
ALTER TABLE public.ordens_servico REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ordens_servico;
```

### Código `src/routes/_authenticated/ordens.index.tsx`
- Adicionar `useEffect` com canal Supabase Realtime ouvindo `postgres_changes` (event `*`) na tabela `ordens_servico` e chamando `qc.invalidateQueries({ queryKey: ["ordens"] })`. Cleanup com `supabase.removeChannel`.
- Adicionar `refetchOnWindowFocus: true` e `staleTime: 0` na `useQuery` de `["ordens"]` como rede de segurança caso o Realtime esteja indisponível.

## Como o usuário deve testar
1. Após o deploy, dar um **hard refresh** na página (Ctrl+Shift+R) para descartar o bundle antigo.
2. A linha da OS #0004 deve mostrar o ícone verde de aprovado ao lado do badge de status.
3. Aprovar/recusar outra OS pelo link público em outra aba → a linha correspondente deve atualizar o ícone em segundos, sem precisar recarregar.