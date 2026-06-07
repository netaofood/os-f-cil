import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const tokenSchema = z.object({ token: z.string().min(8).max(64) });

export const getOSByToken = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => tokenSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: os, error } = await supabaseAdmin
      .from("ordens_servico")
      .select("*, empresa:empresas(*), cliente:clientes(*)")
      .eq("link_publico_token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!os) throw new Error("OS não encontrada");

    const { data: itens } = await supabaseAdmin
      .from("itens_os")
      .select("*")
      .eq("os_id", os.id)
      .order("descricao");

    return { ...os, itens: itens ?? [] };
  });

const aprovarSchema = z.object({
  token: z.string().min(8).max(64),
  aprovacao: z.enum(["aprovada", "rejeitada"]),
  obs: z.string().max(1000).optional(),
  signatureBase64: z.string().max(2_000_000).optional(),
});

export const aprovarOSByToken = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => aprovarSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: os, error: e1 } = await supabaseAdmin
      .from("ordens_servico")
      .select("id, empresa_id, aprovacao")
      .eq("link_publico_token", data.token)
      .maybeSingle();
    if (e1 || !os) throw new Error("OS não encontrada");

    let assinaturaUrl: string | null = null;

    if (data.aprovacao === "aprovada" && data.signatureBase64) {
      const b64 = data.signatureBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(b64, "base64");
      const path = `os/${os.empresa_id}/${os.id}-${Date.now()}.png`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("assinaturas")
        .upload(path, buffer, { contentType: "image/png", upsert: true });
      if (!upErr) {
        const { data: pub } = supabaseAdmin.storage.from("assinaturas").getPublicUrl(path);
        assinaturaUrl = pub.publicUrl;
      }
    }

    const { error: e2 } = await supabaseAdmin
      .from("ordens_servico")
      .update({
        aprovacao: data.aprovacao,
        aprovacao_obs: data.obs ?? null,
        aprovacao_em: new Date().toISOString(),
        ...(assinaturaUrl ? { assinatura_url: assinaturaUrl } : {}),
      })
      .eq("id", os.id);
    if (e2) throw new Error(e2.message);

    return { ok: true };
  });
