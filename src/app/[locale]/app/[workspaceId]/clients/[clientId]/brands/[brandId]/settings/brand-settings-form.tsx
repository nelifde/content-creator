"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateBrandSettings } from "@/app/[locale]/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function BrandSettingsForm({ brand }: { brand: Record<string, unknown> }) {
  const t = useTranslations("app");
  const [tone, setTone] = useState((brand.tone as string) ?? "");
  const [keywords, setKeywords] = useState(((brand.keywords as string[]) ?? []).join(", "));
  const [colors, setColors] = useState(JSON.stringify(brand.colors ?? [], null, 2));
  const [fonts, setFonts] = useState(JSON.stringify(brand.fonts ?? [], null, 2));
  const [guideline, setGuideline] = useState((brand.guideline_pdf_url as string) ?? "");

  return (
    <form
      className="glass-card space-y-4 rounded-xl p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        let colorsJson: unknown = [];
        let fontsJson: unknown = [];
        try {
          colorsJson = JSON.parse(colors);
          fontsJson = JSON.parse(fonts);
        } catch {
          toast.error("JSON geçersiz");
          return;
        }
        const res = await updateBrandSettings(brand.id as string, {
          tone,
          keywords: keywords
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          colors: colorsJson as unknown[],
          fonts: fontsJson as unknown[],
          guideline_pdf_url: guideline || null,
        });
        if ("error" in res && res.error) toast.error(res.error);
        else toast.success("Kaydedildi");
      }}
    >
      <div className="space-y-2">
        <Label>Ton of voice</Label>
        <Textarea value={tone} onChange={(e) => setTone(e.target.value)} rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Anahtar kelimeler (virgülle)</Label>
        <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Renk paleti (JSON)</Label>
        <Textarea value={colors} onChange={(e) => setColors(e.target.value)} rows={6} className="font-mono text-xs" />
      </div>
      <div className="space-y-2">
        <Label>Fontlar (JSON)</Label>
        <Textarea value={fonts} onChange={(e) => setFonts(e.target.value)} rows={6} className="font-mono text-xs" />
      </div>
      <div className="space-y-2">
        <Label>Rehber PDF URL</Label>
        <Input value={guideline} onChange={(e) => setGuideline(e.target.value)} placeholder="https://..." />
      </div>
      <Button type="submit" variant="gradient">
        {t("save")}
      </Button>
    </form>
  );
}
