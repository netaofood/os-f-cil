import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Loader2,
  FileText,
  Trash2,
  Check,
  PackagePlus,
  X,
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

export const Route = createFileRoute("/_authenticated/ordens")({
  component: OrdensPage,
});

type OS = Tables<"ordens_servico"> & { cliente?: { nome: string } | null };

interface ItemRascunho {
  id: string; // key local
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  isNovoProduto: boolean; // será cadastrado no catálogo
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
    onAdd({
      descricao: desc,
      quantidade: Number(quantidade) || 1,
      preco_unitario: Number(preco) || 0,
      isNovoProduto: !jaExiste,
    });
    setDescricao("");
    setQuantidade("1");
    setPreco("");
    setProdutoSelecionadoId(null);
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
          <Button
            type="button"
            className="w-full"
            variant="secondary"
            onClick={handleSalvarItem}
            disabled={!descricao.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Salvar item
          </Button>
        </div>
      </div>

      {produtoNaoEncontrado && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <PackagePlus className="h-3 w-3 shrink-0" />
          Novo item — será cadastrado no catálogo ao criar a OS.
        </p>
      )}
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
function OrdensPage() {
  const { data: usuario } = useCurrentUsuario();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [toDelete, setToDelete] = useState<OS | null>(null);

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

  const { data: statuses = [] } = useQuery({
    queryKey: ["status_os"],
    queryFn: async () => {
      const { data, error } = await supabase.from("status_os").select("*").order("ordem");
      if (error) throw error;
      return data;
    },
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-min"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("id,nome").order("nome");
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
  });

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

  const statusColor = (nome: string) =>
    statuses.find((s) => s.nome === nome)?.cor ?? "#6b7280";

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
            tipo: "servico",
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
      window.location.href = `/ordens/${osData.id}`;
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
              <SelectItem key={s.id} value={s.nome}>
                {s.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openModal} disabled={!usuario?.empresa_id}>
          <Plus className="h-4 w-4 mr-1" />
          Nova OS
        </Button>
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
              <Link
                to="/ordens/$id"
                params={{ id: o.id }}
                className="flex-1 min-w-0 flex items-center gap-3"
              >
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
              </Link>
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
                <Select
                  value={novaOS.cliente_id || "_none"}
                  onValueChange={(v) =>
                    setNovaOS({ ...novaOS, cliente_id: v === "_none" ? "" : v })
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
                      <SelectItem key={s.id} value={s.nome}>
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
            <Button onClick={handleCreate} disabled={creating || !usuario?.empresa_id}>
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
