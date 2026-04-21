export type KonvaLayer = {
  id: string;
  type: "text" | "rect" | "image";
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fill?: string;
  fontSize?: number;
};

export async function suggestLayoutFromBriefMock(
  brief: string,
  brandColors: string[],
): Promise<KonvaLayer[]> {
  await new Promise((r) => setTimeout(r, 90));
  const accent = brandColors[0] ?? "#7C5CFF";
  return [
    {
      id: "bg",
      type: "rect",
      x: 0,
      y: 0,
      width: 1080,
      height: 1080,
      fill: "#0B0B1A",
    },
    {
      id: "headline",
      type: "text",
      x: 80,
      y: 120,
      text: brief.slice(0, 80) || "Headline",
      fill: "#ffffff",
      fontSize: 56,
    },
    {
      id: "accentBar",
      type: "rect",
      x: 80,
      y: 420,
      width: 280,
      height: 8,
      fill: accent,
    },
  ];
}
