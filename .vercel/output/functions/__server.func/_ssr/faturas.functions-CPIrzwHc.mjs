import { c as createServerRpc } from "./createServerRpc-Xf625QLu.mjs";
import { c as createServerFn } from "./server-Bvapkoxa.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
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
const getFaturaByToken_createServerFn_handler = createServerRpc({
  id: "830f307385a5592bec03c7953027a3f1d4ba5570b09c7363dd75252d248c7431",
  name: "getFaturaByToken",
  filename: "src/lib/faturas.functions.ts"
}, (opts) => getFaturaByToken.__executeServer(opts));
const getFaturaByToken = createServerFn({
  method: "POST"
}).inputValidator((d) => tokenSchema.parse(d)).handler(getFaturaByToken_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-ByiyHO4E.mjs");
  const {
    data: fatura,
    error
  } = await supabaseAdmin.from("faturas").select("*, empresa:empresas(*), cliente:clientes(*)").eq("link_publico_token", data.token).maybeSingle();
  if (error) throw new Error(error.message);
  if (!fatura) throw new Error("Fatura não encontrada");
  return fatura;
});
const signSchema = objectType({
  token: stringType().min(8).max(64),
  signatureBase64: stringType().min(100).max(2e6)
});
const signFaturaByToken_createServerFn_handler = createServerRpc({
  id: "375033eb17b3ecad9eb235252e3c8121130de373e62640fa4f09a30794369d28",
  name: "signFaturaByToken",
  filename: "src/lib/faturas.functions.ts"
}, (opts) => signFaturaByToken.__executeServer(opts));
const signFaturaByToken = createServerFn({
  method: "POST"
}).inputValidator((d) => signSchema.parse(d)).handler(signFaturaByToken_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-ByiyHO4E.mjs");
  const {
    data: fatura,
    error: e1
  } = await supabaseAdmin.from("faturas").select("id, empresa_id, status").eq("link_publico_token", data.token).maybeSingle();
  if (e1 || !fatura) throw new Error("Fatura não encontrada");
  const b64 = data.signatureBase64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(b64, "base64");
  const path = `${fatura.empresa_id}/${fatura.id}-${Date.now()}.png`;
  const {
    error: upErr
  } = await supabaseAdmin.storage.from("assinaturas").upload(path, buffer, {
    contentType: "image/png",
    upsert: true
  });
  if (upErr) throw new Error(upErr.message);
  const {
    data: pub
  } = supabaseAdmin.storage.from("assinaturas").getPublicUrl(path);
  const {
    error: e2
  } = await supabaseAdmin.from("faturas").update({
    assinatura_url: pub.publicUrl,
    status: "pago",
    pago_em: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", fatura.id);
  if (e2) throw new Error(e2.message);
  return {
    ok: true,
    url: pub.publicUrl
  };
});
export {
  getFaturaByToken_createServerFn_handler,
  signFaturaByToken_createServerFn_handler
};
