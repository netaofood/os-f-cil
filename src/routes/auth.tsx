import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Sun, Moon } from "lucide-react";
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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let emailParaLogin: string;

      if (isEmail(identificacao)) {
        // Super admin usa email real
        emailParaLogin = identificacao.trim().toLowerCase();
      } else {
        // Admin/colaborador: celular vira email fake
        const digits = identificacao.replace(/\D/g, "");
        emailParaLogin = `u${digits}@osfacil.app`;
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-10 relative">
      {/* Toggle tema */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-primary transition-colors"
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <img src="/logo.png" alt="OS Fácil" className="w-28 h-28 object-contain dark:drop-shadow-[0_0_16px_#00B4FF]" />
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-widest text-primary uppercase dark:text-primary dark:drop-shadow-[0_0_8px_#00B4FF]"
            style={{ fontFamily: "Orbitron, sans-serif" }}>
            OS Fácil
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão de Ordens de Serviço</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="id" className="text-xs uppercase tracking-wider font-semibold">
              E-mail ou celular
            </Label>
            <Input
              id="id"
              value={identificacao}
              onChange={(e) => setIdentificacao(e.target.value)}
              placeholder="voce@exemplo.com ou (00) 00000-0000"
              className="h-12 bg-card border-border focus:border-primary focus:ring-primary dark:focus:shadow-[0_0_8px_#00B4FF44]"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="senha" className="text-xs uppercase tracking-wider font-semibold">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="senha"
                type={showPw ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="h-12 bg-card border-border focus:border-primary pr-10 dark:focus:shadow-[0_0_8px_#00B4FF44]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-sm font-bold uppercase tracking-widest dark:shadow-[0_0_12px_#00B4FF66] transition-all"
            style={{ fontFamily: "Orbitron, sans-serif" }}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Entrar"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-8">
          Problemas? Entre em contato com o administrador.
        </p>
      </div>
    </main>
  );
}
