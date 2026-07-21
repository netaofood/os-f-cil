import { useState } from "react";
import { HelpCircle, X, ChevronRight, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Secao {
  titulo: string;
  conteudo: string[];
}

const secoesAdmin: Secao[] = [
  {
    titulo: "Login",
    conteudo: [
      "Acesse o app em osfacil.netao.app.br",
      "Digite seu número de celular e senha provisória recebida pelo WhatsApp.",
      "Clique em Entrar.",
      "Na primeira vez, troque sua senha nas Configurações.",
    ],
  },
  {
    titulo: "Dashboard",
    conteudo: [
      "Visão geral da empresa: clientes, produtos, OSs e faturas.",
      "Cards financeiros: Recebido, A receber e Vencido.",
      "Gráfico de faturamento dos últimos 14 dias.",
      "Gráfico de OSs por status.",
    ],
  },
  {
    titulo: "Ordens de Serviço (OSs)",
    conteudo: [
      "Clique no ícone + para criar uma nova OS.",
      "Busque o cliente pelo nome ou telefone. Se não existir, cadastre na hora.",
      "Selecione o status inicial (ex: Orçamento).",
      "Adicione itens: digite o nome, o app busca no catálogo automaticamente. Se for novo, escolha se é Produto ou Serviço.",
      "Clique em Criar OS. Após criar, envie o orçamento por WhatsApp ou copie o link.",
      "O cliente acessa o link, visualiza o orçamento e pode aprovar ou recusar com assinatura digital.",
      "Após aprovado, mude o status conforme o andamento.",
      "Quando concluído, gere a fatura.",
    ],
  },
  {
    titulo: "Status das OSs",
    conteudo: [
      "Orçamento — aguardando aprovação do cliente.",
      "Aberta — aprovada, aguardando início.",
      "Em andamento — serviço em execução.",
      "Aguardando — parado por alguma pendência (ex: peça).",
      "Concluída — serviço finalizado. Permite gerar fatura.",
      "Cancelada — OS encerrada sem conclusão.",
    ],
  },
  {
    titulo: "Faturas",
    conteudo: [
      "Faturas só podem ser geradas para OSs com status Concluída.",
      "Clique no ícone + para criar uma nova fatura.",
      "Selecione a OS Concluída desejada e informe o vencimento.",
      "Envie a fatura para o cliente pelo WhatsApp ou copie o link.",
      "O cliente acessa e pode assinar digitalmente — status muda para Aceita.",
      "Para dar baixa no pagamento, clique no ícone de cartão (💳) na fatura.",
      "Informe a data real do pagamento e clique em Marcar pago.",
    ],
  },
  {
    titulo: "Clientes",
    conteudo: [
      "Acesse o menu Clientes para ver todos os clientes cadastrados.",
      "Clique no ícone + para cadastrar um novo cliente.",
      "Campos obrigatórios: nome e telefone.",
      "Use a busca para encontrar clientes por nome ou telefone.",
      "Você também pode cadastrar um cliente diretamente ao criar uma OS.",
    ],
  },
  {
    titulo: "Produtos & Serviços",
    conteudo: [
      "Catálogo de itens da empresa: produtos e serviços com preço padrão.",
      "Itens cadastrados aparecem como sugestão ao criar uma OS.",
      "Novos itens digitados numa OS são salvos automaticamente no catálogo.",
      "Você pode editar, ativar ou desativar itens do catálogo.",
    ],
  },
  {
    titulo: "Configurações",
    conteudo: [
      "Dados da empresa: nome, CNPJ, telefone, e-mail, endereço, PIX, banco e cor de destaque.",
      "Logo: faça upload da logo da empresa (PNG, JPG ou SVG, máx. 2MB).",
      "A logo aparece nas páginas públicas de orçamento e fatura.",
      "Equipe: cadastre colaboradores com nome e celular. Envie o acesso por WhatsApp.",
      "Redefina a senha de um colaborador clicando no ícone de chave.",
    ],
  },
  {
    titulo: "Envio por WhatsApp",
    conteudo: [
      "Em OSs e Faturas, clique no ícone de WhatsApp (💬) para enviar o link ao cliente.",
      "O cliente acessa sem precisar instalar nenhum app.",
      "Na OS: o cliente pode aprovar ou recusar com assinatura digital.",
      "Na Fatura: o cliente pode assinar e confirmar o recebimento.",
      "Use o ícone de copiar (📋) para copiar o link e enviar por outro meio.",
    ],
  },
];

const secoesColaborador: Secao[] = [
  {
    titulo: "O que o colaborador pode fazer",
    conteudo: [
      "Criar e editar Ordens de Serviço.",
      "Cadastrar e consultar clientes.",
      "Consultar o catálogo de produtos e serviços.",
      "Enviar orçamentos por WhatsApp.",
    ],
  },
  {
    titulo: "O que o colaborador NÃO pode fazer",
    conteudo: [
      "Acessar o Dashboard.",
      "Criar ou gerenciar faturas.",
      "Acessar as configurações da empresa.",
      "Cadastrar outros colaboradores.",
    ],
  },
];

function SecaoItem({ secao }: { secao: Secao }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-sm">{secao.titulo}</span>
        {open
          ? <ChevronDown className="h-4 w-4 text-primary shrink-0" />
          : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        }
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3 space-y-2 bg-muted/20">
          {secao.conteudo.map((linha, i) => (
            <p key={i} className="text-sm text-muted-foreground flex gap-2">
              <span className="text-primary shrink-0 font-bold">{i + 1}.</span>
              {linha}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function ManualUsuario() {
  const [open, setOpen] = useState(false);
  const [aba, setAba] = useState<"admin" | "colaborador">("admin");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Manual do usuário"
        className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Orbitron, sans-serif" }}>
              Manual do Usuário
            </DialogTitle>
          </DialogHeader>

          {/* Abas */}
          <div className="flex gap-2 border-b border-border pb-3">
            <button
              onClick={() => setAba("admin")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                aba === "admin"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setAba("colaborador")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                aba === "colaborador"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Colaborador
            </button>
          </div>

          {/* Conteúdo com scroll */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {(aba === "admin" ? secoesAdmin : secoesColaborador).map((s, i) => (
              <SecaoItem key={i} secao={s} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
