import { StyleSheet } from "@react-pdf/renderer";

export const colors = {
  // Brand
  brand: "#4338CA",       // Indigo 700
  brandLight: "#EEF2FF",  // Indigo 50
  brandDark: "#312E81",   // Indigo 900
  brandAccent: "#6366F1", // Indigo 500

  // Neutrals
  black: "#0F172A",       // Slate 900
  dark: "#1E293B",        // Slate 800
  body: "#334155",        // Slate 700
  muted: "#64748B",       // Slate 500
  subtle: "#94A3B8",      // Slate 400
  border: "#E2E8F0",      // Slate 200
  borderLight: "#F1F5F9", // Slate 100
  bg: "#F8FAFC",          // Slate 50
  white: "#FFFFFF",

  // Status
  success: "#059669",     // Emerald 600
  successBg: "#D1FAE5",   // Emerald 100
  warning: "#D97706",     // Amber 600
  warningBg: "#FEF3C7",   // Amber 100
  danger: "#DC2626",      // Red 600
  dangerBg: "#FEE2E2",    // Red 100
  info: "#0284C7",        // Sky 600
  infoBg: "#E0F2FE",      // Sky 100
};

export const pdfStyles = StyleSheet.create({
  // PAGE
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: colors.body,
    backgroundColor: colors.white,
    paddingTop: 0,
    paddingBottom: 48,
    paddingLeft: 0,
    paddingRight: 0,
  },

  // BANDE LATÉRALE GAUCHE
  sideAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: colors.brand,
  },

  // CONTENU PRINCIPAL
  content: {
    marginLeft: 30,
    marginRight: 40,
    paddingTop: 40,
  },

  // ── HEADER ────────────────────────────────────────────────────────────────

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 36,
  },
  orgBlock: {
    flex: 1,
    paddingRight: 24,
  },
  orgName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  orgTagline: {
    fontSize: 7.5,
    color: colors.subtle,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  orgDetail: {
    fontSize: 8,
    color: colors.muted,
    lineHeight: 1.6,
  },
  docBlock: {
    alignItems: "flex-end",
    minWidth: 200,
  },
  docTypeBadge: {
    backgroundColor: colors.brand,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 10,
  },
  docTypeText: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  docRef: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    marginBottom: 3,
  },
  docDate: {
    fontSize: 8,
    color: colors.muted,
  },

  // ── SÉPARATEURS ───────────────────────────────────────────────────────────

  separator: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 24,
  },
  separatorThick: {
    borderBottomWidth: 2,
    borderBottomColor: colors.brand,
    marginBottom: 24,
    width: 48,
  },

  // ── BLOC CLIENT + DATES ───────────────────────────────────────────────────

  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 16,
  },
  clientBox: {
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
    paddingLeft: 12,
    paddingTop: 2,
    paddingBottom: 2,
  },
  clientLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: colors.brand,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  clientName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    marginBottom: 4,
  },
  clientDetail: {
    fontSize: 8,
    color: colors.muted,
    lineHeight: 1.7,
  },
  datesBox: {
    minWidth: 180,
    backgroundColor: colors.bg,
    borderRadius: 8,
    padding: 14,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dateRowLast: {
    borderBottomWidth: 0,
  },
  dateLabel: {
    fontSize: 7.5,
    color: colors.subtle,
  },
  dateValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
  },

  // ── OBJET ─────────────────────────────────────────────────────────────────

  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  subjectLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: colors.subtle,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subjectValue: {
    fontSize: 9,
    color: colors.dark,
    fontFamily: "Helvetica-Bold",
  },

  // ── TABLEAU ───────────────────────────────────────────────────────────────

  table: {
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.black,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableRowAlt: {
    backgroundColor: colors.bg,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },

  // Cellules
  cellDescription: { flex: 5 },
  cellQty: { flex: 1.2, textAlign: "center" },
  cellUnit: { flex: 1.2, textAlign: "center" },
  cellPrice: { flex: 2.5, textAlign: "right" },
  cellVat: { flex: 1.2, textAlign: "center" },
  cellTotal: { flex: 2.5, textAlign: "right" },

  cellText: {
    fontSize: 8.5,
    color: colors.dark,
  },
  cellTextMuted: {
    fontSize: 7.5,
    color: colors.muted,
    marginTop: 2,
  },
  cellTextBold: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
  },
  cellTextRight: {
    fontSize: 8.5,
    color: colors.dark,
    textAlign: "right",
  },
  cellTextBoldRight: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    textAlign: "right",
  },

  // ── TOTAUX ────────────────────────────────────────────────────────────────

  totalsWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    marginBottom: 24,
  },
  totalsBox: {
    width: 260,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  totalRowBordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  totalLabel: {
    fontSize: 8,
    color: colors.muted,
  },
  totalValue: {
    fontSize: 8.5,
    color: colors.dark,
    fontFamily: "Helvetica-Bold",
  },
  totalDiscountLabel: {
    fontSize: 8,
    color: colors.success,
  },
  totalDiscountValue: {
    fontSize: 8.5,
    color: colors.success,
    fontFamily: "Helvetica-Bold",
  },
  grandTotalBox: {
    backgroundColor: colors.brand,
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 6,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },
  grandTotalValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },

  // ── PAIEMENT ──────────────────────────────────────────────────────────────

  paymentSection: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  paymentCard: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  paymentCardPaid: {
    backgroundColor: colors.successBg,
  },
  paymentCardDue: {
    backgroundColor: colors.warningBg,
  },
  paymentCardZero: {
    backgroundColor: colors.borderLight,
  },
  paymentCardLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  paymentCardLabelPaid: { color: colors.success },
  paymentCardLabelDue: { color: colors.warning },
  paymentCardLabelZero: { color: colors.subtle },
  paymentCardAmount: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  paymentCardAmountPaid: { color: colors.success },
  paymentCardAmountDue: { color: colors.warning },
  paymentCardAmountZero: { color: colors.subtle },

  paidBanner: {
    backgroundColor: colors.successBg,
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.success,
  },
  paidBannerText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.success,
    textTransform: "uppercase",
    letterSpacing: 2,
  },

  // ── NOTES & CONDITIONS ────────────────────────────────────────────────────

  notesSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 8,
    color: colors.muted,
    lineHeight: 1.7,
  },
  legalSection: {
    backgroundColor: colors.bg,
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
  },
  legalText: {
    fontSize: 7,
    color: colors.subtle,
    lineHeight: 1.6,
  },

  // ── FOOTER ────────────────────────────────────────────────────────────────

  footer: {
    position: "absolute",
    bottom: 0,
    left: 6,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 34,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  footerLeft: {
    flex: 1,
  },
  footerText: {
    fontSize: 7,
    color: colors.subtle,
    lineHeight: 1.6,
  },
  footerBrand: {
    fontSize: 7,
    color: colors.brand,
    fontFamily: "Helvetica-Bold",
  },
  footerPage: {
    fontSize: 7,
    color: colors.subtle,
  },
});
