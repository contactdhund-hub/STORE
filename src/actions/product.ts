"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const ProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be a positive number"),
  description: z.string().optional()
});

export async function deleteProduct(id: string) {
  await requireAdmin();
  await sql`DELETE FROM "Product" WHERE "id" = ${id}`;
  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const priceStr = formData.get("price")?.toString();
  const price = priceStr ? parseFloat(priceStr) : NaN;

  const parsed = ProductSchema.safeParse({
    name: formData.get("name")?.toString().trim(),
    category: formData.get("category")?.toString().trim(),
    price: price,
    description: formData.get("description")?.toString().trim() || ""
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { name, category, price: validPrice, description } = parsed.data;

  const imagesInput = formData.get("images")?.toString() || "";
  const sizesInput = formData.get("sizes")?.toString() || "";
  const colorsInput = formData.get("colors")?.toString() || "";

  // Process Images
  const images = imagesInput 
    ? imagesInput.split(',').map(i => i.trim()).filter(Boolean)
    : ["https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop"];

  // Process Sizes
  const sizes = sizesInput
    ? sizesInput.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Process Colors (Format: Name:Hex)
  const colors = colorsInput
    ? colorsInput.split(',').map(c => {
        const [colorName, hex] = c.split(':').map(part => part.trim());
        return { name: colorName || "Color", hex: hex || "#000000" };
      }).filter(c => c.name)
    : [];

  const now = new Date().toISOString();

  // Create the product
  const [product] = await sql`
    INSERT INTO "Product" ("id", "name", "description", "price", "category", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${name}, ${description}, ${validPrice}, ${category}, ${now}, ${now})
    RETURNING "id"
  `;

  // Insert images
  for (const url of images) {
    await sql`
      INSERT INTO "ProductImage" ("id", "url", "productId")
      VALUES (gen_random_uuid(), ${url}, ${product.id})
    `;
  }

  // Insert sizes
  for (const sizeName of sizes) {
    await sql`
      INSERT INTO "ProductSize" ("id", "name", "productId")
      VALUES (gen_random_uuid(), ${sizeName}, ${product.id})
    `;
  }

  // Insert colors
  for (const color of colors) {
    await sql`
      INSERT INTO "ProductColor" ("id", "name", "hex", "productId")
      VALUES (gen_random_uuid(), ${color.name}, ${color.hex}, ${product.id})
    `;
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
}
