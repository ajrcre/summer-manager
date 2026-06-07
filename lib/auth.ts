import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "sm_editor";
const COOKIE_VALUE = "editor";

function secret(): string {
  return process.env.EDITOR_COOKIE_SECRET ?? "dev-secret-change-me";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** True if the current request carries a valid editor session cookie. */
export async function isEditor(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  const [value, signature] = token.split(".");
  if (value !== COOKIE_VALUE || !signature) return false;
  return safeEqual(signature, sign(COOKIE_VALUE));
}

/** Throw if the caller is not an editor (used to guard editor server actions). */
export async function requireEditor(): Promise<void> {
  if (!(await isEditor())) {
    throw new Error("נדרשת הרשאת עריכה");
  }
}

/** Validate the PIN; on success set the editor cookie. Returns whether it matched. */
export async function unlockWithPin(pin: string): Promise<boolean> {
  const expected = process.env.FAMILY_EDITOR_PIN ?? "1234";
  if (!safeEqual(pin.trim(), expected)) return false;

  const token = `${COOKIE_VALUE}.${sign(COOKIE_VALUE)}`;
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return true;
}

/** Clear the editor session. */
export async function lockEditor(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
