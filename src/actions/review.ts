"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function submitReview(formData: FormData) {
  try {
    const productId = formData.get("productId") as string;
    const reviewerName = formData.get("reviewerName") as string;
    const reviewerEmail = formData.get("reviewerEmail") as string;
    const rating = parseInt(formData.get("rating") as string);
    const comment = formData.get("comment") as string;

    if (!productId || !reviewerName || !reviewerEmail || !rating || !comment) {
      return { success: false, error: "All fields are required." };
    }

    // VERIFICATION: Check if an Order exists with the provided email that contains this productId
    const purchaseCheck = await sql`
      SELECT oi."id" FROM "OrderItem" oi
      INNER JOIN "Order" o ON o."id" = oi."orderId"
      WHERE oi."productId" = ${productId} AND o."email" = ${reviewerEmail}
      LIMIT 1
    `;

    if (purchaseCheck.length === 0) {
      return { success: false, error: "You can only review products that you have purchased." };
    }

    // Check if they already reviewed it to prevent duplicates
    const existingReview = await sql`
      SELECT "id" FROM "Review"
      WHERE "productId" = ${productId} AND "reviewerEmail" = ${reviewerEmail}
      LIMIT 1
    `;

    if (existingReview.length > 0) {
      return { success: false, error: "You have already reviewed this product." };
    }

    // Create Review
    const now = new Date().toISOString();
    await sql`
      INSERT INTO "Review" ("id", "rating", "comment", "reviewerName", "reviewerEmail", "productId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${rating}, ${comment}, ${reviewerName}, ${reviewerEmail}, ${productId}, ${now}, ${now})
    `;

    revalidatePath(`/product/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("Error submitting review:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function deleteReview(id: string) {
  try {
    await requireAdmin();
    const rows = await sql`
      DELETE FROM "Review" WHERE "id" = ${id} RETURNING "productId"
    `;
    
    if (rows.length > 0) {
      // Revalidate admin page
      revalidatePath('/admin/reviews');
      // Revalidate product page
      revalidatePath(`/product/${rows[0].productId}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, error: "An unexpected error occurred while deleting the review." };
  }
}
