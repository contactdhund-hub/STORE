"use server";

import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password || password.length < 6) {
    return { error: "Invalid email or password (min 6 characters)" };
  }

  try {
    // Check if user already exists
    const existing = await sql`SELECT "id" FROM "User" WHERE "email" = ${email} LIMIT 1`;
    if (existing.length > 0) {
      return { error: "An account with this email already exists" };
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const now = new Date().toISOString();

    await sql`
      INSERT INTO "User" ("id", "email", "passwordHash", "role", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${email}, ${hash}, 'CUSTOMER', ${now}, ${now})
    `;

    return { success: true };
  } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    console.error(err);
    return { error: "Failed to create account" };
  }
}
