import type { CopyGenInput, CopyGenOutput } from "./types";

export async function generateCopyMock(input: CopyGenInput): Promise<CopyGenOutput> {
  await new Promise((r) => setTimeout(r, 80));
  const lang = input.language === "en" ? "en" : "tr";
  if (lang === "en") {
    return {
      title: `${input.topic} — ${input.platform}`,
      caption: `Discover ${input.topic}. Built for ${input.platform} with your brand voice.`,
      hashtags: ["#brand", "#launch", "#content"],
      cta: "Learn more",
    };
  }
  return {
    title: `${input.topic} — ${input.platform}`,
    caption: `${input.topic} ile ${input.platform} için hazırlandı. Ton: ${input.tone ?? "marka"}.`,
    hashtags: ["#marka", "#kampanya", "#icerik"],
    cta: "Şimdi keşfet",
  };
}
