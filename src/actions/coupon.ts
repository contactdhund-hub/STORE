"use server";

import { db } from "@/lib/db";
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

  try {
    await db.coupon.create({
      data: {
        code,
        discountType,
        discountValue,
        isActive: true,
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error("Coupon code might already exist");
  }

  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await requireAdmin();

  await db.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
  await requireAdmin();

  await db.coupon.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath("/admin/coupons");
}

export async function validateCoupon(code: string) {
  const coupon = await db.coupon.findUnique({
    where: { code: code.toUpperCase() }
  });

  if (!coupon || !coupon.isActive) {
    return { valid: false, error: "Invalid or expired coupon code." };
  }

  return { valid: true, coupon };
}
