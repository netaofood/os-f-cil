import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import SignaturePad from "signature_pad";
import { Download, Loader2, PenLine, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFaturaByToken, signFaturaByToken } from "@/lib/faturas.functions";
import { buildFaturaPdf } from "@/lib/fatura-pdf";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/fatura/$token")({
  loader: async ({ params }) => {
    try {
      return await getFaturaByToken({ data: { token: params.token } });
    } catch {
      return null;
    }
  },
  head: ({ loaderData }) => {
    const fat: any = loaderData;
    const empresa = fat?.empresa;
    const nomeEmp = empresa?.nome ?? "OS Fácil";
    const title = fat ? `Fatura ${fat.numero} — ${nomeEmp}` : "Fatura";
    const desc = fat
      ? `Visualize a fatura ${fat.numero} de ${nomeEmp}.`
      : "Visualização pública de fatura.";
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
    ];
    if (empresa?.logo_url) {
      meta.push({ property: "og:image", content: empresa.logo_url });
      meta.push({ name: "twitter:image", content: empresa.logo_url });
      meta.push({ name: "twitter:card", content: "summary_large_image" });
    }
    return { meta };
  },
  component: PublicFaturaPage,
});

type ItemJson = {
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
};

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

function PublicFaturaPage() {
  const { token } = Route.useParams();
  const initialData = Route.useLoaderData();
  const fetchFn = useServerFn(getFaturaByToken);
  const signFn = useServerFn(signFaturaByToken);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["public-fatura", token],
    queryFn: () => fetchFn({ data: { token } }),
    initialData: initialData ?? undefined,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || data?.status === "pago") return;
    const c = canvasRef.current;
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      c.width = c.offsetWidth * ratio;
      c.height = c.offsetHeight * ratio;
      c.getContext("2d")?.scale(ratio, ratio);
      padRef.current?.clear();
    };
    padRef.current = new SignaturePad(c, { backgroundColor: "rgb(255,255,255)" });
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [data?.status]);

  async function handleSign() {
    if (!padRef.current || padRef.current.isEmpty()) {
      toast.error("Por favor, assine no quadro abaixo");
      return;
    }
    setSigning(true);
    try {
      const dataUrl = padRef.current.toDataURL("image/png");
      await signFn({ data: { token, signatureBase64: dataUrl } });
      toast.success("Fatura assinada com sucesso!");
      refetch();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSigning(false);
    }
  }

  function downloadPdf() {
    if (!data) return;
    const itens = (data.itens as unknown as ItemJson[]) ?? [];
    const doc = buildFaturaPdf({
      empresa: data.empresa as Tables<"empresas">,
      fatura: data,
      cliente: data.cliente as Tables<"clientes"> | null,
      itens,
      publicUrl: window.location.href,
    });
    doc.save(`${data.numero}.pdf`);
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
        Fatura não encontrada.
      </div>
    );
  }

  const itens = (data.itens as unknown as ItemJson[]) ?? [];
  const empresa = data.empresa as Tables<"empresas">;
  const cor = empresa.cor_destaque || "#f97316";

  return (
    <div className="min-h-screen bg-muted/30 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div
          className="rounded-lg p-5 text-white shadow flex items-center gap-4"
          style={{ backgroundColor: cor }}
        >
          {empresa.logo_url && (
            <img
              src={empresa.logo_url}
              alt={empresa.nome ?? "Logo"}
              className="h-14 w-14 object-contain rounded bg-white/90 p-1 shrink-0"
            />
          )}
          <div className="min-w-0">
            <div className="text-xs opacity-90 truncate">{empresa.nome}</div>
            <h1 className="text-xl font-bold mt-0.5">Fatura {data.numero}</h1>
            <div className="text-xs opacity-90 mt-1">
              {[empresa.cidade, empresa.estado].filter(Boolean).join("/")}{" "}
              {empresa.telefone && `· ${empresa.telefone}`}
            </div>
          </div>
        </div>


        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>
                {data.cliente_nome ??
                  (data.cliente as Tables<"clientes"> | null)?.nome ??
                  "Cliente"}
              </span>
              <Badge variant={data.status === "pago" ? "default" : "outline"} className="capitalize">
                {data.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {itens.map((it, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-border/50">
                <div className="flex-1 min-w-0">
                  <div className="truncate">{it.descricao}</div>
                  <div className="text-xs text-muted-foreground">
                    {it.quantidade} × {brl(it.preco_unitario)}
                  </div>
                </div>
                <div className="font-medium">{brl(it.total)}</div>
              </div>
            ))}
            <div className="flex justify-between pt-3 text-base font-bold">
              <span>Total</span>
              <span>{brl(Number(data.total))}</span>
            </div>
            {data.vencimento && (
              <div className="text-xs text-muted-foreground pt-2">
                Vencimento: {new Date(data.vencimento).toLocaleDateString("pt-BR")}
              </div>
            )}
          </CardContent>
        </Card>

        {(empresa.pix || empresa.banco) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {empresa.pix && (
                <div>
                  <span className="text-muted-foreground">PIX:</span>{" "}
                  <strong>{empresa.pix}</strong>
                </div>
              )}
              {empresa.banco && (
                <div>
                  <span className="text-muted-foreground">Banco:</span>{" "}
                  {empresa.banco}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {data.status === "pago" && data.assinatura_url ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Fatura assinada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={data.assinatura_url}
                alt="Assinatura"
                className="max-h-32 border border-border rounded bg-white"
              />
              {data.pago_em && (
                <div className="text-xs text-muted-foreground mt-2">
                  {new Date(data.pago_em).toLocaleString("pt-BR")}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PenLine className="h-5 w-5" /> Assinar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <canvas
                ref={canvasRef}
                className="w-full h-40 border border-border rounded bg-white touch-none"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => padRef.current?.clear()}>
                  Limpar
                </Button>
                <Button onClick={handleSign} disabled={signing}>
                  {signing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Confirmar assinatura
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={downloadPdf}>
            <Download className="h-4 w-4 mr-1" /> Baixar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
