import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-B56izvNn.mjs";
import { u as useCurrentUsuario, L as Label, I as Input, B as Button } from "./router-CkbN5ys6.mjs";
import "../_libs/seroval.mjs";
import { L as LoaderCircle } from "../_libs/lucide-react.mjs";
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
function SetupPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const {
    data: usuario,
    isLoading: loadingUser
  } = useCurrentUsuario();
  const [nome, setNome] = reactExports.useState("");
  const [cnpj, setCnpj] = reactExports.useState("");
  const [telefone, setTelefone] = reactExports.useState("");
  const [cidade, setCidade] = reactExports.useState("");
  const [estado, setEstado] = reactExports.useState("");
  const [pix, setPix] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  if (!loadingUser && usuario?.empresa_id) {
    navigate({
      to: "/dashboard"
    });
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!usuario) return;
    setLoading(true);
    try {
      const {
        data: emp,
        error: empErr
      } = await supabase.from("empresas").insert({
        nome,
        cnpj: cnpj || null,
        telefone: telefone || null,
        cidade: cidade || null,
        estado: estado || null,
        pix: pix || null
      }).select().single();
      if (empErr) throw empErr;
      const {
        error: usrErr
      } = await supabase.from("usuarios").update({
        empresa_id: emp.id
      }).eq("id", usuario.id);
      if (usrErr) throw usrErr;
      await supabase.from("status_os").insert([{
        empresa_id: emp.id,
        nome: "Aberta",
        cor: "#3b82f6",
        ordem: 1
      }, {
        empresa_id: emp.id,
        nome: "Em andamento",
        cor: "#f59e0b",
        ordem: 2
      }, {
        empresa_id: emp.id,
        nome: "Concluída",
        cor: "#10b981",
        ordem: 3
      }, {
        empresa_id: emp.id,
        nome: "Cancelada",
        cor: "#ef4444",
        ordem: 4
      }]);
      await supabase.from("formas_pagamento").insert([{
        empresa_id: emp.id,
        nome: "Dinheiro"
      }, {
        empresa_id: emp.id,
        nome: "PIX"
      }, {
        empresa_id: emp.id,
        nome: "Cartão de Crédito"
      }, {
        empresa_id: emp.id,
        nome: "Cartão de Débito"
      }]);
      toast.success("Empresa cadastrada!");
      await qc.invalidateQueries({
        queryKey: ["current-usuario"]
      });
      navigate({
        to: "/dashboard"
      });
    } catch (err) {
      toast.error("Erro ao criar empresa", {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen flex flex-col items-center justify-center bg-background px-6 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/logo.png", alt: "", className: "w-20 h-20 object-contain" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-2xl font-bold", children: "Vamos configurar sua empresa" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center mt-1", children: "Esses dados aparecerão nas suas ordens de serviço e faturas." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "nome", children: "Nome da empresa *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "nome", value: nome, onChange: (e) => setNome(e.target.value), required: true, maxLength: 120 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cnpj", children: "CNPJ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "cnpj", value: cnpj, onChange: (e) => setCnpj(e.target.value), maxLength: 20 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "telefone", children: "Telefone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "telefone", value: telefone, onChange: (e) => setTelefone(e.target.value), maxLength: 20 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cidade", children: "Cidade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "cidade", value: cidade, onChange: (e) => setCidade(e.target.value), maxLength: 80 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "estado", children: "UF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "estado", value: estado, onChange: (e) => setEstado(e.target.value.toUpperCase()), maxLength: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pix", children: "Chave PIX" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "pix", value: pix, onChange: (e) => setPix(e.target.value), maxLength: 120 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "w-full", disabled: loading, children: [
        loading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }),
        "Criar empresa"
      ] })
    ] })
  ] }) });
}
export {
  SetupPage as component
};
