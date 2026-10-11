import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { comparePassword, hashPassword } from "./passwords";
import {
  getAdminByEmail,
  getAdminById,
  insertAdmin,
} from "./queries";
import { createSessionToken, verifySessionToken } from "./session-token";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "restaurant_session";
const SESSION_MAX_AGE = 60 * 60 * 8;

export interface SessionUser {
  id: string;
  email: string;
  fullName: string | null;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be configured with at least 32 characters.");
  }
  return secret;
}

function toSessionUser(admin: {
  id: string;
  email: string;
  fullName: string | null;
}): SessionUser {
  return { id: admin.id, email: admin.email, fullName: admin.fullName };
}

/** Server-only: reads the session cookie and returns the logged-in admin. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const id = verifySessionToken(token, getSessionSecret());
  if (!id) return null;
  const admin = await getAdminById(id);
  return admin ? toSessionUser(admin) : null;
}

/** Server-only: redirects to /admin/login when no session exists. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Server-only: verifies credentials and returns the admin or null. */
export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  const admin = await getAdminByEmail(email);
  if (!admin) return null;
  const ok = await comparePassword(password, admin.passwordHash);
  return ok ? toSessionUser(admin) : null;
}

/** Server-only: create an administrator through the protected setup command. */
export async function createAdmin(email: string, password: string, fullName?: string) {
  const passwordHash = await hashPassword(password);
  const admin = await insertAdmin({
    email,
    passwordHash,
    fullName: fullName ?? null,
  });
  return admin.id;
}

/** Server-only: set the session cookie for an already-authenticated admin. */
export async function setSessionCookie(user: SessionUser) {
  const cookieStore = await cookies();
  const token = createSessionToken(user.id, getSessionSecret());
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Server-only: clear the session cookie. */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export { SESSION_COOKIE, SESSION_MAX_AGE };
