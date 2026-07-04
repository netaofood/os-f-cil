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
  const [pagamentoForm, setPagamentoForm] = useState({ status_pagamento: "ativa", vencimento_plano: "", observacoes_pagamento: "" });
  const [savingPagamento, setSavingPagamento] = useState(false);

  // Modal Reset Senha
  const [resetModal, setResetModal] = useState(false);
  const [resetAdmin, setResetAdmin] = useState<Usuario | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [savingReset, setSavingReset] = useState(false);
  const [resetCriado, setResetCriado] = useState(false);

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

      // Aguarda trigger criar registro em usuarios
      await new Promise(r => setTimeout(r, 800));

      const { error: updErr } = await supabase.from("usuarios").update({
        empresa_id: adminEmpresa.id,
        perfil: "admin",
        celular: adminForm.celular,
        nome: adminForm.nome.trim(),
      }).eq("auth_user_id", authData.user.id);
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

  function openResetModal(u: Usuario) {
    setResetAdmin(u);
    setNovaSenha(gerarSenha());
    setResetCriado(false);
    setResetModal(true);
  }

  async function handleResetSenha() {
    if (!resetAdmin) return;
    setSavingReset(true);
    // Envia email de reset (Supabase não permite alterar senha diretamente pelo cliente)
    const { error } = await supabase.auth.resetPasswordForEmail(resetAdmin.email ?? "");
    setSavingReset(false);
    if (error) toast.error(error.message);
    else {
      setResetCriado(true);
      toast.success("Email de reset enviado");
    }
  }

  async function handleSavePagamento() {
    if (!pagamentoEmpresa) return;
    setSavingPagamento(true);
    const { error } = await supabase.from("empresas").update({
      status_pagamento: pagamentoForm.status_pagamento,
      vencimento_plano: pagamentoForm.vencimento_plano || null,
      observacoes_pagamento: pagamentoForm.observacoes_pagamento || null,
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

  return (
    <AdminShell title="Painel Admin">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border pb-3">
        {[
          { key: "empresas", label: "Empresas", icon: Building2 },
          { key: "pagamentos", label: "Pagamentos", icon: CreditCard },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab === key
                ? "bg-primary text-primary-foreground dark:shadow-[0_0_10px_#00B4FF66]"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
        <Button size="sm" className="ml-auto dark:shadow-[0_0_10px_#00B4FF44]" onClick={openNovaEmpresa}>
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
                        <span className={`text-[10px] text-white px-2 py-0.5 rounded-full ${statusColor[e.status_pagamento ?? "ativa"]}`}>
                          {statusLabel[e.status_pagamento ?? "ativa"]}
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
                          <Button size="sm" variant="outline" onClick={() => { setPagamentoEmpresa(e); setPagamentoForm({ status_pagamento: e.status_pagamento ?? "ativa", vencimento_plano: e.vencimento_plano?.slice(0,10) ?? "", observacoes_pagamento: e.observacoes_pagamento ?? "" }); setPagamentoModal(true); }}>
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
                                <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{a.nome}</p>
                                    <p className="text-xs text-muted-foreground">{a.celular}</p>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Reset senha" onClick={() => openResetModal(a)}>
                                      <KeyRound className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      size="icon" variant="ghost"
                                      className={`h-8 w-8 ${a.ativo ? "text-green-500" : "text-muted-foreground"}`}
                                      title={a.ativo ? "Desativar" : "Ativar"}
                                      onClick={() => toggleAtivo(a)}
                                    >
                                      {a.ativo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                    </Button>
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
                setPagamentoForm({ status_pagamento: e.status_pagamento ?? "ativa", vencimento_plano: e.vencimento_plano?.slice(0,10) ?? "", observacoes_pagamento: e.observacoes_pagamento ?? "" });
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
            <DialogTitle style={{ fontFamily: "Orbitron, sans-serif" }}>Reset de senha</DialogTitle>
          </DialogHeader>
          {!resetCriado ? (
            <>
              <p className="text-sm text-muted-foreground">
                Será enviado um email de redefinição de senha para <strong>{resetAdmin?.email}</strong>.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResetModal(false)} disabled={savingReset}>Cancelar</Button>
                <Button onClick={handleResetSenha} disabled={savingReset}>
                  {savingReset ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <KeyRound className="h-4 w-4 mr-1" />}
                  Enviar reset
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-green-600 font-medium">Email de reset enviado com sucesso!</p>
              <Button variant="ghost" className="w-full" onClick={() => setResetModal(false)}>Fechar</Button>
            </div>
          )}
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
            <div className="space-y-1.5">
              <Label>Vencimento do plano</Label>
              <Input type="date" value={pagamentoForm.vencimento_plano} onChange={(e) => setPagamentoForm({ ...pagamentoForm, vencimento_plano: e.target.value })} />
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

      {/* Confirmar exclusão */}
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
    </AdminShell>
  );
}
