import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_DURATION_SECONDS = 8 * 60 * 60;

export function createSessionToken(
  userId: string,
  secret: string,
  expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
): string {
  if (secret.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters.");
  const payload = `${userId}.${expiresAt}`;
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string, secret: string, now = Math.floor(Date.now() / 1000)): string | null {
  if (secret.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters.");
  const signatureSeparator = token.lastIndexOf(".");
  const expirySeparator = token.lastIndexOf(".", signatureSeparator - 1);
  if (expirySeparator < 1 || signatureSeparator < 0) return null;
  const userId = token.slice(0, expirySeparator);
  const expiresAt = Number(token.slice(expirySeparator + 1, signatureSeparator));
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return null;
  const payload = token.slice(0, signatureSeparator);
  const signature = Buffer.from(token.slice(signatureSeparator + 1));
  const expected = Buffer.from(createHmac("sha256", secret).update(payload).digest("base64url"));
  if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) return null;
  return userId;
}
