import { createServerFn } from "@tanstack/react-start";

export const createSuperAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "netaosushibar@gmail.com",
    password: "Net@o2024!",
    email_confirm: true,
    user_metadata: { nome: "Super Admin" },
  });
  if (error) throw error;
  return { userId: data.user?.id };
});
