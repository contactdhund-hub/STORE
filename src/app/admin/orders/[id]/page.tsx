import { sql } from "@/lib/db";
import Link from "next/link";
import { ChevronLeft, Package, User, MapPin, Truck } from "lucide-react";
import { OrderStatusSelect } from "./OrderStatusSelect";

export default async function AdminOrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const [orders, items] = await Promise.all([
    sql`SELECT * FROM "Order" WHERE "id" = ${resolvedParams.id} LIMIT 1`,
    sql`SELECT * FROM "OrderItem" WHERE "orderId" = ${resolvedParams.id}`,
  ]);

  if (orders.length === 0) {
    return <div>Order not found</div>;
  }

  const order = { ...orders[0], items } as any;

  return (
    <div className="max-w-5xl">
      <Link href="/admin/orders" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6">
        <ChevronLeft size={16} className="mr-1" />
        Back to Orders
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            Order {order.orderId}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusSelect orderId={order.id} initialStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-2">
              <Package size={18} className="text-slate-400" />
              <h2 className="font-bold text-slate-800">Order Items</h2>
            </div>
            <div className="p-5 divide-y divide-slate-100">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  <div className="w-16 h-20 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                    {item.image && <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{item.productName}</h3>
                    {item.size && <p className="text-xs text-slate-500 mt-1">Size: {item.size}</p>}
                    <p className="text-xs font-semibold text-slate-600 mt-2">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-sm text-slate-800">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 p-5 border-t border-slate-100">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-800">Rs. {order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-slate-500">Shipping</span>
                <span className="font-semibold text-slate-800">Free</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="font-bold text-slate-800">Total</span>
                <span className="text-xl font-black text-slate-900">Rs. {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-slate-400" />
              <h2 className="font-bold text-slate-800">Customer</h2>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-800">{order.firstName} {order.lastName}</p>
              <p className="text-slate-500 mt-1">{order.email}</p>
              <p className="text-slate-500 mt-1">{order.phone}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-slate-400" />
              <h2 className="font-bold text-slate-800">Shipping Address</h2>
            </div>
            <div className="text-sm text-slate-600 space-y-1">
              <p>{order.firstName} {order.lastName}</p>
              <p>{order.address}</p>
              {order.apartment && <p>{order.apartment}</p>}
              <p>{order.city}, {order.postalCode}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Truck size={18} className="text-slate-400" />
              <h2 className="font-bold text-slate-800">Payment</h2>
            </div>
            <div className="text-sm">
              <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 font-bold text-xs tracking-wider uppercase">
                Cash on Delivery
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
