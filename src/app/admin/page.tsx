import { sql } from "@/lib/db";
import Link from "next/link";
import { DollarSign, ShoppingBag, Package, TrendingUp, ArrowRight, CheckCircle, Clock, Truck, XCircle } from "lucide-react";
import { DashboardChart } from "./DashboardChart";

interface OrderRow {
  id?: string;
  orderId?: string;
  firstName?: string;
  lastName?: string;
  totalAmount: number;
  status: string;
  createdAt: string | Date;
}

export default async function AdminDashboard() {
  // Fetch data concurrently
  const [productCountResult, ordersRaw, recentOrdersRaw] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM "Product"`,
    sql`SELECT "totalAmount", "status", "createdAt" FROM "Order" WHERE "status" != 'CANCELLED'`,
    sql`SELECT "id", "orderId", "firstName", "lastName", "totalAmount", "status", "createdAt" FROM "Order" ORDER BY "createdAt" DESC LIMIT 5`
  ]);

  const orders = ordersRaw as unknown as OrderRow[];
  const recentOrders = recentOrdersRaw as unknown as OrderRow[];

  const productCount = parseInt(productCountResult[0].count);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum: number, order: OrderRow) => sum + order.totalAmount, 0);
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Process data for the last 7 days chart
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  const chartData = last7Days.map(day => {
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const dayRevenue = orders
      .filter((o: OrderRow) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= day && orderDate < nextDay;
      })
      .reduce((sum: number, order: OrderRow) => sum + order.totalAmount, 0);
      
    return {
      date: day.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: dayRevenue
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-semibold text-xs tracking-wider uppercase">Total Revenue</h3>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign size={16} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800">Rs. {totalRevenue.toLocaleString()}</p>
          <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
            <TrendingUp size={12} /> Expected Earnings
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-semibold text-xs tracking-wider uppercase">Orders</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag size={16} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800">{totalOrders}</p>
          <p className="text-xs font-medium text-slate-500 mt-2">Active non-cancelled orders</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-semibold text-xs tracking-wider uppercase">Average Value</h3>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp size={16} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800">Rs. {averageOrderValue.toLocaleString()}</p>
          <p className="text-xs font-medium text-slate-500 mt-2">Per order</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-semibold text-xs tracking-wider uppercase">Products</h3>
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <Package size={16} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800">{productCount}</p>
          <p className="text-xs font-medium text-slate-500 mt-2">Total active items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-800 mb-2">Revenue Overview</h2>
          <p className="text-sm text-slate-500 mb-6">Your expected earnings over the last 7 days.</p>
          <DashboardChart data={chartData} />
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No orders yet.</div>
              ) : (
                recentOrders.map((order: OrderRow) => (
                  <Link href={`/admin/orders/${order.id}`} key={order.id} className="block p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-slate-800">{order.orderId}</span>
                      <span className="font-bold text-sm text-slate-800">Rs. {order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">{order.firstName} {order.lastName}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                        order.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'APPROVED' ? 'bg-indigo-100 text-indigo-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {order.status === 'DELIVERED' && <CheckCircle size={10} />}
                        {order.status === 'OUT_FOR_DELIVERY' && <Truck size={10} />}
                        {order.status === 'APPROVED' && <CheckCircle size={10} />}
                        {order.status === 'CANCELLED' && <XCircle size={10} />}
                        {order.status === 'PENDING' && <Clock size={10} />}
                        {order.status === 'PENDING' ? 'PLACED' : order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
