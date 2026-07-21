import { useState, useRef, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Loader2, FileText, Trash2,
  Check, PackagePlus, X, Pencil, Save, ExternalLink, MessageCircle, Copy,
  CheckCircle2, XCircle, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useCurrentUsuario } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Tables } from "@/integrations/supabase/types";
import { STATUS_OS, getStatusCor } from "@/lib/status-os";
import { ClienteBusca } from "@/components/cliente-busca";

export const Route = createFileRoute("/_authenticated/ordens/")({
  ssr: false,
  component: OrdensPage,
});

type OS = Tables<"ordens_servico"> & { cliente?: { nome: string } | null };

interface ItemRascunho {
  id: string; // key local
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  isNovoProduto: boolean; // será cadastrado no catálogo
  tipo: "produto" | "servico";
}

interface ProdutoMin {
  id: string;
  nome: string;
  preco: number;
  unidade: string;
  tipo: "produto" | "servico";
}

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

// ─── Autocomplete de item ────────────────────────────────────────────────────
interface ItemInputProps {
  produtos: ProdutoMin[];
  onAdd: (item: Omit<ItemRascunho, "id">) => void;
}

function ItemInput({ produtos, onAdd }: ItemInputProps) {
  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [preco, setPreco] = useState("");
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<string | null>(null);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [tipo, setTipo] = useState<"produto" | "servico">("servico");
  const [showTipo, setShowTipo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sugestoes = descricao.trim().length === 0
    ? produtos.slice(0, 8)
    : produtos.filter((p) => p.nome.toLowerCase().includes(descricao.toLowerCase())).slice(0, 8);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSugestoes(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selecionarProduto(p: ProdutoMin) {
    setDescricao(p.nome);
    setPreco(String(p.preco));
    setProdutoSelecionadoId(p.id);
    setShowSugestoes(false);
    setTimeout(() => {
      const qtdInput = containerRef.current?.querySelector<HTMLInputElement>("[data-qtd]");
      qtdInput?.focus();
      qtdInput?.select();
    }, 50);
  }

  function handleDescChange(v: string) {
    setDescricao(v);
    setProdutoSelecionadoId(null);
    setShowSugestoes(true);
  }

  function handleSalvarItem() {
    const desc = descricao.trim();
    if (!desc) { inputRef.current?.focus(); return; }
    const jaExiste = produtoSelecionadoId !== null ||
      produtos.some((p) => p.nome.toLowerCase() === desc.toLowerCase());
    if (!jaExiste && !showTipo) {
      setShowTipo(true);
      return;
    }
    const tipoFinal = jaExiste
      ? (produtos.find(p => p.nome.toLowerCase() === desc.toLowerCase())?.tipo ?? "servico")
      : tipo;
    onAdd({
      descricao: desc,
      quantidade: Number(quantidade) || 1,
      preco_unitario: Number(preco) || 0,
      isNovoProduto: !jaExiste,
      tipo: tipoFinal,
    });
    setDescricao("");
    setQuantidade("1");
    setPreco("");
    setProdutoSelecionadoId(null);
    setShowTipo(false);
    setTipo("servico");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const produtoNaoEncontrado =
    descricao.trim().length > 0 &&
    !produtoSelecionadoId &&
    !produtos.some((p) => p.nome.toLowerCase() === descricao.trim().toLowerCase());

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="relative">
        <Input
          ref={inputRef}
          value={descricao}
          onChange={(e) => handleDescChange(e.target.value)}
          onFocus={() => setShowSugestoes(true)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSalvarItem(); } }}
          placeholder="Produto, serviço ou descrição livre…"
          autoComplete="off"
        />
        {showSugestoes && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {sugestoes.length === 0 && descricao.trim().length > 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                <PackagePlus className="h-3.5 w-3.5 shrink-0" />
                Será cadastrado no catálogo ao criar a OS
              </div>
            ) : (
              sugestoes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); selecionarProduto(p); }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center justify-between gap-2",
                    produtoSelecionadoId === p.id && "bg-accent"
                  )}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {produtoSelecionadoId === p.id && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    <span className="truncate">{p.nome}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {p.tipo === "servico" ? "serviço" : "produto"}
                    </span>
                  </span>
                  <span className="text-xs font-medium tabular-nums shrink-0">{brl(p.preco)}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-2 items-end">
        <div className="col-span-3">
          <Label className="text-xs mb-1 block">Qtd</Label>
          <Input
            data-qtd
            type="number"
            min="0.001"
            step="0.01"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            onFocus={(e) => e.target.select()}
          />
        </div>
        <div className="col-span-5">
          <Label className="text-xs mb-1 block">Preço unitário</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="0,00"
          />
        </div>
        <div className="col-span-4">
          <Label className="text-xs mb-1 block text-transparent select-none">add</Label>
          <button
            type="button"
            title="Salvar item"
            onClick={handleSalvarItem}
            disabled={!descricao.trim()}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {produtoNaoEncontrado && !showTipo && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <PackagePlus className="h-3 w-3 shrink-0" />
          Novo item — será cadastrado no catálogo ao criar a OS.
        </p>
      )}

      {showTipo && (
        <div className="rounded-lg border border-primary/40 p-3 space-y-2 bg-muted/30">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            Este item é novo. Selecione o tipo:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTipo("servico")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                tipo === "servico"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              Serviço
            </button>
            <button
              type="button"
              onClick={() => setTipo("produto")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                tipo === "produto"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              Produto
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              title="Cancelar"
              onClick={() => setShowTipo(false)}
              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Confirmar"
              onClick={handleSalvarItem}
              className="h-8 w-8 flex items-center justify-center rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
function OrdensPage() {
  const { data: usuario } = useCurrentUsuario();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [toDelete, setToDelete] = useState<OS | null>(null);

  // Modal Editar OS
  const [toEdit, setToEdit] = useState<OS | null>(null);
  const [editForm, setEditForm] = useState({
    cliente_id: "",
    status: "",
    forma_pagamento: "",
    diagnostico: "",
    observacoes: "",
  });
  const [editSaving, setEditSaving] = useState(false);

  function getPublicUrl(token: string) {
    return `${window.location.origin}/os/${token}`;
  }

  function enviarWhatsAppOS(token: string, numero: string) {
    const url = getPublicUrl(token);
    const msg = encodeURIComponent(`*OS Fácil — Orçamento OS #${numero}*\n\nAcesse para visualizar e aprovar:\n${url}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  function copiarLinkOS(token: string) {
    navigator.clipboard.writeText(getPublicUrl(token));
    setConviteCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setConviteCopied(false), 2000);
  }

  function openEdit(o: OS) {
    setEditForm({
      cliente_id: o.cliente_id ?? "",
      status: o.status,
      forma_pagamento: o.forma_pagamento ?? "",
      diagnostico: o.diagnostico ?? "",
      observacoes: o.observacoes ?? "",
    });
    setToEdit(o);
  }

  async function handleEditSave() {
    if (!toEdit) return;
    setEditSaving(true);
    const { error } = await supabase
      .from("ordens_servico")
      .update({
        cliente_id: editForm.cliente_id || null,
        status: editForm.status,
        forma_pagamento: editForm.forma_pagamento || null,
        diagnostico: editForm.diagnostico || null,
        observacoes: editForm.observacoes || null,
      })
      .eq("id", toEdit.id);
    setEditSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("OS atualizada");
      setToEdit(null);
      qc.invalidateQueries({ queryKey: ["ordens"] });
    }
  }

  // OS criada — modal de convite
  const [osCriada, setOsCriada] = useState<{ id: string; numero: string; token: string } | null>(null);
  const [conviteCopied, setConviteCopied] = useState(false);

  // Modal Nova OS
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [novaOS, setNovaOS] = useState({
    cliente_id: "",
    diagnostico: "",
    observacoes: "",
    forma_pagamento: "",
    status: "",
  });
  const [itensRascunho, setItensRascunho] = useState<ItemRascunho[]>([]);

  const statuses = STATUS_OS;

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-min"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("id,nome,telefone").order("nome");
      return data ?? [];
    },
  });

  const { data: formas = [] } = useQuery({
    queryKey: ["formas_pagamento"],
    queryFn: async () => {
      const { data } = await supabase
        .from("formas_pagamento")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      return data ?? [];
    },
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos-min"],
    queryFn: async (): Promise<ProdutoMin[]> => {
      const { data } = await supabase
        .from("produtos")
        .select("id,nome,preco,unidade,tipo")
        .eq("ativo", true)
        .order("nome");
      return (data ?? []) as ProdutoMin[];
    },
  });

  const { data: ordens = [], isLoading } = useQuery({
    queryKey: ["ordens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("*, cliente:clientes(nome)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as OS[];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Realtime: atualiza a listagem quando uma OS muda (ex.: aprovação do cliente)
  useEffect(() => {
    const channel = supabase
      .channel("ordens-list-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ordens_servico" },
        () => {
          qc.invalidateQueries({ queryKey: ["ordens"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const filtered = ordens.filter((o) => {
    if (statusFilter !== "todos" && o.status !== statusFilter) return false;
    const s = search.toLowerCase();
    if (!s) return true;
    return (
      o.numero.toLowerCase().includes(s) ||
      (o.cliente?.nome ?? "").toLowerCase().includes(s) ||
      (o.diagnostico ?? "").toLowerCase().includes(s)
    );
  });

  const statusColor = getStatusCor;

  function openModal() {
    setNovaOS({
      cliente_id: "",
      diagnostico: "",
      observacoes: "",
      forma_pagamento: "",
      status: statuses[0]?.nome ?? "",
    });
    setItensRascunho([]);
    setModalOpen(true);
  }

  function adicionarItemRascunho(item: Omit<ItemRascunho, "id">) {
    setItensRascunho((prev) => [...prev, { ...item, id: crypto.randomUUID() }]);
  }

  function removerItemRascunho(id: string) {
    setItensRascunho((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleCreate() {
    if (!usuario?.empresa_id) return;
    setCreating(true);

    try {
      // 1. Gera número da OS
      const { data: numero, error: errNum } = await supabase.rpc("next_os_numero", {
        _empresa_id: usuario.empresa_id,
      });
      if (errNum || !numero) throw new Error(errNum?.message ?? "Falha ao gerar número");

      // 2. Cria a OS
      const { data: osData, error: osErr } = await supabase
        .from("ordens_servico")
        .insert({
          empresa_id: usuario.empresa_id,
          numero,
          status: novaOS.status || statuses[0]?.nome || "aberta",
          criado_por: usuario.id,
          cliente_id: novaOS.cliente_id || null,
          diagnostico: novaOS.diagnostico || null,
          observacoes: novaOS.observacoes || null,
          forma_pagamento: novaOS.forma_pagamento || null,
        })
        .select("id")
        .single();
      if (osErr || !osData) throw new Error(osErr?.message ?? "Erro ao criar OS");

      // 3. Cadastra novos produtos no catálogo
      const novosNomes = itensRascunho
        .filter((i) => i.isNovoProduto)
        .map((i) => i.descricao.toLowerCase());

      for (const item of itensRascunho) {
        if (item.isNovoProduto && novosNomes.includes(item.descricao.toLowerCase())) {
          const { error: pErr } = await supabase.from("produtos").insert({
            empresa_id: usuario.empresa_id,
            nome: item.descricao,
            preco: item.preco_unitario,
            unidade: "un",
            tipo: item.tipo ?? "servico",
            ativo: true,
          });
          if (!pErr) {
            // remove do set para não duplicar se mesmo nome aparecer duas vezes
            novosNomes.splice(novosNomes.indexOf(item.descricao.toLowerCase()), 1);
          }
        }
      }

      // 4. Insere os itens na OS
      if (itensRascunho.length > 0) {
        const { error: itErr } = await supabase.from("itens_os").insert(
          itensRascunho.map((i) => ({
            os_id: osData.id,
            descricao: i.descricao,
            quantidade: i.quantidade,
            preco_unitario: i.preco_unitario,
          }))
        );
        if (itErr) console.warn("Aviso ao inserir itens:", itErr.message);
      }

      qc.invalidateQueries({ queryKey: ["ordens"] });
      qc.invalidateQueries({ queryKey: ["produtos-min"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
      setModalOpen(false);
      // Busca o token público da OS criada
      const { data: osComToken } = await supabase
        .from("ordens_servico")
        .select("link_publico_token, numero")
        .eq("id", osData.id)
        .maybeSingle();
      if (osComToken?.link_publico_token) {
        setOsCriada({ id: osData.id, numero: osComToken.numero, token: osComToken.link_publico_token });
      } else {
        navigate({ to: "/ordens/$id", params: { id: osData.id } });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao criar OS");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    const { error } = await supabase
      .from("ordens_servico")
      .delete()
      .eq("id", toDelete.id);
    if (error) toast.error(error.message);
    else {
      toast.success("OS removida");
      qc.invalidateQueries({ queryKey: ["ordens"] });
    }
    setToDelete(null);
  }

  const totalRascunho = itensRascunho.reduce(
    (acc, i) => acc + i.quantidade * i.preco_unitario,
    0
  );

  return (
    <AppShell title="Ordens de Serviço">
      {/* Barra de busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, cliente ou diagnóstico…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s.nome} value={s.nome}>
                {s.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          onClick={openModal}
          disabled={!usuario}
          title="Nova OS"
          className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 dark:shadow-[0_0_12px_#00B4FF66] transition-all"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Lista de OSs */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-2">
          <FileText className="h-8 w-8 opacity-40" />
          {ordens.length === 0
            ? "Nenhuma OS criada ainda. Clique em 'Nova OS' para começar."
            : "Nenhum resultado."}
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 hover:bg-accent/30 transition"
            >
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className="font-mono text-sm font-semibold w-16 shrink-0">
                  #{o.numero}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">
                    {o.cliente?.nome ?? "Sem cliente"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {new Date(o.created_at).toLocaleDateString("pt-BR")} ·{" "}
                    {brl(Number(o.total))}
                  </div>
                </div>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full text-white shrink-0"
                  style={{ backgroundColor: statusColor(o.status) }}
                >
                  {o.status}
                </span>
                {o.aprovacao === "aprovada" && (
                  <span
                    title={`Aprovada pelo cliente${o.aprovacao_em ? " em " + new Date(o.aprovacao_em).toLocaleString("pt-BR") : ""}`}
                    className="shrink-0 inline-flex"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-label="Aprovada pelo cliente" />
                  </span>
                )}
                {o.aprovacao === "rejeitada" && (
                  <span
                    title={`Recusada pelo cliente${o.aprovacao_obs ? ": " + o.aprovacao_obs : ""}`}
                    className="shrink-0 inline-flex"
                  >
                    <XCircle className="h-5 w-5 text-destructive" aria-label="Recusada pelo cliente" />
                  </span>
                )}
                {!o.aprovacao && o.link_publico_token && (
                  <span title="Aguardando resposta do cliente" className="shrink-0 inline-flex">
                    <Clock className="h-5 w-5 text-muted-foreground" aria-label="Aguardando resposta do cliente" />
                  </span>
                )}
              </div>
              <Link
                to="/ordens/$id"
                params={{ id: o.id }}
                className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent shrink-0 transition-colors"
                title="Abrir OS"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
              {o.link_publico_token && (
                <button
                  title="Enviar pelo WhatsApp"
                  onClick={() => enviarWhatsAppOS(o.link_publico_token!, o.numero)}
                  className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-green-600 hover:bg-accent shrink-0 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
              )}
              {o.link_publico_token && (
                <button
                  title="Copiar link"
                  onClick={() => copiarLinkOS(o.link_publico_token!)}
                  className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent shrink-0 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setToDelete(o)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Convite após criar OS */}
      <Dialog open={!!osCriada} onOpenChange={(o) => { if (!o) { setOsCriada(null); if (osCriada) navigate({ to: "/ordens/$id", params: { id: osCriada.id } }); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>OS #{osCriada?.numero} criada!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Envie o orçamento para o cliente agora ou acesse a OS para adicionar mais detalhes.
            </p>
            <div className="flex gap-3">
              <button
                title="Enviar pelo WhatsApp"
                onClick={() => osCriada && enviarWhatsAppOS(osCriada.token, osCriada.numero)}
                className="flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border border-green-500/40 text-green-600 hover:bg-green-500/10 transition-colors"
              >
                <MessageCircle className="h-6 w-6" />
                <span className="text-xs font-medium">WhatsApp</span>
              </button>
              <button
                title="Copiar link"
                onClick={() => osCriada && copiarLinkOS(osCriada.token)}
                className="flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border border-border hover:bg-muted transition-colors"
              >
                {conviteCopied ? <Check className="h-6 w-6 text-green-500" /> : <Copy className="h-6 w-6" />}
                <span className="text-xs font-medium">{conviteCopied ? "Copiado!" : "Copiar link"}</span>
              </button>
            </div>
            <button
              onClick={() => { if (osCriada) navigate({ to: "/ordens/$id", params: { id: osCriada.id } }); setOsCriada(null); }}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Abrir OS →
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Nova OS */}
      <Dialog open={modalOpen} onOpenChange={(o) => !creating && setModalOpen(o)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Ordem de Serviço</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-1">
            {/* Dados gerais */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cliente</Label>
                <ClienteBusca
                  clientes={clientes}
                  value={novaOS.cliente_id}
                  onChange={(id) => setNovaOS({ ...novaOS, cliente_id: id })}
                  onNovoCliente={(c) => {
                    qc.invalidateQueries({ queryKey: ["clientes-min"] });
                    qc.setQueryData(["clientes-min"], (old: any[]) => [...(old ?? []), c]);
                    setNovaOS({ ...novaOS, cliente_id: c.id });
                  }}
                  empresaId={usuario?.empresa_id}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Status inicial</Label>
                <Select
                  value={novaOS.status || statuses[0]?.nome || ""}
                  onValueChange={(v) => setNovaOS({ ...novaOS, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.nome} value={s.nome}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>
                Diagnóstico{" "}
                <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Textarea
                value={novaOS.diagnostico}
                onChange={(e) => setNovaOS({ ...novaOS, diagnostico: e.target.value })}
                rows={2}
                maxLength={2000}
                placeholder="Descreva o problema ou serviço solicitado…"
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Observações{" "}
                <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Textarea
                value={novaOS.observacoes}
                onChange={(e) => setNovaOS({ ...novaOS, observacoes: e.target.value })}
                rows={2}
                maxLength={2000}
                placeholder="Informações adicionais…"
              />
            </div>

            {formas.length > 0 && (
              <div className="space-y-1.5">
                <Label>Forma de pagamento</Label>
                <Select
                  value={novaOS.forma_pagamento || "_none"}
                  onValueChange={(v) =>
                    setNovaOS({ ...novaOS, forma_pagamento: v === "_none" ? "" : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">— Não definida —</SelectItem>
                    {formas.map((f) => (
                      <SelectItem key={f.id} value={f.nome}>
                        {f.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Itens */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Itens</p>
                {itensRascunho.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Total: <strong className="text-foreground">{brl(totalRascunho)}</strong>
                  </span>
                )}
              </div>

              {/* Lista de itens adicionados */}
              {itensRascunho.length > 0 && (
                <div className="space-y-1 mb-1">
                  {itensRascunho.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 text-sm border-b border-border/50 py-1.5"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{item.descricao}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {item.quantidade} × {brl(item.preco_unitario)}
                          {item.isNovoProduto && (
                            <span className="text-primary flex items-center gap-0.5">
                              <PackagePlus className="h-3 w-3" /> novo
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="font-medium tabular-nums shrink-0">
                        {brl(item.quantidade * item.preco_unitario)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removerItemRascunho(item.id)}
                        className="text-muted-foreground hover:text-destructive transition p-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulário de item inline */}
              <ItemInput produtos={produtos} onAdd={adicionarItemRascunho} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={creating}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={creating || !usuario}>
              {creating ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Criar OS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar OS */}
      <Dialog open={!!toEdit} onOpenChange={(o) => !editSaving && !o && setToEdit(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar OS #{toEdit?.numero}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cliente</Label>
                <Select
                  value={editForm.cliente_id || "_none"}
                  onValueChange={(v) =>
                    setEditForm({ ...editForm, cliente_id: v === "_none" ? "" : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">— Sem cliente —</SelectItem>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) => setEditForm({ ...editForm, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.nome} value={s.nome}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>
                Diagnóstico{" "}
                <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Textarea
                value={editForm.diagnostico}
                onChange={(e) => setEditForm({ ...editForm, diagnostico: e.target.value })}
                rows={3}
                maxLength={2000}
                placeholder="Descreva o problema ou serviço solicitado…"
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Observações{" "}
                <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Textarea
                value={editForm.observacoes}
                onChange={(e) => setEditForm({ ...editForm, observacoes: e.target.value })}
                rows={2}
                maxLength={2000}
                placeholder="Informações adicionais…"
              />
            </div>

            {formas.length > 0 && (
              <div className="space-y-1.5">
                <Label>Forma de pagamento</Label>
                <Select
                  value={editForm.forma_pagamento || "_none"}
                  onValueChange={(v) =>
                    setEditForm({ ...editForm, forma_pagamento: v === "_none" ? "" : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">— Não definida —</SelectItem>
                    {formas.map((f) => (
                      <SelectItem key={f.id} value={f.nome}>
                        {f.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setToEdit(null)}
              disabled={editSaving}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar exclusão */}
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover OS #{toDelete?.numero}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os itens e o histórico também serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
