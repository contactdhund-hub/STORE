"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.product.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || "";
  const category = formData.get("category")?.toString().trim();
  
  const priceStr = formData.get("price")?.toString();
  const price = priceStr ? parseFloat(priceStr) : NaN;

  if (!name || !category || isNaN(price)) {
    throw new Error("Invalid input: Please ensure Name, Category, and a valid Price are provided.");
  }

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

  await db.product.create({
    data: {
      name,
      description,
      price,
      category,
      images: {
        create: images.map(url => ({ url }))
      },
      sizes: {
        create: sizes.map(name => ({ name }))
      },
      colors: {
        create: colors.map(c => ({ name: c.name, hex: c.hex }))
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/products");
}
