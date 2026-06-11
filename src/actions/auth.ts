"use server";

import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";

// Simple memory-based rate limiter (resets on serverless cold starts)
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limitData = rateLimitMap.get(ip);
  if (!limitData || now > limitData.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 }); // 1 minute window
    return true;
  }
  if (limitData.count >= 5) { // 5 requests per minute
    return false;
  }
  limitData.count++;
  return true;
}

export async function registerUser(formData: FormData) {
  // Get IP address from headers
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(',')[0] : "unknown_ip";
  
  if (!checkRateLimit(ip)) {
    return { error: "Too many registration attempts. Please try again later." };
  }

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
