"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const CouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").transform(val => val.trim().toUpperCase()),
  discountType: z.enum(["PERCENTAGE", "FIXED"], { message: "Discount type is required" }),
  discountValue: z.number().positive("Discount value must be a positive number")
});

export async function createCoupon(formData: FormData) {
  await requireAdmin();

  const parsed = CouponSchema.safeParse({
    code: formData.get("code")?.toString() || "",
    discountType: formData.get("discountType")?.toString(),
    discountValue: parseFloat(formData.get("discountValue")?.toString() || "NaN")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { code, discountType, discountValue } = parsed.data;
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
