import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const criarAdminSchema = z.object({
  nome: z.string().min(1),
  celular: z.string().min(8),
  email: z.string().email(),
  senha: z.string().min(6),
  empresa_id: z.string().uuid(),
});

export const criarAdmin = createServerFn({ method: "POST" })
  .validator((d: unknown) => criarAdminSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Cria usuário com email já confirmado usando service role
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.senha,
      email_confirm: true,
      user_metadata: { nome: data.nome, celular: data.celular },
    });

    if (authErr || !authData.user) {
      throw new Error(authErr?.message ?? "Erro ao criar usuário");
    }

    // Aguarda o trigger criar o registro em usuarios
    await new Promise(r => setTimeout(r, 1000));

    // Vincula à empresa
    const { error: updErr } = await supabaseAdmin
      .from("usuarios")
      .update({
        empresa_id: data.empresa_id,
        perfil: "admin",
        celular: data.celular,
        nome: data.nome,
      })
      .eq("auth_user_id", authData.user.id);

    if (updErr) throw new Error(updErr.message);

    return { ok: true };
  });
