/** Parse aspect_ratio stored as "1:1", "9:16", or "1080x1920" (custom). */
export function parseExportDimensions(aspectRatio: string): { w: number; h: number } {
  const plain = aspectRatio?.trim() ?? "1:1";
  const wxh = /^(\d+)\s*x\s*(\d+)$/i.exec(plain);
  if (wxh) {
    return { w: Math.min(4096, Math.max(64, parseInt(wxh[1], 10))), h: Math.min(4096, Math.max(64, parseInt(wxh[2], 10))) };
  }
  const parts = plain.split(":").map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && parts.every((n) => Number.isFinite(n) && n > 0)) {
    const [aw, ah] = parts;
    const base = 1080;
    const w = aw >= ah ? base : Math.round((base * aw) / ah);
    const h = ah >= aw ? base : Math.round((base * ah) / aw);
    return { w, h };
  }
  return { w: 1080, h: 1080 };
}
