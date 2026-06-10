"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function createCoupon(formData: FormData) {
  await requireAdmin();

  const code = formData.get("code")?.toString().trim().toUpperCase();
  const discountType = formData.get("discountType")?.toString();
  const discountValueStr = formData.get("discountValue")?.toString();
  
  if (!code || !discountType || !discountValueStr) {
    throw new Error("Missing required fields");
  }

  const discountValue = parseFloat(discountValueStr);
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO "Coupon" ("id", "code", "discountType", "discountValue", "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${code}, ${discountType}, ${discountValue}, true, ${now}, ${now})
    `;
  } catch (error) {
    console.error(error);
    throw new Error("Coupon code might already exist");
  }

  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await requireAdmin();

  await sql`DELETE FROM "Coupon" WHERE "id" = ${id}`;
  revalidatePath("/admin/coupons");
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
  await requireAdmin();
  const now = new Date().toISOString();

  await sql`UPDATE "Coupon" SET "isActive" = ${isActive}, "updatedAt" = ${now} WHERE "id" = ${id}`;
  revalidatePath("/admin/coupons");
}

export async function validateCoupon(code: string) {
  const rows = await sql`
    SELECT * FROM "Coupon" WHERE "code" = ${code.toUpperCase()} LIMIT 1
  `;

  if (rows.length === 0 || !rows[0].isActive) {
    return { valid: false, error: "Invalid or expired coupon code." };
  }

  return { valid: true, coupon: rows[0] };
}
