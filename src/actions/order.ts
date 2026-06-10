"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sendNewOrderAlertToAdmin, sendOrderConfirmationToCustomer, sendOrderStatusUpdate } from "@/lib/email";
import { z } from "zod";

const OrderItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  name: z.string().min(1, "Product name is required"),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  size: z.string().optional().nullable(),
  image: z.string().optional().nullable()
});

const OrderSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  apartment: z.string().optional().nullable(),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(2, "Postal code is required"),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
  totalAmount: z.number().positive("Total amount must be positive"),
  couponCode: z.string().optional().nullable(),
  discountAmount: z.number().optional().nullable(),
  items: z.array(OrderItemSchema).min(1, "Order must contain at least one item")
});

const OrderStatusSchema = z.enum(['PENDING', 'APPROVED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']);

export async function createOrder(data: any) {
  try {
    const parsedData = OrderSchema.parse(data);

    // Generate order ID
    const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `#ORD-${randomChars}`;
    const now = new Date().toISOString();

    // Create the order
    const [order] = await sql`
      INSERT INTO "Order" ("id", "orderId", "email", "firstName", "lastName", "address", "apartment", "city", "postalCode", "phone", "totalAmount", "couponCode", "discountAmount", "status", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${orderId}, ${parsedData.email}, ${parsedData.firstName}, ${parsedData.lastName}, ${parsedData.address}, ${parsedData.apartment || null}, ${parsedData.city}, ${parsedData.postalCode}, ${parsedData.phone}, ${parsedData.totalAmount}, ${parsedData.couponCode || null}, ${parsedData.discountAmount || null}, 'PENDING', ${now}, ${now})
      RETURNING "id", "orderId"
    `;

    // Insert order items
    for (const item of parsedData.items) {
      await sql`
        INSERT INTO "OrderItem" ("id", "orderId", "productId", "productName", "price", "quantity", "size", "image")
        VALUES (gen_random_uuid(), ${order.id}, ${item.productId}, ${item.name}, ${item.price}, ${item.quantity}, ${item.size || null}, ${item.image || null})
      `;
    }

    // Trigger emails asynchronously (do not await so user isn't blocked)
    const fullOrderData = { ...parsedData, orderId: order.orderId };
    sendNewOrderAlertToAdmin(fullOrderData);
    sendOrderConfirmationToCustomer(fullOrderData);

    revalidatePath("/admin/orders");
    
    return { success: true, orderId: order.orderId };
  } catch (error) {
    console.error("Failed to create order:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to create order" };
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    await requireAdmin();
    const validStatus = OrderStatusSchema.parse(status);
    const now = new Date().toISOString();
    const rows = await sql`UPDATE "Order" SET "status" = ${validStatus}, "updatedAt" = ${now} WHERE "id" = ${id} RETURNING "orderId", "email", "firstName"`;
    
    if (rows.length > 0) {
      sendOrderStatusUpdate(rows[0].orderId, rows[0].email, rows[0].firstName, validStatus);
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
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
