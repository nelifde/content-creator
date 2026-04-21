"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { portalApprove, portalComment } from "./actions";
import { toast } from "sonner";

export function PortalClient({
  token,
  contents,
}: {
  token: string;
  contents: {
    id: string;
    title: string | null;
    status: string;
    caption: string | null;
  }[];
}) {
  const router = useRouter();
  const [text, setText] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      {contents.map((c) => (
        <Card key={c.id} className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">{c.title ?? "İçerik"}</CardTitle>
            <p className="text-xs text-muted-foreground">Durum: {c.status}</p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">{c.caption}</p>
            {c.status === "review" && (
              <Button
                type="button"
                variant="gradient"
                size="sm"
                onClick={async () => {
                  const res = await portalApprove(token, c.id);
                  if ("error" in res && res.error) toast.error(res.error);
                  else {
                    toast.success("Onaylandı");
                    router.refresh();
                  }
                }}
              >
                Onayla
              </Button>
            )}
            <form
              className="space-y-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const body = text[c.id]?.trim();
                if (!body) return;
                const res = await portalComment(token, c.id, body);
                if ("error" in res && res.error) toast.error(res.error);
                else {
                  setText((s) => ({ ...s, [c.id]: "" }));
                  toast.success("Yorum gönderildi");
                  router.refresh();
                }
              }}
            >
              <Textarea
                placeholder="Revizyon / yorum"
                rows={2}
                value={text[c.id] ?? ""}
                onChange={(e) => setText((s) => ({ ...s, [c.id]: e.target.value }))}
              />
              <Button type="submit" size="sm" variant="outline">
                Yorum gönder
              </Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
