## Problema

O ícone "Abrir OS" navega para `/ordens/{id}`, a URL muda, mas a tela de detalhe não aparece. Causa: `src/routes/_authenticated/ordens.tsx` é tanto a lista quanto o "pai" da rota `/ordens/$id`, mas não renderiza `<Outlet />`. No TanStack Router, sem `<Outlet />` o filho nunca monta.

## Solução

Separar layout, lista e detalhe em três arquivos:

```text
src/routes/_authenticated/
  ordens.tsx          -> layout: apenas renderiza <Outlet />
  ordens.index.tsx    -> lista de OS (conteúdo atual de ordens.tsx)
  ordens.$id.tsx      -> detalhe da OS (já existe, sem mudanças)
```

## Passos

1. Renomear o atual `src/routes/_authenticated/ordens.tsx` para `src/routes/_authenticated/ordens.index.tsx` e trocar `createFileRoute("/_authenticated/ordens")` por `createFileRoute("/_authenticated/ordens/")`.
2. Criar novo `src/routes/_authenticated/ordens.tsx` mínimo:
   ```tsx
   import { createFileRoute, Outlet } from "@tanstack/react-router";
   export const Route = createFileRoute("/_authenticated/ordens")({
     component: () => <Outlet />,
   });
   ```
3. Deixar `ordens.$id.tsx` como está.
4. O `routeTree.gen.ts` é regenerado automaticamente pelo plugin.

## Verificação

- Build passa.
- `/ordens` continua mostrando a lista.
- Clicar no ícone "Abrir OS" abre `/ordens/{id}` e renderiza o detalhe.
