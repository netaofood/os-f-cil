import { c as createServerRpc } from "./createServerRpc-Xf625QLu.mjs";
import { c as createServerFn } from "./server-Bvapkoxa.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, e as enumType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
const tokenSchema = objectType({
  token: stringType().min(8).max(64)
});
const getOSByToken_createServerFn_handler = createServerRpc({
  id: "8ef677d1135f14ebd091a59810d59b8a45b41c58b8ad539d30380bf862edbd79",
  name: "getOSByToken",
  filename: "src/lib/os.functions.ts"
}, (opts) => getOSByToken.__executeServer(opts));
const getOSByToken = createServerFn({
  method: "POST"
}).inputValidator((d) => tokenSchema.parse(d)).handler(getOSByToken_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-ByiyHO4E.mjs");
  const {
    data: os,
    error
  } = await supabaseAdmin.from("ordens_servico").select("*, empresa:empresas(*), cliente:clientes(*)").eq("link_publico_token", data.token).maybeSingle();
  if (error) throw new Error(error.message);
  if (!os) throw new Error("OS não encontrada");
  const {
    data: itens
  } = await supabaseAdmin.from("itens_os").select("*").eq("os_id", os.id).order("descricao");
  return {
    ...os,
    itens: itens ?? []
  };
});
const aprovarSchema = objectType({
  token: stringType().min(8).max(64),
  aprovacao: enumType(["aprovada", "rejeitada"]),
  obs: stringType().max(1e3).optional(),
  signatureBase64: stringType().max(2e6).optional()
});
const aprovarOSByToken_createServerFn_handler = createServerRpc({
  id: "e8d36fdab3fbb68fac8ccd641593e76aee09ca5d5412f3f624a632102bd8ac18",
  name: "aprovarOSByToken",
  filename: "src/lib/os.functions.ts"
}, (opts) => aprovarOSByToken.__executeServer(opts));
const aprovarOSByToken = createServerFn({
  method: "POST"
}).inputValidator((d) => aprovarSchema.parse(d)).handler(aprovarOSByToken_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-ByiyHO4E.mjs");
  const {
    data: os,
    error: e1
  } = await supabaseAdmin.from("ordens_servico").select("id, empresa_id, aprovacao").eq("link_publico_token", data.token).maybeSingle();
  if (e1 || !os) throw new Error("OS não encontrada");
  let assinaturaUrl = null;
  if (data.aprovacao === "aprovada" && data.signatureBase64) {
    const b64 = data.signatureBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(b64, "base64");
    const path = `os/${os.empresa_id}/${os.id}-${Date.now()}.png`;
    const {
      error: upErr
    } = await supabaseAdmin.storage.from("assinaturas").upload(path, buffer, {
      contentType: "image/png",
      upsert: true
    });
    if (!upErr) {
      const {
        data: pub
      } = supabaseAdmin.storage.from("assinaturas").getPublicUrl(path);
      assinaturaUrl = pub.publicUrl;
    }
  }
  const {
    error: e2
  } = await supabaseAdmin.from("ordens_servico").update({
    aprovacao: data.aprovacao,
    aprovacao_obs: data.obs ?? null,
    aprovacao_em: (/* @__PURE__ */ new Date()).toISOString(),
    ...assinaturaUrl ? {
      assinatura_url: assinaturaUrl
    } : {}
  }).eq("id", os.id);
  if (e2) throw new Error(e2.message);
  return {
    ok: true
  };
});
export {
  aprovarOSByToken_createServerFn_handler,
  getOSByToken_createServerFn_handler
};
