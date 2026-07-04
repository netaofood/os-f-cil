import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2, Plus, Pencil, Trash2, Loader2,
  Save, X, MessageCircle, Copy, Check,
  RefreshCw, CreditCard, ChevronDown, ChevronRight,
  ToggleLeft, ToggleRight, KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

type Empresa = {
  id: string; nome: string; cnpj: string | null; cidade: string | null;
  estado: string | null; email: string | null; telefone: string | null;
  cor_destaque: string; created_at: string; status_pagamento: string;
  vencimento_plano: string | null; observacoes_pagamento: string | null;
  total_usuarios: number; total_os: number;
};
type Usuario = Tables<"usuarios"> & { empresa_nome?: string };

const statusColor: Record<string, string> = {
  ativa: "bg-green-500",
  inadimplente: "bg-yellow-500",
  cancelada: "bg-red-500",
};
const statusLabel: Record<string, string> = {
  ativa: "Ativa", inadimplente: "Inadimplente", cancelada: "Cancelada",
};

function gerarSenha() {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function AdminPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"empresas" | "pagamentos">("empresas");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: empresas = [], isLoading } = useQuery({
    queryKey: ["admin-empresas"],
    queryFn: async (): Promise<Empresa[]> => {
      const { data, error } = await supabase.rpc("super_admin_empresas_resumo");
      if (error) throw error;
      return (data ?? []) as Empresa[];
    },
  });

  const { data: admins = [] } = useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: async (): Promise<Usuario[]> => {
      const { data } = await supabase.from("usuarios").select("*").eq("perfil", "admin");
      return (data ?? []) as Usuario[];
    },
  });

  // Modal Empresa
  const [empresaModal, setEmpresaModal] = useState(false);
  const [editEmpresa, setEditEmpresa] = useState<Empresa | null>(null);
  const [savingEmpresa, setSavingEmpresa] = useState(false);
  const [deleteEmpresa, setDeleteEmpresa] = useState<Empresa | null>(null);
  const [empresaForm, setEmpresaForm] = useState({ nome: "", cnpj: "", telefone: "", email: "", cidade: "", estado: "" });

  // Modal Admin
  const [adminModal, setAdminModal] = useState(false);
  const [adminEmpresa, setAdminEmpresa] = useState<Empresa | null>(null);
  const [adminForm, setAdminForm] = useState({ nome: "", celular: "", senha: "" });
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminCriado, setAdminCriado] = useState<{ celular: string; senha: string; empresa: string } | null>(null);

  // Modal Pagamento
  const [pagamentoModal, setPagamentoModal] = useState(false);
  const [pagamentoEmpresa, setPagamentoEmpresa] = useState<Empresa | null>(null);
  const [pagamentoForm, setPagamentoForm] = useState({ status_pagamento: "ativa", vencimento_plano: "", observacoes_pagamento: "", valor_plano: "", dia_faturamento: "" });
  const [savingPagamento, setSavingPagamento] = useState(false);

  // Modal Reset Senha
  const [resetModal, setResetModal] = useState(false);
  const [resetAdmin, setResetAdmin] = useState<Usuario | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [savingReset, setSavingReset] = useState(false);
  const [resetCriado, setResetCriado] = useState(false);

  // Modal Editar Admin
  const [editAdminModal, setEditAdminModal] = useState(false);
  const [editAdminData, setEditAdminData] = useState<Usuario | null>(null);
  const [editAdminForm, setEditAdminForm] = useState({ nome: "", celular: "" });
  const [savingEditAdmin, setSavingEditAdmin] = useState(false);

  // Convite para copiar/whatsapp
  const [conviteAdmin, setConviteAdmin] = useState<{ nome: string; celular: string; senha: string; empresa: string } | null>(null);
  const [conviteModal, setConviteModal] = useState(false);

  // Confirmar exclusão de admin
  const [deleteAdmin, setDeleteAdmin] = useState<Usuario | null>(null);

  function openNovaEmpresa() {
    setEditEmpresa(null);
    setEmpresaForm({ nome: "", cnpj: "", telefone: "", email: "", cidade: "", estado: "" });
    setEmpresaModal(true);
  }

  function openEditEmpresa(e: Empresa) {
    setEditEmpresa(e);
    setEmpresaForm({ nome: e.nome, cnpj: e.cnpj ?? "", telefone: e.telefone ?? "", email: e.email ?? "", cidade: e.cidade ?? "", estado: e.estado ?? "" });
    setEmpresaModal(true);
  }

  async function handleSaveEmpresa() {
    if (!empresaForm.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    setSavingEmpresa(true);
    try {
      if (editEmpresa) {
        const { error } = await supabase.from("empresas").update({
          nome: empresaForm.nome.trim(), cnpj: empresaForm.cnpj || null,
          telefone: empresaForm.telefone || null, email: empresaForm.email || null,
          cidade: empresaForm.cidade || null, estado: empresaForm.estado || null,
        }).eq("id", editEmpresa.id);
        if (error) throw error;
        toast.success("Empresa atualizada");
      } else {
        const { error } = await supabase.from("empresas").insert({
          nome: empresaForm.nome.trim(), cnpj: empresaForm.cnpj || null,
          telefone: empresaForm.telefone || null, email: empresaForm.email || null,
          cidade: empresaForm.cidade || null, estado: empresaForm.estado || null,
        });
        if (error) throw error;
        toast.success("Empresa criada");
      }
      setEmpresaModal(false);
      qc.invalidateQueries({ queryKey: ["admin-empresas"] });
    } catch (err: any) { toast.error(err.message); }
    finally { setSavingEmpresa(false); }
  }

  async function handleDeleteEmpresa() {
    if (!deleteEmpresa) return;
    const { error } = await supabase.from("empresas").delete().eq("id", deleteEmpresa.id);
    if (error) toast.error(error.message);
    else { toast.success("Empresa removida"); qc.invalidateQueries({ queryKey: ["admin-empresas"] }); }
    setDeleteEmpresa(null);
  }

  function openAdminModal(e: Empresa) {
    setAdminEmpresa(e);
    setAdminCriado(null);
    setAdminForm({ nome: "", celular: "", senha: gerarSenha() });
    setAdminModal(true);
  }

  async function handleSaveAdmin() {
    if (!adminEmpresa) return;
    if (!adminForm.nome.trim() || !adminForm.celular.trim()) {
      toast.error("Nome e celular são obrigatórios"); return;
    }
    setSavingAdmin(true);
    try {
      // Email fake baseado no celular — só dígitos
      const digits = adminForm.celular.replace(/\D/g, "");
      const emailFake = `u${digits}@osfacil.app`;

      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: emailFake,
        password: adminForm.senha,
        options: { data: { nome: adminForm.nome.trim(), celular: adminForm.celular } },
      });
      if (authErr) throw authErr;
      if (!authData.user) throw new Error("Usuário não criado");

      // Aguarda trigger criar registro em usuarios (aumentado para 2s)
      await new Promise(r => setTimeout(r, 2000));

      // Tenta vincular à empresa com retry
      let updErr = null;
      for (let i = 0; i < 3; i++) {
        const { error } = await supabase.from("usuarios").update({
          empresa_id: adminEmpresa.id,
          perfil: "admin",
          celular: adminForm.celular,
          nome: adminForm.nome.trim(),
        }).eq("auth_user_id", authData.user.id);
        updErr = error;
        if (!error) break;
        await new Promise(r => setTimeout(r, 1000));
      }
      if (updErr) throw updErr;

      // Confirma email fake automaticamente via SQL
      await supabase.rpc("confirmar_usuario_por_email" as any, { p_email: emailFake });

      setAdminCriado({ celular: adminForm.celular, senha: adminForm.senha, empresa: adminEmpresa.nome });
      qc.invalidateQueries({ queryKey: ["admin-empresas"] });
      qc.invalidateQueries({ queryKey: ["admin-usuarios"] });
    } catch (err: any) { toast.error(err.message); }
    finally { setSavingAdmin(false); }
  }

  function copiarAcesso(dados: { celular: string; senha: string; empresa: string }) {
    const texto = `*OS Fácil — Dados de Acesso*\n\nEmpresa: ${dados.empresa}\nCelular: ${dados.celular}\nSenha: ${dados.senha}\n\nAcesse: https://os-facil-sepia.vercel.app`;
    navigator.clipboard.writeText(texto);
    setCopied(true);
    toast.success("Dados copiados!");
    setTimeout(() => setCopied(false), 2000);
  }

  function enviarWhatsApp(dados: { celular: string; senha: string; empresa: string }) {
    const texto = encodeURIComponent(`*OS Fácil — Dados de Acesso*\n\nEmpresa: ${dados.empresa}\nCelular: ${dados.celular}\nSenha: ${dados.senha}\n\nAcesse: https://os-facil-sepia.vercel.app`);
    const numero = dados.celular.replace(/\D/g, "");
    window.open(`https://wa.me/55${numero}?text=${texto}`, "_blank");
  }

  async function toggleAtivo(u: Usuario) {
    const { error } = await supabase.from("usuarios").update({ ativo: !u.ativo }).eq("id", u.id);
    if (error) toast.error(error.message);
    else {
      toast.success(u.ativo ? "Usuário desativado" : "Usuário ativado");
      await qc.invalidateQueries({ queryKey: ["admin-usuarios"] });
      await qc.refetchQueries({ queryKey: ["admin-usuarios"] });
    }
  }

  function openResetModal(u: Usuario, empresaNome: string) {
    const nova = gerarSenha();
    setNovaSenha(nova);
    setResetAdmin(u);
    setConviteAdmin({
      nome: u.nome,
      celular: u.celular ?? "",
      senha: nova,
      empresa: empresaNome,
    });
    setResetModal(true);
  }

  async function handleResetSenha() {
    if (!resetAdmin) return;
    setSavingReset(true);
    const digits = (resetAdmin.celular ?? "").replace(/\D/g, "");
    const emailFake = `u${digits}@osfacil.app`;

    // Atualiza a senha via Supabase Admin API (server function)
    const { error } = await supabase.rpc("resetar_senha_usuario" as any, {
      p_email: emailFake,
      p_nova_senha: novaSenha,
    });

    setSavingReset(false);
    if (error) {
      toast.error("Erro ao resetar senha");
      return;
    }
    setResetModal(false);
    // Abre modal de convite com a nova senha (empresa já está em conviteAdmin)
    setConviteModal(true);
  }

  function openEditAdmin(u: Usuario) {
    setEditAdminData(u);
    setEditAdminForm({ nome: u.nome, celular: u.celular ?? "" });
    setEditAdminModal(true);
  }

  async function handleSaveEditAdmin() {
    if (!editAdminData) return;
    setSavingEditAdmin(true);
    const { error } = await supabase.from("usuarios").update({
      nome: editAdminForm.nome.trim(),
      celular: editAdminForm.celular,
    }).eq("id", editAdminData.id);
    setSavingEditAdmin(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Admin atualizado");
      setEditAdminModal(false);
      qc.invalidateQueries({ queryKey: ["admin-usuarios"] });
    }
  }

  async function handleDeleteAdmin() {
    if (!deleteAdmin) return;
    const { error } = await supabase.from("usuarios").delete().eq("id", deleteAdmin.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Admin removido");
      qc.invalidateQueries({ queryKey: ["admin-usuarios"] });
    }
    setDeleteAdmin(null);
  }

  function abrirConvite(u: Usuario, empresaNome: string) {
    setConviteAdmin({ nome: u.nome, celular: u.celular ?? "", senha: "••••••••", empresa: empresaNome });
    setConviteModal(true);
  }

  function copiarConviteAdmin() {
    if (!conviteAdmin) return;
    const texto = `*OS Fácil — Dados de Acesso*\n\nEmpresa: ${conviteAdmin.empresa}\nCelular: ${conviteAdmin.celular}\nSenha: ${conviteAdmin.senha}\n\nAcesse: https://os-facil-sepia.vercel.app`;
    navigator.clipboard.writeText(texto);
    setCopied(true);
    toast.success("Dados copiados!");
    setTimeout(() => setCopied(false), 2000);
  }

  function whatsappConviteAdmin() {
    if (!conviteAdmin) return;
    const texto = encodeURIComponent(`*OS Fácil — Dados de Acesso*\n\nEmpresa: ${conviteAdmin.empresa}\nCelular: ${conviteAdmin.celular}\nSenha: ${conviteAdmin.senha}\n\nAcesse: https://os-facil-sepia.vercel.app`);
    const numero = conviteAdmin.celular.replace(/\D/g, "");
    window.open(`https://wa.me/55${numero}?text=${texto}`, "_blank");
  }

  async function handleSavePagamento() {
    if (!pagamentoEmpresa) return;
    setSavingPagamento(true);
    const { error } = await supabase.from("empresas").update({
      status_pagamento: pagamentoForm.status_pagamento,
      vencimento_plano: pagamentoForm.vencimento_plano || null,
      observacoes_pagamento: pagamentoForm.observacoes_pagamento || null,
      valor_plano: pagamentoForm.valor_plano ? Number(pagamentoForm.valor_plano) : null,
      dia_faturamento: pagamentoForm.dia_faturamento ? Number(pagamentoForm.dia_faturamento) : null,
    } as any).eq("id", pagamentoEmpresa.id);
    setSavingPagamento(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Pagamento atualizado");
      setPagamentoModal(false);
      qc.invalidateQueries({ queryKey: ["admin-empresas"] });
    }
  }

  const adminsDaEmpresa = (empresaId: string) => admins.filter(a => a.empresa_id === empresaId);

  function situacaoEmpresa(e: Empresa) {
    if (e.status_pagamento === "cancelada") return { label: "Cancelada", color: "bg-gray-500" };
    if (e.status_pagamento === "inadimplente") return { label: "Inadimplente", color: "bg-red-500" };
    const dia = (e as any).dia_faturamento;
    if (dia) {
      const hoje = new Date().getDate();
      if (hoje > dia) return { label: "Verificar pagamento", color: "bg-yellow-500" };
    }
    return { label: "Em dia", color: "bg-green-500" };
  }

  const brl = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

  return (
    <AdminShell title="Painel Admin">
      {/* Botão Nova empresa no topo */}
      <div className="flex justify-end mb-4">
        <Button size="sm" className="dark:shadow-[0_0_10px_#00B4FF44]" onClick={openNovaEmpresa}>
          <Plus className="h-4 w-4 mr-1" /> Nova empresa
        </Button>
      </div>

      {/* ABA EMPRESAS */}
      {tab === "empresas" && (
        <>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : empresas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
              <Building2 className="h-10 w-10 opacity-30" />
              <p>Nenhuma empresa cadastrada.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {empresas.map((e) => {
                const expanded = expandedId === e.id;
                const adminsEmpresa = adminsDaEmpresa(e.id);
                return (
                  <div key={e.id} className="border border-border rounded-lg overflow-hidden bg-card">
                    {/* Header do accordion */}
                    <button
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors text-left"
                      onClick={() => setExpandedId(expanded ? null : e.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ChevronRight className={`h-4 w-4 text-primary shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{e.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {[e.cidade, e.estado].filter(Boolean).join("/")} · {e.total_os} OSs · {e.total_usuarios} usuários
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {(e as any).valor_plano > 0 && (
                          <span className="text-xs font-mono text-muted-foreground hidden sm:block">
                            {brl(Number((e as any).valor_plano))}
                          </span>
                        )}
                        {(e as any).dia_faturamento && (
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            dia {(e as any).dia_faturamento}
                          </span>
                        )}
                        <span className={`text-[10px] text-white px-2 py-0.5 rounded-full ${situacaoEmpresa(e).color}`}>
                          {situacaoEmpresa(e).label}
                        </span>
                      </div>
                    </button>

                    {/* Conteúdo expandido */}
                    {expanded && (
                      <div className="border-t border-border p-4 space-y-4 bg-background/50">
                        {/* Ações da empresa */}
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditEmpresa(e)}>
                            <Pencil className="h-3.5 w-3.5 mr-1" /> Editar empresa
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setPagamentoEmpresa(e); setPagamentoForm({ status_pagamento: e.status_pagamento ?? "ativa", vencimento_plano: e.vencimento_plano?.slice(0,10) ?? "", observacoes_pagamento: e.observacoes_pagamento ?? "", valor_plano: String((e as any).valor_plano ?? ""), dia_faturamento: String((e as any).dia_faturamento ?? "") }); setPagamentoModal(true); }}>
                            <CreditCard className="h-3.5 w-3.5 mr-1" /> Pagamento
                          </Button>
                          <Button size="sm" variant="outline" className="text-primary border-primary/50" onClick={() => openAdminModal(e)}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> Criar admin
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive border-destructive/50 ml-auto" onClick={() => setDeleteEmpresa(e)}>
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                          </Button>
                        </div>

                        {/* Lista de admins */}
                        {adminsEmpresa.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Administradores</p>
                            <div className="space-y-2">
                              {adminsEmpresa.map((a) => (
                                <div key={a.id} className="p-3 rounded-lg border border-border bg-card space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="font-medium text-sm truncate">{a.nome}</p>
                                      <p className="text-xs text-muted-foreground font-mono">{a.celular}</p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full text-white shrink-0 ${a.ativo ? "bg-green-500" : "bg-red-500"}`}>
                                      {a.ativo ? "Ativo" : "Inativo"}
                                    </span>
                                  </div>
                                  {/* Action buttons — ícones com tooltip */}
                                  <div className="flex gap-1 shrink-0">
                                    <button
                                      title="Editar"
                                      onClick={() => openEditAdmin(a)}
                                      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                      title="Resetar senha"
                                      onClick={() => openResetModal(a, e.nome)}
                                      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                      <KeyRound className="h-4 w-4" />
                                    </button>
                                    <button
                                      title="Enviar convite"
                                      onClick={() => abrirConvite(a, e.nome)}
                                      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-green-600 hover:bg-muted transition-colors"
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                    </button>
                                    <button
                                      title="Copiar convite"
                                      onClick={() => { abrirConvite(a, e.nome); setTimeout(copiarConviteAdmin, 100); }}
                                      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </button>
                                    <button
                                      title="Excluir"
                                      onClick={() => setDeleteAdmin(a)}
                                      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ABA PAGAMENTOS */}
      {tab === "pagamentos" && (
        <div className="space-y-2">
          {empresas.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-3 p-4 rounded-lg border border-border bg-card">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm">{e.nome}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-[10px] text-white px-2 py-0.5 rounded-full ${statusColor[e.status_pagamento ?? "ativa"]}`}>
                    {statusLabel[e.status_pagamento ?? "ativa"]}
                  </span>
                  {e.vencimento_plano && (
                    <span className="text-xs text-muted-foreground">
                      Vence: {new Date(e.vencimento_plano).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => {
                setPagamentoEmpresa(e);
                setPagamentoForm({ status_pagamento: e.status_pagamento ?? "ativa", vencimento_plano: e.vencimento_plano?.slice(0,10) ?? "", observacoes_pagamento: e.observacoes_pagamento ?? "", valor_plano: String((e as any).valor_plano ?? ""), dia_faturamento: String((e as any).dia_faturamento ?? "") });
                setPagamentoModal(true);
              }}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Empresa */}
      <Dialog open={empresaModal} onOpenChange={(o) => !savingEmpresa && setEmpresaModal(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Orbitron, sans-serif" }}>
              {editEmpresa ? "Editar empresa" : "Nova empresa"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={empresaForm.nome} onChange={(e) => setEmpresaForm({ ...empresaForm, nome: e.target.value })} placeholder="Nome da empresa" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>CNPJ</Label>
                <Input value={empresaForm.cnpj} onChange={(e) => setEmpresaForm({ ...empresaForm, cnpj: e.target.value })} placeholder="00.000.000/0001-00" />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input value={empresaForm.telefone} onChange={(e) => setEmpresaForm({ ...empresaForm, telefone: e.target.value })} placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={empresaForm.email} onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cidade</Label>
                <Input value={empresaForm.cidade} onChange={(e) => setEmpresaForm({ ...empresaForm, cidade: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>UF</Label>
                <Input value={empresaForm.estado} onChange={(e) => setEmpresaForm({ ...empresaForm, estado: e.target.value.toUpperCase() })} maxLength={2} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmpresaModal(false)} disabled={savingEmpresa}>
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
            <Button onClick={handleSaveEmpresa} disabled={savingEmpresa}>
              {savingEmpresa ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Admin */}
      <Dialog open={adminModal} onOpenChange={(o) => !savingAdmin && setAdminModal(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Orbitron, sans-serif" }}>
              Admin — {adminEmpresa?.nome}
            </DialogTitle>
          </DialogHeader>
          {!adminCriado ? (
            <>
              <div className="space-y-3 py-1">
                <div className="space-y-1.5">
                  <Label>Nome *</Label>
                  <Input value={adminForm.nome} onChange={(e) => setAdminForm({ ...adminForm, nome: e.target.value })} placeholder="Nome completo" />
                </div>
                <div className="space-y-1.5">
                  <Label>Celular *</Label>
                  <Input value={adminForm.celular} onChange={(e) => setAdminForm({ ...adminForm, celular: e.target.value })} placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-1.5">
                  <Label>Senha provisória</Label>
                  <div className="flex gap-2">
                    <Input value={adminForm.senha} onChange={(e) => setAdminForm({ ...adminForm, senha: e.target.value })} />
                    <Button type="button" variant="outline" size="icon" onClick={() => setAdminForm({ ...adminForm, senha: gerarSenha() })}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAdminModal(false)} disabled={savingAdmin}>Cancelar</Button>
                <Button onClick={handleSaveAdmin} disabled={savingAdmin}>
                  {savingAdmin ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                  Criar admin
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted p-4 text-sm space-y-1 font-mono">
                <p><strong>Empresa:</strong> {adminCriado.empresa}</p>
                <p><strong>Celular:</strong> {adminCriado.celular}</p>
                <p><strong>Senha:</strong> {adminCriado.senha}</p>
                <p className="text-xs text-muted-foreground mt-2">https://os-facil-sepia.vercel.app</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => enviarWhatsApp(adminCriado)}>
                  <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => copiarAcesso(adminCriado)}>
                  {copied ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                  Copiar
                </Button>
              </div>
              <Button variant="ghost" className="w-full" onClick={() => setAdminModal(false)}>Fechar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Reset Senha */}
      <Dialog open={resetModal} onOpenChange={(o) => !savingReset && setResetModal(o)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Orbitron, sans-serif" }}>Nova senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Uma nova senha foi gerada para <strong>{resetAdmin?.nome}</strong>. Confirme para aplicar e enviar ao usuário.
            </p>
            <div className="rounded-lg bg-muted p-4 font-mono text-center">
              <p className="text-xs text-muted-foreground mb-1">Nova senha</p>
              <p className="text-xl font-bold tracking-widest text-primary">{novaSenha}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetModal(false)} disabled={savingReset}>Cancelar</Button>
            <Button onClick={handleResetSenha} disabled={savingReset}>
              {savingReset ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <KeyRound className="h-4 w-4 mr-1" />}
              Aplicar e enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Pagamento */}
      <Dialog open={pagamentoModal} onOpenChange={(o) => !savingPagamento && setPagamentoModal(o)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Orbitron, sans-serif" }}>
              Pagamento — {pagamentoEmpresa?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={pagamentoForm.status_pagamento} onValueChange={(v) => setPagamentoForm({ ...pagamentoForm, status_pagamento: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="inadimplente">Inadimplente</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valor do plano (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={pagamentoForm.valor_plano}
                  onChange={(e) => setPagamentoForm({ ...pagamentoForm, valor_plano: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Dia de faturamento</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 10"
                  value={pagamentoForm.dia_faturamento}
                  onChange={(e) => setPagamentoForm({ ...pagamentoForm, dia_faturamento: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea value={pagamentoForm.observacoes_pagamento} onChange={(e) => setPagamentoForm({ ...pagamentoForm, observacoes_pagamento: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPagamentoModal(false)} disabled={savingPagamento}>Cancelar</Button>
            <Button onClick={handleSavePagamento} disabled={savingPagamento}>
              {savingPagamento ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Admin */}
      <Dialog open={editAdminModal} onOpenChange={(o) => !savingEditAdmin && setEditAdminModal(o)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Orbitron, sans-serif" }}>Editar admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={editAdminForm.nome} onChange={(e) => setEditAdminForm({ ...editAdminForm, nome: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Celular</Label>
              <Input value={editAdminForm.celular} onChange={(e) => setEditAdminForm({ ...editAdminForm, celular: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAdminModal(false)} disabled={savingEditAdmin}>Cancelar</Button>
            <Button onClick={handleSaveEditAdmin} disabled={savingEditAdmin}>
              {savingEditAdmin ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Convite */}
      <Dialog open={conviteModal} onOpenChange={setConviteModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Orbitron, sans-serif" }}>Enviar convite</DialogTitle>
          </DialogHeader>
          {conviteAdmin && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted p-4 text-sm space-y-1 font-mono">
                <p><strong>Empresa:</strong> {conviteAdmin.empresa}</p>
                <p><strong>Celular:</strong> {conviteAdmin.celular}</p>
                {conviteAdmin.senha && conviteAdmin.senha !== "••••••••" && (
                  <p><strong>Senha:</strong> {conviteAdmin.senha}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">https://os-facil-sepia.vercel.app</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={whatsappConviteAdmin}>
                  <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                </Button>
                <Button variant="outline" className="flex-1" onClick={copiarConviteAdmin}>
                  {copied ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                  Copiar
                </Button>
              </div>
              <Button variant="ghost" className="w-full" onClick={() => setConviteModal(false)}>Fechar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmar exclusão admin */}
      <AlertDialog open={!!deleteAdmin} onOpenChange={(o) => !o && setDeleteAdmin(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover admin "{deleteAdmin?.nome}"?</AlertDialogTitle>
            <AlertDialogDescription>
              O admin perderá acesso ao sistema. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAdmin} className="bg-destructive hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmar exclusão empresa */}
      <AlertDialog open={!!deleteEmpresa} onOpenChange={(o) => !o && setDeleteEmpresa(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover "{deleteEmpresa?.nome}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os dados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEmpresa} className="bg-destructive hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Bottom Navigation fixo */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border h-16">
        <div className="flex h-full max-w-6xl mx-auto">
          {[
            { key: "empresas", label: "Empresas", icon: Building2 },
            { key: "pagamentos", label: "Pagamentos", icon: CreditCard },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-medium transition-colors
                ${tab === key
                  ? "text-primary dark:drop-shadow-[0_0_6px_#00B4FF]"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Icon className={`h-5 w-5 ${tab === key ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </AdminShell>
  );
}
