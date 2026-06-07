import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Download,
  Loader2,
  Copy,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";
import { buildFaturaPdf } from "@/lib/fatura-pdf";

export const Route = createFileRoute("/_authenticated/faturas/$id")({
  component: FaturaDetailPage,
});

type Fatura = Tables<"faturas">;
type Empresa = Tables<"empresas">;
type Cliente = Tables<"clientes">;
type ItemJson = {
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
};

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

function FaturaDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["fatura", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faturas")
        .select("*, empresa:empresas(*), cliente:clientes(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as
        | (Fatura & { empresa: Empresa; cliente: Cliente | null })
        | null;
    },
  });

  const [updating, setUpdating] = useState(false);
  async function updateStatus(status: Fatura["status"]) {
    setUpdating(true);
    const { error } = await supabase
      .from("faturas")
      .update({
        status,
        pago_em: status === "pago" ? new Date().toISOString() : null,
      })
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
        <div className="text-center py-12 text-muted-foreground">
          Fatura não encontrada.
        </div>
      </AppShell>
    );
  }

  const itens = (data.itens as unknown as ItemJson[]) ?? [];
  const publicUrl = `${window.location.origin}/fatura/${data.link_publico_token}`;

  async function downloadPdf() {
    if (!data) return;
    const doc = buildFaturaPdf({
      empresa: data.empresa,
      fatura: data,
      cliente: data.cliente,
      itens,
      publicUrl,
    });
    doc.save(`${data.numero}.pdf`);
  }

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado");
  }

  return (
    <AppShell title={`Fatura ${data.numero}`}>
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/faturas">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Link>
        </Button>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={copyLink}>
            <Copy className="h-4 w-4 mr-1" /> Copiar link público
          </Button>
          <Button onClick={downloadPdf}>
            <Download className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>{data.numero}</span>
                <Badge variant="outline" className="capitalize">
                  {data.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Cliente</div>
                <div className="font-medium">
                  {data.cliente?.nome ?? data.cliente_nome ?? "—"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Emitida</div>
                  {new Date(data.created_at).toLocaleDateString("pt-BR")}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Vencimento</div>
                  {data.vencimento
                    ? new Date(data.vencimento).toLocaleDateString("pt-BR")
                    : "—"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Itens</CardTitle>
            </CardHeader>
            <CardContent>
              {itens.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sem itens.</div>
              ) : (
                <div className="space-y-1">
                  {itens.map((it, i) => (
                    <div
                      key={i}
                      className="flex items-center text-sm border-b border-border/50 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{it.descricao}</div>
                        <div className="text-xs text-muted-foreground">
                          {it.quantidade} × {brl(it.preco_unitario)}
                        </div>
                      </div>
                      <div className="font-medium tabular-nums">
                        {brl(it.total)}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 font-semibold">
                    <span>Total</span>
                    <span>{brl(Number(data.total))}</span>
                  </div>
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
                <img
                  src={data.assinatura_url}
                  alt="Assinatura"
                  className="max-h-32 border border-border rounded bg-white"
                />
                {data.pago_em && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Assinada em {new Date(data.pago_em).toLocaleString("pt-BR")}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Status</label>
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
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => updateStatus("pago")}
                disabled={updating || data.status === "pago"}
              >
                <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                Pago
              </Button>
              <Button
                variant="outline"
                onClick={() => updateStatus("cancelado")}
                disabled={updating || data.status === "cancelado"}
              >
                <XCircle className="h-4 w-4 mr-1 text-destructive" />
                Cancelar
              </Button>
            </div>
            <div className="pt-2 text-xs text-muted-foreground break-all">
              Link público:
              <br />
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                {publicUrl}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
