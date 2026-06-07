## Problema

A página pública da OS carrega os dados, mas mostra "Sem itens" mesmo quando a OS tem itens cadastrados (ex.: `#0004` tem 4 itens totalizando R$ 4.550).

## Causa

Em `src/lib/os.functions.ts`, `getOSByToken` faz:

```ts
.from("itens_os").select("*").eq("os_id", os.id).order("created_at")
```

A tabela `itens_os` não possui a coluna `created_at` (colunas: `id`, `os_id`, `descricao`, `quantidade`, `preco_unitario`, `total`). A query retorna erro, mas o código só lê `data` e cai no fallback `itens ?? []`, escondendo a falha.

## Correção

Em `src/lib/os.functions.ts` linha 22, trocar `.order("created_at")` por `.order("descricao")` (ordem estável e útil ao cliente, já que não há timestamp de criação).

Resultado: o link público volta a exibir todos os itens, o total detalhado e fica completo para aprovação.