import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentUsuario } from "@/hooks/use-current-user";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const { data: usuario, isLoading: loadingUsuario } = useCurrentUsuario();

  useEffect(() => {
    if (loading || loadingUsuario) return;
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    if (usuario?.perfil === "super_admin") {
      window.location.href = "/admin";
    } else if (usuario) {
      window.location.href = "/dashboard";
    }
  }, [loading, loadingUsuario, user, usuario]);

  // Timeout de segurança — se demorar mais de 5s, vai para /auth
  useEffect(() => {
    const t = setTimeout(() => {
      if (!user) window.location.href = "/auth";
    }, 5000);
    return () => clearTimeout(t);
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
