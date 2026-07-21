import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Loader2, Receipt, Trash2, MessageCircle, Copy, Check, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useCurrentUsuario } from "@/hooks/use-current-user";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/faturas")({
  ssr: false,
  component: FaturasPage,
});

type Fatura = Tables<"faturas"> & { cliente?: { nome: string } | null };

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

const statusColor: Record<string, string> = {
  pendente: "#f59e0b", pago: "#10b981", vencido: "#ef4444", cancelado: "#6b7280",
};

function FaturasPage() {
  const { data: usuario } = useCurrentUsuario();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [newOpen, setNewOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Fatura | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: faturas = [], isLoading } = useQuery({
    queryKey: ["faturas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faturas")
        .select("*, cliente:clientes(nome)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Fatura[];
    },
  });

  const filtered = faturas.filter((f) => {
    if (statusFilter !== "todos" && f.status !== statusFilter) return false;
    const s = search.toLowerCase();
    if (!s) return true;
    return (
      f.numero.toLowerCase().includes(s) ||
      (f.cliente?.nome ?? "").toLowerCase().includes(s) ||
      (f.cliente_nome ?? "").toLowerCase().includes(s)
    );
  });

  async function handleDelete() {
    if (!toDelete) return;
    const { error } = await supabase.from("faturas").delete().eq("id", toDelete.id);
    if (error) toast.error(error.message);
    else { toast.success("Fatura removida"); qc.invalidateQueries({ queryKey: ["faturas"] }); }
    setToDelete(null);
  }

  function getPublicUrl(token: string) {
    return `${window.location.origin}/fatura/${token}`;
  }

  function copiarLink(f: Fatura) {
    if (!f.link_publico_token) return;
    navigator.clipboard.writeText(getPublicUrl(f.link_publico_token));
    setCopied(f.id);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(null), 2000);
  }

  function enviarWhatsApp(f: Fatura) {
    if (!f.link_publico_token) return;
    const url = getPublicUrl(f.link_publico_token);
    const msg = encodeURIComponent(`*OS Fácil — Fatura ${f.numero}*\n\nAcesse para visualizar:\n${url}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  return (
    <AppShell title="Faturas">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou cliente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="pago">Pagas</SelectItem>
            <SelectItem value="vencido">Vencidas</SelectItem>
            <SelectItem value="cancelado">Canceladas</SelectItem>
          </SelectContent>
        </Select>
        <button
          onClick={() => setNewOpen(true)}
          disabled={!usuario}
          title="Nova fatura"
          className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 dark:shadow-[0_0_12px_#00B4FF66] transition-all"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-2">
          <Receipt className="h-8 w-8 opacity-40" />
          {faturas.length === 0
            ? "Nenhuma fatura ainda. Gere uma a partir de uma OS Concluída."
            : "Nenhum resultado."}
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className="font-mono text-sm font-semibold w-20 shrink-0">{f.numero}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">
                    {f.cliente?.nome ?? f.cliente_nome ?? "Sem cliente"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {new Date(f.created_at).toLocaleDateString("pt-BR")} · {brl(Number(f.total))}
                  </div>
                </div>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full text-white shrink-0 capitalize"
                  style={{ backgroundColor: statusColor[f.status] ?? "#6b7280" }}
                >
                  {f.status}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                <Link
                  to="/faturas/$id"
                  params={{ id: f.id }}
                  title="Abrir fatura"
                  className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <button
                  title="Enviar pelo WhatsApp"
                  onClick={() => enviarWhatsApp(f)}
                  className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-green-600 hover:bg-muted transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button
                  title="Copiar link"
                  onClick={() => copiarLink(f)}
                  className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {copied === f.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  title="Excluir fatura"
                  onClick={() => setToDelete(f)}
                  className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NovaFaturaDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        empresaId={usuario?.empresa_id ?? null}
        onCreated={(id) => {
          qc.invalidateQueries({ queryKey: ["faturas"] });
          window.location.href = `/faturas/${id}`;
        }}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover fatura {toDelete?.numero}?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
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

function NovaFaturaDialog({
  open, onOpenChange, empresaId, onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  empresaId: string | null;
  onCreated: (id: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [osId, setOsId] = useState<string>("_none");
  const [vencimento, setVencimento] = useState("");

  const { data: ordens = [] } = useQuery({
    queryKey: ["ordens-para-fatura"],
    enabled: open,
    queryFn: async () => {
      const { data } = await supabase
        .from("ordens_servico")
        .select("id, numero, total, status, cliente_id, cliente:clientes(nome)")
        .eq("status", "Concluída") // Apenas OS Concluídas
        .order("created_at", { ascending: false })
        .limit(100);
      return (data ?? []) as Array<{
        id: string; numero: string; total: number;
        status: string; cliente_id: string | null;
        cliente: { nome: string } | null;
      }>;
    },
  });

  const brl = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

  async function handleCreate() {
    if (!empresaId) { toast.error("Empresa não identificada"); return; }
    if (osId === "_none") { toast.error("Selecione uma OS Concluída"); return; }
    setSaving(true);

    const { data: numero, error: e1 } = await supabase.rpc("next_fatura_numero", {
      _empresa_id: empresaId,
    });
    if (e1 || !numero) { setSaving(false); toast.error(e1?.message ?? "Erro ao gerar número"); return; }

    const fromOs = ordens.find((o) => o.id === osId);
    let itens: unknown[] = [];
    let total = 0;
    let cliente_id: string | null = null;
    let cliente_nome: string | null = null;

    if (fromOs) {
      cliente_id = fromOs.cliente_id;
      cliente_nome = fromOs.cliente?.nome ?? null;
      const { data: its } = await supabase
        .from("itens_os")
        .select("descricao, quantidade, preco_unitario, total")
        .eq("os_id", fromOs.id);
      itens = (its ?? []).map((i) => ({
        descricao: i.descricao,
        quantidade: Number(i.quantidade),
        preco_unitario: Number(i.preco_unitario),
        total: Number(i.total),
      }));
      total = Number(fromOs.total) || 0;
    }

    const { data: novaFatura, error } = await supabase
      .from("faturas")
      .insert({
        empresa_id: empresaId, numero,
        os_id: fromOs?.id ?? null,
        cliente_id, cliente_nome,
        itens: itens as never, total,
        vencimento: vencimento || null,
      })
      .select("id")
      .single();

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Fatura criada!");
    onCreated(novaFatura.id);
    onOpenChange(false);
    setOsId("_none");
    setVencimento("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova fatura</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>OS Concluída *</Label>
            <Select value={osId} onValueChange={setOsId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar OS Concluída" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">— Selecione uma OS —</SelectItem>
                {ordens.length === 0 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    Nenhuma OS Concluída encontrada.
                  </div>
                )}
                {ordens.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    #{o.numero} — {o.cliente?.nome ?? "sem cliente"} · {brl(Number(o.total))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Somente OSs com status "Concluída" podem gerar fatura.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="venc">Vencimento</Label>
            <Input
              id="venc" type="date"
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving || osId === "_none"}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Criar fatura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
