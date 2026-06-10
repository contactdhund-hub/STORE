"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { unstable_cache } from "next/cache";

// Cache settings for 120 seconds — called on every storefront page
const getStoreSettingsCached = unstable_cache(
  async () => {
    const rows = await sql`
      SELECT * FROM "StoreSettings" WHERE "id" = 'default' LIMIT 1
    `;

    if (rows.length === 0) {
      const now = new Date().toISOString();
      const [settings] = await sql`
        INSERT INTO "StoreSettings" ("id", "shippingFee", "freeShippingThreshold", "updatedAt")
        VALUES ('default', 250, 2000, ${now})
        RETURNING *
      `;
      return settings;
    }

    return rows[0];
  },
  ['store-settings'],
  { revalidate: 120 }
);

export async function getStoreSettings() {
  return await getStoreSettingsCached();
}

export async function updateStoreSettings(formData: FormData) {
  await requireAdmin();

  const shippingFee = parseFloat(formData.get("shippingFee")?.toString() || "250");
  const freeShippingThreshold = parseFloat(formData.get("freeShippingThreshold")?.toString() || "2000");
  const now = new Date().toISOString();

  await sql`
    INSERT INTO "StoreSettings" ("id", "shippingFee", "freeShippingThreshold", "updatedAt")
    VALUES ('default', ${shippingFee}, ${freeShippingThreshold}, ${now})
    ON CONFLICT ("id") DO UPDATE SET
      "shippingFee" = ${shippingFee},
      "freeShippingThreshold" = ${freeShippingThreshold},
      "updatedAt" = ${now}
  `;

  revalidatePath("/");
  revalidatePath("/checkout");
  revalidatePath("/admin/settings");
}
