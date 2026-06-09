"use client";

import { useState } from "react";
import { trackOrder } from "@/actions/order";
import { Search, Package, Truck, CheckCircle, ClipboardCheck } from "lucide-react";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setIsPending(true);
    setError("");
    setOrderData(null);

    // Automatically prepend #ORD- if user only typed numbers, but safely
    let formattedId = orderId.trim().toUpperCase();
    if (!formattedId.startsWith("#ORD-")) {
       if (formattedId.startsWith("ORD-")) {
         formattedId = `#${formattedId}`;
       } else if (!formattedId.startsWith("#")) {
         formattedId = `#ORD-${formattedId}`;
       }
    }

    const result = await trackOrder(formattedId);
    
    if (result.success) {
      setOrderData(result.order);
    } else {
      setError(result.error || "Order not found. Please check the ID and try again.");
    }
    
    setIsPending(false);
  };

  return (
    <div className="min-h-[70vh] bg-[#f8f9fc] py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0a1128] mb-4 tracking-tight">Track Your Order</h1>
          <p className="text-gray-500">Enter your order ID below to check the current status of your shipment.</p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., #ORD-9A2XF"
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent uppercase transition-all"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-black text-white px-8 py-4 rounded-lg font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isPending ? "Tracking..." : "Track"}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm font-medium text-center">
              {error}
            </div>
          )}
        </div>

        {orderData && (
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-100 pb-6 gap-4">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Order Number</p>
                <h2 className="text-2xl font-black text-[#0a1128]">{orderData.orderId}</h2>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-500 font-medium mb-1">Order Date</p>
                <p className="font-semibold">{new Date(orderData.createdAt).toISOString().split('T')[0]}</p>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-lg font-bold mb-6">Tracking Status</h3>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-100"></div>

                <div className="space-y-8 relative">
                  {/* Step 1: Placed */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 relative z-10 shadow-md">
                      <Package size={20} />
                    </div>
                    <div className="pt-2">
                      <h4 className="font-bold text-[#0a1128]">Order Placed</h4>
                      <p className="text-sm text-gray-500 mt-1">We have received your order.</p>
                    </div>
                  </div>

                  {/* Step 2: Approved */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 transition-colors ${
                      ['APPROVED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(orderData.status) ? 'bg-black text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-300'
                    }`}>
                      <ClipboardCheck size={20} />
                    </div>
                    <div className="pt-2">
                      <h4 className={`font-bold ${['APPROVED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(orderData.status) ? 'text-[#0a1128]' : 'text-gray-400'}`}>Order Approved</h4>
                      <p className="text-sm text-gray-500 mt-1">Your order has been confirmed and is being prepared.</p>
                    </div>
                  </div>

                  {/* Step 3: Out for Delivery */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 transition-colors ${
                      ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(orderData.status) ? 'bg-black text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-300'
                    }`}>
                      <Truck size={20} />
                    </div>
                    <div className="pt-2">
                      <h4 className={`font-bold ${['OUT_FOR_DELIVERY', 'DELIVERED'].includes(orderData.status) ? 'text-[#0a1128]' : 'text-gray-400'}`}>
                        Out for Delivery
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Your package has been handed over to our delivery partner.
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Delivered or Cancelled */}
                  <div className="flex items-start gap-4">
                    {orderData.status === 'CANCELLED' ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0 relative z-10 shadow-sm border border-red-200">
                          <CheckCircle size={20} />
                        </div>
                        <div className="pt-2">
                          <h4 className="font-bold text-red-600">Order Cancelled</h4>
                          <p className="text-sm text-gray-500 mt-1">This order was cancelled.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 transition-colors ${
                          orderData.status === 'DELIVERED' ? 'bg-green-500 text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-300'
                        }`}>
                          <CheckCircle size={20} />
                        </div>
                        <div className="pt-2">
                          <h4 className={`font-bold ${orderData.status === 'DELIVERED' ? 'text-green-600' : 'text-gray-400'}`}>Delivered</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {orderData.status === 'DELIVERED' ? 'Package has been delivered successfully.' : 'Pending delivery.'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500 font-medium">Customer</p>
                <p className="font-bold text-[#0a1128]">{orderData.firstName}</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-sm text-gray-500 font-medium">Total Amount</p>
                <p className="font-black text-xl text-[#0a1128]">Rs. {orderData.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
