import { verifyCredentials } from "@/lib/clientexec";
import { verifyTurnstile } from "@/lib/turnstile";

export async function POST(request: Request): Promise<Response> {
  let email = "";
  let password = "";
  let turnstileToken = "";
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.trim() : "";
    password = typeof body?.password === "string" ? body.password : "";
    turnstileToken = typeof body?.turnstileToken === "string" ? body.turnstileToken : "";
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!email || !password) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
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
    const ok = await verifyCredentials({ email, password });
    if (ok) return Response.json({ ok: true });
    return Response.json({ ok: false, error: "Incorrect email or password." });
  } catch {
    return Response.json(
      { error: "Sign-in is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }
}
