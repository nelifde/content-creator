import type { VideoGenInput, VideoProviderId } from "./types";

export async function generateVideoMock(
  provider: VideoProviderId,
  input: VideoGenInput,
): Promise<{ url: string; provider: VideoProviderId }> {
  await new Promise((r) => setTimeout(r, 180));
  void input;
  return {
    provider,
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  };
}
