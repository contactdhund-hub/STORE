"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/actions/order";

export function OrderStatusSelect({ orderId, initialStatus }: { orderId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, setIsPending] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setIsPending(true);
    await updateOrderStatus(orderId, newStatus);
    setIsPending(false);
  };

  return (
    <select 
      value={status} 
      onChange={handleStatusChange}
      disabled={isPending}
      className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md border focus:ring-black focus:border-black transition-colors ${
        status === 'DELIVERED' ? 'bg-green-50 border-green-200 text-green-700' :
        status === 'OUT_FOR_DELIVERY' ? 'bg-blue-50 border-blue-200 text-blue-700' :
        status === 'APPROVED' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
        status === 'CANCELLED' ? 'bg-red-50 border-red-200 text-red-700' :
        'bg-orange-50 border-orange-200 text-orange-700'
      }`}
    >
      <option value="PENDING">Placed (Pending)</option>
      <option value="APPROVED">Approved</option>
      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
      <option value="DELIVERED">Delivered</option>
      <option value="CANCELLED">Cancelled</option>
    </select>
  );
}
