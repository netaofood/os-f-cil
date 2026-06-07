## Objetivo
Permitir que o usuário faça upload da logo da empresa em **Configurações → Dados da empresa**, e usar essa logo automaticamente na página pública de OS e Faturas (e o cabeçalho da OS já a renderiza desde a última alteração).

## Mudanças

### 1. Bucket de storage para logos
Criar um bucket **público** chamado `logos-empresas` com políticas RLS em `storage.objects`:
- **SELECT**: público (qualquer um pode visualizar a logo, já que ela aparece em links públicos de OS/Fatura).
- **INSERT/UPDATE/DELETE**: apenas usuários autenticados, e apenas em arquivos dentro de uma pasta com o id da própria empresa (`<empresa_id>/...`).

### 2. Tela de Configurações (`src/routes/_authenticated/configuracoes.tsx`)
Adicionar um novo bloco "Logo da empresa" no card "Dados da empresa":
- Mostrar a logo atual (se houver), com um placeholder cinza se vazio.
- Botão **"Enviar logo"** que abre o seletor de arquivo (aceita PNG/JPG/SVG/WebP, máx. 2 MB).
- Botão **"Remover logo"** quando já houver uma.
- Ao selecionar arquivo: upload para `logos-empresas/<empresa_id>/logo.<ext>` com `upsert: true`, obter `publicUrl` e salvar em `empresas.logo_url`.
- Toast de sucesso/erro; pré-visualização imediata.

### 3. Página pública da Fatura (`src/routes/fatura.$token.tsx`)
Espelhar o tratamento que já existe na página pública da OS: renderizar `empresa.logo_url` no cabeçalho (imagem pequena à esquerda do nome). Se não houver logo, mantém só o nome.

## Detalhes técnicos
- A coluna `empresas.logo_url` já existe — não precisa migrar schema.
- O cabeçalho da OS pública (`os.$token.tsx`) já exibe `logo_url`, então passa a funcionar automaticamente assim que o usuário fizer upload.
- Validação no client: tipo de arquivo e tamanho máximo 2 MB antes do upload.

## Itens fora do escopo
- PDFs gerados / templates de e-mail (podem ser feitos depois, mas a `logo_url` ficará disponível para reuso).