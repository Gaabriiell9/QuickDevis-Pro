import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PdfQuoteData, TemplateConfig, PdfOrganization, PdfItem } from "./pdf-types";

// ── Constants ──────────────────────────────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const ML = 18;
const MR = 14;
const CW = PAGE_W - ML - MR; // 178
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

// ── Utilities ──────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [67, 56, 202];
}

function lighten(rgb: [number, number, number], factor: number): [number, number, number] {
  return [
    Math.min(255, Math.round(rgb[0] + (255 - rgb[0]) * factor)),
    Math.min(255, Math.round(rgb[1] + (255 - rgb[1]) * factor)),
    Math.min(255, Math.round(rgb[2] + (255 - rgb[2]) * factor)),
  ];
}

function fMoney(n: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(n).replace(/\u202F|\u00A0|\u2009/g, " ");
}
function fNum(n: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n).replace(/\u202F|\u00A0|\u2009/g, " ");
}
function fDate(s: string | null | undefined) {
  if (!s) return "—";
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return "—"; }
}

function checkBreak(doc: jsPDF, y: number, need: number): number {
  if (y + need > SAFE_B) { doc.addPage(); return 20; }
  return y;
}

// ── Shared sections ────────────────────────────────────────────────────────────

function drawItemsTable(
  doc: jsPDF,
  items: PdfItem[],
  startY: number,
  PRIMARY: [number, number, number],
  SECONDARY: [number, number, number],
  FONT: string,
  tableStyle: string,
  style: string,
  currency: string
): number {
  const tableRows = items.map((item) => [
    item.description,
    item.unit ?? "—",
    fNum(item.quantity),
    fMoney(item.unitPrice, currency),
    `${fNum(item.vatRate)}%`,
    fMoney(item.subtotal, currency),
  ]);

  let headFill: [number, number, number];
  let headText: [number, number, number] = C.white;

  if (style === "MINIMAL") {
    headFill = C.white;
    headText = PRIMARY;
  } else if (style === "BOLD") {
    headFill = SECONDARY;
  } else {
    headFill = PRIMARY;
  }

  const altFill: [number, number, number] = style === "BOLD"
    ? lighten(SECONDARY, 0.94)
    : style === "MODERN"
    ? lighten(PRIMARY, 0.95)
    : C.bg;

  autoTable(doc, {
    startY,
    head: [["DÉSIGNATION", "UNITÉ", "QTÉ", "PRIX HT", "TVA", "MONTANT HT"]],
    body: tableRows,
    margin: { left: ML, right: MR },
    tableWidth: CW,
    styles: {
      fontSize: 8,
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
      textColor: [C.dark[0], C.dark[1], C.dark[2]],
      lineColor: [C.border[0], C.border[1], C.border[2]],
      lineWidth: (style === "MINIMAL" || tableStyle === "BORDERED") ? 0.2 : 0,
      font: FONT,
    },
    headStyles: {
      fillColor: headFill,
      textColor: headText,
      fontStyle: "bold",
      fontSize: 7,
      cellPadding: { top: 5, bottom: 5, left: 3, right: 3 },
      lineWidth: style === "MINIMAL" ? 0.5 : 0,
      lineColor: style === "MINIMAL" ? PRIMARY : undefined,
    },
    alternateRowStyles: tableStyle === "STRIPED" || style === "MODERN" || style === "BOLD"
      ? { fillColor: altFill }
      : { fillColor: C.white },
    columnStyles: {
      0: { cellWidth: 78 },
      1: { cellWidth: 16, halign: "center" },
      2: { cellWidth: 16, halign: "right" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 18, halign: "center" },
      5: { cellWidth: 22, halign: "right", fontStyle: "bold", textColor: [PRIMARY[0], PRIMARY[1], PRIMARY[2]] },
    },
    showHead: "everyPage",
  });

  return (doc as any).lastAutoTable.finalY + 8;
}

