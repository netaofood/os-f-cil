import { j as jsPDF } from "../_libs/jspdf.mjs";
const brl = (n) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
function buildFaturaPdf(opts) {
  const { empresa, fatura, cliente, itens, publicUrl } = opts;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const cor = empresa.cor_destaque || "#f97316";
  doc.setFillColor(cor);
  doc.rect(0, 0, W, 28, "F");
  doc.setTextColor("#fff");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(empresa.nome, 12, 14);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    [empresa.cidade, empresa.estado].filter(Boolean).join("/") + (empresa.telefone ? ` · ${empresa.telefone}` : ""),
    12,
    21
  );
  doc.setTextColor("#111");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Fatura ${fatura.numero}`, 12, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Emitida em ${new Date(fatura.created_at).toLocaleDateString("pt-BR")}`,
    12,
    46
  );
  if (fatura.vencimento) {
    doc.text(
      `Vencimento: ${new Date(fatura.vencimento).toLocaleDateString("pt-BR")}`,
      12,
      52
    );
  }
  let y = 62;
  doc.setFont("helvetica", "bold");
  doc.text("Cliente", 12, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  doc.text(cliente?.nome ?? fatura.cliente_nome ?? "—", 12, y);
  if (cliente?.telefone || cliente?.email) {
    y += 5;
    doc.text([cliente.telefone, cliente.email].filter(Boolean).join(" · "), 12, y);
  }
  y += 12;
  doc.setFillColor(245, 245, 245);
  doc.rect(12, y - 5, W - 24, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Descrição", 14, y);
  doc.text("Qtd", 130, y, { align: "right" });
  doc.text("Preço", 160, y, { align: "right" });
  doc.text("Total", W - 14, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  y += 7;
  for (const it of itens) {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    const lines = doc.splitTextToSize(it.descricao, 110);
    doc.text(lines, 14, y);
    doc.text(String(it.quantidade), 130, y, { align: "right" });
    doc.text(brl(it.preco_unitario), 160, y, { align: "right" });
    doc.text(brl(it.total), W - 14, y, { align: "right" });
    y += Math.max(6, lines.length * 5);
  }
  y += 4;
  doc.setDrawColor(200);
  doc.line(120, y, W - 12, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL", 130, y, { align: "right" });
  doc.text(brl(Number(fatura.total)), W - 14, y, { align: "right" });
  y += 12;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Pagamento", 12, y);
  doc.setFont("helvetica", "normal");
  y += 5;
  if (empresa.pix) doc.text(`PIX: ${empresa.pix}`, 12, y), y += 5;
  if (empresa.banco) doc.text(`Banco: ${empresa.banco}`, 12, y), y += 5;
  if (fatura.forma_pagamento)
    doc.text(`Forma: ${fatura.forma_pagamento}`, 12, y), y += 5;
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text(`Status: ${fatura.status.toUpperCase()}`, 12, y);
  if (fatura.assinatura_url) {
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Assinado pelo cliente:", 12, y);
    try {
      doc.addImage(fatura.assinatura_url, "PNG", 12, y + 2, 60, 25);
    } catch {
      doc.text("(assinatura registrada)", 12, y + 8);
    }
  }
  doc.setFontSize(8);
  doc.setTextColor("#666");
  doc.text(`Visualize online: ${publicUrl}`, 12, 285);
  return doc;
}
export {
  buildFaturaPdf as b
};
