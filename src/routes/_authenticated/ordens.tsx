import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Loader2, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useCurrentUsuario } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/_authenticated/ordens")({
  component: OrdensPage,
});

type OS = Tables<"ordens_servico"> & { cliente?: { nome: string } | null };

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

function OrdensPage() {
  const { data: usuario } = useCurrentUsuario();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<OS | null>(null);

  const { data: statuses = [] } = useQuery({
    queryKey: ["status_os"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("status_os")
        .select("*")
        .order("ordem");
      if (error) throw error;
      return data;
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

  async function handleCreate() {
    if (!usuario?.empresa_id) return;
    setCreating(true);
    const { data: numero, error: errNum } = await supabase.rpc("next_os_numero", {
      _empresa_id: usuario.empresa_id,
    });
    if (errNum || !numero) {
      setCreating(false);
      toast.error(errNum?.message ?? "Falha ao gerar número");
      return;
    }
    const defaultStatus = statuses[0]?.nome ?? "aberta";
    const { data, error } = await supabase
      .from("ordens_servico")
      .insert({
        empresa_id: usuario.empresa_id,
        numero,
        status: defaultStatus,
        criado_por: usuario.id,
      })
      .select("id")
      .single();
    setCreating(false);
    if (error || !data) {
      toast.error(error?.message ?? "Erro");
      return;
    }
    qc.invalidateQueries({ queryKey: ["ordens"] });
    window.location.href = `/ordens/${data.id}`;
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

  return (
    <AppShell title="Ordens de Serviço">
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
        <Button onClick={handleCreate} disabled={creating || !usuario?.empresa_id}>
          {creating ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-1" />
          )}
          Nova OS
        </Button>
      </div>

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

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover OS #{toDelete?.numero}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os itens e o histórico também serão
              removidos.
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
