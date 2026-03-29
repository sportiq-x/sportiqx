import crypto from "node:crypto";

type AdminSessionPayload = {
  email: string;
  role: "ADMIN";
  exp: number;
};

const SESSION_COOKIE_NAME = "sportiqx_admin_session";

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function sign(value: string) {
  const secret = getSecret();
  if (!secret) {
    return "";
  }

  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function getAdminSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function createAdminSessionToken(email: string) {
  const payload: AdminSessionPayload = {
    email,
    role: "ADMIN",
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };

  const base = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
  const signature = sign(base);
  return `${base}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const [base, signature] = token.split(".");
  if (!base || !signature) {
    return null;
  }

  const expected = sign(base);
  if (!expected || signature !== expected) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(base, "base64url").toString("utf-8")) as AdminSessionPayload;
    if (!payload.email || payload.role !== "ADMIN" || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
