"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function toggleWishlist(productId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, error: "You must be logged in to manage your wishlist." };
    }
    const email = session.user.email;

    // Check if it's already in wishlist
    const existing = await sql`
      SELECT "id" FROM "Wishlist" 
      WHERE "email" = ${email} AND "productId" = ${productId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      // Remove it
      await sql`
        DELETE FROM "Wishlist" 
        WHERE "id" = ${existing[0].id}
      `;
    } else {
      // Add it
      await sql`
        INSERT INTO "Wishlist" ("email", "productId")
        VALUES (${email}, ${productId})
      `;
    }

    revalidatePath(`/product/${productId}`);
    return { success: true, isWishlisted: existing.length === 0 };
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function checkWishlist(productId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return false;
    }
    const email = session.user.email;

    const existing = await sql`
      SELECT "id" FROM "Wishlist" 
      WHERE "email" = ${email} AND "productId" = ${productId}
      LIMIT 1
    `;

    return existing.length > 0;
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return false;
  }
}
