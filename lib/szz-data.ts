import type { TerminalLine } from "@/components/szz/terminal";

export const heroLines: TerminalLine[] = [
  { type: "command", text: "serverizz launch mybakery.com" },
  { type: "spinner", text: "Setting up hosting, email & SSL…" },
  { type: "success", text: "Mailbox ready: hello@mybakery.com" },
  { type: "success", text: "Site live — daily backups on, SSL issued" },
  { type: "comment", text: "your coffee isn’t even cold yet" },
];

export const wpLines: TerminalLine[] = [
  { type: "command", text: "serverizz wp install --site mybakery.com" },
  { type: "spinner", text: "Installing WordPress + caching…" },
  { type: "success", text: "WordPress 6.x ready · SSL issued" },
  { type: "success", text: "Daily backups + auto-updates enabled" },
  { type: "comment", text: "log in at /wp-admin — we’ll keep it patched" },
];

export const aboutLines: TerminalLine[] = [
  { type: "command", text: "serverizz whoami" },
  { type: "output", text: "Ry Bealey · founder, since 2014" },
  { type: "output", text: "role: builds it, hosts it, answers the phone" },
  { type: "success", text: "mission: keep small business online" },
  { type: "comment", text: "started with one website — my mom’s" },
];

export const aiTeamLines: TerminalLine[] = [
  { type: "command", text: "serverizz hire --team marblism" },
  { type: "spinner", text: "Onboarding your AI employees…" },
  { type: "success", text: "Eva, Sonny, Stan, Penny, Rachel & Linda — clocked in" },
  { type: "success", text: "SERVERIZZ perk applied: 10% off for life" },
  { type: "comment", text: "they work nights. you don’t have to." },
];

export const rsLines: TerminalLine[] = [
  { type: "command", text: "whm create-acct --domain clientsite.com --plan starter" },
  { type: "spinner", text: "Provisioning cPanel account…" },
  { type: "success", text: "Account live · AutoSSL issued" },
  { type: "success", text: "Nameservers: ns1.yourbrand.com" },
  { type: "comment", text: "your client never sees serverizz" },
];

/** A single city/PoP within a data center region. */
export interface DcCity {
  city: string;
  /** Sub-region / country marker shown in mono, e.g. "TX · US" or "DE". */
  code: string;
}

/** A continent-level grouping of data center cities. */
export interface DcRegion {
  region: string;
  /** Region count shown in the pill — kept as a string to match the label. */
  count: string;
  cities: DcCity[];
}

/**
 * SERVERIZZ's global data center footprint — 32 regions across six continents.
 * Drives the /data-centers page region grid and its hero stats.
 */
export const dcRegions: DcRegion[] = [
  {
    region: "North America",
    count: "11",
    cities: [
      { city: "New York", code: "NJ · US" },
      { city: "Silicon Valley", code: "CA · US" },
      { city: "Seattle", code: "WA · US" },
      { city: "Los Angeles", code: "CA · US" },
      { city: "Chicago", code: "IL · US" },
      { city: "Dallas", code: "TX · US" },
      { city: "Atlanta", code: "GA · US" },
      { city: "Miami", code: "FL · US" },
      { city: "Honolulu", code: "HI · US" },
      { city: "Toronto", code: "CA" },
      { city: "Mexico City", code: "MX" },
    ],
  },
  {
    region: "Europe",
    count: "8",
    cities: [
      { city: "London", code: "GB" },
      { city: "Manchester", code: "GB" },
      { city: "Amsterdam", code: "NL" },
      { city: "Frankfurt", code: "DE" },
      { city: "Paris", code: "FR" },
      { city: "Madrid", code: "ES" },
      { city: "Stockholm", code: "SE" },
      { city: "Warsaw", code: "PL" },
    ],
  },
  {
    region: "Asia & Middle East",
    count: "8",
    cities: [
      { city: "Tokyo", code: "JP" },
      { city: "Osaka", code: "JP" },
      { city: "Seoul", code: "KR" },
      { city: "Singapore", code: "SG" },
      { city: "Mumbai", code: "IN" },
      { city: "Delhi NCR", code: "IN" },
      { city: "Bangalore", code: "IN" },
      { city: "Tel Aviv", code: "IL" },
    ],
  },
  {
    region: "South America",
    count: "2",
    cities: [
      { city: "São Paulo", code: "BR" },
      { city: "Santiago", code: "CL" },
    ],
  },
  {
    region: "Oceania",
    count: "2",
    cities: [
      { city: "Sydney", code: "AU" },
      { city: "Melbourne", code: "AU" },
    ],
  },
  {
    region: "Africa",
    count: "1",
    cities: [{ city: "Johannesburg", code: "ZA" }],
  },
];
