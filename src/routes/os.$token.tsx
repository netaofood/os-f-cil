import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import SignaturePad from "signature_pad";
import { Loader2, CheckCircle2, XCircle, PenLine, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getOSByToken, aprovarOSByToken } from "@/lib/os.functions";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/os/$token")({
  ssr: false,
  component: PublicOSPage,
});

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

function PublicOSPage() {
  const { token } = Route.useParams();
  const fetchOS = useServerFn(getOSByToken);
  const aprovarOS = useServerFn(aprovarOSByToken);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["public-os", token],
    queryFn: () => fetchOS({ data: { token } }),
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [rejObs, setRejObs] = useState("");
  const [step, setStep] = useState<"view" | "assinar" | "rejeitar">("view");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || step !== "assinar") return;
    const c = canvasRef.current;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    c.getContext("2d")?.scale(ratio, ratio);
    padRef.current = new SignaturePad(c, { backgroundColor: "rgb(255,255,255)" });
  }, [step]);

  async function handleAprovar() {
    if (!padRef.current || padRef.current.isEmpty()) {
      toast.error("Por favor, assine para confirmar a aprovação");
      return;
    }
    setSaving(true);
    try {
      await aprovarOS({
        data: {
          token,
          aprovacao: "aprovada",
          signatureBase64: padRef.current.toDataURL("image/png"),
        },
      });
      toast.success("Orçamento aprovado! Obrigado.");
      refetch();
      setStep("view");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRejeitar() {
    setSaving(true);
    try {
      await aprovarOS({ data: { token, aprovacao: "rejeitada", obs: rejObs } });
      toast.success("Resposta enviada.");
      refetch();
      setStep("view");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Orçamento não encontrado.
      </div>
    );
  }

  const empresa = data.empresa as Tables<"empresas">;
  const cliente = data.cliente as Tables<"clientes"> | null;
  const itens = (data.itens ?? []) as Tables<"itens_os">[];
  const cor = empresa?.cor_destaque || "#f97316";

  const jaRespondeu = data.aprovacao === "aprovada" || data.aprovacao === "rejeitada";

  return (
    <div className="min-h-screen bg-muted/30 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Cabeçalho empresa */}
        <div className="rounded-lg p-5 text-white shadow flex items-center gap-4" style={{ backgroundColor: cor }}>
          {empresa?.logo_url && (
            <img
              src={empresa.logo_url}
              alt={empresa?.nome ?? "Logo"}
              className="h-14 w-14 object-contain rounded bg-white/90 p-1 shrink-0"
            />
          )}
          <div className="min-w-0">
            <div className="text-xs opacity-80 truncate">{empresa?.nome}</div>
            <h1 className="text-xl font-bold mt-0.5">Orçamento #{data.numero}</h1>
            <div className="text-xs opacity-80 mt-1">
              {[empresa?.cidade, empresa?.estado].filter(Boolean).join("/")}
              {empresa?.telefone && ` · ${empresa.telefone}`}
            </div>
          </div>
        </div>


        {/* Dados */}
        <Card>
          <CardContent className="pt-5 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Cliente</p>
                <p className="font-medium">{cliente?.nome ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Data</p>
                <p>{new Date(data.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
            {data.diagnostico && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Descrição</p>
                <p className="whitespace-pre-wrap">{data.diagnostico}</p>
              </div>
            )}
            {data.observacoes && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Observações</p>
                <p className="whitespace-pre-wrap">{data.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Itens */}
        <Card>
          <CardContent className="pt-5">
            <p className="font-semibold text-sm mb-3">Itens do orçamento</p>
            {itens.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem itens.</p>
            ) : (
              <div className="space-y-0.5">
                {itens.map((it, i) => (
                  <div key={it.id ?? i} className="flex items-center text-sm border-b border-border/50 py-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{it.descricao}</div>
                      <div className="text-xs text-muted-foreground">
                        {Number(it.quantidade)} × {brl(Number(it.preco_unitario))}
                      </div>
                    </div>
                    <div className="font-medium tabular-nums shrink-0">{brl(Number(it.total))}</div>
                  </div>
                ))}
                <div className="flex justify-between pt-3 font-bold text-base">
                  <span>Total</span>
                  <span>{brl(Number(data.total))}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagamento */}
        {(empresa?.pix || empresa?.banco) && (
          <Card>
            <CardContent className="pt-5 text-sm space-y-1">
              <p className="font-semibold mb-2">Forma de pagamento</p>
              {data.forma_pagamento && <p>{data.forma_pagamento}</p>}
              {empresa.pix && (
                <p><span className="text-muted-foreground">PIX:</span> <strong>{empresa.pix}</strong></p>
              )}
              {empresa.banco && (
                <p><span className="text-muted-foreground">Banco:</span> {empresa.banco}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status de aprovação */}
        {data.aprovacao === "aprovada" && (
          <Card className="border-green-500/50">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                <CheckCircle2 className="h-5 w-5" />
                Orçamento aprovado
              </div>
              {data.aprovacao_em && (
                <p className="text-xs text-muted-foreground">
                  {new Date(data.aprovacao_em).toLocaleString("pt-BR")}
                </p>
              )}
              {data.assinatura_url && (
                <img
                  src={data.assinatura_url}
                  alt="Assinatura"
                  className="mt-3 max-h-24 border border-border rounded bg-white"
                />
              )}
            </CardContent>
          </Card>
        )}

        {data.aprovacao === "rejeitada" && (
          <Card className="border-red-500/50">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-red-600 font-semibold mb-2">
                <XCircle className="h-5 w-5" />
                Orçamento não aprovado
              </div>
              {data.aprovacao_obs && (
                <p className="text-sm text-muted-foreground">{data.aprovacao_obs}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Ações — só aparece se ainda não respondeu */}
        {!jaRespondeu && (
          <>
            {step === "view" && (
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => setStep("assinar")}>
                  <PenLine className="h-4 w-4 mr-1" />
                  Aprovar e assinar
                </Button>
                <Button variant="outline" className="flex-1 text-destructive border-destructive/50 hover:bg-destructive/10" onClick={() => setStep("rejeitar")}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Não aprovar
                </Button>
              </div>
            )}

            {step === "assinar" && (
              <Card>
                <CardContent className="pt-5 space-y-3">
                  <p className="font-semibold text-sm flex items-center gap-2">
                    <PenLine className="h-4 w-4" /> Assinatura do cliente
                  </p>
                  <canvas
                    ref={canvasRef}
                    className="w-full h-40 border border-border rounded bg-white touch-none"
                  />
                  <div className="flex gap-2 justify-between">
                    <Button variant="ghost" onClick={() => { padRef.current?.clear(); setStep("view"); }}>
                      Cancelar
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => padRef.current?.clear()}>
                        Limpar
                      </Button>
                      <Button onClick={handleAprovar} disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                        Confirmar aprovação
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "rejeitar" && (
              <Card>
                <CardContent className="pt-5 space-y-3">
                  <p className="font-semibold text-sm flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" /> Motivo (opcional)
                  </p>
                  <Textarea
                    value={rejObs}
                    onChange={(e) => setRejObs(e.target.value)}
                    placeholder="Descreva o motivo da recusa…"
                    rows={3}
                    maxLength={1000}
                  />
                  <div className="flex gap-2 justify-between">
                    <Button variant="ghost" onClick={() => setStep("view")}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleRejeitar} disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                      Confirmar recusa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <p className="text-center text-xs text-muted-foreground pb-4">
          Powered by OS Fácil
        </p>
      </div>
    </div>
  );
}
