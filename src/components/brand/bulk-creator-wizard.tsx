"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createContentJobRecord } from "@/app/[locale]/app/actions";
import { PLATFORMS, ASPECT_RATIOS, CONTENT_TYPES } from "@/lib/constants/platforms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const INPUT_TYPES = [
  "prompt_variants",
  "csv",
  "brief",
  "template_assets",
  "platform_multiply",
] as const;

export function BulkCreatorWizard({ brandId }: { brandId: string }) {
  const t = useTranslations("bulkCreator");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [inputType, setInputType] = useState<(typeof INPUT_TYPES)[number]>(
    "prompt_variants",
  );
  const [platforms, setPlatforms] = useState<string[]>(["instagram"]);
  const [aspects, setAspects] = useState<string[]>(["1:1"]);
  const [contentTypes, setContentTypes] = useState<string[]>(["static"]);
  const [language, setLanguage] = useState("tr");
  const [imageProvider, setImageProvider] = useState<"nanoBananaPro" | "seedream">(
    "nanoBananaPro",
  );
  const [videoProvider, setVideoProvider] = useState<"seedream" | "kling">(
    "seedream",
  );
  const [basePrompt, setBasePrompt] = useState("");
  const [variantCount, setVariantCount] = useState(3);
  const [brief, setBrief] = useState("");
  const [csvText, setCsvText] = useState("title,body\nSatış,Spring\n");
  const [campaignName, setCampaignName] = useState("Bulk kampanya");
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1920);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState<string | null>(null);

  function parseCsv() {
    const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
    const header = lines[0]?.toLowerCase();
    const rows: { title: string; body: string }[] = [];
    if (header?.includes("title") && header.includes("body")) {
      for (let i = 1; i < lines.length; i++) {
        const [title, body] = lines[i].split(",").map((s) => s.trim());
        rows.push({ title: title ?? "", body: body ?? "" });
      }
    }
    return rows;
  }

  async function pollJob(id: string) {
    for (let i = 0; i < 60; i++) {
      const res = await fetch(`/api/jobs/${id}`);
      const j = await res.json();
      setProgress(j.progress ?? 0);
      setJobStatus(j.status);
      if (j.status === "completed" || j.status === "failed") break;
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  async function startGenerate() {
    const payload = {
      platforms,
      aspects,
      contentTypes,
      language,
      imageProvider,
      videoProvider,
      basePrompt,
      variantCount,
      brief,
      csvRows: inputType === "csv" ? parseCsv() : undefined,
      campaignName,
      customWidth,
      customHeight,
    };
    const res = await createContentJobRecord({
      brandId,
      inputType,
      payload: payload as unknown as Record<string, unknown>,
    });
    if ("error" in res && res.error) {
      toast.error(res.error);
      return;
    }
    if (!("id" in res) || !res.id) return;
    setJobId(res.id);
    setProgress(0);
    setJobStatus("queued");
    const proc = await fetch(`/api/jobs/${res.id}/process`, { method: "POST" });
    if (!proc.ok) toast.error("İşlem başlatılamadı");
    await pollJob(res.id);
    toast.success("Üretim tamamlandı");
    router.refresh();
  }

  const steps = [t("step1"), t("step2"), t("step3"), t("step4"), t("step5")];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              step === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <Card className="glass-card">
          <CardContent className="grid gap-3 p-6">
            <div className="flex flex-wrap gap-2">
              {INPUT_TYPES.map((it) => (
                <Button
                  key={it}
                  type="button"
                  size="sm"
                  variant={inputType === it ? "default" : "outline"}
                  onClick={() => setInputType(it)}
                >
                  {it === "prompt_variants" && t("inputPrompt")}
                  {it === "csv" && t("inputCsv")}
                  {it === "brief" && t("inputBrief")}
                  {it === "template_assets" && t("inputTemplate")}
                  {it === "platform_multiply" && t("inputMultiply")}
                </Button>
              ))}
            </div>
            {inputType === "prompt_variants" && (
              <div className="space-y-2 pt-2">
                <Label>Prompt</Label>
                <Textarea value={basePrompt} onChange={(e) => setBasePrompt(e.target.value)} />
                <Label>Varyant</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={variantCount}
                  onChange={(e) => setVariantCount(Number(e.target.value))}
                />
              </div>
            )}
            {inputType === "csv" && (
              <div className="space-y-2">
                <Label>CSV</Label>
                <Textarea rows={6} value={csvText} onChange={(e) => setCsvText(e.target.value)} />
              </div>
            )}
            {inputType === "brief" && (
              <div className="space-y-2">
                <Label>Brief</Label>
                <Textarea rows={6} value={brief} onChange={(e) => setBrief(e.target.value)} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card className="glass-card">
          <CardContent className="space-y-4 p-6">
            <div>
              <p className="mb-2 text-sm font-medium">Platformlar</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm capitalize">
                    <Checkbox
                      checked={platforms.includes(p)}
                      onCheckedChange={(c) =>
                        setPlatforms((prev) =>
                          c ? [...prev, p] : prev.filter((x) => x !== p),
                        )
                      }
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Oranlar</p>
              <div className="flex flex-wrap gap-2">
                {ASPECT_RATIOS.map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={aspects.includes(a)}
                      onCheckedChange={(c) =>
                        setAspects((prev) =>
                          c ? [...prev, a] : prev.filter((x) => x !== a),
                        )
                      }
                    />
                    {a === "custom" ? "Özel (px)" : a}
                  </label>
                ))}
              </div>
              {aspects.includes("custom") && (
                <div className="mt-3 flex max-w-md flex-wrap gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Genişlik</Label>
                    <Input
                      type="number"
                      min={64}
                      max={4096}
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value) || 1080)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Yükseklik</Label>
                    <Input
                      type="number"
                      min={64}
                      max={4096}
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value) || 1080)}
                    />
                  </div>
                </div>
              )}
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">İçerik türleri</p>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map((ct) => (
                  <label key={ct} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={contentTypes.includes(ct)}
                      onCheckedChange={(c) =>
                        setContentTypes((prev) =>
                          c ? [...prev, ct] : prev.filter((x) => x !== ct),
                        )
                      }
                    />
                    {ct}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="glass-card">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label>İçerik dili</Label>
              <Select
                value={language}
                onValueChange={(v) => v && setLanguage(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kampanya adı</Label>
              <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="glass-card">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label>Görsel (Nano Banana Pro varsayılan)</Label>
              <Select
                value={imageProvider}
                onValueChange={(v) =>
                  v && setImageProvider(v as typeof imageProvider)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nanoBananaPro">Nano Banana Pro</SelectItem>
                  <SelectItem value="seedream">Seedream</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Video</Label>
              <Select
                value={videoProvider}
                onValueChange={(v) =>
                  v && setVideoProvider(v as typeof videoProvider)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seedream">Seedream</SelectItem>
                  <SelectItem value="kling">Kling AI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="glass-card">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              {inputType} · {platforms.join(", ")} · {aspects.join(", ")} · {language}
            </p>
            {jobId && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">Durum: {jobStatus}</p>
              </div>
            )}
            <Button type="button" variant="gradient" onClick={startGenerate}>
              {t("generate")}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          {t("back")}
        </Button>
        <Button
          type="button"
          variant="gradient"
          disabled={step >= 4}
          onClick={() => setStep((s) => Math.min(4, s + 1))}
        >
          {t("next")}
        </Button>
      </div>
    </div>
  );
}
