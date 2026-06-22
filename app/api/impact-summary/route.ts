import { getImpactSummary } from "@/lib/treeapp";

export async function GET(): Promise<Response> {
  const impact = await getImpactSummary();
  return Response.json(impact, {
    // Figures change slowly; let the CDN/browser hold them for a while.
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
  });
}
