import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Download, Loader2, MessageCircle, Copy, Check,
  CheckCircle2, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";
import { buildFaturaPdf } from "@/lib/fatura-pdf";

export const Route = createFileRoute("/_authenticated/faturas/$id")({
  component: FaturaDetailPage,
});

type Fatura = Tables<"faturas">;
type Empresa = Tables<"empresas">;
type Cliente = Tables<"clientes">;
type ItemJson = {
  descricao: string; quantidade: number; preco_unitario: number; total: number;
};

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

const statusColor: Record<string, string> = {
  pendente: "#f59e0b", pago: "#10b981", vencido: "#ef4444", cancelado: "#6b7280",
};

function FaturaDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [conviteModal, setConviteModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["fatura", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faturas")
        .select("*, empresa:empresas(*), cliente:clientes(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as (Fatura & { empresa: Empresa; cliente: Cliente | null }) | null;
    },
  });

  async function updateStatus(status: Fatura["status"]) {
    setUpdating(true);
    const { error } = await supabase
      .from("faturas")
      .update({ status, pago_em: status === "pago" ? new Date().toISOString() : null })
      .eq("id", id);
    setUpdating(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Status atualizado");
      qc.invalidateQueries({ queryKey: ["fatura", id] });
      qc.invalidateQueries({ queryKey: ["faturas"] });
    }
  }

  if (isLoading) {
    return (
      <AppShell title="Fatura">
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }
  if (!data) {
    return (
      <AppShell title="Fatura">
        <div className="text-center py-12 text-muted-foreground">Fatura não encontrada.</div>
      </AppShell>
    );
  }

  const itens = (data.itens as unknown as ItemJson[]) ?? [];
  const publicUrl = `${window.location.origin}/fatura/${data.link_publico_token}`;

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  }

  function openWhatsApp() {
    const msg = encodeURIComponent(`*OS Fácil — Fatura ${data.numero}*\n\nAcesse para visualizar:\n${publicUrl}`);
    const tel = (data.cliente as any)?.telefone?.replace(/\D/g, "");
    window.open(`https://wa.me/${tel ? `55${tel}` : ""}?text=${msg}`, "_blank");
  }

  async function downloadPdf() {
    const doc = buildFaturaPdf({
      empresa: data.empresa,
      fatura: data,
      cliente: data.cliente,
      itens,
      publicUrl,
    });
    doc.save(`${data.numero}.pdf`);
  }

  return (
    <AppShell title={`Fatura ${data.numero}`}>
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => { window.location.href = "/faturas"; }}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="flex gap-2">
          <button title="Enviar pelo WhatsApp" onClick={openWhatsApp}
            className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-green-600 hover:bg-muted transition-colors">
            <MessageCircle className="h-4 w-4" />
          </button>
          <button title="Copiar link" onClick={copyLink}
            className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
          <button title="Baixar PDF" onClick={downloadPdf}
            className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>{data.numero}</span>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full text-white capitalize"
                  style={{ backgroundColor: statusColor[data.status] ?? "#6b7280" }}
                >
                  {data.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Cliente</div>
                <div className="font-medium">{data.cliente?.nome ?? data.cliente_nome ?? "—"}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Emitida</div>
                  {new Date(data.created_at).toLocaleDateString("pt-BR")}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Vencimento</div>
                  {data.vencimento ? new Date(data.vencimento).toLocaleDateString("pt-BR") : "—"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Itens</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Total: <strong className="text-foreground">{brl(Number(data.total))}</strong>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {itens.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sem itens.</div>
              ) : (
                <div className="space-y-0.5">
                  {itens.map((it, i) => (
                    <div key={i} className="flex items-center text-sm border-b border-border/50 py-2">
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{it.descricao}</div>
                        <div className="text-xs text-muted-foreground">
                          {it.quantidade} × {brl(it.preco_unitario)}
                        </div>
                      </div>
                      <div className="font-medium tabular-nums">{brl(it.total)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {data.assinatura_url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assinatura do cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={data.assinatura_url} alt="Assinatura"
                  className="max-h-32 border border-border rounded bg-white" />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Painel de ações */}
        <Card className="h-fit">
          <CardContent className="pt-5 space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
              <Select
                value={data.status}
                onValueChange={(v) => updateStatus(v as Fatura["status"])}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botões de ação rápida */}
            <div className="flex gap-2">
              <button title="Marcar como pago"
                onClick={() => updateStatus("pago")}
                disabled={updating || data.status === "pago"}
                className="h-9 w-9 flex items-center justify-center rounded-md text-green-600 hover:bg-muted disabled:opacity-40 transition-colors">
                <CheckCircle2 className="h-4 w-4" />
              </button>
              <button title="Cancelar fatura"
                onClick={() => updateStatus("cancelado")}
                disabled={updating || data.status === "cancelado"}
                className="h-9 w-9 flex items-center justify-center rounded-md text-destructive hover:bg-muted disabled:opacity-40 transition-colors">
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            {/* Enviar fatura */}
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Enviar fatura</p>
              <div className="flex gap-3">
                <button onClick={openWhatsApp}
                  className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border border-green-500/40 text-green-600 hover:bg-green-500/10 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">WhatsApp</span>
                </button>
                <button onClick={copyLink}
                  className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border border-border hover:bg-muted transition-colors">
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  <span className="text-xs font-medium">{copied ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
