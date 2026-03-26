import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PdfQuoteData } from "./pdf-types";

// ── Layout Abby — structure identique à DocumentPreview ──────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [67, 56, 202];
}

const PAGE_W    = 210;
const PAGE_H    = 297;
const ML        = 18;   // margin left
const MR        = 14;   // margin right
const CW        = PAGE_W - ML - MR; // 178mm content width
const SAFE_B    = PAGE_H - 24;

const C = {
  black:  [15,  23,  42] as [number, number, number],
  dark:   [30,  41,  59] as [number, number, number],
  muted:  [100, 116, 139] as [number, number, number],
  subtle: [148, 163, 184] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  bg:     [248, 250, 252] as [number, number, number],
  white:  [255, 255, 255] as [number, number, number],
  success:[5,   150, 105] as [number, number, number],
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

export function generateQuotePdf(data: PdfQuoteData): void {
  const tpl          = data.templateConfig;
  const PRIMARY      = hexToRgb(tpl?.primaryColor ?? "#4338CA");
  const FONT         = tpl?.fontStyle === "SERIF" ? "times" : "helvetica";
  const tableStyle   = tpl?.tableStyle ?? "STRIPED";
  const currency     = data.organization.currency ?? "EUR";
  const { organization: org, client, items } = data;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const checkBreak = (y: number, need: number): number => {
    if (y + need > SAFE_B) { doc.addPage(); return 20; }
    return y;
  };

  // ── HEADER ─────────────────────────────────────────────────────────────────
  let y = 18;

  // Org name — left
  doc.setFont(FONT, "bold");
  doc.setFontSize(18);
  doc.setTextColor(C.black[0], C.black[1], C.black[2]);
  doc.text(org.name || "Votre Entreprise", ML, y);

  // "DEVIS" — right, primary color, very large
  doc.setFont(FONT, "bold");
  doc.setFontSize(32);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("DEVIS", PAGE_W - MR, y - 1, { align: "right" });

  y += 5;

  // Org details (small)
  const orgLines = [
    org.address ? [org.address, org.postalCode, org.city].filter(Boolean).join(", ") : "",
    org.email ?? "",
    org.phone  ?? "",
  ].filter(Boolean);
  doc.setFont(FONT, "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  orgLines.forEach((l) => { doc.text(l, ML, y); y += 3.8; });

  // Reference + status — right column, aligned with org details
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

  if (data.status === "DRAFT") {
    ry += 5;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(PAGE_W - MR - 24, ry - 4, 24, 6, 1.5, 1.5, "FD");
    doc.setFont(FONT, "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    doc.text("BROUILLON", PAGE_W - MR - 12, ry, { align: "center" });
  }

  y = Math.max(y + 4, 44);

  // ── SEPARATOR ─────────────────────────────────────────────────────────────
  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PAGE_W - MR, y);
  y += 7;

  // ── ÉMETTEUR / CLIENT ─────────────────────────────────────────────────────
  const colW = (CW - 6) / 2;
  const col2X = ML + colW + 6;

  // Label ÉMETTEUR
  doc.setFont(FONT, "bold");
  doc.setFontSize(7);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("ÉMETTEUR", ML, y);
  // Label CLIENT
  doc.text("CLIENT", col2X, y);
  y += 4;

  const colStartY = y;

  // Émetteur content
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
  doc.setFont(FONT, "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  emLines.forEach((l) => { doc.text(l, ML, ey); ey += 3.8; });

  // Client content
  let cy2 = colStartY;
  if (client) {
    doc.setFont(FONT, "bold");
    doc.setFontSize(9);
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
    doc.setFont(FONT, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    clLines.forEach((l) => { doc.text(l, col2X, cy2); cy2 += 3.8; });
  } else {
    doc.setFont(FONT, "normal");
    doc.setFontSize(8);
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
  if (data.validUntilDate) dateEntries.push(["Date de validité", fDate(data.validUntilDate)]);
  if (data.subject)        dateEntries.push(["Objet", data.subject]);

  doc.setFont(FONT, "normal");
  doc.setFontSize(7);
  doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
  let dx = ML;
  dateEntries.forEach(([label, value]) => {
    doc.text(label.toUpperCase(), dx, y);
    doc.setFont(FONT, "bold");
    doc.setFontSize(8);
    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.text(value, dx, y + 4);
    doc.setFont(FONT, "normal");
    doc.setFontSize(7);
    doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
    dx += 50;
  });
  y += 10;

  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PAGE_W - MR, y);
  y += 6;

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

  // ── TOTAUX + CONDITIONS ────────────────────────────────────────────────────
  y = checkBreak(y, 60);

  const TOT_W = 80;
  const TOT_X = PAGE_W - MR - TOT_W;
  const ROW_H = 7;

  // HT
  doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
  doc.rect(TOT_X, y, TOT_W, ROW_H, "F");
  doc.setFont(FONT, "normal"); doc.setFontSize(8);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  doc.text("Total HT", TOT_X + 3, y + 4.8);
  doc.setFont(FONT, "bold");
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.text(fMoney(data.subtotal, currency), TOT_X + TOT_W - 3, y + 4.8, { align: "right" });
  y += ROW_H + 1;

  // Remise
  if (data.discountAmount > 0) {
    doc.setFont(FONT, "normal"); doc.setFontSize(8);
    doc.setTextColor(C.success[0], C.success[1], C.success[2]);
    doc.text("Remise", TOT_X + 3, y + 4.8);
    doc.setFont(FONT, "bold");
    doc.text(`- ${fMoney(data.discountAmount, currency)}`, TOT_X + TOT_W - 3, y + 4.8, { align: "right" });
    y += ROW_H + 1;
  }

  // TVA
  doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
  doc.rect(TOT_X, y, TOT_W, ROW_H, "F");
  doc.setFont(FONT, "normal"); doc.setFontSize(8);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  doc.text("TVA", TOT_X + 3, y + 4.8);
  doc.setFont(FONT, "bold");
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.text(fMoney(data.vatAmount, currency), TOT_X + TOT_W - 3, y + 4.8, { align: "right" });
  y += ROW_H + 3;

  // TTC — primary bg
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.roundedRect(TOT_X, y, TOT_W, 13, 2, 2, "F");
  doc.setFont(FONT, "bold"); doc.setFontSize(9);
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.text("Total TTC", TOT_X + 4, y + 8.5);
  doc.setFontSize(11);
  doc.text(fMoney(data.total, currency), TOT_X + TOT_W - 3, y + 8.5, { align: "right", maxWidth: TOT_W - 30 });
  y += 20;

  // Conditions de paiement (left of totals)
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

  // ── BLOC SIGNATURE ─────────────────────────────────────────────────────────
  if (tpl?.showSignatureBlock !== false) {
    y = checkBreak(y, 48);
    y += 4;
    const SIG_W = (CW - 8) / 2;
    const SIG_H = 36;

    [[ML, "BON POUR ACCORD"], [ML + SIG_W + 8, "CACHET ET SIGNATURE"]].forEach(([sx, label]) => {
      const sxn = Number(sx);
      doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
      doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(sxn, y, SIG_W, SIG_H, 2, 2, "FD");
      doc.setFont(FONT, "bold"); doc.setFontSize(7);
      doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
      doc.text(String(label), sxn + 4, y + 7);
      if (label === "BON POUR ACCORD") {
        doc.setFont(FONT, "normal"); doc.setFontSize(7);
        doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
        doc.text("Date : _____ / _____ / __________", sxn + 4, y + 18);
        doc.setDrawColor(C.subtle[0], C.subtle[1], C.subtle[2]);
        doc.line(sxn + 4, y + 30, sxn + SIG_W - 4, y + 30);
        doc.setFontSize(6.5);
        doc.text("Signature", sxn + 4, y + 34);
      }
    });
  }

  // ── WATERMARK BROUILLON ────────────────────────────────────────────────────
  if (data.status === "DRAFT") {
    const pages = (doc.internal as any).getNumberOfPages() as number;
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      (doc as any).setGState(new (doc as any).GState({ opacity: 0.05 }));
      doc.setFont(FONT, "bold"); doc.setFontSize(72);
      doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
      doc.text("BROUILLON", PAGE_W / 2, PAGE_H / 2, { align: "center", angle: 45 });
      (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));
    }
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
    const footerParts = [org.name, org.siret ? `SIRET : ${org.siret}` : "", org.email ?? ""].filter(Boolean);
    doc.text(footerParts.join("   ·   "), ML, PAGE_H - 8, { maxWidth: 140 });
    doc.text(`Page ${i} / ${totalPages}`, PAGE_W - MR, PAGE_H - 8, { align: "right" });
  }

  doc.save(`${data.reference}.pdf`);
}
