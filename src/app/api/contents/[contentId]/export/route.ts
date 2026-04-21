import archiver from "archiver";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import { parseExportDimensions } from "@/lib/export/raster";

async function buildRaster(
  input: Buffer,
  aspectRatio: string,
  format: "png" | "jpg" | "gif",
): Promise<Buffer> {
  const { w, h } = parseExportDimensions(aspectRatio);
  const pipeline = sharp(input).resize(w, h, { fit: "cover" });
  if (format === "jpg") return pipeline.jpeg({ quality: 90 }).toBuffer();
  if (format === "gif") return pipeline.gif({ effort: 7 }).toBuffer();
  return pipeline.png().toBuffer();
}

async function buildPdf(title: string, caption: string): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  page.drawText(title || "Export", { x: 50, y: 720, size: 18 });
  page.drawText((caption || "").slice(0, 500), { x: 50, y: 680, size: 11 });
  return Buffer.from(await pdf.save());
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ contentId: string }> },
) {
  const { contentId } = await params;
  const { format } = (await req.json().catch(() => ({}))) as {
    format?: "png" | "jpg" | "gif" | "pdf" | "mp4" | "zip";
  };
  const fmt = format ?? "png";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: content } = await supabase
    .from("contents")
    .select("id, title, caption, aspect_ratio, layers")
    .eq("id", contentId)
    .single();

  if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const layers = (content.layers as { type?: string; url?: string }[]) ?? [];
  const imgLayer = layers.find((l) => l.type === "image" && l.url);
  const vidLayer = layers.find((l) => l.type === "video" && l.url);

  if (fmt === "mp4") {
    if (!vidLayer?.url) {
      return NextResponse.json(
        { error: "Bu içerikte video katmanı yok" },
        { status: 400 },
      );
    }
    const r = await fetch(vidLayer.url);
    if (!r.ok) {
      return NextResponse.json({ error: "Video indirilemedi" }, { status: 502 });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="content-${contentId}.mp4"`,
      },
    });
  }

  if (fmt === "pdf") {
    const pdfBuf = await buildPdf(
      content.title ?? "Export",
      content.caption ?? "",
    );
    return new NextResponse(new Uint8Array(pdfBuf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="content-${contentId}.pdf"`,
      },
    });
  }

  const aspect = (content.aspect_ratio as string) ?? "1:1";

  if (fmt === "zip") {
    if (!imgLayer?.url) {
      return NextResponse.json({ error: "ZIP için görsel gerekli" }, { status: 400 });
    }
    const r = await fetch(imgLayer.url);
    const input = Buffer.from(await r.arrayBuffer());
    const png = await buildRaster(input, aspect, "png");
    const jpg = await buildRaster(input, aspect, "jpg");
    let gif: Buffer;
    try {
      gif = await buildRaster(input, aspect, "gif");
    } catch {
      gif = png;
    }
    const pdfBuf = await buildPdf(content.title ?? "", content.caption ?? "");

    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    archive.on("data", (d: Buffer) => chunks.push(d));
    archive.append(png, { name: "export.png" });
    archive.append(jpg, { name: "export.jpg" });
    archive.append(gif, { name: "export.gif" });
    archive.append(pdfBuf, { name: "export.pdf" });
    await archive.finalize();
    const zip = Buffer.concat(chunks);
    return new NextResponse(new Uint8Array(zip), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="content-${contentId}.zip"`,
      },
    });
  }

  if (imgLayer?.url) {
    const resImg = await fetch(imgLayer.url);
    const input = Buffer.from(await resImg.arrayBuffer());
    const out = await buildRaster(input, aspect, fmt === "jpg" ? "jpg" : fmt === "gif" ? "gif" : "png");
    const mime =
      fmt === "jpg" ? "image/jpeg" : fmt === "gif" ? "image/gif" : "image/png";
    const ext = fmt === "jpg" ? "jpg" : fmt === "gif" ? "gif" : "png";
    return new NextResponse(new Uint8Array(out), {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="export.${ext}"`,
      },
    });
  }

  const { w, h } = parseExportDimensions(aspect);
  const out = await sharp({
    create: {
      width: w,
      height: h,
      channels: 4,
      background: { r: 16, g: 11, b: 26, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  return new NextResponse(new Uint8Array(out), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="placeholder.png"`,
    },
  });
}
