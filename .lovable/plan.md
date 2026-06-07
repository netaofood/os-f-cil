Adicionar parâmetro `?v=2` nos links públicos de OS e Fatura para invalidar cache de previews sociais (WhatsApp, Facebook, etc.).

**Arquivos alterados:**
- `src/routes/_authenticated/ordens.$id.tsx` — linha 278: adicionar `?v=2` ao `publicUrl`
- `src/routes/_authenticated/faturas.$id.tsx` — linha 103: adicionar `?v=2` ao `publicUrl`

**Resultado:**
Links compartilhados passam a ter formato `.../os/<token>?v=2` e `.../fatura/<token>?v=2`, forçando crawlers sociais a refazer o preview com a logo atualizada da empresa.