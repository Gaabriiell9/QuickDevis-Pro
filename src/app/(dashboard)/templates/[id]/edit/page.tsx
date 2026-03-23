"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { TemplatePreview, type TemplateConfig } from "@/components/shared/template-preview";
import { cn } from "@/lib/utils/cn";

const COLOR_PRESETS = [
  { label: "Indigo", value: "#4338CA" },
  { label: "Slate", value: "#0F172A" },
  { label: "Vert", value: "#059669" },
  { label: "Bordeaux", value: "#9F1239" },
  { label: "Marine", value: "#0C4A6E" },
];

const SECONDARY_PRESETS = [
  { label: "Noir", value: "#0F172A" },
  { label: "Gris", value: "#64748B" },
  { label: "Ardoise", value: "#334155" },
];

const STYLE_OPTIONS: { value: TemplateConfig["style"]; label: string; desc: string }[] = [
  { value: "CLASSIC", label: "Classique", desc: "Bande latérale, header split" },
  { value: "MODERN", label: "Moderne", desc: "Accent coloré, épuré" },
  { value: "MINIMAL", label: "Minimaliste", desc: "Ligne fine, sobre" },
  { value: "BOLD", label: "Bold", desc: "Header plein fond" },
];

const DEFAULT_CONFIG: TemplateConfig = {
  style: "CLASSIC", primaryColor: "#4338CA", secondaryColor: "#0F172A",
  showLogo: true, showSignatureBlock: true, showBankDetails: false, showStamp: true,
  headerStyle: "SPLIT", tableStyle: "STRIPED", fontStyle: "SANS",
};

export default function EditTemplatePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("QUOTE");
  const [isDefault, setIsDefault] = useState(false);
  const [config, setConfig] = useState<TemplateConfig>(DEFAULT_CONFIG);

  const { data: template } = useQuery({
    queryKey: ["template", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/templates/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  useEffect(() => {
    if (template) {
      setName(template.name);
      setType(template.type);
      setIsDefault(template.isDefault);
      if (template.content) setConfig({ ...DEFAULT_CONFIG, ...template.content });
    }
  }, [template]);

  function updateConfig(patch: Partial<TemplateConfig>) {
    setConfig(c => ({ ...c, ...patch }));
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Nom requis"); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, type, isDefault, config }),
      });
      if (!res.ok) { toast.error("Erreur lors de la mise à jour"); return; }
      toast.success("Template mis à jour");
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
      await queryClient.invalidateQueries({ queryKey: ["template", id] });
      router.push("/templates");
    } catch { toast.error("Erreur serveur"); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Modifier le template"
        action={<Button variant="outline" size="sm" asChild><Link href="/templates"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Link></Button>}
      />
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Général</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom du template *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Classique Indigo" />
                </div>
                <div className="space-y-2">
                  <Label>Type de document</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={type} onChange={e => setType(e.target.value)}>
                    <option value="QUOTE">Devis</option>
                    <option value="INVOICE">Facture</option>
                    <option value="CREDIT_NOTE">Avoir</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Style</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mise en page</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {STYLE_OPTIONS.map(opt => (
                      <button key={opt.value} type="button" onClick={() => updateConfig({ style: opt.value })}
                        className={cn("border rounded-lg p-2.5 text-left transition-colors", config.style === opt.value ? "border-primary bg-primary/5" : "hover:bg-muted")}>
                        <p className="text-xs font-medium">{opt.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Couleur principale</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={config.primaryColor} onChange={e => updateConfig({ primaryColor: e.target.value })} className="h-8 w-10 rounded border cursor-pointer p-0.5" />
                    <Input value={config.primaryColor} onChange={e => updateConfig({ primaryColor: e.target.value })} className="font-mono text-sm" placeholder="#4338CA" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {COLOR_PRESETS.map(p => (
                      <button key={p.value} type="button" onClick={() => updateConfig({ primaryColor: p.value })}
                        className={cn("flex items-center gap-1 text-xs border rounded-full px-2 py-0.5 transition-colors", config.primaryColor === p.value ? "border-primary" : "hover:bg-muted")}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.value }} />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Couleur secondaire</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={config.secondaryColor} onChange={e => updateConfig({ secondaryColor: e.target.value })} className="h-8 w-10 rounded border cursor-pointer p-0.5" />
                    <Input value={config.secondaryColor} onChange={e => updateConfig({ secondaryColor: e.target.value })} className="font-mono text-sm" placeholder="#0F172A" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {SECONDARY_PRESETS.map(p => (
                      <button key={p.value} type="button" onClick={() => updateConfig({ secondaryColor: p.value })}
                        className={cn("flex items-center gap-1 text-xs border rounded-full px-2 py-0.5 transition-colors", config.secondaryColor === p.value ? "border-primary" : "hover:bg-muted")}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.value }} />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Style tableau</Label>
                  <div className="flex gap-2">
                    {(["STRIPED", "BORDERED", "MINIMAL"] as const).map(s => (
                      <button key={s} type="button" onClick={() => updateConfig({ tableStyle: s })}
                        className={cn("flex-1 border rounded-lg py-1.5 text-xs font-medium transition-colors", config.tableStyle === s ? "border-primary bg-primary/5" : "hover:bg-muted")}>
                        {s === "STRIPED" ? "Rayé" : s === "BORDERED" ? "Bordures" : "Minimal"}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Contenu</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {([
                  { key: "showLogo", label: "Afficher le logo" },
                  { key: "showSignatureBlock", label: "Bloc signature (devis)" },
                  { key: "showBankDetails", label: "Coordonnées bancaires (facture)" },
                  { key: "showStamp", label: "Filigrane de statut" },
                ] as const).map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="font-normal">{label}</Label>
                    <Switch checked={config[key]} onCheckedChange={v => updateConfig({ [key]: v })} />
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1 border-t">
                  <Label className="font-normal">Template par défaut</Label>
                  <Switch checked={isDefault} onCheckedChange={setIsDefault} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Textes par défaut</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2"><Label>Notes par défaut</Label><Textarea rows={2} value={config.defaultNotes ?? ""} onChange={e => updateConfig({ defaultNotes: e.target.value })} /></div>
                <div className="space-y-2"><Label>Conditions de règlement</Label><Textarea rows={2} value={config.defaultTerms ?? ""} onChange={e => updateConfig({ defaultTerms: e.target.value })} /></div>
                <div className="space-y-2"><Label>Texte footer</Label><Input value={config.footerText ?? ""} onChange={e => updateConfig({ footerText: e.target.value })} /></div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>

          <div className="lg:col-span-3 lg:sticky lg:top-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Aperçu en temps réel</p>
            <TemplatePreview config={config} />
          </div>
        </div>
      </form>
    </div>
  );
}
