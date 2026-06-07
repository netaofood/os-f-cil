import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, Loader2, Save, History } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/ordens/$id")({
  component: OrdemDetailPage,
});

type OS = Tables<"ordens_servico">;
type Item = Tables<"itens_os">;

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

function OrdemDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

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
  const { data: statuses = [] } = useQuery({
    queryKey: ["status_os"],
    queryFn: async () => {
      const { data } = await supabase.from("status_os").select("*").order("ordem");
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
    queryFn: async () => {
      const { data } = await supabase
        .from("produtos")
        .select("id,nome,preco,unidade")
        .eq("ativo", true)
        .order("nome");
      return data ?? [];
    },
  });

  const { data: itens = [] } = useQuery({
    queryKey: ["itens_os", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itens_os")
        .select("*")
        .eq("os_id", id);
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
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Array<Tables<"log_os"> & { usuario: { nome: string } | null }>);
    },
  });

  const [form, setForm] = useState({
    cliente_id: "",
    status: "",
    forma_pagamento: "",
    diagnostico: "",
    observacoes: "",
  });
  const [saving, setSaving] = useState(false);

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

  async function handleSave() {
    if (!os) return;
    setSaving(true);
    const { error } = await supabase
      .from("ordens_servico")
      .update({
        cliente_id: form.cliente_id || null,
        status: form.status,
        forma_pagamento: form.forma_pagamento || null,
        diagnostico: form.diagnostico || null,
        observacoes: form.observacoes || null,
      })
      .eq("id", os.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("OS atualizada");
      qc.invalidateQueries({ queryKey: ["os", id] });
      qc.invalidateQueries({ queryKey: ["log_os", id] });
      qc.invalidateQueries({ queryKey: ["ordens"] });
    }
  }

  // Item form
  const [novoItem, setNovoItem] = useState({
    descricao: "",
    quantidade: "1",
    preco_unitario: "0",
  });
  const [addingItem, setAddingItem] = useState(false);

  async function addItem() {
    if (!os) return;
    if (!novoItem.descricao.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }
    setAddingItem(true);
    const { error } = await supabase.from("itens_os").insert({
      os_id: os.id,
      descricao: novoItem.descricao.trim(),
      quantidade: Number(novoItem.quantidade) || 1,
      preco_unitario: Number(novoItem.preco_unitario) || 0,
    });
    setAddingItem(false);
    if (error) toast.error(error.message);
    else {
      setNovoItem({ descricao: "", quantidade: "1", preco_unitario: "0" });
      qc.invalidateQueries({ queryKey: ["itens_os", id] });
      qc.invalidateQueries({ queryKey: ["os", id] });
      qc.invalidateQueries({ queryKey: ["log_os", id] });
    }
  }

  async function removeItem(itemId: string) {
    const { error } = await supabase.from("itens_os").delete().eq("id", itemId);
    if (error) toast.error(error.message);
    else {
      qc.invalidateQueries({ queryKey: ["itens_os", id] });
      qc.invalidateQueries({ queryKey: ["os", id] });
      qc.invalidateQueries({ queryKey: ["log_os", id] });
    }
  }

  function pickProduto(produtoId: string) {
    const p = produtos.find((x) => x.id === produtoId);
    if (!p) return;
    setNovoItem({
      descricao: p.nome,
      quantidade: "1",
      preco_unitario: String(p.preco),
    });
  }

  if (isLoading) {
    return (
      <AppShell title="OS">
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }
  if (!os) {
    return (
      <AppShell title="OS">
        <div className="text-center py-12 text-muted-foreground">OS não encontrada.</div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`OS #${os.numero}`}>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/ordens">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Cliente</Label>
                  <Select
                    value={form.cliente_id || "_none"}
                    onValueChange={(v) =>
                      setForm({ ...form, cliente_id: v === "_none" ? "" : v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
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
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                <Label>Diagnóstico</Label>
                <Textarea
                  value={form.diagnostico}
                  onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
                  rows={3}
                  maxLength={2000}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Observações</Label>
                <Textarea
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  rows={2}
                  maxLength={2000}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Forma de pagamento</Label>
                <Select
                  value={form.forma_pagamento || "_none"}
                  onValueChange={(v) =>
                    setForm({ ...form, forma_pagamento: v === "_none" ? "" : v })
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

              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Salvar alterações
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Itens</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Total: <strong className="text-foreground">{brl(Number(os.total))}</strong>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {itens.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Nenhum item adicionado.
                </div>
              ) : (
                <div className="space-y-1">
                  {itens.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center gap-2 text-sm border-b border-border/50 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{it.descricao}</div>
                        <div className="text-xs text-muted-foreground">
                          {Number(it.quantidade)} × {brl(Number(it.preco_unitario))}
                        </div>
                      </div>
                      <div className="font-medium tabular-nums">
                        {brl(Number(it.total))}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(it.id)}
                        className="text-destructive hover:text-destructive h-8 w-8"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-border space-y-2">
                {produtos.length > 0 && (
                  <Select onValueChange={pickProduto}>
                    <SelectTrigger>
                      <SelectValue placeholder="Adicionar do catálogo…" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome} — {brl(Number(p.preco))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="grid grid-cols-12 gap-2">
                  <Input
                    className="col-span-6"
                    placeholder="Descrição"
                    value={novoItem.descricao}
                    onChange={(e) =>
                      setNovoItem({ ...novoItem, descricao: e.target.value })
                    }
                  />
                  <Input
                    className="col-span-2"
                    type="number"
                    step="0.01"
                    placeholder="Qtd"
                    value={novoItem.quantidade}
                    onChange={(e) =>
                      setNovoItem({ ...novoItem, quantidade: e.target.value })
                    }
                  />
                  <Input
                    className="col-span-3"
                    type="number"
                    step="0.01"
                    placeholder="Preço unit."
                    value={novoItem.preco_unitario}
                    onChange={(e) =>
                      setNovoItem({ ...novoItem, preco_unitario: e.target.value })
                    }
                  />
                  <Button
                    className="col-span-1"
                    size="icon"
                    onClick={addItem}
                    disabled={addingItem}
                  >
                    {addingItem ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-xs text-muted-foreground">
                Nenhuma alteração registrada ainda.
              </div>
            ) : (
              <ul className="space-y-3 text-xs">
                {logs.map((l) => (
                  <li key={l.id} className="border-l-2 border-primary/50 pl-3">
                    <div className="font-medium text-foreground">
                      {l.campo_alterado}
                    </div>
                    <div className="text-muted-foreground">
                      {l.valor_anterior ?? "—"} → <strong>{l.valor_novo ?? "—"}</strong>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {l.usuario?.nome ?? "Sistema"} ·{" "}
                      {new Date(l.created_at).toLocaleString("pt-BR")}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
