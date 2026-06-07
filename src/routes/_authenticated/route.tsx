// Integration-managed authenticated layout. Uses ssr:false because Supabase
// stores the session in localStorage which the server cannot read.
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // No ambiente SSR (servidor), localStorage não existe — skip o guard
    if (typeof window === "undefined") return;

    // Usa getSession() que lê do localStorage sem round-trip ao servidor
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
    return { user: data.session.user };
  },
  component: () => <Outlet />,
});