function drawTotals(
  doc: jsPDF,
  data: { subtotal: number; discountAmount: number; vatAmount: number; total: number },
  y: number,
  PRIMARY: [number, number, number],
  SECONDARY: [number, number, number],
  FONT: string,
  style: string,
  currency: string
): number {
  const TOT_W = 80;
  const TOT_X = PAGE_W - MR - TOT_W;
  const ROW_H = 7;

  if (style === "MINIMAL") {
    doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
    doc.setLineWidth(0.2);
    doc.line(TOT_X, y, TOT_X + TOT_W, y);
    y += 2;

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

    doc.setFont(FONT, "normal"); doc.setFontSize(8);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    doc.text("TVA", TOT_X + 3, y + 4.8);
    doc.setFont(FONT, "bold"); doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.text(fMoney(data.vatAmount, currency), TOT_X + TOT_W - 3, y + 4.8, { align: "right" });
    y += ROW_H + 2;

    doc.setDrawColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.setLineWidth(0.5);
    doc.line(TOT_X, y, TOT_X + TOT_W, y);
    y += 3;

    doc.setFont(FONT, "bold"); doc.setFontSize(10);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text("Total TTC", TOT_X + 3, y + 5);
    doc.setFontSize(11);
    doc.text(fMoney(data.total, currency), TOT_X + TOT_W - 3, y + 5, { align: "right" });
    y += 14;

  } else if (style === "BOLD") {
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

    doc.setFillColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
    doc.roundedRect(TOT_X, y, TOT_W, 13, 2, 2, "F");
    doc.setFont(FONT, "bold"); doc.setFontSize(9);
    doc.setTextColor(C.white[0], C.white[1], C.white[2]);
    doc.text("Total TTC", TOT_X + 4, y + 8.5);
    doc.setFontSize(11);
    doc.text(fMoney(data.total, currency), TOT_X + TOT_W - 3, y + 8.5, { align: "right" });
    y += 20;

  } else {
    // CLASSIC / MODERN
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
    doc.text(fMoney(data.total, currency), TOT_X + TOT_W - 3, y + 8.5, { align: "right" });
    y += 20;
  }

  return y;
}

function drawNotes(doc: jsPDF, data: PdfQuoteData, y: number, FONT: string): number {
  const TOT_X = PAGE_W - MR - 80;
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
    y = checkBreak(doc, y, 20);
    doc.setFont(FONT, "bold"); doc.setFontSize(7);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    doc.text("NOTES", ML, y);
    doc.setFont(FONT, "normal"); doc.setFontSize(7.5);
    const noteLines = doc.splitTextToSize(data.notes, CW);
    doc.text(noteLines, ML, y + 5);
    y += 5 + noteLines.length * 4 + 6;
  }
  return y;
}

