"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function createSlide(formData: FormData) {
  try {
    await requireAdmin();
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const image = formData.get("image") as string;
    const link = formData.get("link") as string || "/";
    const order = parseInt(formData.get("order") as string || "0");
    const now = new Date().toISOString();

    await sql`
      INSERT INTO "HeroSlide" ("id", "image", "title", "subtitle", "link", "order", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${image}, ${title}, ${subtitle}, ${link}, ${order}, ${now}, ${now})
    `;

    revalidatePath("/");
    revalidatePath("/admin/carousel");
    return { success: true };
  } catch (error) {
    console.error("Error creating slide:", error);
    return { success: false, error: "Failed to create slide" };
  }
}

export async function deleteSlide(id: string) {
  try {
    await requireAdmin();
    await sql`DELETE FROM "HeroSlide" WHERE "id" = ${id}`;
    revalidatePath("/");
    revalidatePath("/admin/carousel");
    return { success: true };
  } catch (error) {
    console.error("Error deleting slide:", error);
    return { success: false, error: "Failed to delete slide" };
  }
}
