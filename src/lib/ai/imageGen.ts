import type { ImageGenInput, ImageProviderId } from "./types";

export async function generateImageMock(
  provider: ImageProviderId,
  input: ImageGenInput,
): Promise<{ url: string; provider: ImageProviderId }> {
  await new Promise((r) => setTimeout(r, 120));
  const seed = encodeURIComponent(input.prompt.slice(0, 40));
  return {
    provider,
    url: `https://picsum.photos/seed/${seed}/1080/1080`,
  };
}
