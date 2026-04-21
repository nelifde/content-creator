"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { suggestLayoutFromBriefMock, type KonvaLayer } from "@/lib/ai/layoutSuggest";
import { saveTemplate } from "@/app/[locale]/app/actions";
import { TemplateCanvas } from "@/components/brand/template-canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const presets: { name: string; layers: KonvaLayer[] }[] = [
  {
    name: "Product hero",
    layers: [
      { id: "bg", type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "#101028" },
      {
        id: "head",
        type: "text",
        x: 80,
        y: 160,
        text: "Yeni ürün",
        fill: "#fff",
        fontSize: 72,
      },
      { id: "bar", type: "rect", x: 80, y: 360, width: 200, height: 6, fill: "#22d3ee" },
    ],
  },
  {
    name: "Quote card",
    layers: [
      { id: "bg", type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "#0b0b1a" },
      {
        id: "q",
        type: "text",
        x: 100,
        y: 280,
        text: "“Markanızı büyütün.”",
        fill: "#e9d5ff",
        fontSize: 48,
      },
    ],
  },
];

export function TemplateStudio({ brandId }: { brandId: string }) {
  const t = useTranslations("app");
  const [layers, setLayers] = useState<KonvaLayer[] | undefined>(undefined);
  const [canvasKey, setCanvasKey] = useState(0);
  const [name, setName] = useState("Şablonum");
  const [brief, setBrief] = useState("");

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <TemplateCanvas
          resetKey={canvasKey}
          initialLayers={layers}
          onJsonChange={(l) => setLayers(l)}
        />
      </div>
      <div className="space-y-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Preset galeri</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {presets.map((p) => (
              <Button
                key={p.name}
                type="button"
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => {
                  setLayers(p.layers);
                  setCanvasKey((k) => k + 1);
                }}
              >
                {p.name}
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">AI layout önerisi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Kampanya brief'i…"
              rows={4}
            />
            <Button
              type="button"
              variant="gradient"
              size="sm"
              onClick={async () => {
                const suggested = await suggestLayoutFromBriefMock(brief, [
                  "#7c5cff",
                  "#22d3ee",
                ]);
                setLayers(suggested);
                setCanvasKey((k) => k + 1);
                toast.success("Layout önerildi");
              }}
            >
              Öner
            </Button>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Kaydet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Button
              type="button"
              variant="gradient"
              onClick={async () => {
                if (!layers?.length) {
                  toast.error("Önce katman oluşturun");
                  return;
                }
                const res = await saveTemplate({
                  brandId,
                  workspaceId: null,
                  name,
                  layers,
                });
                if ("error" in res && res.error) toast.error(res.error);
                else toast.success("Şablon kaydedildi");
              }}
            >
              {t("save")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
