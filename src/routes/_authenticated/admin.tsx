import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2, Users, FileText, Plus, Pencil, X,
  Save, Loader2, ShieldAlert, Trash2, ToggleLeft, ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUsuario } from "@/hooks/use-current-user";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

type EmpresaResumo = {
  id: string; nome: string; cnpj: string | null; cidade: string | null;
  estado: string | null; email: string | null; telefone: string | null;
  cor_destaque: string; created_at: string;
  total_usuarios: number; total_os: number;
};
type Usuario = Tables<"usuarios">;

const perfilLabel: Record<string, string> = {
  super_admin: "Super Admin", admin: "Admin", colaborador: "Colaborador",
};
const perfilColor: Record<string, string> = {
  super_admin: "bg-purple-500", admin: "bg-blue-500", colaborador: "bg-gray-500",
};

const emptyEmpresa = {
  nome: "", cnpj: "", telefone: "", email: "",
  endereco: "", cidade: "", estado: "", pix: "", banco: "",
};

export default function AdminPage() {
  const { data: usuario } = useCurrentUsuario();
  const qc = useQueryClient();

  // guards
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

  // tabs
  const [tab, setTab] = useState<"empresas" | "usuarios">("empresas");

  // ── EMPRESAS ──────────────────────────────────────────────────────────────
  const { data: empresas = [], isLoading: loadingEmpresas } = useQuery({
    queryKey: ["admin-empresas"],
    enabled: usuario?.perfil === "super_admin",
    queryFn: async (): Promise<EmpresaResumo[]> => {
      const { data, error } = await supabase.rpc("super_admin_empresas_resumo");
      if (error) throw error;
      return (data ?? []) as EmpresaResumo[];
    },
  });

  const [empresaModal, setEmpresaModal] = useState(false);
  const [editEmpresa, setEditEmpresa] = useState<EmpresaResumo | null>(null);
  const [empresaForm, setEmpresaForm] = useState({ ...emptyEmpresa });
  const [savingEmpresa, setSavingEmpresa] = useState(false);
  const [deleteEmpresa, setDeleteEmpresa] = useState<EmpresaResumo | null>(null);

  function openNovaEmpresa() {
    setEditEmpresa(null);
    setEmpresaForm({ ...emptyEmpresa });
    setEmpresaModal(true);
  }
  function openEditEmpresa(e: EmpresaResumo) {
    setEditEmpresa(e);
    setEmpresaForm({
      nome: e.nome, cnpj: e.cnpj ?? "", telefone: e.telefone ?? "",
      email: e.email ?? "", endereco: "", cidade: e.cidade ?? "",
      estado: e.estado ?? "", pix: "", banco: "",
    });
    setEmpresaModal(true);
  }

  async function handleSaveEmpresa() {
    if (!empresaForm.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    setSavingEmpresa(true);
    try {
      if (editEmpresa) {
        const { error } = await supabase.from("empresas").update({
          nome: empresaForm.nome.trim(),
          cnpj: empresaForm.cnpj || null,
          telefone: empresaForm.telefone || null,
          email: empresaForm.email || null,
          cidade: empresaForm.cidade || null,
          estado: empresaForm.estado || null,
        }).eq("id", editEmpresa.id);
        if (error) throw error;
        toast.success("Empresa atualizada");
      } else {
        const { error } = await supabase.from("empresas").insert({
          nome: empresaForm.nome.trim(),
          cnpj: empresaForm.cnpj || null,
          telefone: empresaForm.telefone || null,
          email: empresaForm.email || null,
          cidade: empresaForm.cidade || null,
          estado: empresaForm.estado || null,
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
    else {
      toast.success("Empresa removida");
      qc.invalidateQueries({ queryKey: ["admin-empresas"] });
    }
    setDeleteEmpresa(null);
  }

  // ── USUÁRIOS ──────────────────────────────────────────────────────────────
  const { data: usuarios = [], isLoading: loadingUsuarios } = useQuery({
    queryKey: ["admin-usuarios"],
    enabled: usuario?.perfil === "super_admin" && tab === "usuarios",
    queryFn: async (): Promise<Array<Usuario & { empresa_nome?: string }>>  => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*, empresa:empresas(nome)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((u: any) => ({
        ...u, empresa_nome: u.empresa?.nome ?? "Sem empresa",
      }));
    },
  });

  const [editUsuario, setEditUsuario] = useState<(Usuario & { empresa_nome?: string }) | null>(null);
  const [editPerfil, setEditPerfil] = useState("");
  const [savingUsuario, setSavingUsuario] = useState(false);

  function openEditUsuario(u: Usuario & { empresa_nome?: string }) {
    setEditUsuario(u);
    setEditPerfil(u.perfil);
  }

  async function handleSaveUsuario() {
    if (!editUsuario) return;
    setSavingUsuario(true);
    const { error } = await supabase
      .from("usuarios")
      .update({ perfil: editPerfil as any })
      .eq("id", editUsuario.id);
    setSavingUsuario(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Usuário atualizado");
      setEditUsuario(null);
      qc.invalidateQueries({ queryKey: ["admin-usuarios"] });
    }
  }

  async function toggleAtivo(u: Usuario) {
    const { error } = await supabase
      .from("usuarios")
      .update({ ativo: !u.ativo })
      .eq("id", u.id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["admin-usuarios"] });
  }

  return (
    <AppShell title="Super Admin">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={tab === "empresas" ? "default" : "outline"}
          onClick={() => setTab("empresas")}
          size="sm"
        >
          <Building2 className="h-4 w-4 mr-1" />
          Empresas
          <span className="ml-1.5 text-xs opacity-70">({empresas.length})</span>
        </Button>
        <Button
          variant={tab === "usuarios" ? "default" : "outline"}
          onClick={() => setTab("usuarios")}
          size="sm"
        >
          <Users className="h-4 w-4 mr-1" />
          Usuários
          <span className="ml-1.5 text-xs opacity-70">({usuarios.length})</span>
        </Button>
      </div>

      {/* ── ABA EMPRESAS ── */}
      {tab === "empresas" && (
        <>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-muted-foreground">
              {empresas.length} empresa{empresas.length !== 1 ? "s" : ""} cadastrada{empresas.length !== 1 ? "s" : ""}
            </p>
            <Button size="sm" onClick={openNovaEmpresa}>
              <Plus className="h-4 w-4 mr-1" /> Nova empresa
            </Button>
          </div>

          {loadingEmpresas ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
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
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: e.cor_destaque }}
                          />
                          <p className="font-semibold truncate">{e.nome}</p>
                        </div>
                        {(e.cidade || e.estado) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {[e.cidade, e.estado].filter(Boolean).join(" / ")}
                          </p>
                        )}
                        {e.cnpj && (
                          <p className="text-xs text-muted-foreground">{e.cnpj}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditEmpresa(e)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteEmpresa(e)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>{e.total_usuarios}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{e.total_os} OS</span>
                      </div>
                      <div className="text-xs text-muted-foreground ml-auto">
                        {new Date(e.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── ABA USUÁRIOS ── */}
      {tab === "usuarios" && (
        <>
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">
              {usuarios.length} usuário{usuarios.length !== 1 ? "s" : ""} cadastrado{usuarios.length !== 1 ? "s" : ""}
            </p>
          </div>

          {loadingUsuarios ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-2">
              {usuarios.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">{u.nome}</p>
                      <span className={`text-[10px] text-white px-1.5 py-0.5 rounded-full ${perfilColor[u.perfil] ?? "bg-gray-500"}`}>
                        {perfilLabel[u.perfil] ?? u.perfil}
                      </span>
                      {!u.ativo && (
                        <span className="text-[10px] text-white px-1.5 py-0.5 rounded-full bg-red-500">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {u.email ?? "—"} · {(u as any).empresa_nome}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon" variant="ghost"
                      className={`h-8 w-8 ${u.ativo ? "text-green-500 hover:text-green-600" : "text-muted-foreground hover:text-foreground"}`}
                      title={u.ativo ? "Desativar" : "Ativar"}
                      onClick={() => toggleAtivo(u)}
                    >
                      {u.ativo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditUsuario(u)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal Empresa */}
      <Dialog open={empresaModal} onOpenChange={(o) => !savingEmpresa && setEmpresaModal(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editEmpresa ? `Editar: ${editEmpresa.nome}` : "Nova empresa"}</DialogTitle>
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
              <Input type="email" value={empresaForm.email} onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })} placeholder="contato@empresa.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cidade</Label>
                <Input value={empresaForm.cidade} onChange={(e) => setEmpresaForm({ ...empresaForm, cidade: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Input value={empresaForm.estado} onChange={(e) => setEmpresaForm({ ...empresaForm, estado: e.target.value })} placeholder="SP" maxLength={2} />
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

      {/* Modal Editar Usuário */}
      <Dialog open={!!editUsuario} onOpenChange={(o) => !savingUsuario && !o && setEditUsuario(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
          </DialogHeader>
          {editUsuario && (
            <div className="space-y-4 py-1">
              <div>
                <p className="font-medium">{editUsuario.nome}</p>
                <p className="text-xs text-muted-foreground">{editUsuario.email} · {(editUsuario as any).empresa_nome}</p>
              </div>
              <div className="space-y-1.5">
                <Label>Perfil</Label>
                <Select value={editPerfil} onValueChange={setEditPerfil}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUsuario(null)} disabled={savingUsuario}>Cancelar</Button>
            <Button onClick={handleSaveUsuario} disabled={savingUsuario}>
              {savingUsuario ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar exclusão empresa */}
      <AlertDialog open={!!deleteEmpresa} onOpenChange={(o) => !o && setDeleteEmpresa(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover empresa "{deleteEmpresa?.nome}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os dados da empresa (OSs, clientes, produtos, faturas) serão permanentemente removidos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEmpresa} className="bg-destructive hover:bg-destructive/90">
              Remover empresa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
