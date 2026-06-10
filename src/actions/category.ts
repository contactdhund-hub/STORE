"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import { z } from "zod";

const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required").transform(val => val.trim().toUpperCase())
});

// Cache categories for 60 seconds — called on every page via Header
const getCategoriesCached = unstable_cache(
  async () => {
    const categories = await sql`
      SELECT * FROM "Category" ORDER BY "createdAt" ASC
    `;
    return categories;
  },
  ['categories'],
  { revalidate: 60 }
);

export async function getCategories() {
  try {
    return await getCategoriesCached();
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const parsed = CategorySchema.safeParse({
    name: formData.get("name")?.toString() || ""
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { name } = parsed.data;

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
