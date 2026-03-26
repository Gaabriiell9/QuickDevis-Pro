"use client";

import { formatMoney } from "@/lib/utils/money";
import { formatDateShort } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PreviewOrg {
  name: string;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  siret?: string | null;
  vatNumber?: string | null;
}

export interface PreviewClient {
  displayName: string;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  email?: string | null;
  phone?: string | null;
  siret?: string | null;
  vatNumber?: string | null;
}

export interface PreviewItem {
  description: string;
  unit?: string | null;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

export interface PreviewTheme {
  primaryColor?: string;
  tableStyle?: "STRIPED" | "BORDERED" | "MINIMAL";
  fontStyle?: "SANS" | "SERIF";
}

export interface PreviewData {
  type: "quote" | "invoice";
  reference: string;
  status: string;
  subject?: string | null;
  issueDate?: string | null;
  validUntilDate?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  termsAndConditions?: string | null;
  org: PreviewOrg;
  client: PreviewClient | null;
  items: PreviewItem[];
  currency?: string;
  theme?: PreviewTheme;
}

// ─── Status map ───────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:          { label: "Brouillon",        color: "text-slate-600",   bg: "bg-slate-100"   },
  SENT:           { label: "Envoyé",            color: "text-blue-700",    bg: "bg-blue-50"     },
  ACCEPTED:       { label: "Accepté",           color: "text-emerald-700", bg: "bg-emerald-50"  },
  REJECTED:       { label: "Refusé",            color: "text-red-700",     bg: "bg-red-50"      },
  EXPIRED:        { label: "Expiré",            color: "text-amber-700",   bg: "bg-amber-50"    },
  CANCELLED:      { label: "Annulé",            color: "text-slate-600",   bg: "bg-slate-100"   },
  PAID:           { label: "Payée",             color: "text-emerald-700", bg: "bg-emerald-50"  },
  PARTIALLY_PAID: { label: "Part. payée",       color: "text-amber-700",   bg: "bg-amber-50"    },
  OVERDUE:        { label: "En retard",         color: "text-red-700",     bg: "bg-red-50"      },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcTotals(items: PreviewItem[], currency = "EUR") {
  let subtotal = 0;
  let vatAmount = 0;
  // Group VAT by rate for display
  const vatByRate: Record<number, number> = {};

  for (const item of items) {
    const s = (item.quantity || 0) * (item.unitPrice || 0);
    const v = s * ((item.vatRate || 0) / 100);
    subtotal += s;
    vatAmount += v;
    if (item.vatRate > 0) {
      vatByRate[item.vatRate] = (vatByRate[item.vatRate] ?? 0) + v;
    }
  }

  return { subtotal, vatAmount, total: subtotal + vatAmount, vatByRate };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface DocumentPreviewProps {
  data: PreviewData;
}

export function DocumentPreview({ data }: DocumentPreviewProps) {
  const { type, reference, status, subject, org, client, items } = data;
  const currency = data.currency ?? "EUR";
  const { subtotal, vatAmount, total, vatByRate } = calcTotals(items, currency);
  const allZeroVat = Object.keys(vatByRate).length === 0;
  const multipleVatRates = Object.keys(vatByRate).length > 1;
  const statusInfo = STATUS_MAP[status] ?? { label: status, color: "text-slate-600", bg: "bg-slate-100" };
  const endDateLabel = type === "quote" ? "Date de validité" : "Date d'échéance";
  const endDate = type === "quote" ? data.validUntilDate : data.dueDate;

  const primary = data.theme?.primaryColor ?? "#4f46e5";
  const tableStyle = data.theme?.tableStyle ?? "STRIPED";
  const fontFamily = data.theme?.fontStyle === "SERIF"
    ? "Georgia, 'Times New Roman', serif"
    : "system-ui, -apple-system, sans-serif";

  function rowBg(i: number): string {
    if (tableStyle === "MINIMAL") return "#ffffff";
    if (tableStyle === "BORDERED") return "#ffffff";
    return i % 2 === 0 ? "#ffffff" : "#f8fafc";
  }
  const cellBorder = tableStyle === "BORDERED" ? `1px solid #e2e8f0` : undefined;

  return (
    <div className="relative bg-white shadow-xl text-slate-800 overflow-hidden" style={{ fontFamily, fontSize: "13px", lineHeight: "1.6" }}>

      {/* Watermark */}
      {status === "DRAFT" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10" style={{ transform: "rotate(-35deg)" }}>
          <span className="font-black text-slate-200 select-none tracking-widest" style={{ fontSize: "96px" }}>BROUILLON</span>
        </div>
      )}

      <div className="p-10">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8">
          {/* Company name */}
          <div className="max-w-[55%]">
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">{org.name || "Votre Entreprise"}</h1>
            {org.address && <p className="text-slate-500 text-xs mt-1">{org.address}</p>}
            {(org.postalCode || org.city) && (
              <p className="text-slate-500 text-xs">{[org.postalCode, org.city].filter(Boolean).join(" ")}</p>
            )}
            {org.email && <p className="text-slate-500 text-xs">{org.email}</p>}
            {org.phone && <p className="text-slate-500 text-xs">{org.phone}</p>}
          </div>

          {/* Document type + reference + status */}
          <div className="text-right">
            <p className="font-black tracking-tight" style={{ fontSize: "36px", lineHeight: 1, color: primary }}>
              {type === "quote" ? "DEVIS" : "FACTURE"}
            </p>
            <p className="text-base font-bold text-slate-700 mt-1">{reference}</p>
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold mt-1.5", statusInfo.bg, statusInfo.color)}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Objet */}
        {subject && (
          <p className="text-slate-600 font-medium mb-5 text-sm">{subject}</p>
        )}

        {/* ── Émetteur / Client ── */}
        <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-5 mb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: primary }}>Émetteur</p>
            <p className="font-semibold text-slate-800">{org.name}</p>
            {org.address && <p className="text-slate-500">{org.address}</p>}
            {(org.postalCode || org.city) && (
              <p className="text-slate-500">{[org.postalCode, org.city].filter(Boolean).join(" ")}</p>
            )}
            {org.phone && <p className="text-slate-500">{org.phone}</p>}
            {org.email && <p className="text-slate-500">{org.email}</p>}
            {org.siret && <p className="text-slate-400 text-xs mt-1">SIRET : {org.siret}</p>}
            {org.vatNumber && <p className="text-slate-400 text-xs">N° TVA : {org.vatNumber}</p>}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: primary }}>Client</p>
            {client ? (
              <>
                <p className="font-semibold text-slate-800">{client.displayName}</p>
                {client.address && <p className="text-slate-500">{client.address}</p>}
                {(client.postalCode || client.city) && (
                  <p className="text-slate-500">{[client.postalCode, client.city].filter(Boolean).join(" ")}</p>
                )}
                {client.email && <p className="text-slate-500">{client.email}</p>}
                {client.phone && <p className="text-slate-500">{client.phone}</p>}
                {client.siret && <p className="text-slate-400 text-xs mt-1">SIRET : {client.siret}</p>}
                {client.vatNumber && <p className="text-slate-400 text-xs">N° TVA : {client.vatNumber}</p>}
              </>
            ) : (
              <p className="text-slate-400 italic text-sm">Client non sélectionné</p>
            )}
          </div>
        </div>

        {/* ── Dates ── */}
        <div className="flex gap-10 border-y border-slate-100 py-3 mb-6">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Date d'émission</p>
            <p className="font-semibold text-slate-700 mt-0.5">
              {data.issueDate ? formatDateShort(data.issueDate) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{endDateLabel}</p>
            <p className="font-semibold text-slate-700 mt-0.5">
              {endDate ? formatDateShort(endDate) : "—"}
            </p>
          </div>
        </div>

        {/* ── Items table ── */}
        <div className="mb-7">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: primary, color: "white" }}>
                <th className="text-left py-2.5 px-3 font-semibold text-xs w-8">#</th>
                <th className="text-left py-2.5 px-3 font-semibold text-xs">Désignation</th>
                <th className="text-center py-2.5 px-3 font-semibold text-xs w-16">Unité</th>
                <th className="text-right py-2.5 px-3 font-semibold text-xs w-12">Qté</th>
                <th className="text-right py-2.5 px-3 font-semibold text-xs w-24">Prix HT</th>
                <th className="text-right py-2.5 px-3 font-semibold text-xs w-24">Montant HT</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 italic text-sm">Aucune ligne ajoutée</td>
                </tr>
              ) : items.map((item, i) => (
                <tr key={i} style={{ backgroundColor: rowBg(i) }}>
                  <td className="py-2.5 px-3 text-slate-400" style={{ border: cellBorder }}>{i + 1}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800" style={{ border: cellBorder }}>{item.description || "—"}</td>
                  <td className="py-2.5 px-3 text-center text-slate-500" style={{ border: cellBorder }}>{item.unit || "—"}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600" style={{ border: cellBorder }}>{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600" style={{ border: cellBorder }}>{formatMoney(item.unitPrice, currency)}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-800" style={{ border: cellBorder }}>
                    {formatMoney((item.quantity || 0) * (item.unitPrice || 0), currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Totaux + conditions ── */}
        <div className="flex justify-between items-end gap-8">
          {/* Left: notes & conditions */}
          <div className="flex-1 min-w-0 space-y-4">
            {data.termsAndConditions && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conditions de règlement</p>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{data.termsAndConditions}</p>
              </div>
            )}
            {data.notes && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{data.notes}</p>
              </div>
            )}
          </div>

          {/* Right: totals */}
          <div className="min-w-[220px] shrink-0">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-8">
                <span className="text-slate-500">Total HT</span>
                <span className="font-semibold text-slate-700">{formatMoney(subtotal, currency)}</span>
              </div>

              {allZeroVat ? (
                <p className="text-xs text-slate-400 italic text-right leading-tight">
                  TVA non applicable,<br />art. 293 B du CGI
                </p>
              ) : multipleVatRates ? (
                Object.entries(vatByRate).map(([rate, amount]) => (
                  <div key={rate} className="flex justify-between gap-8">
                    <span className="text-slate-500">TVA {rate}%</span>
                    <span className="font-semibold text-slate-700">{formatMoney(amount, currency)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between gap-8">
                  <span className="text-slate-500">TVA {Object.keys(vatByRate)[0]}%</span>
                  <span className="font-semibold text-slate-700">{formatMoney(vatAmount, currency)}</span>
                </div>
              )}

              <div className="flex justify-between gap-8 border-t border-slate-200 pt-2.5 mt-1.5">
                <span className="font-bold text-slate-900">Total TTC</span>
                <span className="font-extrabold text-base" style={{ color: primary }}>{formatMoney(total, currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
