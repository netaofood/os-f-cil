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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export const Route = createFileRoute("/_authenticated/clientes")({
  component: ClientesPage,
});

type Cliente = Tables<"clientes">;

function ClientesPage() {
  const { data: usuario } = useCurrentUsuario();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [toDelete, setToDelete] = useState<Cliente | null>(null);

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data as Cliente[];
    },
  });

  const filtered = clientes.filter((c) =>
    [c.nome, c.telefone, c.email, c.cpf]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(search.toLowerCase())),
  );

  function startNew() {
    setEditing(null);
    setOpen(true);
  }
  function startEdit(c: Cliente) {
    setEditing(c);
    setOpen(true);
  }

  async function handleDelete() {
    if (!toDelete) return;
    const { error } = await supabase.from("clientes").delete().eq("id", toDelete.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Cliente removido");
      qc.invalidateQueries({ queryKey: ["clientes"] });
    }
    setToDelete(null);
  }

  return (
    <AppShell title="Clientes">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone, e-mail ou CPF…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={startNew}>
          <Plus className="h-4 w-4 mr-1" /> Novo cliente
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {clientes.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum resultado."}
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{c.nome}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {[c.telefone, c.email, c.cidade && c.estado ? `${c.cidade}/${c.estado}` : null]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => startEdit(c)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setToDelete(c)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ClienteDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        empresaId={usuario?.empresa_id ?? null}
        onSaved={() => qc.invalidateQueries({ queryKey: ["clientes"] })}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Cliente: <strong>{toDelete?.nome}</strong>
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

function ClienteDialog({
  open,
  onOpenChange,
  editing,
  empresaId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Cliente | null;
  empresaId: string | null;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    cpf: "",
    cidade: "",
    estado: "",
    observacoes: "",
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          nome: editing.nome,
          telefone: editing.telefone ?? "",
          email: editing.email ?? "",
          cpf: editing.cpf ?? "",
          cidade: editing.cidade ?? "",
          estado: editing.estado ?? "",
          observacoes: editing.observacoes ?? "",
        });
      } else {
        setForm({ nome: "", telefone: "", email: "", cpf: "", cidade: "", estado: "", observacoes: "" });
      }
    }
  }, [open, editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!empresaId) {
      toast.error("Empresa não configurada");
      return;
    }
    if (!form.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    const payload = {
      nome: form.nome.trim(),
      telefone: form.telefone.trim() || null,
      email: form.email.trim() || null,
      cpf: form.cpf.trim() || null,
      cidade: form.cidade.trim() || null,
      estado: form.estado.trim() || null,
      observacoes: form.observacoes.trim() || null,
    };
    const { error } = editing
      ? await supabase.from("clientes").update(payload).eq("id", editing.id)
      : await supabase.from("clientes").insert({ ...payload, empresa_id: empresaId });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "Cliente atualizado" : "Cliente cadastrado");
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar cliente" : "Novo cliente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="c-nome">Nome *</Label>
            <Input
              id="c-nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              maxLength={120}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-tel">Telefone</Label>
              <Input
                id="c-tel"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                maxLength={20}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-cpf">CPF</Label>
              <Input
                id="c-cpf"
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                maxLength={20}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-email">E-mail</Label>
            <Input
              id="c-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              maxLength={120}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="c-cid">Cidade</Label>
              <Input
                id="c-cid"
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-uf">UF</Label>
              <Input
                id="c-uf"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })}
                maxLength={2}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-obs">Observações</Label>
            <Textarea
              id="c-obs"
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              rows={2}
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
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
