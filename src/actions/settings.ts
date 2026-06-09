"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function getStoreSettings() {
  let settings = await db.storeSettings.findUnique({
    where: { id: "default" }
  });

  if (!settings) {
    settings = await db.storeSettings.create({
      data: {
        id: "default",
        shippingFee: 250,
        freeShippingThreshold: 2000
      }
    });
  }

  return settings;
}

export async function updateStoreSettings(formData: FormData) {
  await requireAdmin();

  const shippingFee = parseFloat(formData.get("shippingFee")?.toString() || "250");
  const freeShippingThreshold = parseFloat(formData.get("freeShippingThreshold")?.toString() || "2000");

  await db.storeSettings.upsert({
    where: { id: "default" },
    update: {
      shippingFee,
      freeShippingThreshold
    },
    create: {
      id: "default",
      shippingFee,
      freeShippingThreshold
    }
  });

  revalidatePath("/");
  revalidatePath("/checkout");
  revalidatePath("/admin/settings");
}
