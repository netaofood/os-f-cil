import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const tokenSchema = z.object({ token: z.string().min(8).max(64) });

export const getFaturaByToken = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => tokenSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: fatura, error } = await supabaseAdmin
      .from("faturas")
      .select("*, empresa:empresas(*), cliente:clientes(*)")
      .eq("link_publico_token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!fatura) throw new Error("Fatura não encontrada");
    return fatura;
  });

const signSchema = z.object({
  token: z.string().min(8).max(64),
  signatureBase64: z.string().min(100).max(2_000_000),
});

export const signFaturaByToken = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => signSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: fatura, error: e1 } = await supabaseAdmin
      .from("faturas")
      .select("id, empresa_id, status")
      .eq("link_publico_token", data.token)
      .maybeSingle();
    if (e1 || !fatura) throw new Error("Fatura não encontrada");

    const b64 = data.signatureBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(b64, "base64");
    const path = `${fatura.empresa_id}/${fatura.id}-${Date.now()}.png`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("assinaturas")
      .upload(path, buffer, { contentType: "image/png", upsert: true });
    if (upErr) throw new Error(upErr.message);

    const { data: pub } = supabaseAdmin.storage.from("assinaturas").getPublicUrl(path);
    const { error: e2 } = await supabaseAdmin
      .from("faturas")
      .update({ assinatura_url: pub.publicUrl, status: "pago", pago_em: new Date().toISOString() })
      .eq("id", fatura.id);
    if (e2) throw new Error(e2.message);
    return { ok: true, url: pub.publicUrl };
  });
