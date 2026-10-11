import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./session-token";

const secret = "a-test-session-secret-with-more-than-32-characters";

describe("signed administrator sessions", () => {
  it("accepts an untampered session token", () => {
    const token = createSessionToken("admin-123", secret);
    expect(verifySessionToken(token, secret)).toBe("admin-123");
  });

  it("rejects a changed ID, changed signature, or different secret", () => {
    const token = createSessionToken("admin-123", secret);
    const [id, expiry, signature] = token.split(".");
    expect(verifySessionToken(`other-${expiry}.${signature}`, secret)).toBeNull();
    expect(verifySessionToken(`${id}.${expiry}.${signature.slice(0, -1)}x`, secret)).toBeNull();
    expect(verifySessionToken(token, `${secret}-wrong`)).toBeNull();
  });

  it("rejects expired session tokens", () => {
    const token = createSessionToken("admin-123", secret, 100);
    expect(verifySessionToken(token, secret, 100)).toBeNull();
  });

  it("requires a configured secret of at least 32 characters", () => {
    expect(() => createSessionToken("admin-123", "short")).toThrow(/32 characters/);
  });
});
