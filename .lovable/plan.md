## Objetivo
Criar a base do projeto **OS Fácil** com identidade visual (logo + tema escuro/azul neon), pronto para receber as funcionalidades que você vai descrever depois.

## O que será feito

1. **Logo como asset**
   - Subir a imagem enviada para o CDN (Lovable Assets) e referenciar via pointer JSON em `src/assets/`.

2. **Tema visual (design system)**
   - Atualizar `src/styles.css` para tema escuro por padrão:
     - Fundo preto (`oklch` próximo de #000)
     - Primária azul neon (~#1E90FF / azul do logo)
     - Foreground branco
     - Tokens semânticos coerentes (card, border, ring, accent) em light e dark
   - Aplicar classe `dark` no `<html>` para iniciar em modo escuro.

3. **Página inicial (`src/routes/index.tsx`)**
   - Substituir o placeholder por uma landing simples e limpa:
     - Logo centralizada com leve glow
     - Título "OS Fácil"
     - Subtítulo curto ("Gestão de Ordens de Serviço — em breve")
   - Atualizar `head()` com title/description/og adequados ("OS Fácil").

4. **Metadados do app**
   - Atualizar título padrão em `__root.tsx` para "OS Fácil".

## Detalhes técnicos
- Sem backend ainda — Lovable Cloud só será ativado quando você pedir funcionalidades que exigem (login, banco, etc.).
- Sem rotas extras nesta etapa — adicionaremos conforme você descrever o escopo (ex.: clientes, ordens de serviço, dashboard).

## Próximo passo
Depois que essa base estiver pronta, me conta o que o OS Fácil precisa fazer (cadastro de clientes? ordens de serviço? técnicos? relatórios?) e eu sigo construindo.