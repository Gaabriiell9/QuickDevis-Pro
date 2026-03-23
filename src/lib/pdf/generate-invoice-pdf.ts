import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PdfInvoiceData } from "./pdf-types";

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [67, 56, 202];
}

// ── LAYOUT ───────────────────────────────────────────────────────────────────
const PAGE_W    = 210;
const PAGE_H    = 297;
const MARGIN_L  = 18;
const MARGIN_R  = 14;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R; // 178mm

const FOOTER_H    = 16;
const SAFE_BOTTOM = PAGE_H - FOOTER_H - 8;      // 273mm

const COL_DESC  = 80;
const COL_QTY   = 18;
const COL_UNIT  = 18;
const COL_PRICE = 28;
const COL_VAT   = 14;
const COL_TOTAL = 20;

const TOT_W = 80;
const TOT_X = PAGE_W - MARGIN_R - TOT_W;
const ROW_H = 7;

const HEADER_BG_H = 56;

// ── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  black:     [15,  23,  42]  as [number, number, number],
  dark:      [30,  41,  59]  as [number, number, number],
  body:      [51,  65,  85]  as [number, number, number],
  muted:     [100, 116, 139] as [number, number, number],
  subtle:    [148, 163, 184] as [number, number, number],
  border:    [226, 232, 240] as [number, number, number],
  bg:        [248, 250, 252] as [number, number, number],
  white:     [255, 255, 255] as [number, number, number],
  success:   [5,   150, 105] as [number, number, number],
  successBg: [209, 250, 229] as [number, number, number],
  warning:   [217, 119, 6]   as [number, number, number],
  warningBg: [254, 243, 199] as [number, number, number],
  danger:    [220, 38,  38]  as [number, number, number],
};

// ── FORMATEURS ───────────────────────────────────────────────────────────────

function fixSpaces(s: string): string {
  return s.replace(/\u202F|\u00A0|\u2009/g, " ");
}

function fMoney(amount: number, currency = "EUR"): string {
  return fixSpaces(
    new Intl.NumberFormat("fr-FR", {
      style: "currency", currency,
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(amount)
  );
}

function fNumber(n: number): string {
  return fixSpaces(
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0, maximumFractionDigits: 2,
    }).format(n)
  );
}

function fDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return "—"; }
}

// ── GÉNÉRATEUR PRINCIPAL ──────────────────────────────────────────────────────

