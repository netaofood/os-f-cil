import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-B56izvNn.mjs";
import { u as useCurrentUsuario, E as useCurrentEmpresa, A as AppShell, C as Card, e as CardHeader, f as CardTitle, a as CardContent, L as Label, B as Button, I as Input } from "./router-CkbN5ys6.mjs";
import { T as Textarea } from "./textarea-CtYEOiuR.mjs";
import "../_libs/seroval.mjs";
import { L as LoaderCircle, I as Image, u as Upload, T as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
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
function ConfigPage() {
  const qc = useQueryClient();
  const {
    data: usuario
  } = useCurrentUsuario();
  const {
    data: empresa,
    isLoading
  } = useCurrentEmpresa(usuario?.empresa_id);
  const [form, setForm] = reactExports.useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    estado: "",
    pix: "",
    banco: "",
    cor_destaque: "#f97316"
  });
  const [saving, setSaving] = reactExports.useState(false);
  const [logoUrl, setLogoUrl] = reactExports.useState(null);
  const [uploadingLogo, setUploadingLogo] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (empresa) {
      setForm({
        nome: empresa.nome,
        cnpj: empresa.cnpj ?? "",
        telefone: empresa.telefone ?? "",
        email: empresa.email ?? "",
        endereco: empresa.endereco ?? "",
        cidade: empresa.cidade ?? "",
        estado: empresa.estado ?? "",
        pix: empresa.pix ?? "",
        banco: empresa.banco ?? "",
        cor_destaque: empresa.cor_destaque || "#f97316"
      });
      setLogoUrl(empresa.logo_url ?? null);
    }
  }, [empresa]);
  async function handleLogoFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !empresa) return;
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      toast.error("Formato inválido. Use PNG, JPG, WebP ou SVG.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx. 2 MB).");
      return;
    }
    setUploadingLogo(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${empresa.id}/logo-${Date.now()}.${ext}`;
    const {
      error: uploadError
    } = await supabase.storage.from("logos-empresas").upload(path, file, {
      upsert: true,
      contentType: file.type
    });
    if (uploadError) {
      setUploadingLogo(false);
      toast.error(uploadError.message);
      return;
    }
    const {
      data: pub
    } = supabase.storage.from("logos-empresas").getPublicUrl(path);
    const publicUrl = pub.publicUrl;
    const {
      error: updateError
    } = await supabase.from("empresas").update({
      logo_url: publicUrl
    }).eq("id", empresa.id);
    setUploadingLogo(false);
    if (updateError) {
      toast.error(updateError.message);
      return;
    }
    setLogoUrl(publicUrl);
    toast.success("Logo atualizada");
    qc.invalidateQueries({
      queryKey: ["current-empresa"]
    });
  }
  async function handleRemoveLogo() {
    if (!empresa) return;
    setUploadingLogo(true);
    const {
      error
    } = await supabase.from("empresas").update({
      logo_url: null
    }).eq("id", empresa.id);
    setUploadingLogo(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setLogoUrl(null);
    toast.success("Logo removida");
    qc.invalidateQueries({
      queryKey: ["current-empresa"]
    });
  }
  async function handleSave(e) {
    e.preventDefault();
    if (!empresa) return;
    setSaving(true);
    const {
      error
    } = await supabase.from("empresas").update({
      nome: form.nome,
      cnpj: form.cnpj || null,
      telefone: form.telefone || null,
      email: form.email || null,
      endereco: form.endereco || null,
      cidade: form.cidade || null,
      estado: form.estado || null,
      pix: form.pix || null,
      banco: form.banco || null,
      cor_destaque: form.cor_destaque
    }).eq("id", empresa.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Configurações salvas");
      qc.invalidateQueries({
        queryKey: ["current-empresa"]
      });
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title: "Configurações", children: isLoading || !empresa ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Dados da empresa" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 pb-5 border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "block mb-2", children: "Logo da empresa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 w-20 rounded-md border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0", children: logoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoUrl, alt: "Logo", className: "h-full w-full object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-7 w-7 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", accept: "image/png,image/jpeg,image/webp,image/svg+xml", className: "hidden", onChange: handleLogoFile }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", onClick: () => fileInputRef.current?.click(), disabled: uploadingLogo, children: [
                uploadingLogo ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 mr-1 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5 mr-1" }),
                logoUrl ? "Trocar logo" : "Enviar logo"
              ] }),
              logoUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "ghost", onClick: handleRemoveLogo, disabled: uploadingLogo, className: "text-destructive hover:text-destructive", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 mr-1" }),
                " Remover"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "PNG, JPG, WebP ou SVG · até 2 MB. Aparece nas OS e Faturas." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSave, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "e-nome", children: "Nome *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "e-nome", value: form.nome, onChange: (e) => setForm({
            ...form,
            nome: e.target.value
          }), required: true, maxLength: 120 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "e-cnpj", children: "CNPJ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "e-cnpj", value: form.cnpj, onChange: (e) => setForm({
              ...form,
              cnpj: e.target.value
            }), maxLength: 20 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "e-tel", children: "Telefone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "e-tel", value: form.telefone, onChange: (e) => setForm({
              ...form,
              telefone: e.target.value
            }), maxLength: 20 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "e-email", children: "E-mail" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "e-email", type: "email", value: form.email, onChange: (e) => setForm({
            ...form,
            email: e.target.value
          }), maxLength: 120 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "e-end", children: "Endereço" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "e-end", value: form.endereco, onChange: (e) => setForm({
            ...form,
            endereco: e.target.value
          }), rows: 2, maxLength: 200 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "e-cid", children: "Cidade" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "e-cid", value: form.cidade, onChange: (e) => setForm({
              ...form,
              cidade: e.target.value
            }), maxLength: 80 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "e-uf", children: "UF" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "e-uf", value: form.estado, onChange: (e) => setForm({
              ...form,
              estado: e.target.value.toUpperCase()
            }), maxLength: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "e-pix", children: "Chave PIX" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "e-pix", value: form.pix, onChange: (e) => setForm({
              ...form,
              pix: e.target.value
            }), maxLength: 120 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "e-banco", children: "Banco" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "e-banco", value: form.banco, onChange: (e) => setForm({
              ...form,
              banco: e.target.value
            }), maxLength: 80 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "e-cor", children: "Cor de destaque" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "color", id: "e-cor", value: form.cor_destaque, onChange: (e) => setForm({
              ...form,
              cor_destaque: e.target.value
            }), className: "h-10 w-14 rounded border border-border bg-background" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cor_destaque, onChange: (e) => setForm({
              ...form,
              cor_destaque: e.target.value
            }), maxLength: 9, className: "font-mono" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: saving, children: [
          saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }),
          "Salvar alterações"
        ] })
      ] })
    ] })
  ] }) }) });
}
export {
  ConfigPage as component
};
