import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2, Users, Plus, Pencil, Trash2, Loader2,
  ShieldAlert, Save, X, ToggleLeft, ToggleRight,
  MessageCircle, Copy, Check, RefreshCw, CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUsuario } from "@/hooks/use-current-user";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

type Empresa = Tables<"empresas"> & {
  status_pagamento?: string;
  vencimento_plano?: string | null;
  observacoes_pagamento?: string | null;
  total_usuarios?: number;
  total_os?: number;
};
type Usuario = Tables<"usuarios"> & { empresa_nome?: string };

const statusPagamentoColor: Record<string, string> = {
  ativa: "bg-green-500",
  inadimplente: "bg-yellow-500",
  cancelada: "bg-red-500",
};

const statusPagamentoLabel: Record<string, string> = {
  ativa: "Ativa",
  inadimplente: "Inadimplente",
  cancelada: "Cancelada",
};

function gerarSenha() {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function AdminPage() {
  const { data: usuario } = useCurrentUsuario();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"empresas" | "pagamentos">("empresas");
  const [copied, setCopied] = useState(false);

  if (usuario && usuario.perfil !== "super_admin") {
    return (
      <AppShell title="Admin">
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <ShieldAlert className="h-10 w-10" />
          <p>Acesso restrito a super administradores.</p>
        </div>
      </AppShell>
    );
  }

  // ── EMPRESAS ──
  const { data: empresas = [], isLoading: loadingEmpresas } = useQuery({
    queryKey: ["admin-empresas"],
    enabled: usuario?.perfil === "super_admin",
    queryFn: async (): Promise<Empresa[]> => {
      const { data, error } = await supabase.rpc("super_admin_empresas_resumo");
      if (error) throw error;
      return (data ?? []) as Empresa[];
    },
  });

  // Modal empresa
  const [empresaModal, setEmpresaModal] = useState(false);
  const [editEmpresa, setEditEmpresa] = useState<Empresa | null>(null);
  const [savingEmpresa, setSavingEmpresa] = useState(false);
  const [deleteEmpresa, setDeleteEmpresa] = useState<Empresa | null>(null);
  const [empresaForm, setEmpresaForm] = useState({
    nome: "", cnpj: "", telefone: "", email: "", cidade: "", estado: "",
  });

  // Modal admin da empresa
  const [adminModal, setAdminModal] = useState(false);
  const [adminEmpresa, setAdminEmpresa] = useState<Empresa | null>(null);
  const [adminForm, setAdminForm] = useState({ nome: "", celular: "", email: "", senha: "" });
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminCriado, setAdminCriado] = useState<{ celular: string; senha: string; empresa: string } | null>(null);

  // Modal pagamento
  const [pagamentoModal, setPagamentoModal] = useState(false);
  const [pagamentoEmpresa, setPagamentoEmpresa] = useState<Empresa | null>(null);
  const [pagamentoForm, setPagamentoForm] = useState({
    status_pagamento: "ativa", vencimento_plano: "", observacoes_pagamento: "",
  });
  const [savingPagamento, setSavingPagamento] = useState(false);

  function openNovaEmpresa() {
    setEditEmpresa(null);
    setEmpresaForm({ nome: "", cnpj: "", telefone: "", email: "", cidade: "", estado: "" });
    setEmpresaModal(true);
  }

  function openEditEmpresa(e: Empresa) {
    setEditEmpresa(e);
    setEmpresaForm({
      nome: e.nome, cnpj: e.cnpj ?? "", telefone: e.telefone ?? "",
      email: e.email ?? "", cidade: e.cidade ?? "", estado: e.estado ?? "",
    });
    setEmpresaModal(true);
  }

  function openAdminModal(e: Empresa) {
    setAdminEmpresa(e);
    setAdminCriado(null);
    setAdminForm({ nome: "", celular: "", email: "", senha: gerarSenha() });
    setAdminModal(true);
  }

  function openPagamentoModal(e: Empresa) {
    setPagamentoEmpresa(e);
    setPagamentoForm({
      status_pagamento: e.status_pagamento ?? "ativa",
      vencimento_plano: e.vencimento_plano ? e.vencimento_plano.slice(0, 10) : "",
      observacoes_pagamento: e.observacoes_pagamento ?? "",
    });
    setPagamentoModal(true);
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
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingEmpresa(false);
    }
  }

  async function handleDeleteEmpresa() {
    if (!deleteEmpresa) return;
    const { error } = await supabase.from("empresas").delete().eq("id", deleteEmpresa.id);
    if (error) toast.error(error.message);
    else { toast.success("Empresa removida"); qc.invalidateQueries({ queryKey: ["admin-empresas"] }); }
    setDeleteEmpresa(null);
  }

  async function handleSaveAdmin() {
    if (!adminEmpresa) return;
    if (!adminForm.nome.trim() || !adminForm.celular.trim() || !adminForm.email.trim()) {
      toast.error("Nome, celular e email são obrigatórios"); return;
    }
    setSavingAdmin(true);
    try {
      // Cria usuário no Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: adminForm.email.trim().toLowerCase(),
        password: adminForm.senha,
        options: { data: { nome: adminForm.nome.trim(), celular: adminForm.celular } },
      });
      if (authErr) throw authErr;
      if (!authData.user) throw new Error("Usuário não criado");

      // Vincula à empresa e define como admin
      await supabase.from("usuarios").update({
        empresa_id: adminEmpresa.id,
        perfil: "admin",
        celular: adminForm.celular,
        nome: adminForm.nome.trim(),
      }).eq("auth_user_id", authData.user.id);

      // Confirma email automaticamente via SQL
      setAdminCriado({
        celular: adminForm.celular,
        senha: adminForm.senha,
        empresa: adminEmpresa.nome,
      });
      qc.invalidateQueries({ queryKey: ["admin-empresas"] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingAdmin(false);
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

  function copiarAcesso() {
    if (!adminCriado) return;
    const texto = `*OS Fácil — Dados de Acesso*\n\nEmpresa: ${adminCriado.empresa}\nCelular: ${adminCriado.celular}\nSenha: ${adminCriado.senha}\n\nAcesse: https://os-facil-sepia.vercel.app`;
    navigator.clipboard.writeText(texto);
    setCopied(true);
    toast.success("Dados copiados!");
    setTimeout(() => setCopied(false), 2000);
  }

  function enviarWhatsApp() {
    if (!adminCriado) return;
    const texto = encodeURIComponent(`*OS Fácil — Dados de Acesso*\n\nEmpresa: ${adminCriado.empresa}\nCelular: ${adminCriado.celular}\nSenha: ${adminCriado.senha}\n\nAcesse: https://os-facil-sepia.vercel.app`);
    const numero = adminCriado.celular.replace(/\D/g, "");
    window.open(`https://wa.me/55${numero}?text=${texto}`, "_blank");
  }

  return (
    <AppShell title="Super Admin">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button variant={tab === "empresas" ? "default" : "outline"} onClick={() => setTab("empresas")} size="sm">
          <Building2 className="h-4 w-4 mr-1" /> Empresas
          <span className="ml-1.5 text-xs opacity-70">({empresas.length})</span>
        </Button>
        <Button variant={tab === "pagamentos" ? "default" : "outline"} onClick={() => setTab("pagamentos")} size="sm">
          <CreditCard className="h-4 w-4 mr-1" /> Pagamentos
        </Button>
      </div>

      {/* ABA EMPRESAS */}
      {tab === "empresas" && (
        <>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-muted-foreground">{empresas.length} empresa(s) cadastrada(s)</p>
            <Button size="sm" onClick={openNovaEmpresa}>
              <Plus className="h-4 w-4 mr-1" /> Nova empresa
            </Button>
          </div>
          {loadingEmpresas ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : empresas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-2">
              <Building2 className="h-8 w-8 opacity-40" />
              Nenhuma empresa cadastrada.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {empresas.map((e) => (
                <Card key={e.id}>
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{e.nome}</p>
                        {(e.cidade || e.estado) && (
                          <p className="text-xs text-muted-foreground">{[e.cidade, e.estado].filter(Boolean).join(" / ")}</p>
                        )}
                        {e.telefone && <p className="text-xs text-muted-foreground">{e.telefone}</p>}
                        <span className={`inline-block mt-1 text-[10px] text-white px-2 py-0.5 rounded-full ${statusPagamentoColor[e.status_pagamento ?? "ativa"] ?? "bg-green-500"}`}>
                          {statusPagamentoLabel[e.status_pagamento ?? "ativa"]}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" title="Editar empresa" onClick={() => openEditEmpresa(e)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" title="Excluir empresa" onClick={() => setDeleteEmpresa(e)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openAdminModal(e)}>
                        <Users className="h-3.5 w-3.5 mr-1" /> Admin
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openPagamentoModal(e)}>
                        <CreditCard className="h-3.5 w-3.5 mr-1" /> Pagamento
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ABA PAGAMENTOS */}
      {tab === "pagamentos" && (
        <div className="grid gap-2">
          {empresas.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{e.nome}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] text-white px-2 py-0.5 rounded-full ${statusPagamentoColor[e.status_pagamento ?? "ativa"]}`}>
                    {statusPagamentoLabel[e.status_pagamento ?? "ativa"]}
                  </span>
                  {e.vencimento_plano && (
                    <span className="text-xs text-muted-foreground">
                      Vence: {new Date(e.vencimento_plano).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => openPagamentoModal(e)}>
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
            <DialogTitle>{editEmpresa ? "Editar empresa" : "Nova empresa"}</DialogTitle>
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
            <DialogTitle>Admin — {adminEmpresa?.nome}</DialogTitle>
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
                  <Label>E-mail *</Label>
                  <Input type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} />
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
                  {savingAdmin ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Users className="h-4 w-4 mr-1" />}
                  Criar admin
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
                <p><strong>Empresa:</strong> {adminCriado.empresa}</p>
                <p><strong>Celular:</strong> {adminCriado.celular}</p>
                <p><strong>Senha:</strong> {adminCriado.senha}</p>
                <p className="text-xs text-muted-foreground mt-2">Acesse: https://os-facil-sepia.vercel.app</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={enviarWhatsApp}>
                  <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                </Button>
                <Button variant="outline" className="flex-1" onClick={copiarAcesso}>
                  {copied ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                  Copiar
                </Button>
              </div>
              <Button variant="ghost" className="w-full" onClick={() => setAdminModal(false)}>Fechar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Pagamento */}
      <Dialog open={pagamentoModal} onOpenChange={(o) => !savingPagamento && setPagamentoModal(o)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Pagamento — {pagamentoEmpresa?.nome}</DialogTitle>
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
              <Textarea value={pagamentoForm.observacoes_pagamento} onChange={(e) => setPagamentoForm({ ...pagamentoForm, observacoes_pagamento: e.target.value })} rows={3} placeholder="Notas sobre o pagamento..." />
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
              Todos os dados da empresa serão removidos permanentemente.
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
    </AppShell>
  );
}
