## Mudanças

### 1. Mensagem padrão com nome do cliente + link
**Arquivo:** `src/routes/_authenticated/ordens.$id.tsx`

Criar uma única mensagem reutilizada pelo botão "Copiar" e pelo WhatsApp:

```
Olá {nomeDoCliente || ""}, segue seu orçamento {publicUrl}
```

- O botão de copiar passa a copiar essa mensagem completa (texto + link), em vez de apenas o link.
- O WhatsApp continua abrindo com a mesma mensagem.
- Se a OS não tiver cliente, o nome fica vazio → `Olá , segue seu orçamento …`.
- O `<Input>` no modal mostra a mensagem completa (readonly) para o usuário ver o que será enviado/copiado.

### 2. Logo da empresa na página pública do orçamento
**Arquivo:** `src/routes/os.$token.tsx`

No cabeçalho da página pública (logo no topo, antes do nome da empresa), exibir `empresa.logo_url` quando existir:

- Se `empresa.logo_url` estiver preenchido → mostra a imagem (altura fixa, ex.: 48–64px, com `object-contain`).
- Se não houver logo → mantém só o nome (comportamento atual).

Assim, ao abrir o link compartilhado, o cliente vê imediatamente a marca da empresa.

## Detalhes técnicos

- A logo já é armazenada em `empresas.logo_url` e a query da página pública já retorna a empresa — basta renderizar o `<img>`.
- Nenhum dado novo no banco, nenhuma alteração de schema.