import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { S as SignaturePad } from "../_libs/signature_pad.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { d as Route$b, C as Card, e as CardHeader, f as CardTitle, a as CardContent, B as Button, h as getFaturaByToken, s as signFaturaByToken } from "./router-CkbN5ys6.mjs";
import { B as Badge } from "./badge-CtW5P91g.mjs";
import { b as buildFaturaPdf } from "./fatura-pdf-ufB4KK46.mjs";
import "../_libs/seroval.mjs";
import "../_libs/jspdf.mjs";
import { L as LoaderCircle, o as CircleCheck, q as PenLine, D as Download } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./client-B56izvNn.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./server-Bvapkoxa.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-separator.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/zod.mjs";
import "fs";
import "path";
import "../_libs/fflate.mjs";
import "../_libs/fast-png.mjs";
import "../_libs/iobuffer.mjs";
import "../_libs/pako.mjs";
import "../_libs/html2canvas.mjs";
import "../_libs/dompurify.mjs";
import "../_libs/canvg.mjs";
import "../_libs/core-js.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/raf.mjs";
import "../_libs/performance-now.mjs";
import "../_libs/rgbcolor.mjs";
import "../_libs/svg-pathdata.mjs";
import "../_libs/stackblur-canvas.mjs";
const brl = (n) => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
}).format(n || 0);
function PublicFaturaPage() {
  const {
    token
  } = Route$b.useParams();
  const initialData = Route$b.useLoaderData();
  const fetchFn = useServerFn(getFaturaByToken);
  const signFn = useServerFn(signFaturaByToken);
  const {
    data,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["public-fatura", token],
    queryFn: () => fetchFn({
      data: {
        token
      }
    }),
    initialData: initialData ?? void 0
  });
  const canvasRef = reactExports.useRef(null);
  const padRef = reactExports.useRef(null);
  const [signing, setSigning] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!canvasRef.current || data?.status === "pago") return;
    const c = canvasRef.current;
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      c.width = c.offsetWidth * ratio;
      c.height = c.offsetHeight * ratio;
      c.getContext("2d")?.scale(ratio, ratio);
      padRef.current?.clear();
    };
    padRef.current = new SignaturePad(c, {
      backgroundColor: "rgb(255,255,255)"
    });
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
      await signFn({
        data: {
          token,
          signatureBase64: dataUrl
        }
      });
      toast.success("Fatura assinada com sucesso!");
      refetch();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSigning(false);
    }
  }
  function downloadPdf() {
    if (!data) return;
    const itens2 = data.itens ?? [];
    const doc = buildFaturaPdf({
      empresa: data.empresa,
      fatura: data,
      cliente: data.cliente,
      itens: itens2,
      publicUrl: window.location.href
    });
    doc.save(`${data.numero}.pdf`);
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) });
  }
  if (!data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center text-muted-foreground", children: "Fatura não encontrada." });
  }
  const itens = data.itens ?? [];
  const empresa = data.empresa;
  const cor = empresa.cor_destaque || "#f97316";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-muted/30 py-6 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg p-5 text-white shadow flex items-center gap-4", style: {
      backgroundColor: cor
    }, children: [
      empresa.logo_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: empresa.logo_url, alt: empresa.nome ?? "Logo", className: "h-14 w-14 object-contain rounded bg-white/90 p-1 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-90 truncate", children: empresa.nome }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-bold mt-0.5", children: [
          "Fatura ",
          data.numero
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs opacity-90 mt-1", children: [
          [empresa.cidade, empresa.estado].filter(Boolean).join("/"),
          " ",
          empresa.telefone && `· ${empresa.telefone}`
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: data.cliente_nome ?? data.cliente?.nome ?? "Cliente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: data.status === "pago" ? "default" : "outline", className: "capitalize", children: data.status })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-1 text-sm", children: [
        itens.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between py-1 border-b border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate", children: it.descricao }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              it.quantidade,
              " × ",
              brl(it.preco_unitario)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: brl(it.total) })
        ] }, i)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between pt-3 text-base font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: brl(Number(data.total)) })
        ] }),
        data.vencimento && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground pt-2", children: [
          "Vencimento: ",
          new Date(data.vencimento).toLocaleDateString("pt-BR")
        ] })
      ] })
    ] }),
    (empresa.pix || empresa.banco) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Pagamento" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "text-sm space-y-1", children: [
        empresa.pix && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "PIX:" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: empresa.pix })
        ] }),
        empresa.banco && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Banco:" }),
          " ",
          empresa.banco
        ] })
      ] })
    ] }),
    data.status === "pago" && data.assinatura_url ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5 text-green-600" }),
        "Fatura assinada"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: data.assinatura_url, alt: "Assinatura", className: "max-h-32 border border-border rounded bg-white" }),
        data.pago_em && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-2", children: new Date(data.pago_em).toLocaleString("pt-BR") })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "h-5 w-5" }),
        " Assinar"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "w-full h-40 border border-border rounded bg-white touch-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => padRef.current?.clear(), children: "Limpar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSign, disabled: signing, children: [
            signing && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-1 animate-spin" }),
            "Confirmar assinatura"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: downloadPdf, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-1" }),
      " Baixar PDF"
    ] }) })
  ] }) });
}
export {
  PublicFaturaPage as component
};
