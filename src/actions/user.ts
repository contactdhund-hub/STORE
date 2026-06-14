"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";

export type User = {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
};

export async function getUsers(): Promise<User[]> {
  await requireAdmin();
  const users = await sql`
    SELECT "id", "email", "role", "createdAt"
    FROM "User"
    ORDER BY "createdAt" DESC
  `;
  return users as unknown as User[];
}

export async function updateUserRole(id: string, role: string) {
  await requireAdmin();
  
  if (role !== "ADMIN" && role !== "CUSTOMER") {
    throw new Error("Invalid role");
  }

  const now = new Date().toISOString();
  await sql`
    UPDATE "User"
    SET "role" = ${role}, "updatedAt" = ${now}
    WHERE "id" = ${id}
  `;

  revalidatePath("/admin/users");
}

export async function updateUserPassword(id: string, newPassword: string) {
  await requireAdmin();

  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);
  const now = new Date().toISOString();

  await sql`
    UPDATE "User"
    SET "passwordHash" = ${hash}, "updatedAt" = ${now}
    WHERE "id" = ${id}
  `;

  revalidatePath("/admin/users");
}

export async function deleteUser(id: string) {
  await requireAdmin();

  await sql`
    DELETE FROM "User"
    WHERE "id" = ${id}
  `;

  revalidatePath("/admin/users");
}
