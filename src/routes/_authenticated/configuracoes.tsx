import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useCurrentUsuario, useCurrentEmpresa } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export const Route = createFileRoute("/_authenticated/configuracoes")({
  component: ConfigPage,
});

function ConfigPage() {
  const qc = useQueryClient();
  const { data: usuario } = useCurrentUsuario();
  const { data: empresa, isLoading } = useCurrentEmpresa(usuario?.empresa_id);

  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    estado: "",
    pix: "",
    banco: "",
    cor_destaque: "#f97316",
  });
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
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
        cor_destaque: empresa.cor_destaque || "#f97316",
      });
    }
  }, [empresa]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!empresa) return;
    setSaving(true);
    const { error } = await supabase
      .from("empresas")
      .update({
        nome: form.nome,
        cnpj: form.cnpj || null,
        telefone: form.telefone || null,
        email: form.email || null,
        endereco: form.endereco || null,
        cidade: form.cidade || null,
        estado: form.estado || null,
        pix: form.pix || null,
        banco: form.banco || null,
        cor_destaque: form.cor_destaque,
      })
      .eq("id", empresa.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Configurações salvas");
      qc.invalidateQueries({ queryKey: ["current-empresa"] });
    }
  }

  return (
    <AppShell title="Configurações">
      {isLoading || !empresa ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados da empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="e-nome">Nome *</Label>
                  <Input
                    id="e-nome"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    required
                    maxLength={120}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="e-cnpj">CNPJ</Label>
                    <Input
                      id="e-cnpj"
                      value={form.cnpj}
                      onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                      maxLength={20}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="e-tel">Telefone</Label>
                    <Input
                      id="e-tel"
                      value={form.telefone}
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                      maxLength={20}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="e-email">E-mail</Label>
                  <Input
                    id="e-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    maxLength={120}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="e-end">Endereço</Label>
                  <Textarea
                    id="e-end"
                    value={form.endereco}
                    onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                    rows={2}
                    maxLength={200}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="e-cid">Cidade</Label>
                    <Input
                      id="e-cid"
                      value={form.cidade}
                      onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                      maxLength={80}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="e-uf">UF</Label>
                    <Input
                      id="e-uf"
                      value={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })}
                      maxLength={2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="e-pix">Chave PIX</Label>
                    <Input
                      id="e-pix"
                      value={form.pix}
                      onChange={(e) => setForm({ ...form, pix: e.target.value })}
                      maxLength={120}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="e-banco">Banco</Label>
                    <Input
                      id="e-banco"
                      value={form.banco}
                      onChange={(e) => setForm({ ...form, banco: e.target.value })}
                      maxLength={80}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="e-cor">Cor de destaque</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      id="e-cor"
                      value={form.cor_destaque}
                      onChange={(e) => setForm({ ...form, cor_destaque: e.target.value })}
                      className="h-10 w-14 rounded border border-border bg-background"
                    />
                    <Input
                      value={form.cor_destaque}
                      onChange={(e) => setForm({ ...form, cor_destaque: e.target.value })}
                      maxLength={9}
                      className="font-mono"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Salvar alterações
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
