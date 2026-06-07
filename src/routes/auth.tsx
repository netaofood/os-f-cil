import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — OS Fácil" },
      { name: "description", content: "Acesse sua conta OS Fácil." },
    ],
  }),
  component: AuthPage,
});

// detecta se entrada é email ou celular
function isEmail(v: string) {
  return /\S+@\S+\.\S+/.test(v);
}
function normalizeEmail(identifier: string) {
  if (isEmail(identifier)) return identifier.trim().toLowerCase();
  // celular -> pseudo email para login via celular (fase futura, por ora aceitamos só email)
  const digits = identifier.replace(/\D/g, "");
  return `${digits}@celular.osfacil.local`;
}

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // login
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");

  // signup
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [signupPw, setSignupPw] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(loginId),
      password: loginPw,
    });
    setLoading(false);
    if (error) {
      toast.error("Login falhou", { description: error.message });
      return;
    }
    toast.success("Bem-vindo!");
    navigate({ to: "/" });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (signupPw.length < 6) {
      toast.error("Senha precisa ter ao menos 6 caracteres");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: signupPw,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { nome, celular },
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Cadastro falhou", { description: error.message });
      return;
    }
    toast.success("Conta criada!", { description: "Você já pode entrar." });
    setTab("login");
    setLoginId(email);
  }

  async function handleReset() {
    if (!isEmail(loginId)) {
      toast.error("Informe seu e-mail para recuperar a senha");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(loginId.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Enviamos um e-mail com instruções");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="OS Fácil" className="w-24 h-24 object-contain" />
          <h1 className="mt-3 text-2xl font-bold text-foreground">OS Fácil</h1>
          <p className="text-sm text-muted-foreground">Gestão de Ordens de Serviço</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar conta</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="loginId">E-mail ou celular</Label>
                <Input
                  id="loginId"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="voce@exemplo.com"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="loginPw">Senha</Label>
                <div className="relative">
                  <Input
                    id="loginPw"
                    type={showPw ? "text" : "password"}
                    value={loginPw}
                    onChange={(e) => setLoginPw(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Entrar
              </Button>
              <button
                type="button"
                onClick={handleReset}
                className="block mx-auto text-sm text-muted-foreground hover:text-primary"
              >
                Esqueci minha senha
              </button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="nome">Seu nome</Label>
                <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  type="tel"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  placeholder="(14) 99999-9999"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signupPw">Senha</Label>
                <div className="relative">
                  <Input
                    id="signupPw"
                    type={showPw ? "text" : "password"}
                    value={signupPw}
                    onChange={(e) => setSignupPw(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Criar conta
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground text-center mt-6">
          <Link to="/" className="hover:text-primary">Voltar à página inicial</Link>
        </p>
      </div>
    </main>
  );
}
