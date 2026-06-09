"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: { createdAt: "asc" }
    });
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

  try {
    await db.category.create({
      data: { name }
    });
    revalidatePath("/admin/categories");
    revalidatePath("/");
  } catch (error) {
    console.error(error);
    throw new Error("Category might already exist");
  }
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  await db.category.delete({
    where: { id }
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
