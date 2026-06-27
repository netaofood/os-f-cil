import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { S as SignaturePad } from "../_libs/signature_pad.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as Route$c, C as Card, a as CardContent, B as Button, g as getOSByToken, b as aprovarOSByToken } from "./router-CkbN5ys6.mjs";
import { T as Textarea } from "./textarea-CtYEOiuR.mjs";
import "../_libs/seroval.mjs";
import { L as LoaderCircle, o as CircleCheck, p as CircleX, q as PenLine } from "../_libs/lucide-react.mjs";
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
const brl = (n) => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
}).format(n || 0);
function PublicOSPage() {
  const {
    token
  } = Route$c.useParams();
  const initialData = Route$c.useLoaderData();
  const fetchOS = useServerFn(getOSByToken);
  const aprovarOS = useServerFn(aprovarOSByToken);
  const {
    data,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["public-os", token],
    queryFn: () => fetchOS({
      data: {
        token
      }
    }),
    initialData: initialData ?? void 0
  });
  const canvasRef = reactExports.useRef(null);
  const padRef = reactExports.useRef(null);
  const [rejObs, setRejObs] = reactExports.useState("");
  const [step, setStep] = reactExports.useState("view");
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!canvasRef.current || step !== "assinar") return;
    const c = canvasRef.current;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    c.getContext("2d")?.scale(ratio, ratio);
    padRef.current = new SignaturePad(c, {
      backgroundColor: "rgb(255,255,255)"
    });
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
          signatureBase64: padRef.current.toDataURL("image/png")
        }
      });
      toast.success("Orçamento aprovado! Obrigado.");
      refetch();
      setStep("view");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function handleRejeitar() {
    setSaving(true);
    try {
      await aprovarOS({
        data: {
          token,
          aprovacao: "rejeitada",
          obs: rejObs
        }
      });
      toast.success("Resposta enviada.");
      refetch();
      setStep("view");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) });
  }
  if (!data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center text-muted-foreground", children: "Orçamento não encontrado." });
  }
  const empresa = data.empresa;
  const cliente = data.cliente;
  const itens = data.itens ?? [];
  const cor = empresa?.cor_destaque || "#f97316";
  const jaRespondeu = data.aprovacao === "aprovada" || data.aprovacao === "rejeitada";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-muted/30 py-6 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg p-5 text-white shadow flex items-center gap-4", style: {
      backgroundColor: cor
    }, children: [
      empresa?.logo_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: empresa.logo_url, alt: empresa?.nome ?? "Logo", className: "h-14 w-14 object-contain rounded bg-white/90 p-1 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-80 truncate", children: empresa?.nome }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-bold mt-0.5", children: [
          "Orçamento #",
          data.numero
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs opacity-80 mt-1", children: [
          [empresa?.cidade, empresa?.estado].filter(Boolean).join("/"),
          empresa?.telefone && ` · ${empresa.telefone}`
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5 space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Cliente" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: cliente?.nome ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Data" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: new Date(data.created_at).toLocaleDateString("pt-BR") })
        ] })
      ] }),
      data.diagnostico && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Descrição" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: data.diagnostico })
      ] }),
      data.observacoes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Observações" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: data.observacoes })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm mb-3", children: "Itens do orçamento" }),
      itens.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Sem itens." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
        itens.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm border-b border-border/50 py-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-medium", children: it.descricao }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              Number(it.quantidade),
              " × ",
              brl(Number(it.preco_unitario))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium tabular-nums shrink-0", children: brl(Number(it.total)) })
        ] }, it.id ?? i)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between pt-3 font-bold text-base", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: brl(Number(data.total)) })
        ] })
      ] })
    ] }) }),
    (empresa?.pix || empresa?.banco) && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5 text-sm space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-2", children: "Forma de pagamento" }),
      data.forma_pagamento && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: data.forma_pagamento }),
      empresa.pix && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "PIX:" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: empresa.pix })
      ] }),
      empresa.banco && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Banco:" }),
        " ",
        empresa.banco
      ] })
    ] }) }),
    data.aprovacao === "aprovada" && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-green-500/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-green-600 font-semibold mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5" }),
        "Orçamento aprovado"
      ] }),
      data.aprovacao_em && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: new Date(data.aprovacao_em).toLocaleString("pt-BR") }),
      data.assinatura_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: data.assinatura_url, alt: "Assinatura", className: "mt-3 max-h-24 border border-border rounded bg-white" })
    ] }) }),
    data.aprovacao === "rejeitada" && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-red-500/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-red-600 font-semibold mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-5 w-5" }),
        "Orçamento não aprovado"
      ] }),
      data.aprovacao_obs && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: data.aprovacao_obs })
    ] }) }),
    !jaRespondeu && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      step === "view" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "flex-1", onClick: () => setStep("assinar"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "h-4 w-4 mr-1" }),
          "Aprovar e assinar"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "flex-1 text-destructive border-destructive/50 hover:bg-destructive/10", onClick: () => setStep("rejeitar"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 mr-1" }),
          "Não aprovar"
        ] })
      ] }),
      step === "assinar" && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "h-4 w-4" }),
          " Assinatura do cliente"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "w-full h-40 border border-border rounded bg-white touch-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => {
            padRef.current?.clear();
            setStep("view");
          }, children: "Cancelar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => padRef.current?.clear(), children: "Limpar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleAprovar, disabled: saving, children: [
              saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-1 animate-spin" }),
              "Confirmar aprovação"
            ] })
          ] })
        ] })
      ] }) }),
      step === "rejeitar" && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-destructive" }),
          " Motivo (opcional)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: rejObs, onChange: (e) => setRejObs(e.target.value), placeholder: "Descreva o motivo da recusa…", rows: 3, maxLength: 1e3 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setStep("view"), children: "Cancelar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: handleRejeitar, disabled: saving, children: [
            saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-1 animate-spin" }),
            "Confirmar recusa"
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground pb-4", children: "Powered by OS Fácil" })
  ] }) });
}
export {
  PublicOSPage as component
};
