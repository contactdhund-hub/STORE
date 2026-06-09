"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function createOrder(data: any) {
  try {
    // Generate order ID
    const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `#ORD-${randomChars}`;

    // Create the order
    const order = await db.order.create({
      data: {
        orderId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        apartment: data.apartment || null,
        city: data.city,
        postalCode: data.postalCode,
        phone: data.phone,
        totalAmount: data.totalAmount,
        couponCode: data.couponCode || null,
        discountAmount: data.discountAmount || null,
        status: "PENDING",
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            productName: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size || null,
            image: item.image || null,
          })),
        },
      },
    });

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
    await db.order.update({
      where: { id },
      data: { status },
    });
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
    await db.order.delete({
      where: { id },
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete order:", error);
    return { success: false, error: "Failed to delete order" };
  }
}

export async function trackOrder(orderId: string) {
  try {
    const order = await db.order.findUnique({
      where: { orderId },
      select: {
        orderId: true,
        status: true,
        createdAt: true,
        totalAmount: true,
        firstName: true,
      }
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, order };
  } catch (error) {
    console.error("Failed to track order:", error);
    return { success: false, error: "Failed to track order" };
  }
}
