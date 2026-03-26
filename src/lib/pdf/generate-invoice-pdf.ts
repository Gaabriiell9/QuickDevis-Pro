import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PdfInvoiceData } from "./pdf-types";

// ── Layout Abby — structure identique à DocumentPreview ──────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [67, 56, 202];
}

const PAGE_W = 210;
const PAGE_H = 297;
const ML     = 18;
const MR     = 14;
const CW     = PAGE_W - ML - MR;
const SAFE_B = PAGE_H - 24;

const C = {
  black:     [15,  23,  42]  as [number, number, number],
  dark:      [30,  41,  59]  as [number, number, number],
  muted:     [100, 116, 139] as [number, number, number],
  subtle:    [148, 163, 184] as [number, number, number],
  border:    [226, 232, 240] as [number, number, number],
  bg:        [248, 250, 252] as [number, number, number],
  white:     [255, 255, 255] as [number, number, number],
  success:   [5,   150, 105] as [number, number, number],
  successBg: [209, 250, 229] as [number, number, number],
  warning:   [217, 119, 6]   as [number, number, number],
  warningBg: [254, 243, 199] as [number, number, number],
};

function fMoney(n: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency,
    minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(n).replace(/\u202F|\u00A0|\u2009/g, " ");
}
function fNum(n: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n)
    .replace(/\u202F|\u00A0|\u2009/g, " ");
}
function fDate(s: string | null | undefined) {
  if (!s) return "—";
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return "—"; }
}

