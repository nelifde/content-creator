export type EditOp = "bgRemove" | "upscale" | "inpaint";

export async function runEditMock(
  op: EditOp,
  sourceUrl: string,
): Promise<{ url: string; op: EditOp }> {
  await new Promise((r) => setTimeout(r, 100));
  void sourceUrl;
  return {
    op,
    url: "https://picsum.photos/seed/edit/800/800",
  };
}
