export async function autoTagAssetMock(fileName: string): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 60));
  const base = fileName.replace(/\.[^.]+$/, "").toLowerCase();
  return ["asset", base.slice(0, 20) || "upload", "bulk"];
}
