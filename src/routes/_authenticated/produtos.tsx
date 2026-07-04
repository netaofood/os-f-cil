import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useCurrentUsuario } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export const Route = createFileRoute("/_authenticated/produtos")({
  component: ProdutosPage,
});

type Produto = Tables<"produtos">;

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ProdutosPage() {
  const { data: usuario } = useCurrentUsuario();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Produto | null>(null);
  const [toDelete, setToDelete] = useState<Produto | null>(null);

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("produtos").select("*").order("nome");
      if (error) throw error;
      return data as Produto[];
    },
  });

  const filtered = produtos.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleDelete() {
    if (!toDelete) return;
    const { error } = await supabase.from("produtos").delete().eq("id", toDelete.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Item removido");
      qc.invalidateQueries({ queryKey: ["produtos"] });
    }
    setToDelete(null);
  }

  return (
    <AppShell title="Produtos & Serviços">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <button
          onClick={() => { setEditing(null); setOpen(true); }}
          title="Novo produto/serviço"
          className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 dark:shadow-[0_0_12px_#00B4FF66] transition-all"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {produtos.length === 0 ? "Nenhum item cadastrado." : "Nenhum resultado."}
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{p.nome}</span>
                  <Badge variant={p.tipo === "servico" ? "secondary" : "outline"}>
                    {p.tipo === "servico" ? "Serviço" : "Produto"}
                  </Badge>
                  {!p.ativo && <Badge variant="destructive">Inativo</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {brl(Number(p.preco))} / {p.unidade}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditing(p);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setToDelete(p)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProdutoDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        empresaId={usuario?.empresa_id ?? null}
        onSaved={() => qc.invalidateQueries({ queryKey: ["produtos"] })}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover item?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Item: <strong>{toDelete?.nome}</strong>
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

function ProdutoDialog({
  open,
  onOpenChange,
  editing,
  empresaId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Produto | null;
  empresaId: string | null;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    tipo: "servico" as "servico" | "produto",
    preco: "",
    unidade: "un",
    ativo: true,
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          nome: editing.nome,
          tipo: editing.tipo as "servico" | "produto",
          preco: String(editing.preco),
          unidade: editing.unidade,
          ativo: editing.ativo,
        });
      } else {
        setForm({ nome: "", tipo: "servico", preco: "", unidade: "un", ativo: true });
      }
    }
  }, [open, editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!empresaId) return toast.error("Empresa não configurada");
    if (!form.nome.trim()) return toast.error("Nome é obrigatório");
    const preco = Number(form.preco.replace(",", "."));
    if (isNaN(preco) || preco < 0) return toast.error("Preço inválido");

    setSaving(true);
    const payload = {
      nome: form.nome.trim(),
      tipo: form.tipo,
      preco,
      unidade: form.unidade.trim() || "un",
      ativo: form.ativo,
    };
    const { error } = editing
      ? await supabase.from("produtos").update(payload).eq("id", editing.id)
      : await supabase.from("produtos").insert({ ...payload, empresa_id: empresaId });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Item atualizado" : "Item cadastrado");
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar item" : "Novo item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-nome">Nome *</Label>
            <Input
              id="p-nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              maxLength={120}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => setForm({ ...form, tipo: v as "servico" | "produto" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="servico">Serviço</SelectItem>
                  <SelectItem value="produto">Produto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-un">Unidade</Label>
              <Input
                id="p-un"
                value={form.unidade}
                onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                maxLength={10}
                placeholder="un, h, kg…"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-preco">Preço (R$)</Label>
            <Input
              id="p-preco"
              inputMode="decimal"
              value={form.preco}
              onChange={(e) => setForm({ ...form, preco: e.target.value })}
              placeholder="0,00"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
            />
            Ativo
          </label>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
