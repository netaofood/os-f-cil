import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Trash2, Loader2, Save, History,
  Pencil, X, Send, Copy, Check, CheckCircle2,
  XCircle, Clock, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ItemOSForm } from "@/components/item-os-form";
import { STATUS_OS, getStatusCor } from "@/lib/status-os";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/ordens/$id")({
  ssr: false,
  component: OrdemDetailPage,
});

type OS = Tables<"ordens_servico"> & {
  link_publico_token?: string;
  aprovacao?: string | null;
  aprovacao_obs?: string | null;
  aprovacao_em?: string | null;
  assinatura_url?: string | null;
};
type Item = Tables<"itens_os">;

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

// ── Linha de item editável ───────────────────────────────────────────────────
function ItemRow({ item, osId }: { item: Item; osId: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(item.descricao);
  const [qtd, setQtd] = useState(String(item.quantidade));
  const [preco, setPreco] = useState(String(item.preco_unitario));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("itens_os")
      .update({
        descricao: desc.trim() || item.descricao,
        quantidade: Number(qtd) || 1,
        preco_unitario: Number(preco) || 0,
      })
      .eq("id", item.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["itens_os", osId] });
      qc.invalidateQueries({ queryKey: ["os", osId] });
    }
  }

  async function handleDelete() {
    const { error } = await supabase.from("itens_os").delete().eq("id", item.id);
    if (error) toast.error(error.message);
    else {
      qc.invalidateQueries({ queryKey: ["itens_os", osId] });
      qc.invalidateQueries({ queryKey: ["os", osId] });
    }
  }

  if (editing) {
    return (
      <div className="py-2 border-b border-border/50 space-y-2">
        <Input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Descrição"
          className="text-sm"
        />
        <div className="grid grid-cols-12 gap-2 items-center">
          <Input
            className="col-span-3 text-sm"
            type="number" step="0.01" min="0.001"
            value={qtd}
            onChange={(e) => setQtd(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="Qtd"
          />
          <Input
            className="col-span-4 text-sm"
            type="number" step="0.01" min="0"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="Preço unit."
          />
          <div className="col-span-5 flex gap-1 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1" />}
              Salvar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm border-b border-border/50 py-2">
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{item.descricao}</div>
        <div className="text-xs text-muted-foreground">
          {Number(item.quantidade)} × {brl(Number(item.preco_unitario))}
        </div>
      </div>
      <div className="font-medium tabular-nums shrink-0">{brl(Number(item.total))}</div>
      <Button
        size="icon" variant="ghost"
        onClick={() => { setDesc(item.descricao); setQtd(String(item.quantidade)); setPreco(String(item.preco_unitario)); setEditing(true); }}
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="icon" variant="ghost"
        onClick={handleDelete}
        className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
function OrdemDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: os, isLoading } = useQuery({
    queryKey: ["os", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as OS | null;
    },
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-min"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("id,nome").order("nome");
      return data ?? [];
    },
  });

  const statuses = STATUS_OS;

  const { data: formas = [] } = useQuery({
    queryKey: ["formas_pagamento"],
    queryFn: async () => {
      const { data } = await supabase.from("formas_pagamento").select("*").eq("ativo", true).order("nome");
      return data ?? [];
    },
  });

  const { data: itens = [] } = useQuery({
    queryKey: ["itens_os", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("itens_os").select("*").eq("os_id", id);
      if (error) throw error;
      return data as Item[];
    },
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["log_os", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("log_os")
        .select("*, usuario:usuarios(nome)")
        .eq("os_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Array<Tables<"log_os"> & { usuario: { nome: string } | null }>;
    },
  });

  const [form, setForm] = useState({
    cliente_id: "", status: "", forma_pagamento: "", diagnostico: "", observacoes: "",
  });

  useEffect(() => {
    if (os) {
      setForm({
        cliente_id: os.cliente_id ?? "",
        status: os.status,
        forma_pagamento: os.forma_pagamento ?? "",
        diagnostico: os.diagnostico ?? "",
        observacoes: os.observacoes ?? "",
      });
    }
  }, [os]);

  function handleCancelEdit() {
    if (!os) return;
    setForm({
      cliente_id: os.cliente_id ?? "",
      status: os.status,
      forma_pagamento: os.forma_pagamento ?? "",
      diagnostico: os.diagnostico ?? "",
      observacoes: os.observacoes ?? "",
    });
    setEditing(false);
  }

  async function handleSave() {
    if (!os) return;
    setSaving(true);
    const { error } = await supabase.from("ordens_servico").update({
      cliente_id: form.cliente_id || null,
      status: form.status,
      forma_pagamento: form.forma_pagamento || null,
      diagnostico: form.diagnostico || null,
      observacoes: form.observacoes || null,
    }).eq("id", os.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("OS atualizada");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["os", id] });
      qc.invalidateQueries({ queryKey: ["log_os", id] });
      qc.invalidateQueries({ queryKey: ["ordens"] });
      // Abre modal de envio após salvar
      setShareModal(true);
    }
  }

  async function handleStatusRapido(novoStatus: string) {
    if (!os || os.status === novoStatus) return;
    const { error } = await supabase.from("ordens_servico").update({ status: novoStatus }).eq("id", os.id);
    if (error) toast.error(error.message);
    else {
      qc.invalidateQueries({ queryKey: ["os", id] });
      qc.invalidateQueries({ queryKey: ["log_os", id] });
      qc.invalidateQueries({ queryKey: ["ordens"] });
    }
  }

  const publicUrl = os?.link_publico_token
    ? `${window.location.origin}/os/${os.link_publico_token}?v=2`
    : null;

  const clienteNomeMsg = clientes.find((c) => c.id === os?.cliente_id)?.nome ?? "";
  const shareMessage = publicUrl
    ? `Olá ${clienteNomeMsg}, segue seu orçamento ${publicUrl}`
    : "";

  function copyLink() {
    if (!shareMessage) return;
    navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    toast.success("Mensagem copiada!");
    setTimeout(() => setCopied(false), 2000);
  }

  function openWhatsApp() {
    if (!shareMessage) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, "_blank");
  }


  const clienteNome = clientes.find((c) => c.id === os?.cliente_id)?.nome ?? "Sem cliente";
  const statusCor = getStatusCor(os?.status ?? "");

  const aprovacaoIcon = {
    aprovada: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    rejeitada: <XCircle className="h-4 w-4 text-red-500" />,
  }[os?.aprovacao ?? ""] ?? null;

  if (isLoading) return (
    <AppShell title="OS">
      <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
    </AppShell>
  );

  if (!os) return (
    <AppShell title="OS">
      <div className="text-center py-12 text-muted-foreground">OS não encontrada.</div>
    </AppShell>
  );

  return (
    <AppShell title={`OS #${os.numero}`}>
      {/* Cabeçalho */}
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/ordens" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <div className="flex gap-2">
          <button title="Enviar orçamento" onClick={() => setShareModal(true)} className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Status rápido */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-muted-foreground shrink-0">Status:</span>
        {statuses.map((s, i) => {
          const ativo = os.status === s.nome;
          return (
            <button
              key={s.nome}
              onClick={() => handleStatusRapido(s.nome)}
              className={cn(
                "flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
                ativo
                  ? "text-white border-transparent shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
              style={ativo ? { backgroundColor: s.cor } : {}}
            >
              {i > 0 && !ativo && <ChevronRight className="h-3 w-3 opacity-40" />}
              {s.nome}
            </button>
          );
        })}
        {os.aprovacao && (
          <span className="flex items-center gap-1 text-xs ml-2">
            {aprovacaoIcon}
            <span className={cn(
              "font-medium",
              os.aprovacao === "aprovada" ? "text-green-600" : "text-red-600"
            )}>
              {os.aprovacao === "aprovada" ? "Aprovado pelo cliente" : "Recusado pelo cliente"}
            </span>
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">

          {/* ── Dados Gerais ── */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-base">Dados gerais</p>
                {!editing ? (
                  <button title="Editar" onClick={() => setEditing(true)} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={saving}>
                      <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                      Salvar
                    </Button>
                  </div>
                )}
              </div>

              {!editing ? (
                <div className="space-y-3 text-sm">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Cliente</p>
                      <p className="font-medium">{clienteNome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Forma de pagamento</p>
                      <p>{os.forma_pagamento || "—"}</p>
                    </div>
                  </div>
                  {os.diagnostico && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Diagnóstico</p>
                      <p className="whitespace-pre-wrap">{os.diagnostico}</p>
                    </div>
                  )}
                  {os.observacoes && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Observações</p>
                      <p className="whitespace-pre-wrap">{os.observacoes}</p>
                    </div>
                  )}
                  {!os.diagnostico && !os.observacoes && !os.forma_pagamento && !os.cliente_id && (
                    <p className="text-muted-foreground text-xs italic">
                      Nenhum dado preenchido. Clique em "Editar" para preencher.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Cliente</Label>
                      <Select value={form.cliente_id || "_none"} onValueChange={(v) => setForm({ ...form, cliente_id: v === "_none" ? "" : v })}>
                        <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">— Sem cliente —</SelectItem>
                          {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Forma de pagamento</Label>
                      <Select value={form.forma_pagamento || "_none"} onValueChange={(v) => setForm({ ...form, forma_pagamento: v === "_none" ? "" : v })}>
                        <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">— Não definida —</SelectItem>
                          {formas.map((f) => <SelectItem key={f.id} value={f.nome}>{f.nome}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Diagnóstico <span className="text-xs text-muted-foreground font-normal">(opcional)</span></Label>
                    <Textarea value={form.diagnostico} onChange={(e) => setForm({ ...form, diagnostico: e.target.value })} rows={3} maxLength={2000} placeholder="Descreva o problema ou serviço…" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Observações <span className="text-xs text-muted-foreground font-normal">(opcional)</span></Label>
                    <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={2} maxLength={2000} placeholder="Informações adicionais…" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Itens ── */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-base">Itens</p>
                <span className="text-sm text-muted-foreground">
                  Total: <strong className="text-foreground">{brl(Number(os.total))}</strong>
                </span>
              </div>

              {itens.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">
                  Nenhum item adicionado ainda.
                </p>
              ) : (
                <div className="mb-2">
                  {itens.map((it) => (
                    <ItemRow key={it.id} item={it} osId={os.id} />
                  ))}
                </div>
              )}

              <ItemOSForm osId={os.id} />
            </CardContent>
          </Card>
        </div>

        {/* ── Histórico / Linha do tempo ── */}
        <div className="space-y-4">
          {/* Aprovação do cliente */}
          {os.aprovacao && (
            <Card className={cn(
              "border-2",
              os.aprovacao === "aprovada" ? "border-green-500/40" : "border-red-500/40"
            )}>
              <CardContent className="pt-5">
                <div className={cn(
                  "flex items-center gap-2 font-semibold text-sm mb-2",
                  os.aprovacao === "aprovada" ? "text-green-600" : "text-red-600"
                )}>
                  {aprovacaoIcon}
                  {os.aprovacao === "aprovada" ? "Orçamento aprovado" : "Orçamento recusado"}
                </div>
                {os.aprovacao_em && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(os.aprovacao_em).toLocaleString("pt-BR")}
                  </p>
                )}
                {os.aprovacao_obs && (
                  <p className="text-xs text-muted-foreground mt-1 italic">"{os.aprovacao_obs}"</p>
                )}
                {os.assinatura_url && (
                  <img src={os.assinatura_url} alt="Assinatura" className="mt-3 max-h-20 border border-border rounded bg-white" />
                )}
              </CardContent>
            </Card>
          )}

          {/* Linha do tempo */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-4 w-4" />
                <p className="font-semibold text-sm">Histórico</p>
              </div>
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma alteração registrada.</p>
              ) : (
                <ol className="relative border-l border-border/60 space-y-4 ml-2">
                  {logs.map((l) => (
                    <li key={l.id} className="ml-4">
                      <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-background bg-primary/70" />
                      <div className="text-xs font-medium text-foreground">{l.campo_alterado}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.valor_anterior ?? "—"} → <strong>{l.valor_novo ?? "—"}</strong>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {l.usuario?.nome ?? "Sistema"} · {new Date(l.created_at).toLocaleString("pt-BR")}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Enviar Orçamento */}
      <Dialog open={shareModal} onOpenChange={setShareModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enviar orçamento OS #{os?.numero}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {publicUrl ? (
              <>
                {os?.aprovacao && (
                  <div className={cn(
                    "flex items-center gap-2 text-sm p-3 rounded-lg",
                    os.aprovacao === "aprovada" ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
                  )}>
                    {aprovacaoIcon}
                    Cliente já {os.aprovacao === "aprovada" ? "aprovou" : "recusou"} este orçamento.
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={openWhatsApp}
                    className="flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border border-green-500/40 text-green-600 hover:bg-green-500/10 transition-colors"
                  >
                    <Send className="h-6 w-6" />
                    <span className="text-xs font-medium">WhatsApp</span>
                  </button>
                  <button
                    onClick={copyLink}
                    className="flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border border-border hover:bg-muted transition-colors"
                  >
                    {copied ? <Check className="h-6 w-6 text-green-500" /> : <Copy className="h-6 w-6" />}
                    <span className="text-xs font-medium">{copied ? "Copiado!" : "Copiar link"}</span>
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Link público não disponível.
              </p>
            )}
            <button
              onClick={() => setShareModal(false)}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
