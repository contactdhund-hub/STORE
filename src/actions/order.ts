"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function createOrder(data: any) {
  try {
    // Generate order ID
    const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `#ORD-${randomChars}`;
    const now = new Date().toISOString();

    // Create the order
    const [order] = await sql`
      INSERT INTO "Order" ("id", "orderId", "email", "firstName", "lastName", "address", "apartment", "city", "postalCode", "phone", "totalAmount", "couponCode", "discountAmount", "status", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${orderId}, ${data.email}, ${data.firstName}, ${data.lastName}, ${data.address}, ${data.apartment || null}, ${data.city}, ${data.postalCode}, ${data.phone}, ${data.totalAmount}, ${data.couponCode || null}, ${data.discountAmount || null}, 'PENDING', ${now}, ${now})
      RETURNING "id", "orderId"
    `;

    // Insert order items
    for (const item of data.items) {
      await sql`
        INSERT INTO "OrderItem" ("id", "orderId", "productId", "productName", "price", "quantity", "size", "image")
        VALUES (gen_random_uuid(), ${order.id}, ${item.productId}, ${item.name}, ${item.price}, ${item.quantity}, ${item.size || null}, ${item.image || null})
      `;
    }

    revalidatePath("/admin/orders");
    
    return { success: true, orderId: order.orderId };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { success: false, error: "Failed to create order" };
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    await requireAdmin();
    const now = new Date().toISOString();
    await sql`UPDATE "Order" SET "status" = ${status}, "updatedAt" = ${now} WHERE "id" = ${id}`;
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

export async function deleteOrder(id: string) {
  try {
    await requireAdmin();
    await sql`DELETE FROM "Order" WHERE "id" = ${id}`;
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete order:", error);
    return { success: false, error: "Failed to delete order" };
  }
}

export async function trackOrder(orderId: string) {
  try {
    const rows = await sql`
      SELECT "orderId", "status", "createdAt", "totalAmount", "firstName"
      FROM "Order"
      WHERE "orderId" = ${orderId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, order: rows[0] };
  } catch (error) {
    console.error("Failed to track order:", error);
    return { success: false, error: "Failed to track order" };
  }
}
