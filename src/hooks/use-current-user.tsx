import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Usuario = Tables<"usuarios">;
export type Empresa = Tables<"empresas">;

export function useCurrentUsuario() {
  return useQuery({
    queryKey: ["current-usuario"],
    queryFn: async (): Promise<Usuario | null> => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) return null;
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("auth_user_id", sessionData.session.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCurrentEmpresa(empresaId: string | null | undefined) {
  return useQuery({
    queryKey: ["current-empresa", empresaId],
    enabled: !!empresaId,
    queryFn: async (): Promise<Empresa | null> => {
      if (!empresaId) return null;
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .eq("id", empresaId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
