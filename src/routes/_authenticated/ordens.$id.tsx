import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Trash2,
  Loader2,
  Save,
  History,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ItemOSForm } from "@/components/item-os-form";
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

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

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
      return data as Array<Tables<"log_os"> & { usuario: { nome: string } | null }>;
    },
  });

  const [form, setForm] = useState({
    cliente_id: "",
    status: "",
    forma_pagamento: "",
    diagnostico: "",
    observacoes: "",
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
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("OS atualizada");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["os", id] });
      qc.invalidateQueries({ queryKey: ["log_os", id] });
      qc.invalidateQueries({ queryKey: ["ordens"] });
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

  const clienteNome = clientes.find((c) => c.id === os?.cliente_id)?.nome ?? "Sem cliente";
  const statusCor = statuses.find((s) => s.nome === os?.status)?.cor ?? "#6b7280";

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
      {/* Cabeçalho */}
      <div className="mb-4 flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/ordens">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">

          {/* ── Card Dados Gerais ── */}
          <Card>
            <CardContent className="pt-6">
              {/* Header do card com botão editar */}
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-base">Dados gerais</p>
                {!editing ? (
                  <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5 mr-1" />
                      )}
                      Salvar
                    </Button>
                  </div>
                )}
              </div>

              {/* Visualização */}
              {!editing && (
                <div className="space-y-3 text-sm">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Cliente</p>
                      <p className="font-medium">{clienteNome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                      <span
                        className="inline-block text-xs font-medium px-2 py-1 rounded-full text-white"
                        style={{ backgroundColor: statusCor }}
                      >
                        {os.status}
                      </span>
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
                  {os.forma_pagamento && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Forma de pagamento</p>
                      <p>{os.forma_pagamento}</p>
                    </div>
                  )}
                  {!os.diagnostico && !os.observacoes && !os.forma_pagamento && !os.cliente_id && (
                    <p className="text-muted-foreground text-xs italic">
                      Nenhum dado preenchido. Clique em "Editar" para preencher.
                    </p>
                  )}
                </div>
              )}

              {/* Formulário de edição */}
              {editing && (
                <div className="space-y-3">
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
                    <Label>
                      Diagnóstico{" "}
                      <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                    </Label>
                    <Textarea
                      value={form.diagnostico}
                      onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
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
                      value={form.observacoes}
                      onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                      rows={2}
                      maxLength={2000}
                      placeholder="Informações adicionais…"
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Card Itens ── */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-base">Itens</p>
                <span className="text-sm text-muted-foreground">
                  Total:{" "}
                  <strong className="text-foreground">{brl(Number(os.total))}</strong>
                </span>
              </div>

              {itens.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum item adicionado ainda.
                </p>
              ) : (
                <div className="space-y-0.5 mb-2">
                  {itens.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center gap-2 text-sm border-b border-border/50 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{it.descricao}</div>
                        <div className="text-xs text-muted-foreground">
                          {Number(it.quantidade)} × {brl(Number(it.preco_unitario))}
                        </div>
                      </div>
                      <div className="font-medium tabular-nums shrink-0">
                        {brl(Number(it.total))}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(it.id)}
                        className="text-destructive hover:text-destructive h-8 w-8 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <ItemOSForm osId={os.id} />
            </CardContent>
          </Card>
        </div>

        {/* ── Histórico ── */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-4 w-4" />
              <p className="font-semibold text-base">Histórico</p>
            </div>
            {logs.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhuma alteração registrada ainda.
              </p>
            ) : (
              <ul className="space-y-3 text-xs">
                {logs.map((l) => (
                  <li key={l.id} className="border-l-2 border-primary/50 pl-3">
                    <div className="font-medium text-foreground">{l.campo_alterado}</div>
                    <div className="text-muted-foreground">
                      {l.valor_anterior ?? "—"} →{" "}
                      <strong>{l.valor_novo ?? "—"}</strong>
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