export function generateInvoicePdf(data: PdfInvoiceData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { organization: org, client, items } = data;
  const isOverdue = data.status === "OVERDUE";

  const tpl = data.templateConfig;

  // ── Config template ───────────────────────────────────────────────────────
  const style       = tpl?.style       ?? "CLASSIC";
  const tableStyle  = tpl?.tableStyle  ?? "STRIPED";
  const headerStyle = tpl?.headerStyle ?? "SPLIT";
  const fontStyle   = tpl?.fontStyle   ?? "SANS";
  const showLogo    = tpl?.showLogo    ?? true;
  const footerText  = tpl?.footerText;

  const PRIMARY: [number, number, number]   = tpl?.primaryColor   ? hexToRgb(tpl.primaryColor)   : [67, 56, 202];
  const SECONDARY: [number, number, number] = tpl?.secondaryColor ? hexToRgb(tpl.secondaryColor) : C.black;
  const FONT = fontStyle === "SERIF" ? "times" : "helvetica";

  // Colors derived from STYLE
  const onBold = style === "BOLD";
  const TEXT_ORG:    [number, number, number] = onBold ? C.white : SECONDARY;
  const TEXT_MUTED:  [number, number, number] = onBold ? [210, 210, 220] : C.muted;
  const TEXT_SUBTLE: [number, number, number] = onBold ? [180, 180, 195] : C.subtle;

  const ACCENT_W = style === "CLASSIC" ? 6 : style === "MODERN" ? 4 : 0;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const drawAccent = () => {
    if (ACCENT_W === 0) return;
    doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.rect(0, 0, ACCENT_W, PAGE_H, "F");
  };

  const checkBreak = (y: number, needed: number): number => {
    if (y + needed > SAFE_BOTTOM) {
      doc.addPage();
      drawAccent();
      return 20;
    }
    return y;
  };

  // ── Page 1 background (BOLD / MODERN) ────────────────────────────────────
  drawAccent();

  if (style === "BOLD") {
    doc.setFillColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
    doc.rect(0, 0, PAGE_W, HEADER_BG_H, "F");
  } else if (style === "MODERN") {
    const lr = Math.round(PRIMARY[0] * 0.1 + 255 * 0.9);
    const lg = Math.round(PRIMARY[1] * 0.1 + 255 * 0.9);
    const lb = Math.round(PRIMARY[2] * 0.1 + 255 * 0.9);
    doc.setFillColor(lr, lg, lb);
    doc.rect(ACCENT_W, 0, PAGE_W - ACCENT_W, HEADER_BG_H, "F");
  }

  // ── HEADER ───────────────────────────────────────────────────────────────
  let y = 18;

  const renderOrgName = (xLeft: number, yPos: number, centered: boolean): number => {
    const tx = centered ? PAGE_W / 2 : xLeft;
    const align = centered ? { align: "center" as const } : {};

    if (showLogo && org.logo) {
      try {
        const logoX = centered ? (PAGE_W - 30) / 2 : xLeft;
        doc.addImage(org.logo as string, "PNG", logoX, yPos - 8, 30, 15);
        return yPos + 10;
      } catch { /* fall through */ }
    }
    doc.setFont(FONT, "bold");
    doc.setFontSize(20);
    doc.setTextColor(TEXT_ORG[0], TEXT_ORG[1], TEXT_ORG[2]);
    doc.text(org.name, tx, yPos, align);
    return yPos + 7;
  };

  if (headerStyle === "CENTERED") {
    // ── CENTERED ──────────────────────────────────────────────────────────
    y = renderOrgName(MARGIN_L, y, true);

    if (org.siret || org.vatNumber) {
      const legal = [
        org.siret     ? `SIRET ${org.siret}`   : "",
        org.vatNumber ? `TVA ${org.vatNumber}` : "",
      ].filter(Boolean).join("   ·   ");
      doc.setFont(FONT, "normal");
      doc.setFontSize(7);
      doc.setTextColor(TEXT_SUBTLE[0], TEXT_SUBTLE[1], TEXT_SUBTLE[2]);
      doc.text(legal, PAGE_W / 2, y, { align: "center" });
      y += 5;
    }

    [
      [org.address, org.postalCode, org.city].filter(Boolean).join(", "),
      org.phone ?? "",
      org.email ?? "",
    ].filter(Boolean).forEach((line) => {
      doc.setFont(FONT, "normal");
      doc.setFontSize(8);
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      doc.text(line, PAGE_W / 2, y, { align: "center" });
      y += 4;
    });

    y += 3;

    if (style === "BOLD") {
      doc.setFont(FONT, "bold");
      doc.setFontSize(16);
      doc.setTextColor(C.white[0], C.white[1], C.white[2]);
      doc.text("FACTURE", PAGE_W / 2, y, { align: "center" });
      y += 7;
    } else {
      const BW = 44;
      const bx = (PAGE_W - BW) / 2;
      doc.setFillColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
      doc.roundedRect(bx, y, BW, 10, 2, 2, "F");
      doc.setFont(FONT, "bold");
      doc.setFontSize(11);
      doc.setTextColor(C.white[0], C.white[1], C.white[2]);
      doc.text("FACTURE", PAGE_W / 2, y + 6.8, { align: "center" });
      y += 13;
    }

    doc.setFont(FONT, "bold");
    doc.setFontSize(13);
    doc.setTextColor(TEXT_ORG[0], TEXT_ORG[1], TEXT_ORG[2]);
    doc.text(data.reference, PAGE_W / 2, y, { align: "center" });
    y += 5;

    doc.setFont(FONT, "normal");
    doc.setFontSize(8);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text(`Émise le ${fDate(data.issueDate)}`, PAGE_W / 2, y, { align: "center" });
    y += 6;

  } else {
    // ── SPLIT or LEFT ─────────────────────────────────────────────────────
    y = renderOrgName(MARGIN_L, y, false);

    if (org.siret || org.vatNumber) {
      const legal = [
        org.siret     ? `SIRET ${org.siret}`   : "",
        org.vatNumber ? `TVA ${org.vatNumber}` : "",
      ].filter(Boolean).join("   ·   ");
      doc.setFont(FONT, "normal");
      doc.setFontSize(7);
      doc.setTextColor(TEXT_SUBTLE[0], TEXT_SUBTLE[1], TEXT_SUBTLE[2]);
      doc.text(legal, MARGIN_L, y);
      y += 5;
    }

    [
      [org.address, org.postalCode, org.city].filter(Boolean).join(", "),
      org.phone ?? "",
      org.email ?? "",
    ].filter(Boolean).forEach((line) => {
      doc.setFont(FONT, "normal");
      doc.setFontSize(8);
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      doc.text(line, MARGIN_L, y);
      y += 4;
    });

    const badgeY = 14;
    if (style === "BOLD") {
      doc.setFont(FONT, "bold");
      doc.setFontSize(headerStyle === "LEFT" ? 16 : 18);
      doc.setTextColor(C.white[0], C.white[1], C.white[2]);
      doc.text("FACTURE", PAGE_W - MARGIN_R, badgeY + 7, { align: "right" });
    } else if (headerStyle === "LEFT") {
      const BW = 36;
      const bx = PAGE_W - MARGIN_R - BW;
      doc.setFillColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
      doc.roundedRect(bx, badgeY, BW, 8, 2, 2, "F");
      doc.setFont(FONT, "bold");
      doc.setFontSize(9);
      doc.setTextColor(C.white[0], C.white[1], C.white[2]);
      doc.text("FACTURE", bx + BW / 2, badgeY + 5.5, { align: "center" });
    } else {
      // SPLIT
      const BW = 44;
      const bx = PAGE_W - MARGIN_R - BW;
      doc.setFillColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
      doc.roundedRect(bx, badgeY, BW, 10, 2, 2, "F");
      doc.setFont(FONT, "bold");
      doc.setFontSize(11);
      doc.setTextColor(C.white[0], C.white[1], C.white[2]);
      doc.text("FACTURE", bx + BW / 2, badgeY + 6.8, { align: "center" });
    }

    doc.setFont(FONT, "bold");
    doc.setFontSize(13);
    doc.setTextColor(TEXT_ORG[0], TEXT_ORG[1], TEXT_ORG[2]);
    doc.text(data.reference, PAGE_W - MARGIN_R, badgeY + 16, { align: "right" });

    doc.setFont(FONT, "normal");
    doc.setFontSize(8);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text(`Émise le ${fDate(data.issueDate)}`, PAGE_W - MARGIN_R, badgeY + 21, { align: "right" });
  }

  // ── SÉPARATEUR ───────────────────────────────────────────────────────────
  y = Math.max(y + 4, 52);
  const sepColor: [number, number, number] = style === "BOLD" ? C.white : C.border;
  doc.setDrawColor(sepColor[0], sepColor[1], sepColor[2]);
  doc.setLineWidth(style === "MINIMAL" ? 0.2 : 0.3);
  doc.line(MARGIN_L, y, PAGE_W - MARGIN_R, y);
  y += 8;

  // ── BLOC CLIENT + DATES ───────────────────────────────────────────────────
  const sectionY    = y;
  const DATES_BOX_W = 65;
  const datesX      = PAGE_W - MARGIN_R - DATES_BOX_W;
  const clientMaxW  = datesX - MARGIN_L - 8;

  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(MARGIN_L, sectionY, 1.2, 30, "F");

  doc.setFont(FONT, "bold");
  doc.setFontSize(7);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("FACTURER À", MARGIN_L + 4, sectionY + 5);

  doc.setFont(FONT, "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
  doc.text(client.displayName, MARGIN_L + 4, sectionY + 11, { maxWidth: clientMaxW });

  doc.setFont(FONT, "normal");
  doc.setFontSize(8);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  let cy = sectionY + 17;
  [
    client.address ?? "",
    [client.postalCode, client.city].filter(Boolean).join(" "),
    client.email ?? "",
    client.phone ?? "",
    client.siret     ? `SIRET : ${client.siret}`      : "",
    client.vatNumber ? `N° TVA : ${client.vatNumber}` : "",
  ].filter(Boolean).forEach((line) => {
    doc.text(line, MARGIN_L + 4, cy, { maxWidth: clientMaxW });
    cy += 4;
  });

  // Dates box
  const dateEntries: [string, string, boolean][] = [
    ["Date d'émission", fDate(data.issueDate), false],
  ];
  if (data.dueDate)        dateEntries.push(["Échéance",  fDate(data.dueDate),    isOverdue]);
  if (data.quoteReference) dateEntries.push(["Devis N°",  data.quoteReference,    false]);
  if (data.subject)        dateEntries.push(["Objet",     data.subject,           false]);

  const dateBoxH = Math.max(30, 6 + dateEntries.length * 8 + 4);
  doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
  doc.roundedRect(datesX, sectionY, DATES_BOX_W, dateBoxH, 2, 2, "F");

  dateEntries.forEach(([label, value, isRed], i) => {
    const dy = sectionY + 7 + i * 8;
    doc.setFont(FONT, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
    doc.text(label, datesX + 4, dy);
    doc.setFont(FONT, "bold");
    doc.setFontSize(8);
    const vc = isRed ? C.danger : C.dark;
    doc.setTextColor(vc[0], vc[1], vc[2]);
    const val = value.length > 22 ? value.substring(0, 20) + "…" : value;
    doc.text(val, datesX + DATES_BOX_W - 3, dy, { align: "right" });
    if (i < dateEntries.length - 1) {
      doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
      doc.setLineWidth(0.2);
      doc.line(datesX + 3, dy + 3, datesX + DATES_BOX_W - 3, dy + 3);
    }
  });

  y = Math.max(cy, sectionY + dateBoxH) + 10;

  // ── TABLEAU LIGNES ────────────────────────────────────────────────────────
  const tableRows = items.map((item) => [
    item.description,
    fNumber(item.quantity),
    item.unit ?? "—",
    fMoney(item.unitPrice),
    `${fNumber(item.vatRate)}%`,
    fMoney(item.subtotal),
  ]);

  const isMinimalTable  = tableStyle === "MINIMAL";
  const isBorderedTable = tableStyle === "BORDERED";

  autoTable(doc, {
    startY: y,
    head: [["DESCRIPTION", "QTÉ", "UNITÉ", "PRIX HT", "TVA%", "TOTAL HT"]],
    body: tableRows,
    margin: { left: MARGIN_L, right: MARGIN_R },
    tableWidth: CONTENT_W,
    styles: {
      fontSize: 8,
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
      textColor: [C.dark[0], C.dark[1], C.dark[2]],
      lineColor: [C.border[0], C.border[1], C.border[2]],
      lineWidth: isMinimalTable ? 0 : isBorderedTable ? 0.3 : 0.1,
      overflow: "linebreak",
      font: FONT,
    },
    headStyles: {
      fillColor: isMinimalTable
        ? [255, 255, 255] as [number, number, number]
        : [SECONDARY[0], SECONDARY[1], SECONDARY[2]],
      textColor: isMinimalTable
        ? [PRIMARY[0], PRIMARY[1], PRIMARY[2]]
        : [C.white[0], C.white[1], C.white[2]],
      fontStyle: "bold",
      fontSize: 7,
      cellPadding: { top: 5, bottom: 5, left: 3, right: 3 },
      halign: "left",
      lineWidth: isMinimalTable
        ? ({ top: 0, right: 0, bottom: 0.4, left: 0 } as any)
        : 0,
      lineColor: isMinimalTable
        ? [PRIMARY[0], PRIMARY[1], PRIMARY[2]]
        : [C.border[0], C.border[1], C.border[2]],
    },
    alternateRowStyles: tableStyle === "STRIPED"
      ? { fillColor: [C.bg[0], C.bg[1], C.bg[2]] }
      : { fillColor: [255, 255, 255] as [number, number, number] },
    columnStyles: {
      0: { cellWidth: COL_DESC,  overflow: "linebreak" },
      1: { cellWidth: COL_QTY,   halign: "center" },
      2: { cellWidth: COL_UNIT,  halign: "center" },
      3: { cellWidth: COL_PRICE, halign: "right" },
      4: { cellWidth: COL_VAT,   halign: "center" },
      5: { cellWidth: COL_TOTAL, halign: "right", fontStyle: "bold",
           textColor: [PRIMARY[0], PRIMARY[1], PRIMARY[2]] },
    },
    showHead: "everyPage",
    tableLineColor: [C.border[0], C.border[1], C.border[2]],
    tableLineWidth: isMinimalTable ? 0 : 0.1,
    didDrawPage: () => { drawAccent(); },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── TOTAUX ────────────────────────────────────────────────────────────────
  y = checkBreak(y, 80);

  // Sous-total HT
  doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
  doc.rect(TOT_X, y, TOT_W, ROW_H, "F");
  doc.setFont(FONT, "normal");
  doc.setFontSize(8);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  doc.text("Sous-total HT", TOT_X + 3, y + 4.8);
  doc.setFont(FONT, "bold");
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.text(fMoney(data.subtotal), TOT_X + TOT_W - 3, y + 4.8, { align: "right" });
  y += ROW_H + 1;

  // Remise
  if (data.discountAmount > 0) {
    doc.setFont(FONT, "normal");
    doc.setFontSize(8);
    doc.setTextColor(C.success[0], C.success[1], C.success[2]);
    doc.text("Remise", TOT_X + 3, y + 4.8);
    doc.setFont(FONT, "bold");
    doc.text(`- ${fMoney(data.discountAmount)}`, TOT_X + TOT_W - 3, y + 4.8, { align: "right" });
    y += ROW_H + 1;
  }

  // TVA
  doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
  doc.rect(TOT_X, y, TOT_W, ROW_H, "F");
  doc.setFont(FONT, "normal");
  doc.setFontSize(8);
  doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
  doc.text("TVA", TOT_X + 3, y + 4.8);
  doc.setFont(FONT, "bold");
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.text(fMoney(data.vatAmount), TOT_X + TOT_W - 3, y + 4.8, { align: "right" });
  y += ROW_H + 3;

  // Grand total TTC
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.roundedRect(TOT_X, y, TOT_W, 13, 2, 2, "F");
  doc.setFont(FONT, "bold");
  doc.setFontSize(9);
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.text("Total TTC", TOT_X + 4, y + 8.5);
  doc.setFontSize(12);
  doc.text(fMoney(data.total), TOT_X + TOT_W - 3, y + 8.5, {
    align: "right",
    maxWidth: TOT_W - 32,
  });
  y += 18;

  // ── BLOC PAIEMENT ─────────────────────────────────────────────────────────
  y = checkBreak(y, 20);
  const PAY_W = (TOT_W - 4) / 2;

  doc.setFillColor(C.successBg[0], C.successBg[1], C.successBg[2]);
  doc.roundedRect(TOT_X, y, PAY_W, 14, 2, 2, "F");
  doc.setFont(FONT, "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(C.success[0], C.success[1], C.success[2]);
  doc.text("MONTANT PAYÉ", TOT_X + PAY_W / 2, y + 5, { align: "center" });
  doc.setFontSize(10);
  doc.text(fMoney(data.amountPaid), TOT_X + PAY_W / 2, y + 11, {
    align: "center",
    maxWidth: PAY_W - 4,
  });

  const dueColor: [number, number, number]     = data.amountDue > 0 ? C.warningBg : C.bg;
  const dueTextColor: [number, number, number] = data.amountDue > 0 ? C.warning   : C.subtle;
  doc.setFillColor(dueColor[0], dueColor[1], dueColor[2]);
  doc.roundedRect(TOT_X + PAY_W + 4, y, PAY_W, 14, 2, 2, "F");
  doc.setFont(FONT, "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(dueTextColor[0], dueTextColor[1], dueTextColor[2]);
  doc.text("RESTE DÛ", TOT_X + PAY_W + 4 + PAY_W / 2, y + 5, { align: "center" });
  doc.setFontSize(10);
  doc.text(fMoney(data.amountDue), TOT_X + PAY_W + 4 + PAY_W / 2, y + 11, {
    align: "center",
    maxWidth: PAY_W - 4,
  });
  y += 20;

  // Bandeau FACTURE PAYÉE INTÉGRALEMENT
  if (data.amountDue === 0 && data.amountPaid > 0) {
    y = checkBreak(y, 14);
    doc.setFillColor(C.successBg[0], C.successBg[1], C.successBg[2]);
    doc.roundedRect(MARGIN_L, y, CONTENT_W, 10, 2, 2, "F");
    doc.setDrawColor(C.success[0], C.success[1], C.success[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(MARGIN_L, y, CONTENT_W, 10, 2, 2, "S");
    doc.setFont(FONT, "bold");
    doc.setFontSize(9);
    doc.setTextColor(C.success[0], C.success[1], C.success[2]);
    doc.text("FACTURE PAYÉE INTÉGRALEMENT", PAGE_W / 2, y + 6.5, { align: "center" });
    y += 16;
  }

  // ── CONDITIONS DE PAIEMENT ────────────────────────────────────────────────
  if (data.termsAndConditions) {
    y = checkBreak(y, 30);
    doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_L, y, PAGE_W - MARGIN_R, y);
    y += 6;

    const termsLines = doc.splitTextToSize(data.termsAndConditions, CONTENT_W - 10);
    const termsBoxH  = 14 + termsLines.length * 4.5;
    y = checkBreak(y, termsBoxH);

    doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
    doc.roundedRect(MARGIN_L, y, CONTENT_W, termsBoxH, 2, 2, "F");
    doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(MARGIN_L, y, CONTENT_W, termsBoxH, 2, 2, "S");

    doc.setFont(FONT, "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text("CONDITIONS DE PAIEMENT", MARGIN_L + 4, y + 7);
    doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_L + 2, y + 10, MARGIN_L + CONTENT_W - 2, y + 10);

    doc.setFont(FONT, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(C.body[0], C.body[1], C.body[2]);
    doc.text(termsLines, MARGIN_L + 4, y + 16);
    y += termsBoxH + 6;
  }

  // ── NOTES ─────────────────────────────────────────────────────────────────
  if (data.notes) {
    y = checkBreak(y, 20);
    if (!data.termsAndConditions) {
      doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
      doc.setLineWidth(0.3);
      doc.line(MARGIN_L, y, PAGE_W - MARGIN_R, y);
      y += 6;
    }
    doc.setFont(FONT, "bold");
    doc.setFontSize(7);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    doc.text("NOTES", MARGIN_L, y);
    y += 4;
    doc.setFont(FONT, "normal");
    doc.setFontSize(8);
    doc.setTextColor(C.body[0], C.body[1], C.body[2]);
    const noteLines = doc.splitTextToSize(data.notes, CONTENT_W);
    doc.text(noteLines, MARGIN_L, y);
    y += noteLines.length * 4.5 + 6;
  }

  // ── MENTIONS LÉGALES ──────────────────────────────────────────────────────
  y = checkBreak(y, 18);
  const legalText =
    "En cas de retard de paiement, des pénalités de retard seront exigibles au taux de trois fois le taux d'intérêt légal. " +
    "Une indemnité forfaitaire pour frais de recouvrement de 40 € sera due de plein droit (art. L441-10 C. com.).";
  const legalLines = doc.splitTextToSize(legalText, CONTENT_W - 8);
  const legalBoxH  = 6 + legalLines.length * 4;

  doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
  doc.roundedRect(MARGIN_L, y, CONTENT_W, legalBoxH, 2, 2, "F");
  doc.setFont(FONT, "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);
  doc.text(legalLines, MARGIN_L + 4, y + 4.5);
  y += legalBoxH + 6;

  // ── COORDONNÉES BANCAIRES ─────────────────────────────────────────────────
  if ((tpl?.showBankDetails ?? false) && org.iban) {
    y = checkBreak(y, 32);
    doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_L, y, PAGE_W - MARGIN_R, y);
    y += 6;

    doc.setFont(FONT, "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text("COORDONNÉES BANCAIRES", MARGIN_L, y);
    y += 5;

    const bankLines: [string, string][] = [["IBAN", org.iban]];
    if (org.bic) bankLines.push(["BIC", org.bic]);

    const bankBoxH = 8 + bankLines.length * 9;
    doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
    doc.roundedRect(MARGIN_L, y, CONTENT_W, bankBoxH, 2, 2, "F");
    doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(MARGIN_L, y, CONTENT_W, bankBoxH, 2, 2, "S");

    bankLines.forEach(([label, value], i) => {
      const by = y + 7 + i * 9;
      doc.setFont(FONT, "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
      doc.text(`${label} :`, MARGIN_L + 4, by);
      doc.setFont(FONT, "bold");
      doc.setFontSize(8);
      doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
      doc.text(value, MARGIN_L + 20, by);
    });

    y += bankBoxH + 8;
  }

  // ── FILIGRANE BROUILLON ────────────────────────────────────────────────────
  if (data.status === "DRAFT" && tpl?.showStamp !== false) {
    const totalPagesWm = (doc.internal as any).getNumberOfPages() as number;
    for (let i = 1; i <= totalPagesWm; i++) {
      doc.setPage(i);
      (doc as any).setGState(new (doc as any).GState({ opacity: 0.06 }));
      doc.setFont(FONT, "bold");
      doc.setFontSize(72);
      doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
      doc.text("BROUILLON", PAGE_W / 2, PAGE_H / 2, {
        align: "center",
        angle: 45,
        maxWidth: 200,
      });
      (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));
    }
  }

  // ── FOOTER (toutes les pages) ─────────────────────────────────────────────
  const totalPages = (doc.internal as any).getNumberOfPages() as number;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
    doc.rect(ACCENT_W, 281, PAGE_W - ACCENT_W, 16, "F");

    doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_L, 282, PAGE_W - MARGIN_R, 282);

    doc.setFont(FONT, "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(C.subtle[0], C.subtle[1], C.subtle[2]);

    if (footerText) {
      doc.text(footerText, MARGIN_L, 288, { maxWidth: 140 });
    } else {
      const parts = [
        org.name,
        org.siret     ? `SIRET : ${org.siret}`     : "",
        org.vatNumber ? `TVA : ${org.vatNumber}` : "",
        org.email ?? "",
      ].filter(Boolean);
      doc.text(parts.join("   ·   "), MARGIN_L, 288, { maxWidth: 140 });
    }

    doc.text(`Page ${i} / ${totalPages}`, PAGE_W - MARGIN_R, 288, { align: "right" });
  }

  doc.save(`${data.reference}.pdf`);
}
