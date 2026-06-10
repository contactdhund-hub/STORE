"use client";

import { useState } from "react";
import { deleteOrder } from "@/actions/order";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeleteOrderButton({ orderId, isIconOnly = false }: { orderId: string, isIconOnly?: boolean }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this order?")) {
      setIsPending(true);
      const result = await deleteOrder(orderId);
      if (result.success) {
        // If we are on the order details page, redirect. Otherwise, the revalidatePath in deleteOrder will refresh the list.
        if (!isIconOnly) {
          router.push("/admin/orders");
        }
      } else {
        alert("Failed to delete order");
        setIsPending(false);
      }
    }
  };

  if (isIconOnly) {
    return (
      <button 
        onClick={handleDelete} 
        disabled={isPending}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 rounded-md text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
        title="Delete Order"
      >
        <Trash2 size={14} />
      </button>
    );
  }

  return (
    <button 
      onClick={handleDelete} 
      disabled={isPending}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-md text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
    >
      <Trash2 size={16} />
      {isPending ? "Deleting..." : "Delete Order"}
    </button>
  );
}
