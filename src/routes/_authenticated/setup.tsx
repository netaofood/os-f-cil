import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUsuario } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoAsset from "@/assets/os-facil-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/setup")({
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: usuario, isLoading: loadingUser } = useCurrentUsuario();
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [pix, setPix] = useState("");
  const [loading, setLoading] = useState(false);

  // se já tem empresa, manda pro dashboard
  if (!loadingUser && usuario?.empresa_id) {
    navigate({ to: "/dashboard" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    setLoading(true);
    try {
      const { data: emp, error: empErr } = await supabase
        .from("empresas")
        .insert({
          nome,
          cnpj: cnpj || null,
          telefone: telefone || null,
          cidade: cidade || null,
          estado: estado || null,
          pix: pix || null,
        })
        .select()
        .single();
      if (empErr) throw empErr;

      const { error: usrErr } = await supabase
        .from("usuarios")
        .update({ empresa_id: emp.id })
        .eq("id", usuario.id);
      if (usrErr) throw usrErr;

      // seed básico de status e formas de pagamento
      await supabase.from("status_os").insert([
        { empresa_id: emp.id, nome: "Aberta", cor: "#3b82f6", ordem: 1 },
        { empresa_id: emp.id, nome: "Em andamento", cor: "#f59e0b", ordem: 2 },
        { empresa_id: emp.id, nome: "Concluída", cor: "#10b981", ordem: 3 },
        { empresa_id: emp.id, nome: "Cancelada", cor: "#ef4444", ordem: 4 },
      ]);
      await supabase.from("formas_pagamento").insert([
        { empresa_id: emp.id, nome: "Dinheiro" },
        { empresa_id: emp.id, nome: "PIX" },
        { empresa_id: emp.id, nome: "Cartão de Crédito" },
        { empresa_id: emp.id, nome: "Cartão de Débito" },
      ]);

      toast.success("Empresa cadastrada!");
      await qc.invalidateQueries({ queryKey: ["current-usuario"] });
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error("Erro ao criar empresa", { description: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src={logoAsset.url} alt="" className="w-20 h-20 object-contain" />
          <h1 className="mt-3 text-2xl font-bold">Vamos configurar sua empresa</h1>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Esses dados aparecerão nas suas ordens de serviço e faturas.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome da empresa *</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required maxLength={120} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} maxLength={20} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} maxLength={20} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estado">UF</Label>
              <Input id="estado" value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} maxLength={2} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pix">Chave PIX</Label>
            <Input id="pix" value={pix} onChange={(e) => setPix(e.target.value)} maxLength={120} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Criar empresa
          </Button>
        </form>
      </div>
    </main>
  );
}
