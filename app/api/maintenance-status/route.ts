import { getMaintenanceStatus } from "@/lib/uptime-kuma";

export async function GET(): Promise<Response> {
  const status = await getMaintenanceStatus();
  return Response.json(status, {
    headers: { "Cache-Control": "public, max-age=30, s-maxage=45" },
  });
}
