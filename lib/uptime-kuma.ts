/** Server-side Uptime Kuma status-page access. Do not import from client components. */

export type MaintenanceStatus = { active: boolean; title: string | null };

type Timeslot = { startDate?: string; endDate?: string };
type MaintenanceEntry = {
  title?: string;
  /** Kuma sets this to false for disabled maintenances. */
  active?: boolean;
  /** Computed by Kuma: "under-maintenance" | "scheduled" | "inactive" | "ended". */
  status?: string;
  timeslotList?: Timeslot[];
};
export type StatusPageResponse = { maintenanceList?: MaintenanceEntry[] };

function isEntryActive(m: MaintenanceEntry, now: Date): boolean {
  // A disabled maintenance is never active, regardless of computed status.
  if (m.active === false) return false;
  // Prefer Kuma's computed status (handles recurrence + timezone for us).
  if (typeof m.status === "string") return m.status === "under-maintenance";
  // Fallback for versions without a computed status: check timeslot windows.
  const t = now.getTime();
  return (m.timeslotList ?? []).some((s) => {
    const start = s.startDate ? Date.parse(s.startDate) : NaN;
    const end = s.endDate ? Date.parse(s.endDate) : NaN;
    return Number.isFinite(start) && Number.isFinite(end) && t >= start && t <= end;
  });
}

export function evaluateMaintenance(data: StatusPageResponse | null | undefined, now: Date): MaintenanceStatus {
  for (const m of data?.maintenanceList ?? []) {
    if (isEntryActive(m, now)) {
      return { active: true, title: m.title?.trim() || null };
    }
  }
  return { active: false, title: null };
}

/** Overall health rolled up from per-monitor heartbeats + maintenance. */
export type SystemStatusLevel = "operational" | "maintenance" | "degraded" | "down" | "unknown";
export type SystemStatus = { level: SystemStatusLevel; label: string };

/** Kuma heartbeat status codes: 0 = down, 1 = up, 2 = pending, 3 = maintenance. */
type Heartbeat = { status?: number };
export type HeartbeatResponse = { heartbeatList?: Record<string, Heartbeat[]> };

const STATUS_URL =
  process.env.UPTIME_KUMA_STATUS_URL ?? "https://status.serverizz.com/api/status-page/web";
const HEARTBEAT_URL =
  process.env.UPTIME_KUMA_HEARTBEAT_URL ??
  "https://status.serverizz.com/api/status-page/heartbeat/web";
const TIMEOUT_MS = 3000;

async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      // Share one upstream call across visitors for ~45s.
      next: { revalidate: 45 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  const data = await fetchJson<StatusPageResponse>(STATUS_URL);
  return evaluateMaintenance(data, new Date());
}

export function evaluateSystemStatus(
  statusPage: StatusPageResponse | null | undefined,
  heartbeats: HeartbeatResponse | null | undefined,
  now: Date,
): SystemStatus {
  // Without heartbeats we can't judge monitor health — don't claim "operational".
  const lists = heartbeats?.heartbeatList;
  if (!lists || Object.keys(lists).length === 0) {
    return { level: "unknown", label: "Live status" };
  }
  // Active maintenance takes visual priority over an otherwise-healthy read.
  if (evaluateMaintenance(statusPage, now).active) {
    return { level: "maintenance", label: "Maintenance in progress" };
  }
  let total = 0;
  let down = 0;
  for (const beats of Object.values(lists)) {
    const last = beats[beats.length - 1];
    if (!last || typeof last.status !== "number") continue;
    total++;
    if (last.status === 0) down++;
  }
  if (down > 0) {
    return down >= total
      ? { level: "down", label: "Major outage" }
      : { level: "degraded", label: "Partial outage" };
  }
  return { level: "operational", label: "All systems operational" };
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const [statusPage, heartbeats] = await Promise.all([
    fetchJson<StatusPageResponse>(STATUS_URL),
    fetchJson<HeartbeatResponse>(HEARTBEAT_URL),
  ]);
  return evaluateSystemStatus(statusPage, heartbeats, new Date());
}
