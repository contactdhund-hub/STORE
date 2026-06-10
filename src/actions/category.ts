"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function getCategories() {
  try {
    const categories = await sql`
      SELECT * FROM "Category" ORDER BY "createdAt" ASC
    `;
    return categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name")?.toString().trim().toUpperCase();
  if (!name) throw new Error("Category name is required");

  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO "Category" ("id", "name", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${name}, ${now}, ${now})
    `;
    revalidatePath("/admin/categories");
    revalidatePath("/");
  } catch (error) {
    console.error(error);
    throw new Error("Category might already exist");
  }
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  await sql`DELETE FROM "Category" WHERE "id" = ${id}`;
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
