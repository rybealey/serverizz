/** Login page helpers (framework-agnostic, unit-testable). */

type SearchParams = { [key: string]: string | string[] | undefined };

/**
 * True when the visitor arrived from a ClientExec logout, signalled by `?lo=true`
 * (e.g. https://www.serverizz.com/login?lo=true). Only the exact string "true"
 * counts; a repeated param uses its first value.
 */
export function isLoggedOut(searchParams: SearchParams): boolean {
  const lo = searchParams.lo;
  const value = Array.isArray(lo) ? lo[0] : lo;
  return value === "true";
}
