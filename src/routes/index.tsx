import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  useEffect(() => {
    async function redirect() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        window.location.href = "/auth";
        return;
      }

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("perfil")
        .eq("auth_user_id", data.session.user.id)
        .maybeSingle();

      if (usuario?.perfil === "super_admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    }

    redirect();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
