"use server";

import { db } from "@/lib/db";
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
    // Note: If you wanted to check for strictly "DELIVERED", add `status: "DELIVERED"` to the order where clause.
    const hasPurchased = await db.orderItem.findFirst({
      where: {
        productId: productId,
        order: {
          email: reviewerEmail,
        }
      }
    });

    if (!hasPurchased) {
      return { success: false, error: "You can only review products that you have purchased." };
    }

    // Check if they already reviewed it to prevent duplicates
    const existingReview = await db.review.findFirst({
      where: {
        productId,
        reviewerEmail
      }
    });

    if (existingReview) {
      return { success: false, error: "You have already reviewed this product." };
    }

    // Create Review
    await db.review.create({
      data: {
        productId,
        reviewerName,
        reviewerEmail,
        rating,
        comment
      }
    });

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
    const review = await db.review.delete({
      where: { id }
    });
    
    // Revalidate admin page
    revalidatePath('/admin/reviews');
    // Revalidate product page
    revalidatePath(`/product/${review.productId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, error: "An unexpected error occurred while deleting the review." };
  }
}
