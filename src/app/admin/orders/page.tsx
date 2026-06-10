import { sql } from "@/lib/db";
import Link from "next/link";
import { Eye, Clock, CheckCircle, XCircle, Truck } from "lucide-react";

export default async function AdminOrders() {
  const orders = await sql`
    SELECT * FROM "Order" ORDER BY "createdAt" DESC
  `;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track customer orders</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{order.orderId}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{order.firstName} {order.lastName}</div>
                    <div className="text-xs text-slate-500">{order.email}</div>
                  </td>
                  <td className="px-6 py-4">{new Date(order.createdAt).toISOString().split('T')[0]}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">Rs. {order.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'APPROVED' ? 'bg-indigo-100 text-indigo-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status === 'DELIVERED' && <CheckCircle size={12} />}
                      {order.status === 'OUT_FOR_DELIVERY' && <Truck size={12} />}
                      {order.status === 'APPROVED' && <CheckCircle size={12} />}
                      {order.status === 'CANCELLED' && <XCircle size={12} />}
                      {order.status === 'PENDING' && <Clock size={12} />}
                      {order.status === 'PENDING' ? 'PLACED' : order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold hover:bg-slate-50 transition-colors">
                      <Eye size={14} />
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