function drawSignatureBlock(
  doc: jsPDF,
  y: number,
  FONT: string,
  style: string,
  PRIMARY: [number, number, number],
  SECONDARY: [number, number, number]
): number {
  y = checkBreak(doc, y, 48);
  y += 4;
  const SIG_W = (CW - 8) / 2;
  const SIG_H = 36;

  (["BON POUR ACCORD", "CACHET ET SIGNATURE"] as const).forEach((label, idx) => {
    const sxn = idx === 0 ? ML : ML + SIG_W + 8;
    if (style === "BOLD") {
      const bgLight = lighten(SECONDARY, 0.96);
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.setDrawColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
    } else {
      doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
      doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
    }
    doc.setLineWidth(0.3);
    doc.roundedRect(sxn, y, SIG_W, SIG_H, 2, 2, "FD");

    doc.setFont(FONT, "bold"); doc.setFontSize(7);
    if (style === "BOLD") {
      doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
    } else {
      doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    }
    doc.text(label, sxn + 4, y + 7);

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

  return y + SIG_H + 6;
}

function drawFooter(
  doc: jsPDF,
  org: PdfOrganization,
  FONT: string,
  style: string,
  PRIMARY: [number, number, number],
  SECONDARY: [number, number, number],
  config: TemplateConfig
): void {
  const totalPages = (doc.internal as any).getNumberOfPages() as number;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    if (style === "BOLD") {
      doc.setFillColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
      doc.rect(0, PAGE_H - 18, PAGE_W, 18, "F");
      doc.setFont(FONT, "normal"); doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      const footerParts = [
        org.name,
        org.siret ? `SIRET : ${org.siret}` : "",
        org.email ?? "",
        config.footerText ?? "",
      ].filter(Boolean);
      doc.text(footerParts.join("   ·   "), ML, PAGE_H - 7, { maxWidth: 140 });
      doc.text(`Page ${i} / ${totalPages}`, PAGE_W - MR, PAGE_H - 7, { align: "right" });
    } else if (style === "MINIMAL") {
      doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
      doc.setLineWidth(0.2);
      doc.line(ML, PAGE_H - 14, PAGE_W - MR, PAGE_H - 14);
      doc.setFont(FONT, "normal"); doc.setFontSize(6.5);
      doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
      const footerParts = [org.name, org.siret ? `SIRET : ${org.siret}` : "", org.email ?? ""].filter(Boolean);
      doc.text(footerParts.join("   ·   "), ML, PAGE_H - 8, { maxWidth: 140 });
      doc.text(`Page ${i} / ${totalPages}`, PAGE_W - MR, PAGE_H - 8, { align: "right" });
    } else {
      doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
      doc.setLineWidth(0.3);
      doc.line(ML, PAGE_H - 14, PAGE_W - MR, PAGE_H - 14);
      doc.setFont(FONT, "normal"); doc.setFontSize(6.5);
      doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
      const footerParts = [org.name, org.siret ? `SIRET : ${org.siret}` : "", org.email ?? ""].filter(Boolean);
      doc.text(footerParts.join("   ·   "), ML, PAGE_H - 8, { maxWidth: 140 });
      doc.text(`Page ${i} / ${totalPages}`, PAGE_W - MR, PAGE_H - 8, { align: "right" });
    }
  }
}

function drawWatermark(doc: jsPDF, FONT: string, PRIMARY: [number, number, number]): void {
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

// ── CLASSIC LAYOUT ─────────────────────────────────────────────────────────────
function renderClassicLayout(doc: jsPDF, data: PdfQuoteData, config: TemplateConfig): void {
  const PRIMARY = hexToRgb(config.primaryColor ?? "#4338CA");
  const SECONDARY = hexToRgb(config.secondaryColor ?? "#1E293B");
  const FONT = config.fontStyle === "SERIF" ? "times" : "helvetica";
  const currency = "EUR";
  const { organization: org, client, items } = data;
  const docType = "DEVIS";
  let y = 18;

  if (org.logo) {
    try { doc.addImage(org.logo, "", ML, 10, 42, 12); }
    catch {
      doc.setFont(FONT, "bold"); doc.setFontSize(18);
      doc.setTextColor(C.black[0], C.black[1], C.black[2]);
      doc.text(org.name || "Votre Entreprise", ML, y);
    }
  } else {
    doc.setFont(FONT, "bold"); doc.setFontSize(18);
    doc.setTextColor(C.black[0], C.black[1], C.black[2]);
    doc.text(org.name || "Votre Entreprise", ML, y);
  }

  doc.setFont(FONT, "bold"); doc.setFontSize(32);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text(docType, PAGE_W - MR, y - 1, { align: "right" });
  y += 5;

  const orgLines = [
    org.address ? [org.address, org.postalCode, org.city].filter(Boolean).join(", ") : "",
    org.email ?? "",
    org.phone ?? "",
  ].filter(Boolean);
  doc.setFont(FONT, "normal"); doc.setFontSize(7.5);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  orgLines.forEach((l) => { doc.text(l, ML, y); y += 3.8; });

  let ry = 23;
  doc.setFont(FONT, "bold"); doc.setFontSize(11);
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.text(data.reference, PAGE_W - MR, ry, { align: "right" });
  ry += 5;
  doc.setFont(FONT, "normal"); doc.setFontSize(8);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  doc.text(`Émis le ${fDate(data.issueDate)}`, PAGE_W - MR, ry, { align: "right" });

  if (data.status === "DRAFT") {
    ry += 5;
    doc.setFillColor(248, 250, 252); doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
    doc.setLineWidth(0.3); doc.roundedRect(PAGE_W - MR - 24, ry - 4, 24, 6, 1.5, 1.5, "FD");
    doc.setFont(FONT, "bold"); doc.setFontSize(6.5);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    doc.text("BROUILLON", PAGE_W - MR - 12, ry, { align: "center" });
  }

  y = Math.max(y + 4, 44);
  doc.setDrawColor(C.border[0], C.border[1], C.border[2]); doc.setLineWidth(0.3);
  doc.line(ML, y, PAGE_W - MR, y); y += 7;

  const colW = (CW - 6) / 2;
  const col2X = ML + colW + 6;
  doc.setFont(FONT, "bold"); doc.setFontSize(7);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("ÉMETTEUR", ML, y);
  doc.text("CLIENT", col2X, y);
  y += 4;
  const colStartY = y;

  doc.setFont(FONT, "bold"); doc.setFontSize(9);
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.text(org.name || "", ML, y);
  let ey = y + 4.5;
  const emLines = [
    org.address ?? "",
    [org.postalCode, org.city].filter(Boolean).join(" "),
    org.phone ?? "",
    org.email ?? "",
    org.siret ? `SIRET : ${org.siret}` : "",
    org.vatNumber ? `N° TVA : ${org.vatNumber}` : "",
  ].filter(Boolean);
  doc.setFont(FONT, "normal"); doc.setFontSize(7.5);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  emLines.forEach((l) => { doc.text(l, ML, ey); ey += 3.8; });

  let cy2 = colStartY;
  if (client) {
    doc.setFont(FONT, "bold"); doc.setFontSize(9); doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.text(client.displayName, col2X, cy2); cy2 += 4.5;
    const clLines = [
      client.address ?? "",
      [client.postalCode, client.city].filter(Boolean).join(" "),
      client.email ?? "",
      client.phone ?? "",
      client.siret ? `SIRET : ${client.siret}` : "",
      client.vatNumber ? `N° TVA : ${client.vatNumber}` : "",
    ].filter(Boolean);
    doc.setFont(FONT, "normal"); doc.setFontSize(7.5); doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    clLines.forEach((l) => { doc.text(l, col2X, cy2); cy2 += 3.8; });
  }
  y = Math.max(ey, cy2) + 6;

  doc.setDrawColor(C.border[0], C.border[1], C.border[2]); doc.setLineWidth(0.3);
  doc.line(ML, y, PAGE_W - MR, y); y += 4;
  const dateEntries: [string, string][] = [["Date d'émission", fDate(data.issueDate)]];
  if (data.validUntilDate) dateEntries.push(["Date de validité", fDate(data.validUntilDate)]);
  if (data.subject) dateEntries.push(["Objet", data.subject]);
  doc.setFont(FONT, "normal"); doc.setFontSize(7); doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
  let dx = ML;
  dateEntries.forEach(([label, value]) => {
    doc.text(label.toUpperCase(), dx, y);
    doc.setFont(FONT, "bold"); doc.setFontSize(8); doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.text(value, dx, y + 4);
    doc.setFont(FONT, "normal"); doc.setFontSize(7); doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
    dx += 50;
  });
  y += 10;
  doc.setDrawColor(C.border[0], C.border[1], C.border[2]); doc.setLineWidth(0.3);
  doc.line(ML, y, PAGE_W - MR, y); y += 6;

  y = drawItemsTable(doc, items, y, PRIMARY, SECONDARY, FONT, config.tableStyle ?? "STRIPED", "CLASSIC", currency);
  y = checkBreak(doc, y, 60);
  y = drawTotals(doc, data, y, PRIMARY, SECONDARY, FONT, "CLASSIC", currency);
  y = drawNotes(doc, data, y, FONT);
  if (config.showSignatureBlock !== false) {
    y = drawSignatureBlock(doc, y, FONT, "CLASSIC", PRIMARY, SECONDARY);
  }
  if (data.status === "DRAFT") drawWatermark(doc, FONT, PRIMARY);
  drawFooter(doc, org, FONT, "CLASSIC", PRIMARY, SECONDARY, config);
}

// ── MODERN LAYOUT ──────────────────────────────────────────────────────────────
function renderModernLayout(doc: jsPDF, data: PdfQuoteData, config: TemplateConfig): void {
  const PRIMARY = hexToRgb(config.primaryColor ?? "#4338CA");
  const SECONDARY = hexToRgb(config.secondaryColor ?? "#1E293B");
  const FONT = config.fontStyle === "SERIF" ? "times" : "helvetica";
  const currency = "EUR";
  const { organization: org, client, items } = data;
  const docType = "DEVIS";

  const headerBg = lighten(PRIMARY, 0.94);
  doc.setFillColor(headerBg[0], headerBg[1], headerBg[2]);
  doc.rect(0, 0, PAGE_W, 48, "F");

  let y = 16;

  if (org.logo) {
    try { doc.addImage(org.logo, "", ML, 8, 42, 12); }
    catch {
      doc.setFont(FONT, "bold"); doc.setFontSize(16);
      doc.setTextColor(C.black[0], C.black[1], C.black[2]);
      doc.text(org.name || "Votre Entreprise", ML, y);
    }
  } else {
    doc.setFont(FONT, "bold"); doc.setFontSize(16);
    doc.setTextColor(C.black[0], C.black[1], C.black[2]);
    doc.text(org.name || "Votre Entreprise", ML, y);
  }
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(ML, y + 2, 60, 0.8, "F");

  const badgeW = 42;
  const badgeH = 10;
  const badgeX = PAGE_W - MR - badgeW;
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.roundedRect(badgeX, y - 7, badgeW, badgeH, 3, 3, "F");
  doc.setFont(FONT, "bold"); doc.setFontSize(9);
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.text(docType, badgeX + badgeW / 2, y - 1, { align: "center" });

  doc.setFont(FONT, "bold"); doc.setFontSize(10);
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.text(data.reference, PAGE_W - MR, y + 7, { align: "right" });
  doc.setFont(FONT, "normal"); doc.setFontSize(7.5);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  doc.text(`Émis le ${fDate(data.issueDate)}`, PAGE_W - MR, y + 12, { align: "right" });

  y += 8;
  const orgLines = [
    org.address ? [org.address, org.postalCode, org.city].filter(Boolean).join(", ") : "",
    org.email ?? "",
    org.phone ?? "",
  ].filter(Boolean);
  doc.setFont(FONT, "normal"); doc.setFontSize(7);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  orgLines.forEach((l) => { doc.text(l, ML, y); y += 3.5; });

  y = Math.max(y + 2, 54);

  const BOX_X = ML;
  const BOX_W = (CW - 6) / 2;
  const BOX_H = 28;

  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(BOX_X, y, BOX_W, BOX_H, 2, 2, "D");

  doc.setFont(FONT, "bold"); doc.setFontSize(7);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("FACTURER À", BOX_X + 4, y + 6);

  if (client) {
    doc.setFont(FONT, "bold"); doc.setFontSize(9);
    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.text(client.displayName, BOX_X + 4, y + 12);
    let cy = y + 17;
    const clLines = [
      client.address ?? "",
      [client.postalCode, client.city].filter(Boolean).join(" "),
      client.email ?? "",
    ].filter(Boolean);
    doc.setFont(FONT, "normal"); doc.setFontSize(7.5);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    clLines.forEach((l) => { if (cy < y + BOX_H - 2) { doc.text(l, BOX_X + 4, cy); cy += 3.5; } });
  }

  const dateX = ML + BOX_W + 10;
  let dy = y + 4;
  const dateEntries: [string, string][] = [["Date d'émission", fDate(data.issueDate)]];
  if (data.validUntilDate) dateEntries.push(["Validité", fDate(data.validUntilDate)]);
  if (data.subject) dateEntries.push(["Objet", data.subject]);
  dateEntries.forEach(([label, value]) => {
    doc.setFont(FONT, "normal"); doc.setFontSize(7);
    doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
    doc.text(label.toUpperCase(), dateX, dy);
    doc.setFont(FONT, "bold"); doc.setFontSize(8.5);
    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.text(value, dateX, dy + 4.5);
    dy += 10;
  });

  y += BOX_H + 10;

  y = drawItemsTable(doc, items, y, PRIMARY, SECONDARY, FONT, config.tableStyle ?? "STRIPED", "MODERN", currency);
  y = checkBreak(doc, y, 60);
  y = drawTotals(doc, data, y, PRIMARY, SECONDARY, FONT, "MODERN", currency);
  y = drawNotes(doc, data, y, FONT);
  if (config.showSignatureBlock !== false) {
    y = drawSignatureBlock(doc, y, FONT, "MODERN", PRIMARY, SECONDARY);
  }
  if (data.status === "DRAFT") drawWatermark(doc, FONT, PRIMARY);
  drawFooter(doc, org, FONT, "MODERN", PRIMARY, SECONDARY, config);
}

// ── MINIMAL LAYOUT ─────────────────────────────────────────────────────────────
function renderMinimalLayout(doc: jsPDF, data: PdfQuoteData, config: TemplateConfig): void {
  const PRIMARY = hexToRgb(config.primaryColor ?? "#4338CA");
  const SECONDARY = hexToRgb(config.secondaryColor ?? "#1E293B");
  const FONT = config.fontStyle === "SERIF" ? "times" : "helvetica";
  const currency = "EUR";
  const { organization: org, client, items } = data;
  const docType = "DEVIS";

  let y = 22;

  if (org.logo) {
    try { doc.addImage(org.logo, "", ML, 10, 42, 12); }
    catch {
      doc.setFont(FONT, "bold"); doc.setFontSize(20);
      doc.setTextColor(C.black[0], C.black[1], C.black[2]);
      doc.text(org.name || "Votre Entreprise", ML, y);
    }
  } else {
    doc.setFont(FONT, "bold"); doc.setFontSize(20);
    doc.setTextColor(C.black[0], C.black[1], C.black[2]);
    doc.text(org.name || "Votre Entreprise", ML, y);
  }

  let sy = y + 5;
  if (org.siret) {
    doc.setFont(FONT, "normal"); doc.setFontSize(7);
    doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
    doc.text(`SIRET : ${org.siret}`, ML, sy);
    sy += 3.5;
  }
  if (org.vatNumber) {
    doc.setFont(FONT, "normal"); doc.setFontSize(7);
    doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
    doc.text(`N° TVA : ${org.vatNumber}`, ML, sy);
  }

  doc.setFont(FONT, "bold"); doc.setFontSize(11);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text(docType, PAGE_W - MR, y - 2, { align: "right" });

  doc.setFont(FONT, "bold"); doc.setFontSize(16);
  doc.setTextColor(C.black[0], C.black[1], C.black[2]);
  doc.text(data.reference, PAGE_W - MR, y + 6, { align: "right" });

  y = Math.max(y + 16, 46);

  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PAGE_W - MR, y);
  y += 8;

  doc.setFont(FONT, "bold"); doc.setFontSize(7);
  doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
  doc.text("FACTURER À", ML, y);

  let datesStr = `Émis le ${fDate(data.issueDate)}`;
  if (data.validUntilDate) datesStr += `   ·   Valable jusqu'au ${fDate(data.validUntilDate)}`;
  doc.setFont(FONT, "normal"); doc.setFontSize(7.5);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  doc.text(datesStr, PAGE_W - MR, y, { align: "right" });

  y += 5;
  if (client) {
    doc.setFont(FONT, "bold"); doc.setFontSize(11);
    doc.setTextColor(C.black[0], C.black[1], C.black[2]);
    doc.text(client.displayName, ML, y); y += 5;
    const clLines = [
      client.address ?? "",
      [client.postalCode, client.city].filter(Boolean).join(" "),
      client.email ?? "",
      client.phone ?? "",
    ].filter(Boolean);
    doc.setFont(FONT, "normal"); doc.setFontSize(8);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    clLines.forEach((l) => { doc.text(l, ML, y); y += 3.8; });
  }

  if (data.subject) {
    y += 3;
    doc.setFont(FONT, "bold"); doc.setFontSize(7);
    doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
    doc.text("OBJET", ML, y); y += 4;
    doc.setFont(FONT, "normal"); doc.setFontSize(8.5);
    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.text(data.subject, ML, y); y += 6;
  }

  y += 4;
  y = drawItemsTable(doc, items, y, PRIMARY, SECONDARY, FONT, "MINIMAL", "MINIMAL", currency);
  y = checkBreak(doc, y, 50);
  y = drawTotals(doc, data, y, PRIMARY, SECONDARY, FONT, "MINIMAL", currency);
  y = drawNotes(doc, data, y, FONT);
  if (data.status === "DRAFT") drawWatermark(doc, FONT, PRIMARY);
  drawFooter(doc, org, FONT, "MINIMAL", PRIMARY, SECONDARY, config);
}

// ── BOLD LAYOUT ────────────────────────────────────────────────────────────────
function renderBoldLayout(doc: jsPDF, data: PdfQuoteData, config: TemplateConfig): void {
  const PRIMARY = hexToRgb(config.primaryColor ?? "#4338CA");
  const SECONDARY = hexToRgb(config.secondaryColor ?? "#1E293B");
  const FONT = config.fontStyle === "SERIF" ? "times" : "helvetica";
  const currency = "EUR";
  const { organization: org, client, items } = data;
  const docType = "DEVIS";

  const HEADER_H = 58;
  doc.setFillColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
  doc.rect(0, 0, PAGE_W, HEADER_H, "F");

  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(0, HEADER_H - 4, PAGE_W, 4, "F");

  const PAD = 20;
  let logoY = 16;

  if (org.logo) {
    try { doc.addImage(org.logo, "", PAD, 10, 42, 12); logoY = 26; }
    catch {
      doc.setFont(FONT, "bold"); doc.setFontSize(22);
      doc.setTextColor(C.white[0], C.white[1], C.white[2]);
      doc.text(org.name || "Votre Entreprise", PAD, logoY);
    }
  } else {
    doc.setFont(FONT, "bold"); doc.setFontSize(22);
    doc.setTextColor(C.white[0], C.white[1], C.white[2]);
    doc.text(org.name || "Votre Entreprise", PAD, logoY);
  }

  let sy = logoY + 6;
  const whiteOpaque: [number, number, number] = [180, 190, 210];
  doc.setFont(FONT, "normal"); doc.setFontSize(7.5);
  doc.setTextColor(whiteOpaque[0], whiteOpaque[1], whiteOpaque[2]);
  if (org.siret) { doc.text(`SIRET : ${org.siret}`, PAD, sy); sy += 3.8; }
  if (org.vatNumber) { doc.text(`N° TVA : ${org.vatNumber}`, PAD, sy); }

  doc.setFont(FONT, "bold"); doc.setFontSize(28);
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.text(docType, PAGE_W - PAD, 24, { align: "right" });

  doc.setFont(FONT, "normal"); doc.setFontSize(14);
  doc.setTextColor(whiteOpaque[0], whiteOpaque[1], whiteOpaque[2]);
  doc.text(data.reference, PAGE_W - PAD, 34, { align: "right" });

  doc.setFont(FONT, "normal"); doc.setFontSize(8);
  doc.text(`Émis le ${fDate(data.issueDate)}`, PAGE_W - PAD, 41, { align: "right" });

  let y = HEADER_H + 12;

  const BOX_W = (CW - 6) / 2;
  const BOX_H = 32;
  const BOX_Y = y;

  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(ML, BOX_Y, 4, BOX_H, "F");

  doc.setFillColor(C.white[0], C.white[1], C.white[2]);
  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.3);
  doc.rect(ML + 4, BOX_Y, BOX_W - 4, BOX_H, "FD");

  doc.setFont(FONT, "bold"); doc.setFontSize(7);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("FACTURER À", ML + 8, BOX_Y + 7);

  if (client) {
    doc.setFont(FONT, "bold"); doc.setFontSize(12);
    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.text(client.displayName, ML + 8, BOX_Y + 14);
    let cy = BOX_Y + 20;
    const clLines = [
      client.address ?? "",
      [client.postalCode, client.city].filter(Boolean).join(" "),
      client.email ?? "",
      client.phone ?? "",
    ].filter(Boolean);
    doc.setFont(FONT, "normal"); doc.setFontSize(7.5);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    clLines.forEach((l) => { if (cy < BOX_Y + BOX_H - 2) { doc.text(l, ML + 8, cy); cy += 3.5; } });
  }

  const dateX = ML + BOX_W + 10;
  let dy = y + 4;
  const dateEntries: [string, string][] = [["Date d'émission", fDate(data.issueDate)]];
  if (data.validUntilDate) dateEntries.push(["Validité", fDate(data.validUntilDate)]);
  if (data.subject) dateEntries.push(["Objet", data.subject]);
  dateEntries.forEach(([label, value]) => {
    doc.setFont(FONT, "bold"); doc.setFontSize(7);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text(label.toUpperCase(), dateX, dy);
    doc.setFont(FONT, "bold"); doc.setFontSize(9);
    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.text(value, dateX, dy + 5);
    dy += 12;
  });

  y += BOX_H + 10;

  y = drawItemsTable(doc, items, y, PRIMARY, SECONDARY, FONT, config.tableStyle ?? "STRIPED", "BOLD", currency);
  y = checkBreak(doc, y, 65);
  y = drawTotals(doc, data, y, PRIMARY, SECONDARY, FONT, "BOLD", currency);
  y = drawNotes(doc, data, y, FONT);
  if (config.showSignatureBlock !== false) {
    y = drawSignatureBlock(doc, y, FONT, "BOLD", PRIMARY, SECONDARY);
  }
  if (data.status === "DRAFT") drawWatermark(doc, FONT, PRIMARY);
  drawFooter(doc, org, FONT, "BOLD", PRIMARY, SECONDARY, config);
}

// ── MAIN EXPORT ────────────────────────────────────────────────────────────────
export function generateQuotePdf(data: PdfQuoteData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const config = data.templateConfig ?? {
    style: "CLASSIC" as const,
    primaryColor: "#4338CA",
    secondaryColor: "#1E293B",
    showLogo: true,
    showSignatureBlock: true,
    showBankDetails: false,
    showStamp: false,
    headerStyle: "SPLIT" as const,
    tableStyle: "STRIPED" as const,
    fontStyle: "SANS" as const,
  };
  const style = config.style ?? "CLASSIC";

  switch (style) {
    case "MODERN":  renderModernLayout(doc, data, config);  break;
    case "MINIMAL": renderMinimalLayout(doc, data, config); break;
    case "BOLD":    renderBoldLayout(doc, data, config);    break;
    default:        renderClassicLayout(doc, data, config); break;
  }

  doc.save(`${data.reference}.pdf`);
}
