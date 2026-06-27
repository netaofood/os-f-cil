import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-B56izvNn.mjs";
import { u as useCurrentUsuario, A as AppShell, I as Input, S as Select, v as SelectTrigger, w as SelectValue, x as SelectContent, y as SelectItem, B as Button, D as Dialog, q as DialogContent, r as DialogHeader, t as DialogTitle, L as Label, z as DialogFooter, i as AlertDialog, j as AlertDialogContent, k as AlertDialogHeader, l as AlertDialogTitle, m as AlertDialogDescription, n as AlertDialogFooter, o as AlertDialogCancel, p as AlertDialogAction, c as cn } from "./router-CkbN5ys6.mjs";
import { T as Textarea } from "./textarea-CtYEOiuR.mjs";
import "../_libs/seroval.mjs";
import { r as Search, P as Plus, L as LoaderCircle, F as FileText, o as CircleCheck, p as CircleX, v as Clock, w as ExternalLink, a as Pencil, T as Trash2, x as PackagePlus, X, d as Save, e as Check } from "../_libs/lucide-react.mjs";
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
const brl = (n) => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
}).format(n || 0);
function ItemInput({
  produtos,
  onAdd
}) {
  const [descricao, setDescricao] = reactExports.useState("");
  const [quantidade, setQuantidade] = reactExports.useState("1");
  const [preco, setPreco] = reactExports.useState("");
  const [produtoSelecionadoId, setProdutoSelecionadoId] = reactExports.useState(null);
  const [showSugestoes, setShowSugestoes] = reactExports.useState(false);
  const inputRef = reactExports.useRef(null);
  const containerRef = reactExports.useRef(null);
  const sugestoes = descricao.trim().length === 0 ? produtos.slice(0, 8) : produtos.filter((p) => p.nome.toLowerCase().includes(descricao.toLowerCase())).slice(0, 8);
  reactExports.useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSugestoes(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  function selecionarProduto(p) {
    setDescricao(p.nome);
    setPreco(String(p.preco));
    setProdutoSelecionadoId(p.id);
    setShowSugestoes(false);
    setTimeout(() => {
      const qtdInput = containerRef.current?.querySelector("[data-qtd]");
      qtdInput?.focus();
      qtdInput?.select();
    }, 50);
  }
  function handleDescChange(v) {
    setDescricao(v);
    setProdutoSelecionadoId(null);
    setShowSugestoes(true);
  }
  function handleSalvarItem() {
    const desc = descricao.trim();
    if (!desc) {
      inputRef.current?.focus();
      return;
    }
    const jaExiste = produtoSelecionadoId !== null || produtos.some((p) => p.nome.toLowerCase() === desc.toLowerCase());
    onAdd({
      descricao: desc,
      quantidade: Number(quantidade) || 1,
      preco_unitario: Number(preco) || 0,
      isNovoProduto: !jaExiste
    });
    setDescricao("");
    setQuantidade("1");
    setPreco("");
    setProdutoSelecionadoId(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }
  const produtoNaoEncontrado = descricao.trim().length > 0 && !produtoSelecionadoId && !produtos.some((p) => p.nome.toLowerCase() === descricao.trim().toLowerCase());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ref: inputRef, value: descricao, onChange: (e) => handleDescChange(e.target.value), onFocus: () => setShowSugestoes(true), onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSalvarItem();
        }
      }, placeholder: "Produto, serviço ou descrição livre…", autoComplete: "off" }),
      showSugestoes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto", children: sugestoes.length === 0 && descricao.trim().length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 text-xs text-muted-foreground flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PackagePlus, { className: "h-3.5 w-3.5 shrink-0" }),
        "Será cadastrado no catálogo ao criar a OS"
      ] }) : sugestoes.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onMouseDown: (e) => {
        e.preventDefault();
        selecionarProduto(p);
      }, className: cn("w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center justify-between gap-2", produtoSelecionadoId === p.id && "bg-accent"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 min-w-0", children: [
          produtoSelecionadoId === p.id && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: p.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground shrink-0", children: p.tipo === "servico" ? "serviço" : "produto" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium tabular-nums shrink-0", children: brl(p.preco) })
      ] }, p.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-2 items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Qtd" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "data-qtd": true, type: "number", min: "0.001", step: "0.01", value: quantidade, onChange: (e) => setQuantidade(e.target.value), onFocus: (e) => e.target.select() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Preço unitário" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", value: preco, onChange: (e) => setPreco(e.target.value), onFocus: (e) => e.target.select(), placeholder: "0,00" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block text-transparent select-none", children: "add" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", className: "w-full", variant: "secondary", onClick: handleSalvarItem, disabled: !descricao.trim(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Salvar item"
        ] })
      ] })
    ] }),
    produtoNaoEncontrado && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PackagePlus, { className: "h-3 w-3 shrink-0" }),
      "Novo item — será cadastrado no catálogo ao criar a OS."
    ] })
  ] });
}
function OrdensPage() {
  const {
    data: usuario
  } = useCurrentUsuario();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("todos");
  const [toDelete, setToDelete] = reactExports.useState(null);
  const [toEdit, setToEdit] = reactExports.useState(null);
  const [editForm, setEditForm] = reactExports.useState({
    cliente_id: "",
    status: "",
    forma_pagamento: "",
    diagnostico: "",
    observacoes: ""
  });
  const [editSaving, setEditSaving] = reactExports.useState(false);
  function openEdit(o) {
    setEditForm({
      cliente_id: o.cliente_id ?? "",
      status: o.status,
      forma_pagamento: o.forma_pagamento ?? "",
      diagnostico: o.diagnostico ?? "",
      observacoes: o.observacoes ?? ""
    });
    setToEdit(o);
  }
  async function handleEditSave() {
    if (!toEdit) return;
    setEditSaving(true);
    const {
      error
    } = await supabase.from("ordens_servico").update({
      cliente_id: editForm.cliente_id || null,
      status: editForm.status,
      forma_pagamento: editForm.forma_pagamento || null,
      diagnostico: editForm.diagnostico || null,
      observacoes: editForm.observacoes || null
    }).eq("id", toEdit.id);
    setEditSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("OS atualizada");
      setToEdit(null);
      qc.invalidateQueries({
        queryKey: ["ordens"]
      });
    }
  }
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [creating, setCreating] = reactExports.useState(false);
  const [novaOS, setNovaOS] = reactExports.useState({
    cliente_id: "",
    diagnostico: "",
    observacoes: "",
    forma_pagamento: "",
    status: ""
  });
  const [itensRascunho, setItensRascunho] = reactExports.useState([]);
  const {
    data: statuses = []
  } = useQuery({
    queryKey: ["status_os"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("status_os").select("*").order("ordem");
      if (error) throw error;
      return data;
    }
  });
  const {
    data: clientes = []
  } = useQuery({
    queryKey: ["clientes-min"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("clientes").select("id,nome").order("nome");
      return data ?? [];
    }
  });
  const {
    data: formas = []
  } = useQuery({
    queryKey: ["formas_pagamento"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("formas_pagamento").select("*").eq("ativo", true).order("nome");
      return data ?? [];
    }
  });
  const {
    data: produtos = []
  } = useQuery({
    queryKey: ["produtos-min"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("produtos").select("id,nome,preco,unidade,tipo").eq("ativo", true).order("nome");
      return data ?? [];
    }
  });
  const {
    data: ordens = [],
    isLoading
  } = useQuery({
    queryKey: ["ordens"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("ordens_servico").select("*, cliente:clientes(nome)").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true
  });
  reactExports.useEffect(() => {
    const channel = supabase.channel("ordens-list-realtime").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "ordens_servico"
    }, () => {
      qc.invalidateQueries({
        queryKey: ["ordens"]
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
  const filtered = ordens.filter((o) => {
    if (statusFilter !== "todos" && o.status !== statusFilter) return false;
    const s = search.toLowerCase();
    if (!s) return true;
    return o.numero.toLowerCase().includes(s) || (o.cliente?.nome ?? "").toLowerCase().includes(s) || (o.diagnostico ?? "").toLowerCase().includes(s);
  });
  const statusColor = (nome) => statuses.find((s) => s.nome === nome)?.cor ?? "#6b7280";
  function openModal() {
    setNovaOS({
      cliente_id: "",
      diagnostico: "",
      observacoes: "",
      forma_pagamento: "",
      status: statuses[0]?.nome ?? ""
    });
    setItensRascunho([]);
    setModalOpen(true);
  }
  function adicionarItemRascunho(item) {
    setItensRascunho((prev) => [...prev, {
      ...item,
      id: crypto.randomUUID()
    }]);
  }
  function removerItemRascunho(id) {
    setItensRascunho((prev) => prev.filter((i) => i.id !== id));
  }
  async function handleCreate() {
    if (!usuario?.empresa_id) return;
    setCreating(true);
    try {
      const {
        data: numero,
        error: errNum
      } = await supabase.rpc("next_os_numero", {
        _empresa_id: usuario.empresa_id
      });
      if (errNum || !numero) throw new Error(errNum?.message ?? "Falha ao gerar número");
      const {
        data: osData,
        error: osErr
      } = await supabase.from("ordens_servico").insert({
        empresa_id: usuario.empresa_id,
        numero,
        status: novaOS.status || statuses[0]?.nome || "aberta",
        criado_por: usuario.id,
        cliente_id: novaOS.cliente_id || null,
        diagnostico: novaOS.diagnostico || null,
        observacoes: novaOS.observacoes || null,
        forma_pagamento: novaOS.forma_pagamento || null
      }).select("id").single();
      if (osErr || !osData) throw new Error(osErr?.message ?? "Erro ao criar OS");
      const novosNomes = itensRascunho.filter((i) => i.isNovoProduto).map((i) => i.descricao.toLowerCase());
      for (const item of itensRascunho) {
        if (item.isNovoProduto && novosNomes.includes(item.descricao.toLowerCase())) {
          const {
            error: pErr
          } = await supabase.from("produtos").insert({
            empresa_id: usuario.empresa_id,
            nome: item.descricao,
            preco: item.preco_unitario,
            unidade: "un",
            tipo: "servico",
            ativo: true
          });
          if (!pErr) {
            novosNomes.splice(novosNomes.indexOf(item.descricao.toLowerCase()), 1);
          }
        }
      }
      if (itensRascunho.length > 0) {
        const {
          error: itErr
        } = await supabase.from("itens_os").insert(itensRascunho.map((i) => ({
          os_id: osData.id,
          descricao: i.descricao,
          quantidade: i.quantidade,
          preco_unitario: i.preco_unitario
        })));
        if (itErr) console.warn("Aviso ao inserir itens:", itErr.message);
      }
      qc.invalidateQueries({
        queryKey: ["ordens"]
      });
      qc.invalidateQueries({
        queryKey: ["produtos-min"]
      });
      qc.invalidateQueries({
        queryKey: ["produtos"]
      });
      setModalOpen(false);
      navigate({
        to: "/ordens/$id",
        params: {
          id: osData.id
        }
      });
    } catch (err) {
      toast.error(err.message ?? "Erro ao criar OS");
    } finally {
      setCreating(false);
    }
  }
  async function handleDelete() {
    if (!toDelete) return;
    const {
      error
    } = await supabase.from("ordens_servico").delete().eq("id", toDelete.id);
    if (error) toast.error(error.message);
    else {
      toast.success("OS removida");
      qc.invalidateQueries({
        queryKey: ["ordens"]
      });
    }
    setToDelete(null);
  }
  const totalRascunho = itensRascunho.reduce((acc, i) => acc + i.quantidade * i.preco_unitario, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: "Ordens de Serviço", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Buscar por número, cliente ou diagnóstico…", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full sm:w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "todos", children: "Todos os status" }),
          statuses.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.nome, children: s.nome }, s.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openModal, disabled: !usuario?.empresa_id, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        "Nova OS"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-8 w-8 opacity-40" }),
      ordens.length === 0 ? "Nenhuma OS criada ainda. Clique em 'Nova OS' para começar." : "Nenhum resultado."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: filtered.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 hover:bg-accent/30 transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-sm font-semibold w-16 shrink-0", children: [
          "#",
          o.numero
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: o.cliente?.nome ?? "Sem cliente" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [
            new Date(o.created_at).toLocaleDateString("pt-BR"),
            " ·",
            " ",
            brl(Number(o.total))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium px-2 py-1 rounded-full text-white shrink-0", style: {
          backgroundColor: statusColor(o.status)
        }, children: o.status }),
        o.aprovacao === "aprovada" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: `Aprovada pelo cliente${o.aprovacao_em ? " em " + new Date(o.aprovacao_em).toLocaleString("pt-BR") : ""}`, className: "shrink-0 inline-flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5 text-emerald-500", "aria-label": "Aprovada pelo cliente" }) }),
        o.aprovacao === "rejeitada" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: `Recusada pelo cliente${o.aprovacao_obs ? ": " + o.aprovacao_obs : ""}`, className: "shrink-0 inline-flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-5 w-5 text-destructive", "aria-label": "Recusada pelo cliente" }) }),
        !o.aprovacao && o.link_publico_token && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: "Aguardando resposta do cliente", className: "shrink-0 inline-flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 text-muted-foreground", "aria-label": "Aguardando resposta do cliente" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/ordens/$id", params: {
        id: o.id
      }, className: "h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent shrink-0 transition-colors", title: "Abrir OS", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => openEdit(o), className: "text-muted-foreground hover:text-foreground shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setToDelete(o), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
    ] }, o.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: modalOpen, onOpenChange: (o) => !creating && setModalOpen(o), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Nova Ordem de Serviço" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cliente" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: novaOS.cliente_id || "_none", onValueChange: (v) => setNovaOS({
              ...novaOS,
              cliente_id: v === "_none" ? "" : v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecionar cliente" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_none", children: "— Sem cliente —" }),
                clientes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.nome }, c.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status inicial" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: novaOS.status || statuses[0]?.nome || "", onValueChange: (v) => setNovaOS({
              ...novaOS,
              status: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: statuses.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.nome, children: s.nome }, s.id)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Diagnóstico",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "(opcional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: novaOS.diagnostico, onChange: (e) => setNovaOS({
            ...novaOS,
            diagnostico: e.target.value
          }), rows: 2, maxLength: 2e3, placeholder: "Descreva o problema ou serviço solicitado…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Observações",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "(opcional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: novaOS.observacoes, onChange: (e) => setNovaOS({
            ...novaOS,
            observacoes: e.target.value
          }), rows: 2, maxLength: 2e3, placeholder: "Informações adicionais…" })
        ] }),
        formas.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Forma de pagamento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: novaOS.forma_pagamento || "_none", onValueChange: (v) => setNovaOS({
            ...novaOS,
            forma_pagamento: v === "_none" ? "" : v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecionar (opcional)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_none", children: "— Não definida —" }),
              formas.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f.nome, children: f.nome }, f.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border-t border-border pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Itens" }),
            itensRascunho.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "Total: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: brl(totalRascunho) })
            ] })
          ] }),
          itensRascunho.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 mb-1", children: itensRascunho.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm border-b border-border/50 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-medium", children: item.descricao }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
                item.quantidade,
                " × ",
                brl(item.preco_unitario),
                item.isNovoProduto && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary flex items-center gap-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PackagePlus, { className: "h-3 w-3" }),
                  " novo"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium tabular-nums shrink-0", children: brl(item.quantidade * item.preco_unitario) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => removerItemRascunho(item.id), className: "text-muted-foreground hover:text-destructive transition p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }) })
          ] }, item.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ItemInput, { produtos, onAdd: adicionarItemRascunho })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setModalOpen(false), disabled: creating, children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleCreate, disabled: creating || !usuario?.empresa_id, children: [
          creating ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-1 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Criar OS"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!toEdit, onOpenChange: (o) => !editSaving && !o && setToEdit(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Editar OS #",
        toEdit?.numero
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cliente" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editForm.cliente_id || "_none", onValueChange: (v) => setEditForm({
              ...editForm,
              cliente_id: v === "_none" ? "" : v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecionar cliente" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_none", children: "— Sem cliente —" }),
                clientes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.nome }, c.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editForm.status, onValueChange: (v) => setEditForm({
              ...editForm,
              status: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: statuses.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.nome, children: s.nome }, s.id)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Diagnóstico",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "(opcional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: editForm.diagnostico, onChange: (e) => setEditForm({
            ...editForm,
            diagnostico: e.target.value
          }), rows: 3, maxLength: 2e3, placeholder: "Descreva o problema ou serviço solicitado…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Observações",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "(opcional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: editForm.observacoes, onChange: (e) => setEditForm({
            ...editForm,
            observacoes: e.target.value
          }), rows: 2, maxLength: 2e3, placeholder: "Informações adicionais…" })
        ] }),
        formas.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Forma de pagamento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editForm.forma_pagamento || "_none", onValueChange: (v) => setEditForm({
            ...editForm,
            forma_pagamento: v === "_none" ? "" : v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecionar" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_none", children: "— Não definida —" }),
              formas.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f.nome, children: f.nome }, f.id))
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setToEdit(null), disabled: editSaving, children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleEditSave, disabled: editSaving, children: [
          editSaving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-1 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-1" }),
          "Salvar"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!toDelete, onOpenChange: (o) => !o && setToDelete(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
          "Remover OS #",
          toDelete?.numero,
          "?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Esta ação não pode ser desfeita. Os itens e o histórico também serão removidos." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDelete, children: "Remover" })
      ] })
    ] }) })
  ] });
}
export {
  OrdensPage as component
};
