## Problema
A aprovação/recusa do cliente (página pública) só grava a coluna `aprovacao` da OS — o `status` permanece igual. A listagem de OS mostra apenas o badge de `status`, então não há nenhum indicativo visual de que o cliente já respondeu.

## Solução proposta
Exibir, ao lado do badge de status na listagem de OS, um **ícone de aprovação do cliente**:

- `aprovacao = 'aprovada'` → ícone `CheckCircle2` verde, tooltip "Aprovada pelo cliente em DD/MM/AAAA HH:mm"
- `aprovacao = 'rejeitada'` → ícone `XCircle` vermelho, tooltip "Recusada pelo cliente" (+ observação se houver)
- `aprovacao = null` e há link público gerado → ícone `Clock` cinza, tooltip "Aguardando resposta do cliente"
- Sem aprovação e sem envio → nada

O badge de status do fluxo interno (Aberta, Em andamento, etc.) continua existindo, pois representa o andamento do serviço, não a aprovação.

## Arquivo alterado
- `src/routes/_authenticated/ordens.index.tsx` — renderizar o ícone de aprovação na linha, ao lado do badge de status, usando `Tooltip` do shadcn.

## Observação
Não vou alterar o `status` automaticamente na aprovação, porque os nomes de status são configuráveis por empresa (tabela `status_os`) e mudar isso pode quebrar o fluxo interno. Se preferir que a aprovação **também** mude o status para um valor fixo (ex: "Aprovada"), me avise que eu ajusto.