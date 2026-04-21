import archiver from "archiver";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";

function dimsForRatio(r: string): { w: number; h: number } {
  const wxh = /^(\d+)\s*x\s*(\d+)$/i.exec(r);
  if (wxh) {
    return {
      w: Math.min(4096, Math.max(64, parseInt(wxh[1], 10))),
      h: Math.min(4096, Math.max(64, parseInt(wxh[2], 10))),
    };
  }
  switch (r) {
    case "1:1":
      return { w: 1080, h: 1080 };
    case "4:5":
      return { w: 1080, h: 1350 };
    case "9:16":
      return { w: 1080, h: 1920 };
    case "16:9":
      return { w: 1920, h: 1080 };
    default:
      return { w: 1080, h: 1080 };
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    assetIds: string[];
    targets: string[];
    format: "png" | "jpg" | "gif";
    brandId: string;
  };

  if (!body.assetIds?.length || !body.targets?.length) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { data: assets } = await supabase
    .from("brand_assets")
    .select("id, public_url, brand_id, type")
    .in("id", body.assetIds);

  const filtered =
    assets?.filter((a) => a.brand_id === body.brandId && a.public_url) ?? [];

  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks: Buffer[] = [];
  archive.on("data", (d: Buffer) => chunks.push(d));

  for (const asset of filtered) {
    const res = await fetch(asset.public_url as string);
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());

    if (asset.type === "video") {
      for (const ratio of body.targets) {
        archive.append(buf, {
          name: `${asset.id}-${ratio}-source.mp4`,
        });
      }
      continue;
    }

    for (const ratio of body.targets) {
      const { w, h } = dimsForRatio(ratio);
      const pipeline = sharp(buf).resize(w, h, { fit: "cover" });
      let out: Buffer;
      const ext = body.format;
      if (body.format === "jpg") {
        out = await pipeline.jpeg({ quality: 88 }).toBuffer();
      } else if (body.format === "gif") {
        try {
          out = await pipeline.gif({ effort: 7 }).toBuffer();
        } catch {
          out = await pipeline.png().toBuffer();
        }
      } else {
        out = await pipeline.png().toBuffer();
      }
      const name = `${asset.id}-${ratio}.${ext === "jpg" ? "jpg" : ext === "gif" ? "gif" : "png"}`;
      archive.append(out, { name });
    }
  }

  await archive.finalize();
  const zip = Buffer.concat(chunks);

  return new NextResponse(new Uint8Array(zip), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="converted.zip"',
    },
  });
}
