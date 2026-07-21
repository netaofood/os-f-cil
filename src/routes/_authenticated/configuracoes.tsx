import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2, Upload, Trash2, ImageIcon, ChevronRight,
  Plus, KeyRound, ToggleLeft, ToggleRight, RefreshCw,
  MessageCircle, Copy, Check, Save,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useCurrentUsuario, useCurrentEmpresa } from "@/hooks/use-current-user";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { criarColaborador } from "@/lib/admin.functions";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  ssr: false,
  component: ConfigPage,
});

type Usuario = Tables<"usuarios">;

function gerarSenha() {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function ConfigPage() {
  const qc = useQueryClient();
  const { data: usuario } = useCurrentUsuario();
  const { data: empresa, isLoading } = useCurrentEmpresa(usuario?.empresa_id);

  const [empresaOpen, setEmpresaOpen] = useState(false);
  const [equipeOpen, setEquipeOpen] = useState(false);

  // ── Dados da empresa ──
  const [form, setForm] = useState({
    nome: "", cnpj: "", telefone: "", email: "",
    endereco: "", cidade: "", estado: "", pix: "", banco: "", cor_destaque: "#f97316",
  });
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (empresa) {
      setForm({
        nome: empresa.nome, cnpj: empresa.cnpj ?? "",
        telefone: empresa.telefone ?? "", email: empresa.email ?? "",
        endereco: empresa.endereco ?? "", cidade: empresa.cidade ?? "",
        estado: empresa.estado ?? "", pix: empresa.pix ?? "",
        banco: empresa.banco ?? "", cor_destaque: empresa.cor_destaque || "#f97316",
      });
      setLogoUrl(empresa.logo_url ?? null);
    }
  }, [empresa]);

  async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !empresa) return;
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) { toast.error("Formato inválido. Use PNG, JPG, WebP ou SVG."); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Arquivo muito grande (máx. 2 MB)."); return; }
    setUploadingLogo(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${empresa.id}/logo-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("logos-empresas").upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) { setUploadingLogo(false); toast.error(uploadError.message); return; }
    const { data: pub } = supabase.storage.from("logos-empresas").getPublicUrl(path);
    const { error: updateError } = await supabase.from("empresas").update({ logo_url: pub.publicUrl }).eq("id", empresa.id);
    setUploadingLogo(false);
    if (updateError) { toast.error(updateError.message); return; }
    setLogoUrl(pub.publicUrl);
    toast.success("Logo atualizada");
    qc.invalidateQueries({ queryKey: ["current-empresa"] });
  }

  async function handleRemoveLogo() {
    if (!empresa) return;
    setUploadingLogo(true);
    const { error } = await supabase.from("empresas").update({ logo_url: null }).eq("id", empresa.id);
    setUploadingLogo(false);
    if (error) { toast.error(error.message); return; }
    setLogoUrl(null);
    toast.success("Logo removida");
    qc.invalidateQueries({ queryKey: ["current-empresa"] });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!empresa) return;
    setSaving(true);
    const { error } = await supabase.from("empresas").update({
      nome: form.nome, cnpj: form.cnpj || null, telefone: form.telefone || null,
      email: form.email || null, endereco: form.endereco || null,
      cidade: form.cidade || null, estado: form.estado || null,
      pix: form.pix || null, banco: form.banco || null, cor_destaque: form.cor_destaque,
    }).eq("id", empresa.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Configurações salvas"); qc.invalidateQueries({ queryKey: ["current-empresa"] }); }
  }

  // ── Colaboradores ──
  const { data: colaboradores = [] } = useQuery({
    queryKey: ["colaboradores", usuario?.empresa_id],
    enabled: !!usuario?.empresa_id && equipeOpen,
    queryFn: async () => {
      const { data } = await supabase
        .from("usuarios")
        .select("*")
        .eq("empresa_id", usuario!.empresa_id!)
        .eq("perfil", "colaborador")
        .order("created_at");
      return (data ?? []) as Usuario[];
    },
  });

  const [novoModal, setNovoModal] = useState(false);
  const [novoForm, setNovoForm] = useState({ nome: "", celular: "", senha: "" });
  const [salvandoNovo, setSalvandoNovo] = useState(false);
  const [convite, setConvite] = useState<{ nome: string; celular: string; senha: string } | null>(null);
  const [conviteModal, setConviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resetColabModal, setResetColabModal] = useState(false);
  const [resetColab, setResetColab] = useState<Usuario | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [savingReset, setSavingReset] = useState(false);

  function openNovoColab() {
    setNovoForm({ nome: "", celular: "", senha: gerarSenha() });
    setNovoModal(true);
  }

  const criarColaboradorFn = useServerFn(criarColaborador);

  async function handleSalvarColab() {
    if (!novoForm.nome.trim() || !novoForm.celular.trim()) {
      toast.error("Nome e celular são obrigatórios"); return;
    }
    if (!usuario?.empresa_id) { toast.error("Empresa não identificada"); return; }
    setSalvandoNovo(true);
    try {
      await criarColaboradorFn({
        data: {
          nome: novoForm.nome.trim(),
          celular: novoForm.celular,
          senha: novoForm.senha,
          empresa_id: usuario.empresa_id,
        },
      });
      setConvite({ nome: novoForm.nome.trim(), celular: novoForm.celular, senha: novoForm.senha });
      setNovoModal(false);
      setConviteModal(true);
      qc.invalidateQueries({ queryKey: ["colaboradores", usuario.empresa_id] });
    } catch (err: any) { toast.error(err.message); }
    finally { setSalvandoNovo(false); }
  }

  async function toggleAtivo(u: Usuario) {
    const { error } = await supabase.from("usuarios").update({ ativo: !u.ativo }).eq("id", u.id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["colaboradores", usuario?.empresa_id] });
  }

  function openResetColab(u: Usuario) {
    setResetColab(u);
    setNovaSenha(gerarSenha());
    setResetColabModal(true);
  }

  async function handleResetColab() {
    if (!resetColab) return;
    setSavingReset(true);
    const digits = (resetColab.celular ?? "").replace(/\D/g, "");
    const emailFake = `u${digits}@osfacil.app`;
    const { error } = await supabase.rpc("resetar_senha_usuario" as any, {
      p_email: emailFake, p_nova_senha: novaSenha,
    });
    setSavingReset(false);
    if (error) { toast.error(error.message); return; }
    setResetColabModal(false);
    setConvite({ nome: resetColab.nome, celular: resetColab.celular ?? "", senha: novaSenha });
    setConviteModal(true);
  }

  function copiarConvite() {
    if (!convite) return;
    const texto = `*OS Fácil — Dados de Acesso*\n\nNome: ${convite.nome}\nCelular: ${convite.celular}\nSenha: ${convite.senha}\n\nAcesse: https://osfacil.netao.app.br`;
    navigator.clipboard.writeText(texto);
    setCopied(true);
    toast.success("Dados copiados!");
    setTimeout(() => setCopied(false), 2000);
  }

  function whatsappConvite() {
    if (!convite) return;
    const texto = encodeURIComponent(`*OS Fácil — Dados de Acesso*\n\nNome: ${convite.nome}\nCelular: ${convite.celular}\nSenha: ${convite.senha}\n\nAcesse: https://osfacil.netao.app.br`);
    const numero = convite.celular.replace(/\D/g, "");
    window.open(`https://wa.me/55${numero}?text=${texto}`, "_blank");
  }

  return (
    <AppShell title="Configurações">
      {isLoading || !empresa ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-w-2xl space-y-3">

          {/* Box Dados da Empresa */}
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
              onClick={() => setEmpresaOpen(!empresaOpen)}
            >
              <span className="font-semibold text-sm">Dados da empresa</span>
              <ChevronRight className={`h-4 w-4 text-primary transition-transform ${empresaOpen ? "rotate-90" : ""}`} />
            </button>

            {empresaOpen && (
              <div className="border-t border-border p-4 space-y-4">
                {/* Logo */}
                <div className="pb-4 border-b border-border">
                  <Label className="block mb-2 text-xs">Logo da empresa</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-md border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                      ) : (
                        <ImageIcon className="h-7 w-7 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={handleLogoFile} />
                      <button type="button" title={logoUrl ? "Trocar logo" : "Enviar logo"} onClick={() => fileInputRef.current?.click()} disabled={uploadingLogo}
                        className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 transition-colors">
                        {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </button>
                      {logoUrl && (
                        <button type="button" title="Remover logo" onClick={handleRemoveLogo} disabled={uploadingLogo}
                          className="h-9 w-9 flex items-center justify-center rounded-md text-destructive hover:bg-muted disabled:opacity-50 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSave} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="e-nome">Nome *</Label>
                    <Input id="e-nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required maxLength={120} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="e-cnpj">CNPJ</Label>
                      <Input id="e-cnpj" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} maxLength={20} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="e-tel">Telefone</Label>
                      <Input id="e-tel" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} maxLength={20} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="e-email">E-mail</Label>
                    <Input id="e-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={120} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="e-end">Endereço</Label>
                    <Textarea id="e-end" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} rows={2} maxLength={200} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="e-cid">Cidade</Label>
                      <Input id="e-cid" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} maxLength={80} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="e-uf">UF</Label>
                      <Input id="e-uf" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })} maxLength={2} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="e-pix">Chave PIX</Label>
                      <Input id="e-pix" value={form.pix} onChange={(e) => setForm({ ...form, pix: e.target.value })} maxLength={120} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="e-banco">Banco</Label>
                      <Input id="e-banco" value={form.banco} onChange={(e) => setForm({ ...form, banco: e.target.value })} maxLength={80} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="e-cor">Cor de destaque</Label>
                    <div className="flex gap-2 items-center">
                      <input type="color" id="e-cor" value={form.cor_destaque} onChange={(e) => setForm({ ...form, cor_destaque: e.target.value })}
                        className="h-10 w-14 rounded border border-border bg-background" />
                      <Input value={form.cor_destaque} onChange={(e) => setForm({ ...form, cor_destaque: e.target.value })} maxLength={9} className="font-mono" />
                    </div>
                  </div>
                  <button type="submit" disabled={saving}
                    className="h-9 w-9 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    title="Salvar">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Box Equipe */}
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
              onClick={() => setEquipeOpen(!equipeOpen)}
            >
              <span className="font-semibold text-sm">
                Equipe
                {colaboradores.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">({colaboradores.length})</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Novo colaborador"
                  onClick={(e) => { e.stopPropagation(); openNovoColab(); }}
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <ChevronRight className={`h-4 w-4 text-primary transition-transform ${equipeOpen ? "rotate-90" : ""}`} />
              </div>
            </button>

            {equipeOpen && (
              <div className="border-t border-border p-4">
                {colaboradores.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum colaborador cadastrado.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {colaboradores.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{c.nome}</p>
                          <p className="text-xs text-muted-foreground font-mono">{c.celular}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full text-white shrink-0 ${c.ativo ? "bg-green-500" : "bg-red-500"}`}>
                          {c.ativo ? "Ativo" : "Inativo"}
                        </span>
                        <div className="flex gap-1 shrink-0">
                          <button title="Resetar senha" onClick={() => openResetColab(c)}
                            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>
                          <button title={c.ativo ? "Desativar" : "Ativar"} onClick={() => toggleAtivo(c)}
                            className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors hover:bg-muted ${c.ativo ? "text-green-500" : "text-muted-foreground"}`}>
                            {c.ativo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Novo Colaborador */}
      <Dialog open={novoModal} onOpenChange={(o) => !salvandoNovo && setNovoModal(o)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Novo colaborador</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={novoForm.nome} onChange={(e) => setNovoForm({ ...novoForm, nome: e.target.value })} placeholder="Nome completo" />
            </div>
            <div className="space-y-1.5">
              <Label>Celular *</Label>
              <Input value={novoForm.celular} onChange={(e) => setNovoForm({ ...novoForm, celular: e.target.value })} placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-1.5">
              <Label>Senha provisória</Label>
              <div className="flex gap-2">
                <Input value={novoForm.senha} onChange={(e) => setNovoForm({ ...novoForm, senha: e.target.value })} />
                <button type="button" onClick={() => setNovoForm({ ...novoForm, senha: gerarSenha() })}
                  className="h-9 w-9 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNovoModal(false)} disabled={salvandoNovo}>Cancelar</Button>
            <Button onClick={handleSalvarColab} disabled={salvandoNovo}>
              {salvandoNovo ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Reset Senha Colaborador */}
      <Dialog open={resetColabModal} onOpenChange={(o) => !savingReset && setResetColabModal(o)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova senha — {resetColab?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted p-4 font-mono text-center">
              <p className="text-xs text-muted-foreground mb-1">Nova senha</p>
              <p className="text-xl font-bold tracking-widest text-primary">{novaSenha}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetColabModal(false)} disabled={savingReset}>Cancelar</Button>
            <Button onClick={handleResetColab} disabled={savingReset}>
              {savingReset ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <KeyRound className="h-4 w-4 mr-1" />}
              Aplicar e enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Convite */}
      <Dialog open={conviteModal} onOpenChange={setConviteModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enviar acesso</DialogTitle>
          </DialogHeader>
          {convite && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted p-4 text-sm space-y-1 font-mono">
                <p><strong>Nome:</strong> {convite.nome}</p>
                <p><strong>Celular:</strong> {convite.celular}</p>
                <p><strong>Senha:</strong> {convite.senha}</p>
                <p className="text-xs text-muted-foreground mt-2">https://osfacil.netao.app.br</p>
              </div>
              <div className="flex gap-3">
                <button onClick={whatsappConvite}
                  className="flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border border-green-500/40 text-green-600 hover:bg-green-500/10 transition-colors">
                  <MessageCircle className="h-6 w-6" />
                  <span className="text-xs font-medium">WhatsApp</span>
                </button>
                <button onClick={copiarConvite}
                  className="flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border border-border hover:bg-muted transition-colors">
                  {copied ? <Check className="h-6 w-6 text-green-500" /> : <Copy className="h-6 w-6" />}
                  <span className="text-xs font-medium">{copied ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>
              <button onClick={() => setConviteModal(false)}
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Fechar
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
