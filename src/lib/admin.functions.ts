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

const criarColaboradorSchema = z.object({
  nome: z.string().min(1),
  celular: z.string().min(8),
  senha: z.string().min(6),
  empresa_id: z.string().uuid(),
});

export const criarColaborador = createServerFn({ method: "POST" })
  .validator((d: unknown) => criarColaboradorSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const digits = data.celular.replace(/\D/g, "");
    const emailFake = `u${digits}@osfacil.app`;

    // Verifica se já existe
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
    const jaExiste = existing.users.find(u => u.email === emailFake);
    if (jaExiste) throw new Error("Este celular já está cadastrado");

    // Cria com email confirmado via service role
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: emailFake,
      password: data.senha,
      email_confirm: true,
      user_metadata: { nome: data.nome, celular: data.celular },
    });
    if (authErr || !authData.user) throw new Error(authErr?.message ?? "Erro ao criar usuário");

    // Aguarda trigger
    await new Promise(r => setTimeout(r, 1500));

    // Vincula à empresa como colaborador
    const { error: updErr } = await supabaseAdmin
      .from("usuarios")
      .update({
        empresa_id: data.empresa_id,
        perfil: "colaborador",
        celular: data.celular,
        nome: data.nome,
      })
      .eq("auth_user_id", authData.user.id);

    if (updErr) throw new Error(updErr.message);

    return { ok: true };
  });
