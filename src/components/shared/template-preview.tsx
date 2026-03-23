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

  return (
    <div className="bg-slate-100 p-6 rounded-xl flex items-center justify-center min-h-[600px]">
      <div className="bg-white shadow-xl relative overflow-hidden" style={{ width: "320px", height: "452px", borderRadius: "4px" }}>
        {/* Bande latérale (CLASSIC/MODERN) */}
        {(config.style === "CLASSIC" || config.style === "MODERN") && (
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", backgroundColor: primary }} />
        )}

        {/* Header */}
        {config.style === "BOLD" ? (
          <div style={{ backgroundColor: secondary, height: "80px", padding: "16px 16px 16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ width: "80px", height: "10px", backgroundColor: "white", borderRadius: "2px", opacity: 0.9 }} />
              <div style={{ width: "50px", height: "6px", backgroundColor: "white", borderRadius: "2px", opacity: 0.5, marginTop: "5px" }} />
            </div>
            <div style={{ backgroundColor: primary, borderRadius: "4px", padding: "5px 10px" }}>
              <div style={{ width: "40px", height: "8px", backgroundColor: "white", borderRadius: "2px" }} />
            </div>
          </div>
        ) : config.style === "MINIMAL" ? (
          <div style={{ padding: "16px 16px 0 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div>
                <div style={{ width: "70px", height: "9px", backgroundColor: secondary, borderRadius: "2px", opacity: 0.9 }} />
                <div style={{ width: "45px", height: "5px", backgroundColor: "#94A3B8", borderRadius: "2px", marginTop: "4px" }} />
              </div>
              <div>
                <div style={{ width: "35px", height: "9px", backgroundColor: primary, borderRadius: "2px" }} />
                <div style={{ width: "55px", height: "6px", backgroundColor: "#94A3B8", borderRadius: "2px", marginTop: "4px" }} />
              </div>
            </div>
            <div style={{ height: "1px", backgroundColor: primary, opacity: 0.3 }} />
          </div>
        ) : (
          <div style={{ padding: "16px 16px 0 22px", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ width: "75px", height: "10px", backgroundColor: secondary, borderRadius: "2px", opacity: 0.9 }} />
              <div style={{ width: "48px", height: "6px", backgroundColor: "#94A3B8", borderRadius: "2px", marginTop: "4px" }} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ backgroundColor: primary, borderRadius: "3px", padding: "4px 8px", display: "inline-block" }}>
                <div style={{ width: "35px", height: "7px", backgroundColor: "white", borderRadius: "1px" }} />
              </div>
              <div style={{ width: "60px", height: "7px", backgroundColor: secondary, borderRadius: "2px", marginTop: "5px", marginLeft: "auto" }} />
            </div>
          </div>
        )}

        {/* Section client + dates */}
        <div style={{ padding: "12px 16px 0 22px", display: "flex", gap: "8px", marginTop: config.style === "BOLD" ? "10px" : "12px" }}>
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

        {/* Tableau */}
        <div style={{ margin: "12px 16px 0 22px" }}>
          <div style={{ backgroundColor: config.style === "MINIMAL" ? "#F1F5F9" : secondary, borderRadius: "3px", padding: "5px 6px", display: "flex", gap: "4px", marginBottom: "1px" }}>
            {[50, 12, 20, 10, 18].map((w, i) => (
              <div key={i} style={{ width: `${w}%`, height: "5px", backgroundColor: config.style === "MINIMAL" ? secondary : "white", borderRadius: "1px", opacity: config.style === "MINIMAL" ? 0.4 : 0.7 }} />
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

        {/* Totaux */}
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
