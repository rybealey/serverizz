import { createAccount } from "@/lib/clientexec";
import { verifyTurnstile } from "@/lib/turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request): Promise<Response> {
  let firstName = "", lastName = "", email = "", turnstileToken = "";
  try {
    const body = await request.json();
    firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
    lastName = typeof body?.lastName === "string" ? body.lastName.trim() : "";
    email = typeof body?.email === "string" ? body.email.trim() : "";
    turnstileToken = typeof body?.turnstileToken === "string" ? body.turnstileToken : "";
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!firstName || !lastName || !email) {
    return Response.json({ error: "First name, last name and email are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!turnstileToken) {
    return Response.json({ error: "Please complete the verification." }, { status: 400 });
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? undefined;
  try {
    const human = await verifyTurnstile(turnstileToken, ip);
    if (!human) {
      return Response.json({ error: "Verification failed. Please try again." }, { status: 400 });
    }
  } catch {
    return Response.json(
      { error: "Verification is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }

  try {
    const created = await createAccount({ firstName, lastName, email });
    if (created) return Response.json({ ok: true });
    return Response.json({ ok: false, error: "We couldn't create your account. It may already exist." });
  } catch {
    return Response.json(
      { error: "Sign-up is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }
}
