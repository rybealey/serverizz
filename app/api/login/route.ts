import { verifyCredentials } from "@/lib/clientexec";

export async function POST(request: Request): Promise<Response> {
  let email = "";
  let password = "";
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.trim() : "";
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!email || !password) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
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
