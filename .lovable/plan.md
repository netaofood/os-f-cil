## Problema

Ao compartilhar o link público da OS ou Fatura (ex.: WhatsApp), o preview mostra a logo do "OS Fácil/Netão Apps" (og:image global), e não a logo cadastrada da empresa. Isso acontece porque:

- As rotas públicas `os.$token.tsx` e `fatura.$token.tsx` estão com `ssr: false` e sem `head()`, então o crawler só lê o `og:image` global do `__root.tsx`.
- A logo da empresa já é exibida dentro da página (depois que carrega no navegador), mas o crawler não executa JS.

## Solução

Tornar as duas rotas públicas SSR-able e gerar metadados dinâmicos por token, apontando `og:image` (e `twitter:image`) para `empresa.logo_url`.

### Alterações

1. **`src/routes/os.$token.tsx`**
   - Remover `ssr: false`.
   - Adicionar `loader` que chama `getOSByToken({ data: { token } })` e devolve os dados para hidratação.
   - Adicionar `head({ loaderData })` retornando:
     - `title`: `Orçamento #<numero> — <empresa.nome>`
     - `meta`: `description` curta, `og:title`, `og:description`, `og:type=website`, `og:image` = `empresa.logo_url` (quando existir), `twitter:card=summary_large_image`, `twitter:image` = `empresa.logo_url`.
   - Componente passa a usar `Route.useLoaderData()` como `initialData` no `useQuery` (mantém o refetch após aprovar/rejeitar).

2. **`src/routes/fatura.$token.tsx`**
   - Mesma estrutura: remover `ssr: false`, adicionar `loader` chamando `getFaturaByToken`, e `head()` com `og:image` = `empresa.logo_url`, título `Fatura <numero> — <empresa.nome>`.

3. **Fallback**
   - Quando a empresa ainda não tem `logo_url`, omitir `og:image`/`twitter:image` da rota — assim a tag global do `__root.tsx` continua sendo usada (comportamento atual).

### Observações técnicas

- As funções `getOSByToken` e `getFaturaByToken` são server functions públicas (sem `requireSupabaseAuth`), então é seguro chamá-las no `loader` durante SSR/prerender.
- Caches: crawlers (WhatsApp, Facebook) cacheiam previews. Depois do deploy, pode ser necessário forçar atualização (ex.: adicionar `?v=2` no link) para ver a logo nova.
- Nenhuma mudança de banco, RLS ou lógica de negócio.
