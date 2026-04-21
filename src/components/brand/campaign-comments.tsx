"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { addComment } from "@/app/[locale]/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function CommentBody({ text }: { text: string }) {
  const parts = text.split(/(@[\w.-]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <span key={i} className="font-medium text-[var(--gradient-from)]">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export type CommentRow = {
  id: string;
  content_id: string;
  body: string;
  created_at: string;
};

export function CampaignComments({
  contents,
  comments,
}: {
  contents: { id: string; title: string | null }[];
  comments: CommentRow[];
}) {
  const t = useTranslations("comments");
  const router = useRouter();
  const [text, setText] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      {contents.map((c) => {
        const list = comments.filter((x) => x.content_id === c.id);
        return (
          <Card key={c.id} className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">{c.title ?? c.id.slice(0, 8)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                {list.map((m) => (
                  <li key={m.id} className="rounded-md bg-muted/40 px-3 py-2">
                    <CommentBody text={m.body} />
                  </li>
                ))}
                {!list.length && (
                  <li className="text-muted-foreground">Henüz yorum yok.</li>
                )}
              </ul>
              <form
                className="flex flex-col gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const body = text[c.id]?.trim();
                  if (!body) return;
                  const res = await addComment(c.id, body);
                  if ("error" in res && res.error) toast.error(res.error);
                  else {
                    setText((s) => ({ ...s, [c.id]: "" }));
                    toast.success("Yorum eklendi");
                    router.refresh();
                  }
                }}
              >
                <Textarea
                  value={text[c.id] ?? ""}
                  onChange={(e) =>
                    setText((s) => ({ ...s, [c.id]: e.target.value }))
                  }
                  placeholder={t("placeholder")}
                  rows={2}
                />
                <Button type="submit" size="sm" variant="secondary">
                  {t("submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
