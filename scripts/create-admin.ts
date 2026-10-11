import { loadEnvConfig } from "@next/env";
import { createAdmin } from "../lib/auth";
import { DuplicateAdminError } from "../lib/queries";

loadEnvConfig(process.cwd());

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME;
  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before creating an administrator.");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must contain at least 8 characters.");
  }

  await createAdmin(email, password, fullName);
  console.log("Administrator created.");
}

main().catch((error: unknown) => {
  if (error instanceof DuplicateAdminError) {
    console.error("An administrator with this email already exists; no changes were made.");
  } else if (error instanceof Error && error.message.startsWith("Set ADMIN_")) {
    console.error(error.message);
  } else if (error instanceof Error && error.message.startsWith("ADMIN_PASSWORD")) {
    console.error(error.message);
  } else {
    console.error("Administrator setup failed. Verify the MongoDB configuration and try again.");
  }
  process.exitCode = 1;
});
