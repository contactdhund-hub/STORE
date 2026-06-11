"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sendNewOrderAlertToAdmin, sendOrderConfirmationToCustomer, sendOrderStatusUpdate } from "@/lib/email";
import { getStoreSettings } from "@/actions/settings";
import { validateCoupon } from "@/actions/coupon";
import crypto from "crypto";
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

export async function createOrder(data: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
  try {
    const parsedData = OrderSchema.parse(data);

    // Calculate prices server-side
    let calculatedSubtotal = 0;
    const resolvedItems = [];

    for (const item of parsedData.items) {
      const rows = await sql`SELECT "name", "price", "id" FROM "Product" WHERE "id" = ${item.productId} LIMIT 1`;
      if (rows.length === 0) {
        return { success: false, error: `Product not found or invalid.` };
      }
      const product = rows[0];
      calculatedSubtotal += product.price * item.quantity;
      
      resolvedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size || null,
        image: item.image || null
      });
    }

    const settings = await getStoreSettings();
    const shipping = calculatedSubtotal > settings.freeShippingThreshold ? 0 : settings.shippingFee;
    
    let discountAmount = 0;
    if (parsedData.couponCode) {
      const res = await validateCoupon(parsedData.couponCode);
      if (res.valid && res.coupon) {
        if (res.coupon.discountType === "PERCENTAGE") {
          discountAmount = Math.round(calculatedSubtotal * (res.coupon.discountValue / 100));
        } else {
          discountAmount = res.coupon.discountValue;
        }
      } else {
        return { success: false, error: res.error || "Invalid coupon" };
      }
    }
    
    const finalTotal = calculatedSubtotal + shipping - discountAmount;

    // Generate secure order ID
    const randomChars = crypto.randomBytes(4).toString('hex').toUpperCase();
    const orderId = `#ORD-${randomChars}`;
    const now = new Date().toISOString();

    // Create the order
    const [order] = await sql`
      INSERT INTO "Order" ("id", "orderId", "email", "firstName", "lastName", "address", "apartment", "city", "postalCode", "phone", "totalAmount", "couponCode", "discountAmount", "status", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${orderId}, ${parsedData.email}, ${parsedData.firstName}, ${parsedData.lastName}, ${parsedData.address}, ${parsedData.apartment || null}, ${parsedData.city}, ${parsedData.postalCode}, ${parsedData.phone}, ${finalTotal}, ${parsedData.couponCode || null}, ${discountAmount > 0 ? discountAmount : null}, 'PENDING', ${now}, ${now})
      RETURNING "id", "orderId"
    `;

    // Insert order items using server-resolved prices and names
    for (const item of resolvedItems) {
      await sql`
        INSERT INTO "OrderItem" ("id", "orderId", "productId", "productName", "price", "quantity", "size", "image")
        VALUES (gen_random_uuid(), ${order.id}, ${item.productId}, ${item.name}, ${item.price}, ${item.quantity}, ${item.size}, ${item.image})
      `;
    }

    // Trigger emails asynchronously (do not await so user isn't blocked)
    const fullOrderData = { ...parsedData, orderId: order.orderId, totalAmount: finalTotal, discountAmount: discountAmount > 0 ? discountAmount : null };
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
      SELECT 
        o."orderId", o."status", o."createdAt", o."totalAmount", o."firstName",
        COALESCE(json_agg(DISTINCT jsonb_build_object('productName', oi."productName", 'quantity', oi."quantity", 'size', oi."size", 'image', oi."image")) FILTER (WHERE oi."id" IS NOT NULL), '[]') as items
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON oi."orderId" = o."id"
      WHERE o."orderId" = ${orderId}
      GROUP BY o."id"
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
