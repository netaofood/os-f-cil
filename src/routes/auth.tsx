import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function isEmail(v: string) {
  return /\S+@\S+\.\S+/.test(v);
}

function AuthPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identificacao, setIdentificacao] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      let emailParaLogin = identificacao.trim().toLowerCase();

      if (!isEmail(identificacao)) {
        const digits = identificacao.replace(/\D/g, "");
        const { data, error } = await supabase.rpc("get_email_by_celular", { _celular: digits });
        if (error || !data) {
          toast.error("Celular não encontrado");
          setLoading(false);
          return;
        }
        emailParaLogin = data;
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailParaLogin,
        password: senha,
      });

      if (signInError || !signInData.user) {
        toast.error("Login falhou", { description: signInError?.message });
        setLoading(false);
        return;
      }

      // Busca perfil direto com o token já ativo
      const { data: u } = await supabase
        .from("usuarios")
        .select("perfil")
        .eq("auth_user_id", signInData.user.id)
        .maybeSingle();

      if (u?.perfil === "super_admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }

    } catch {
      toast.error("Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="OS Fácil" className="w-24 h-24 object-contain" />
          <h1 className="mt-3 text-2xl font-bold text-foreground">OS Fácil</h1>
          <p className="text-sm text-muted-foreground">Gestão de Ordens de Serviço</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="id">E-mail ou celular</Label>
            <Input
              id="id"
              value={identificacao}
              onChange={(e) => setIdentificacao(e.target.value)}
              placeholder="voce@exemplo.com ou (00) 00000-0000"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="senha">Senha</Label>
            <div className="relative">
              <Input
                id="senha"
                type={showPw ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Entrar
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-6">
          Problemas? Entre em contato com o administrador.
        </p>
      </div>
    </main>
  );
}
