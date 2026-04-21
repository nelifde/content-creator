"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertPlanAction } from "../actions";

export function PlanUpsertForm() {
  const t = useTranslations("admin.platform.plans");
  const [name, setName] = useState("");
  const [ai, setAi] = useState("500");
  const [storage, setStorage] = useState(String(512 * 1024 * 1024));
  const [contents, setContents] = useState("2000");
  const [pending, start] = useTransition();

  return (
    <form
      className="glass-card space-y-4 rounded-xl border border-border/50 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          await upsertPlanAction({
            name,
            limits: {
              ai_calls_per_period: Number(ai) || 0,
              storage_bytes: Number(storage) || 0,
              contents_per_period: Number(contents) || 0,
            },
          });
          setName("");
        });
      }}
    >
      <p className="font-medium">{t("createPlan")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>{t("name")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>{t("aiLimit")}</Label>
          <Input value={ai} onChange={(e) => setAi(e.target.value)} type="number" />
        </div>
        <div>
          <Label>{t("storageLimit")}</Label>
          <Input value={storage} onChange={(e) => setStorage(e.target.value)} type="number" />
        </div>
        <div>
          <Label>{t("contentsLimit")}</Label>
          <Input value={contents} onChange={(e) => setContents(e.target.value)} type="number" />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {t("save")}
      </Button>
    </form>
  );
}
