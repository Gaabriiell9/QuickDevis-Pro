"use client";

export interface TemplateConfig {
  style: "CLASSIC" | "MODERN" | "MINIMAL" | "BOLD";
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  showLogo: boolean;
  showSignatureBlock: boolean;
  showBankDetails: boolean;
  showStamp: boolean;
  headerStyle: "LEFT" | "CENTERED" | "SPLIT";
  tableStyle: "BORDERED" | "STRIPED" | "MINIMAL";
  fontStyle: "SANS" | "SERIF";
  footerText?: string;
  defaultNotes?: string;
  defaultTerms?: string;
}

export function TemplatePreview({ config }: { config: TemplateConfig }) {
  const primary = config.primaryColor;
  const secondary = config.secondaryColor;

  const hex2rgba = (hex: string, alpha: number) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!r) return `rgba(67,56,202,${alpha})`;
    return `rgba(${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)},${alpha})`;
  };

  if (config.style === "BOLD") {
    return (
      <div className="bg-slate-100 p-6 rounded-xl flex items-center justify-center min-h-[600px]">
        <div className="bg-white shadow-xl relative overflow-hidden" style={{ width: "320px", height: "452px", borderRadius: "4px" }}>
          {/* Full header bg — secondary */}
          <div style={{ backgroundColor: secondary, height: "90px", position: "relative" }}>
            {/* Accent bar bottom */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "5px", backgroundColor: primary }} />
            <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ width: "90px", height: "11px", backgroundColor: "white", borderRadius: "2px", opacity: 0.9 }} />
                <div style={{ width: "60px", height: "6px", backgroundColor: "white", borderRadius: "2px", opacity: 0.45, marginTop: "6px" }} />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ width: "55px", height: "13px", backgroundColor: "white", borderRadius: "2px", opacity: 0.95 }} />
                <div style={{ width: "70px", height: "7px", backgroundColor: "white", borderRadius: "2px", opacity: 0.5, marginTop: "5px", marginLeft: "auto" }} />
              </div>
            </div>
          </div>

          {/* Client box with left border */}
          <div style={{ margin: "12px 16px 0 20px", display: "flex", gap: "8px" }}>
            <div style={{ display: "flex", flex: 1 }}>
              <div style={{ width: "4px", backgroundColor: primary, flexShrink: 0 }} />
              <div style={{ flex: 1, border: "1px solid #E2E8F0", borderLeft: "none", padding: "7px 8px" }}>
                <div style={{ width: "35px", height: "5px", backgroundColor: primary, borderRadius: "1px", opacity: 0.7, marginBottom: "5px" }} />
                <div style={{ width: "75px", height: "8px", backgroundColor: secondary, borderRadius: "2px", opacity: 0.8 }} />
                <div style={{ width: "55px", height: "5px", backgroundColor: "#CBD5E1", borderRadius: "2px", marginTop: "4px" }} />
              </div>
            </div>
            <div style={{ width: "85px" }}>
              {[1, 2].map(i => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <div style={{ width: "40px", height: "4px", backgroundColor: primary, borderRadius: "1px", opacity: 0.6, marginBottom: "2px" }} />
                  <div style={{ width: "60px", height: "6px", backgroundColor: secondary, borderRadius: "1px", opacity: 0.7 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Table — secondary header */}
          <div style={{ margin: "12px 16px 0 20px" }}>
            <div style={{ backgroundColor: secondary, borderRadius: "2px", padding: "5px 6px", display: "flex", gap: "4px", marginBottom: "1px" }}>
              {[50, 12, 20, 10, 18].map((w, i) => (
                <div key={i} style={{ width: `${w}%`, height: "5px", backgroundColor: "white", borderRadius: "1px", opacity: 0.75 }} />
              ))}
            </div>
            {[1, 2, 3, 4].map((row) => (
              <div key={row} style={{ padding: "5px 6px", display: "flex", gap: "4px", backgroundColor: row % 2 === 0 ? hex2rgba(secondary, 0.04) : "transparent" }}>
                {[50, 12, 20, 10, 18].map((w, i) => (
                  <div key={i} style={{ width: `${w}%`, height: "5px", backgroundColor: i === 4 ? primary : "#E2E8F0", borderRadius: "1px", opacity: i === 4 ? 0.9 : 0.6 }} />
                ))}
              </div>
            ))}
          </div>

          {/* Totals — secondary TTC */}
          <div style={{ margin: "8px 16px 0 auto", width: "100px", marginRight: "16px" }}>
            {[1, 2].map(i => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", padding: "0 6px" }}>
                <div style={{ width: "30px", height: "4px", backgroundColor: "#CBD5E1", borderRadius: "1px" }} />
                <div style={{ width: "25px", height: "4px", backgroundColor: "#94A3B8", borderRadius: "1px" }} />
              </div>
            ))}
            <div style={{ backgroundColor: secondary, borderRadius: "3px", padding: "5px 6px", display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
              <div style={{ width: "30px", height: "5px", backgroundColor: "white", borderRadius: "1px", opacity: 0.8 }} />
              <div style={{ width: "28px", height: "5px", backgroundColor: "white", borderRadius: "1px" }} />
            </div>
          </div>

          {/* Footer — secondary bg */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: secondary, padding: "5px 16px", display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "80px", height: "4px", backgroundColor: "white", borderRadius: "1px", opacity: 0.5 }} />
            <div style={{ width: "25px", height: "4px", backgroundColor: "white", borderRadius: "1px", opacity: 0.5 }} />
          </div>
        </div>
      </div>
    );
  }

  if (config.style === "MINIMAL") {
    return (
      <div className="bg-slate-100 p-6 rounded-xl flex items-center justify-center min-h-[600px]">
        <div className="bg-white shadow-xl relative overflow-hidden" style={{ width: "320px", height: "452px", borderRadius: "4px", padding: "20px 18px 0" }}>
          {/* Header — no bg, just text lines */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <div style={{ width: "85px", height: "12px", backgroundColor: "#0F172A", borderRadius: "2px", opacity: 0.9 }} />
              <div style={{ width: "55px", height: "5px", backgroundColor: "#94A3B8", borderRadius: "2px", marginTop: "5px" }} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ width: "40px", height: "8px", backgroundColor: primary, borderRadius: "1px", marginLeft: "auto", marginBottom: "4px" }} />
              <div style={{ width: "65px", height: "10px", backgroundColor: "#0F172A", borderRadius: "2px", opacity: 0.85 }} />
            </div>
          </div>

          {/* Thin separator */}
          <div style={{ height: "1px", backgroundColor: "#E2E8F0", marginBottom: "12px" }} />

          {/* Client — no box */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ width: "42px", height: "4px", backgroundColor: "#94A3B8", borderRadius: "1px", marginBottom: "5px" }} />
            <div style={{ width: "80px", height: "8px", backgroundColor: "#0F172A", borderRadius: "2px", opacity: 0.85, marginBottom: "4px" }} />
            <div style={{ width: "65px", height: "5px", backgroundColor: "#CBD5E1", borderRadius: "2px", marginBottom: "2px" }} />
            <div style={{ width: "50px", height: "5px", backgroundColor: "#CBD5E1", borderRadius: "2px" }} />
          </div>

          {/* Table — white header with primary bottom border */}
          <div>
            <div style={{ borderBottom: `2px solid ${primary}`, padding: "4px 6px", display: "flex", gap: "4px", marginBottom: "2px" }}>
              {[50, 12, 20, 10, 18].map((w, i) => (
                <div key={i} style={{ width: `${w}%`, height: "4px", backgroundColor: primary, borderRadius: "1px", opacity: 0.6 }} />
              ))}
            </div>
            {[1, 2, 3, 4].map((row) => (
              <div key={row} style={{ padding: "5px 6px", display: "flex", gap: "4px", borderBottom: "1px solid #F1F5F9" }}>
                {[50, 12, 20, 10, 18].map((w, i) => (
                  <div key={i} style={{ width: `${w}%`, height: "5px", backgroundColor: i === 4 ? primary : "#E2E8F0", borderRadius: "1px", opacity: i === 4 ? 0.8 : 0.5 }} />
                ))}
              </div>
            ))}
          </div>

          {/* Totals — no box, just lines with primary separator */}
          <div style={{ marginTop: "10px", width: "110px", marginLeft: "auto" }}>
            {[1, 2].map(i => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                <div style={{ width: "30px", height: "4px", backgroundColor: "#CBD5E1", borderRadius: "1px" }} />
                <div style={{ width: "25px", height: "4px", backgroundColor: "#94A3B8", borderRadius: "1px" }} />
              </div>
            ))}
            <div style={{ borderTop: `1.5px solid ${primary}`, marginTop: "4px", paddingTop: "4px", display: "flex", justifyContent: "space-between" }}>
              <div style={{ width: "35px", height: "6px", backgroundColor: primary, borderRadius: "1px", opacity: 0.8 }} />
              <div style={{ width: "30px", height: "6px", backgroundColor: primary, borderRadius: "1px" }} />
            </div>
          </div>

          {/* Footer — thin line, no bg */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderTop: "1px solid #E2E8F0", padding: "5px 18px", display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "80px", height: "3px", backgroundColor: "#CBD5E1", borderRadius: "1px" }} />
            <div style={{ width: "25px", height: "3px", backgroundColor: "#CBD5E1", borderRadius: "1px" }} />
          </div>
        </div>
      </div>
    );
  }

  if (config.style === "MODERN") {
    return (
      <div className="bg-slate-100 p-6 rounded-xl flex items-center justify-center min-h-[600px]">
        <div className="bg-white shadow-xl relative overflow-hidden" style={{ width: "320px", height: "452px", borderRadius: "4px" }}>
          {/* Light header bg */}
          <div style={{ backgroundColor: hex2rgba(primary, 0.07), height: "80px", padding: "16px 16px 0 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ width: "80px", height: "10px", backgroundColor: secondary, borderRadius: "2px", opacity: 0.9 }} />
                {/* Underline accent */}
                <div style={{ width: "60px", height: "2px", backgroundColor: primary, borderRadius: "1px", marginTop: "4px" }} />
                <div style={{ width: "50px", height: "5px", backgroundColor: "#94A3B8", borderRadius: "2px", marginTop: "5px" }} />
              </div>
              <div style={{ textAlign: "right" }}>
                {/* Badge with rounded corners */}
                <div style={{ backgroundColor: primary, borderRadius: "6px", padding: "4px 10px", display: "inline-block", marginBottom: "5px" }}>
                  <div style={{ width: "38px", height: "7px", backgroundColor: "white", borderRadius: "1px" }} />
                </div>
                <div style={{ width: "65px", height: "7px", backgroundColor: secondary, borderRadius: "2px", marginLeft: "auto", opacity: 0.7 }} />
              </div>
            </div>
          </div>

          {/* Gradient separator */}
          <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${primary}, transparent)`, opacity: 0.3 }} />

          {/* Client in box — border all around */}
          <div style={{ margin: "10px 16px 0 20px", display: "flex", gap: "8px" }}>
            <div style={{ flex: 1, border: "1px solid #E2E8F0", borderRadius: "4px", padding: "8px" }}>
              <div style={{ width: "38px", height: "5px", backgroundColor: primary, borderRadius: "1px", opacity: 0.7, marginBottom: "4px" }} />
              <div style={{ width: "70px", height: "8px", backgroundColor: secondary, borderRadius: "2px", opacity: 0.8, marginBottom: "3px" }} />
              <div style={{ width: "55px", height: "5px", backgroundColor: "#CBD5E1", borderRadius: "2px" }} />
            </div>
            <div style={{ width: "90px", backgroundColor: "#F8FAFC", borderRadius: "4px", padding: "6px" }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ width: "30px", height: "4px", backgroundColor: "#CBD5E1", borderRadius: "1px" }} />
                  <div style={{ width: "35px", height: "4px", backgroundColor: secondary, borderRadius: "1px", opacity: 0.7 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Table — primary header */}
          <div style={{ margin: "10px 16px 0 20px" }}>
            <div style={{ backgroundColor: primary, borderRadius: "3px 3px 0 0", padding: "5px 6px", display: "flex", gap: "4px", marginBottom: "1px" }}>
              {[50, 12, 20, 10, 18].map((w, i) => (
                <div key={i} style={{ width: `${w}%`, height: "5px", backgroundColor: "white", borderRadius: "1px", opacity: 0.8 }} />
              ))}
            </div>
            {[1, 2, 3, 4].map((row) => (
              <div key={row} style={{ padding: "5px 6px", display: "flex", gap: "4px", backgroundColor: row % 2 === 0 ? hex2rgba(primary, 0.04) : "transparent" }}>
                {[50, 12, 20, 10, 18].map((w, i) => (
                  <div key={i} style={{ width: `${w}%`, height: "5px", backgroundColor: i === 4 ? primary : "#E2E8F0", borderRadius: "1px", opacity: i === 4 ? 0.85 : 0.6 }} />
                ))}
              </div>
            ))}
          </div>

          {/* Totals — primary TTC */}
          <div style={{ margin: "8px 16px 0 auto", width: "100px", marginRight: "16px" }}>
            {[1, 2].map(i => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", padding: "0 6px" }}>
                <div style={{ width: "30px", height: "4px", backgroundColor: "#CBD5E1", borderRadius: "1px" }} />
                <div style={{ width: "25px", height: "4px", backgroundColor: "#94A3B8", borderRadius: "1px" }} />
              </div>
            ))}
            <div style={{ backgroundColor: primary, borderRadius: "3px", padding: "5px 6px", display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
              <div style={{ width: "30px", height: "5px", backgroundColor: "white", borderRadius: "1px", opacity: 0.8 }} />
              <div style={{ width: "28px", height: "5px", backgroundColor: "white", borderRadius: "1px" }} />
            </div>
          </div>

          {/* Footer */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderTop: "1px solid #F1F5F9", padding: "5px 16px 5px 20px", display: "flex", justifyContent: "space-between", backgroundColor: "#FAFAFA" }}>
            <div style={{ width: "80px", height: "4px", backgroundColor: "#CBD5E1", borderRadius: "1px" }} />
            <div style={{ width: "30px", height: "4px", backgroundColor: "#CBD5E1", borderRadius: "1px" }} />
          </div>
        </div>
      </div>
    );
  }

  // CLASSIC (default)
  return (
    <div className="bg-slate-100 p-6 rounded-xl flex items-center justify-center min-h-[600px]">
      <div className="bg-white shadow-xl relative overflow-hidden" style={{ width: "320px", height: "452px", borderRadius: "4px" }}>
        {/* Bande latérale gauche */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", backgroundColor: primary }} />

        {/* Header split */}
        <div style={{ padding: "16px 16px 0 22px", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ width: "75px", height: "10px", backgroundColor: secondary, borderRadius: "2px", opacity: 0.9 }} />
            <div style={{ width: "48px", height: "6px", backgroundColor: "#94A3B8", borderRadius: "2px", marginTop: "4px" }} />
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: primary, lineHeight: "1" }}>DEVIS</div>
            <div style={{ width: "60px", height: "7px", backgroundColor: secondary, borderRadius: "2px", marginTop: "5px", marginLeft: "auto", opacity: 0.7 }} />
          </div>
        </div>

        {/* Separator */}
        <div style={{ margin: "10px 16px 0 22px", height: "1px", backgroundColor: "#E2E8F0" }} />

        {/* Client + dates */}
        <div style={{ padding: "10px 16px 0 22px", display: "flex", gap: "8px" }}>
          <div style={{ flex: 1, borderLeft: `3px solid ${primary}`, paddingLeft: "8px" }}>
            <div style={{ width: "30px", height: "5px", backgroundColor: primary, borderRadius: "1px", opacity: 0.7, marginBottom: "4px" }} />
            <div style={{ width: "65px", height: "7px", backgroundColor: secondary, borderRadius: "2px", opacity: 0.8 }} />
            <div style={{ width: "80px", height: "5px", backgroundColor: "#CBD5E1", borderRadius: "2px", marginTop: "3px" }} />
            <div style={{ width: "55px", height: "5px", backgroundColor: "#CBD5E1", borderRadius: "2px", marginTop: "2px" }} />
          </div>
          <div style={{ width: "90px", backgroundColor: "#F8FAFC", borderRadius: "4px", padding: "6px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <div style={{ width: "30px", height: "4px", backgroundColor: "#CBD5E1", borderRadius: "1px" }} />
                <div style={{ width: "35px", height: "4px", backgroundColor: secondary, borderRadius: "1px", opacity: 0.7 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Table — primary header */}
        <div style={{ margin: "12px 16px 0 22px" }}>
          <div style={{ backgroundColor: primary, borderRadius: "3px", padding: "5px 6px", display: "flex", gap: "4px", marginBottom: "1px" }}>
            {[50, 12, 20, 10, 18].map((w, i) => (
              <div key={i} style={{ width: `${w}%`, height: "5px", backgroundColor: "white", borderRadius: "1px", opacity: 0.75 }} />
            ))}
          </div>
          {[1, 2, 3, 4].map((row) => (
            <div key={row} style={{ padding: "5px 6px", display: "flex", gap: "4px", backgroundColor: config.tableStyle === "STRIPED" && row % 2 === 0 ? "#F8FAFC" : "transparent", borderBottom: config.tableStyle === "BORDERED" ? "1px solid #F1F5F9" : "none" }}>
              {[50, 12, 20, 10, 18].map((w, i) => (
                <div key={i} style={{ width: `${w}%`, height: "5px", backgroundColor: i === 4 ? primary : "#E2E8F0", borderRadius: "1px", opacity: i === 4 ? 0.8 : 0.6 }} />
              ))}
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={{ margin: "8px 16px 0 auto", width: "100px", marginRight: "16px" }}>
          {[1, 2].map(i => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", padding: "0 6px" }}>
              <div style={{ width: "30px", height: "4px", backgroundColor: "#CBD5E1", borderRadius: "1px" }} />
              <div style={{ width: "25px", height: "4px", backgroundColor: "#94A3B8", borderRadius: "1px" }} />
            </div>
          ))}
          <div style={{ backgroundColor: primary, borderRadius: "3px", padding: "5px 6px", display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
            <div style={{ width: "30px", height: "5px", backgroundColor: "white", borderRadius: "1px", opacity: 0.8 }} />
            <div style={{ width: "28px", height: "5px", backgroundColor: "white", borderRadius: "1px" }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderTop: "1px solid #F1F5F9", padding: "5px 16px 5px 22px", display: "flex", justifyContent: "space-between", backgroundColor: "#FAFAFA" }}>
          <div style={{ width: "80px", height: "4px", backgroundColor: "#CBD5E1", borderRadius: "1px" }} />
          <div style={{ width: "30px", height: "4px", backgroundColor: "#CBD5E1", borderRadius: "1px" }} />
        </div>
      </div>
    </div>
  );
}
