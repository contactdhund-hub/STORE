"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const SlideSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  image: z.string().url("Valid image URL is required"),
  link: z.string().optional().default("/"),
  order: z.number().int().default(0)
});

export async function createSlide(formData: FormData) {
  try {
    await requireAdmin();
    const parsed = SlideSchema.safeParse({
      title: formData.get("title"),
      subtitle: formData.get("subtitle") || "",
      image: formData.get("image"),
      link: formData.get("link") || "/",
      order: parseInt(formData.get("order") as string || "0")
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { title, subtitle, image, link, order } = parsed.data;
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
