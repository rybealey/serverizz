# Task 2 Report: Guest ticket submission (`createSupportTicket` + success heuristic)

## Status: DONE

## Commit
`edb764e` — feat: createSupportTicket guest submission to ClientExec

## What was done

### TDD cycle followed strictly

**RED (Step 1–2):**
- Added `isTicketSuccess` and `createSupportTicket` to the existing top-of-file import in `lib/clientexec.test.ts`
- Appended `describe("isTicketSuccess", ...)` and `describe("createSupportTicket", ...)` blocks (6 tests total) at end of file
- Ran tests: 6 new tests failed with `TypeError: isTicketSuccess is not a function` / `TypeError: createSupportTicket is not a function` — expected failure, all 41 pre-existing tests passed

**GREEN (Step 3–4):**
- Appended `isTicketSuccess` and `createSupportTicket` exports to `lib/clientexec.ts` after `getSupportTicketTypes`, reusing `SUBMIT_TICKET_URL`, `SAVE_TICKET_URL`, and `TICKET_VALID_EXTNS` from Task 1 without redeclaring them. FormData body used as specified; no `Content-Type` header set.
- Ran tests: all 47 tests passed (6 new + 41 pre-existing)

**COMMIT (Step 5):**
- `git add lib/clientexec.ts lib/clientexec.test.ts`
- `git commit -m "feat: createSupportTicket guest submission to ClientExec"`

## Files modified

- `lib/clientexec.ts` — appended `isTicketSuccess` and `createSupportTicket` exports (approx. 50 lines)
- `lib/clientexec.test.ts` — added `isTicketSuccess, createSupportTicket` to top-of-file import; appended 2 describe blocks (6 tests)

## Test results

```
Test Files  9 passed (9)
     Tests  98 passed (98)
```

Full suite clean. `npx tsc --noEmit` produced no output (clean).

## Concerns

None.

---

## Fix Report (review-fix pass)

### What changed

**`lib/clientexec.ts`:**
1. Added `if (!formRes.ok) throw new Error(\`ClientExec HTTP ${formRes.status}\`);` immediately after the GET in `createSupportTicket`, so a non-ok response from ClientExec causes the function to throw (matching the documented contract that callers map a throw to a 502).
2. Updated the JSDoc on `isTicketSuccess` to replace the inaccurate "a 200 with an error marker → failure" bullet with "a non-3xx response (200/4xx/5xx) → failure" and added a note that `body` is currently unused but kept for symmetry with `isRegisterSuccess`. No runtime behavior changed.

**`lib/clientexec.test.ts`:**
Two new tests added to the `createSupportTicket` describe block:
- `"rejects when the GET resolves with a non-ok status"` — stubs fetch with a two-call mock: first call returns `{ ok: false, status: 500, ... }`, second would succeed (302 redirect to ticket submitted). Without the guard the function would proceed to the POST and return `true`; with the guard it throws. Verified RED before implementing.
- `"rejects when the GET fetch itself rejects (network error)"` — stubs fetch with `mockRejectedValue(new Error("network"))`, confirming the unhandled rejection propagates to the caller.

### Covering test names

- `createSupportTicket > rejects when the GET resolves with a non-ok status`
- `createSupportTicket > rejects when the GET fetch itself rejects (network error)`

### Full suite result

```
Test Files  9 passed (9)
     Tests  100 passed (100)
```

### TypeScript

`npx tsc --noEmit` — no output (clean).