export function generateInvoicePdf(data: PdfInvoiceData): void {
  const tpl        = data.templateConfig;
  const PRIMARY    = hexToRgb(tpl?.primaryColor ?? "#4338CA");
  const FONT       = tpl?.fontStyle === "SERIF" ? "times" : "helvetica";
  const tableStyle = tpl?.tableStyle ?? "STRIPED";
  const currency   = data.organization.currency ?? "EUR";
  const { organization: org, client, items } = data;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const checkBreak = (y: number, need: number): number => {
    if (y + need > SAFE_B) { doc.addPage(); return 20; }
    return y;
  };

  // ── HEADER ─────────────────────────────────────────────────────────────────
  let y = 18;

  // Org logo or name — left
  if (org.logo) {
    try {
      doc.addImage(org.logo, "", ML, 10, 42, 12);
    } catch {
      doc.setFont(FONT, "bold");
      doc.setFontSize(18);
      doc.setTextColor(C.black[0], C.black[1], C.black[2]);
      doc.text(org.name || "Votre Entreprise", ML, y);
    }
  } else {
    doc.setFont(FONT, "bold");
    doc.setFontSize(18);
    doc.setTextColor(C.black[0], C.black[1], C.black[2]);
    doc.text(org.name || "Votre Entreprise", ML, y);
  }

  doc.setFont(FONT, "bold");
  doc.setFontSize(32);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("FACTURE", PAGE_W - MR, y - 1, { align: "right" });

  y += 5;

  const orgLines = [
    org.address ? [org.address, org.postalCode, org.city].filter(Boolean).join(", ") : "",
    org.email ?? "",
    org.phone  ?? "",
  ].filter(Boolean);
  doc.setFont(FONT, "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  orgLines.forEach((l) => { doc.text(l, ML, y); y += 3.8; });

  let ry = 23;
  doc.setFont(FONT, "bold");
  doc.setFontSize(11);
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.text(data.reference, PAGE_W - MR, ry, { align: "right" });
  ry += 5;
  doc.setFont(FONT, "normal");
  doc.setFontSize(8);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  doc.text(`Émis le ${fDate(data.issueDate)}`, PAGE_W - MR, ry, { align: "right" });

  y = Math.max(y + 4, 44);

  // ── SEPARATOR ─────────────────────────────────────────────────────────────
  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PAGE_W - MR, y);
  y += 7;

  // ── ÉMETTEUR / CLIENT ─────────────────────────────────────────────────────
  const colW  = (CW - 6) / 2;
  const col2X = ML + colW + 6;

  doc.setFont(FONT, "bold");
  doc.setFontSize(7);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("ÉMETTEUR", ML, y);
  doc.text("CLIENT", col2X, y);
  y += 4;

  const colStartY = y;

  doc.setFont(FONT, "bold");
  doc.setFontSize(9);
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.text(org.name || "", ML, y);
  let ey = y + 4.5;
  const emLines = [
    org.address ?? "",
    [org.postalCode, org.city].filter(Boolean).join(" "),
    org.phone  ?? "",
    org.email  ?? "",
    org.siret     ? `SIRET : ${org.siret}`      : "",
    org.vatNumber ? `N° TVA : ${org.vatNumber}` : "",
  ].filter(Boolean);
  doc.setFont(FONT, "normal"); doc.setFontSize(7.5);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  emLines.forEach((l) => { doc.text(l, ML, ey); ey += 3.8; });

  let cy2 = colStartY;
  if (client) {
    doc.setFont(FONT, "bold"); doc.setFontSize(9);
    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.text(client.displayName, col2X, cy2);
    cy2 += 4.5;
    const clLines = [
      client.address ?? "",
      [client.postalCode, client.city].filter(Boolean).join(" "),
      client.email  ?? "",
      client.phone  ?? "",
      client.siret     ? `SIRET : ${client.siret}`      : "",
      client.vatNumber ? `N° TVA : ${client.vatNumber}` : "",
    ].filter(Boolean);
    doc.setFont(FONT, "normal"); doc.setFontSize(7.5);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    clLines.forEach((l) => { doc.text(l, col2X, cy2); cy2 += 3.8; });
  } else {
    doc.setFont(FONT, "normal"); doc.setFontSize(8);
    doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
    doc.text("Client non sélectionné", col2X, cy2);
  }

  y = Math.max(ey, cy2) + 6;

  // ── DATES BAR ─────────────────────────────────────────────────────────────
  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PAGE_W - MR, y);
  y += 4;

  const dateEntries: [string, string][] = [
    ["Date d'émission", fDate(data.issueDate)],
  ];
  if (data.dueDate) dateEntries.push(["Date d'échéance", fDate(data.dueDate)]);
  if (data.subject) dateEntries.push(["Objet", data.subject]);

  doc.setFont(FONT, "normal"); doc.setFontSize(7);
  doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
  let dx = ML;
  dateEntries.forEach(([label, value]) => {
    doc.text(label.toUpperCase(), dx, y);
    doc.setFont(FONT, "bold"); doc.setFontSize(8);
    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.text(value, dx, y + 4);
    doc.setFont(FONT, "normal"); doc.setFontSize(7);
    doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
    dx += 50;
  });
  y += 10;

  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PAGE_W - MR, y);
  y += 6;

  // ── PAIEMENT SUMMARY (si partiel ou overdue) ──────────────────────────────
  const showPaymentBar = data.amountPaid > 0 || data.status === "OVERDUE";
  if (showPaymentBar) {
    y = checkBreak(y, 18);
    const BAR_H = 14;
    const half  = (CW - 4) / 2;

    // Payé
    const paidBg: [number, number, number] = data.amountPaid > 0 ? C.successBg : [241, 245, 249];
    const paidFg: [number, number, number] = data.amountPaid > 0 ? C.success   : C.subtle;
    doc.setFillColor(paidBg[0], paidBg[1], paidBg[2]);
    doc.roundedRect(ML, y, half, BAR_H, 2, 2, "F");
    doc.setFont(FONT, "bold"); doc.setFontSize(7);
    doc.setTextColor(paidFg[0], paidFg[1], paidFg[2]);
    doc.text("PAYÉ", ML + 8, y + 5);
    doc.setFontSize(10);
    doc.text(fMoney(data.amountPaid, currency), ML + 8, y + 11);

    // Reste dû
    const dueBg: [number, number, number] = data.amountDue > 0 ? C.warningBg : [241, 245, 249];
    const dueFg: [number, number, number] = data.amountDue > 0 ? C.warning   : C.subtle;
    const dueX = ML + half + 4;
    doc.setFillColor(dueBg[0], dueBg[1], dueBg[2]);
    doc.roundedRect(dueX, y, half, BAR_H, 2, 2, "F");
    doc.setFont(FONT, "bold"); doc.setFontSize(7);
    doc.setTextColor(dueFg[0], dueFg[1], dueFg[2]);
    doc.text("RESTE DÛ", dueX + 8, y + 5);
    doc.setFontSize(10);
    doc.text(fMoney(data.amountDue, currency), dueX + 8, y + 11);

    y += BAR_H + 6;
  }

  // ── ITEMS TABLE ───────────────────────────────────────────────────────────
  const tableRows = items.map((item) => [
    item.description,
    item.unit ?? "—",
    fNum(item.quantity),
    fMoney(item.unitPrice, currency),
    `${fNum(item.vatRate)}%`,
    fMoney(item.subtotal, currency),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["DÉSIGNATION", "UNITÉ", "QTÉ", "PRIX HT", "TVA", "MONTANT HT"]],
    body: tableRows,
    margin: { left: ML, right: MR },
    tableWidth: CW,
    styles: {
      fontSize: 8,
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
      textColor: [C.dark[0], C.dark[1], C.dark[2]],
      lineColor: [C.border[0], C.border[1], C.border[2]],
      lineWidth: tableStyle === "BORDERED" ? 0.3 : 0,
      font: FONT,
    },
    headStyles: {
      fillColor: PRIMARY,
      textColor: C.white,
      fontStyle: "bold",
      fontSize: 7,
      cellPadding: { top: 5, bottom: 5, left: 3, right: 3 },
    },
    alternateRowStyles: tableStyle === "STRIPED"
      ? { fillColor: [C.bg[0], C.bg[1], C.bg[2]] }
      : { fillColor: C.white },
    columnStyles: {
      0: { cellWidth: 78 },
      1: { cellWidth: 16, halign: "center" },
      2: { cellWidth: 16, halign: "right" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 18, halign: "center" },
      5: { cellWidth: 22, halign: "right", fontStyle: "bold",
           textColor: [PRIMARY[0], PRIMARY[1], PRIMARY[2]] },
    },
    showHead: "everyPage",
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── TOTAUX ────────────────────────────────────────────────────────────────
  y = checkBreak(y, 65);

  const TOT_W = 80;
  const TOT_X = PAGE_W - MR - TOT_W;
  const ROW_H = 7;

  doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
  doc.rect(TOT_X, y, TOT_W, ROW_H, "F");
  doc.setFont(FONT, "normal"); doc.setFontSize(8);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  doc.text("Total HT", TOT_X + 3, y + 4.8);
  doc.setFont(FONT, "bold"); doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.text(fMoney(data.subtotal, currency), TOT_X + TOT_W - 3, y + 4.8, { align: "right" });
  y += ROW_H + 1;

  if (data.discountAmount > 0) {
    doc.setFont(FONT, "normal"); doc.setFontSize(8);
    doc.setTextColor(C.success[0], C.success[1], C.success[2]);
    doc.text("Remise", TOT_X + 3, y + 4.8);
    doc.setFont(FONT, "bold");
    doc.text(`- ${fMoney(data.discountAmount, currency)}`, TOT_X + TOT_W - 3, y + 4.8, { align: "right" });
    y += ROW_H + 1;
  }

  doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
  doc.rect(TOT_X, y, TOT_W, ROW_H, "F");
  doc.setFont(FONT, "normal"); doc.setFontSize(8);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  doc.text("TVA", TOT_X + 3, y + 4.8);
  doc.setFont(FONT, "bold"); doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.text(fMoney(data.vatAmount, currency), TOT_X + TOT_W - 3, y + 4.8, { align: "right" });
  y += ROW_H + 3;

  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.roundedRect(TOT_X, y, TOT_W, 13, 2, 2, "F");
  doc.setFont(FONT, "bold"); doc.setFontSize(9);
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.text("Total TTC", TOT_X + 4, y + 8.5);
  doc.setFontSize(11);
  doc.text(fMoney(data.total, currency), TOT_X + TOT_W - 3, y + 8.5, { align: "right", maxWidth: TOT_W - 30 });
  y += 20;

  // Conditions de paiement (left)
  if (data.termsAndConditions) {
    const condY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont(FONT, "bold"); doc.setFontSize(7);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    doc.text("CONDITIONS DE RÈGLEMENT", ML, condY);
    doc.setFont(FONT, "normal"); doc.setFontSize(7.5);
    doc.setTextColor(C.muted[0] + 20, C.muted[1] + 20, C.muted[2] + 20);
    const condLines = doc.splitTextToSize(data.termsAndConditions, TOT_X - ML - 8);
    doc.text(condLines, ML, condY + 5);
  }

  if (data.notes) {
    y = checkBreak(y, 20);
    doc.setFont(FONT, "bold"); doc.setFontSize(7);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    doc.text("NOTES", ML, y);
    doc.setFont(FONT, "normal"); doc.setFontSize(7.5);
    const noteLines = doc.splitTextToSize(data.notes, CW);
    doc.text(noteLines, ML, y + 5);
    y += 5 + noteLines.length * 4 + 6;
  }

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  const totalPages = (doc.internal as any).getNumberOfPages() as number;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
    doc.setLineWidth(0.3);
    doc.line(ML, PAGE_H - 14, PAGE_W - MR, PAGE_H - 14);
    doc.setFont(FONT, "normal"); doc.setFontSize(6.5);
    doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
    const parts = [org.name, org.siret ? `SIRET : ${org.siret}` : "", org.email ?? ""].filter(Boolean);
    doc.text(parts.join("   ·   "), ML, PAGE_H - 8, { maxWidth: 140 });
    doc.text(`Page ${i} / ${totalPages}`, PAGE_W - MR, PAGE_H - 8, { align: "right" });
  }

  doc.save(`${data.reference}.pdf`);
}
