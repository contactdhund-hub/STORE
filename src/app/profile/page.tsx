import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import LogoutButton from "./LogoutButton";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Redirect admins to the admin dashboard
  if ((session.user as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).role === "ADMIN") {
    redirect("/admin");
  }

  // Fetch orders linked to this email
  const orders = await sql`
    SELECT * FROM "Order" 
    WHERE "email" = ${session.user.email} 
    ORDER BY "createdAt" DESC
  `;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-medium text-gray-900 mb-2">My Account</h1>
          <p className="text-sm text-gray-500">Welcome back, {session.user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-[#fcfcfc]">
          <h2 className="text-lg font-bold text-gray-900">Order History</h2>
          <p className="text-sm text-gray-500">View and track your past orders.</p>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
            <p className="text-sm text-gray-500">When you place an order, it will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#fcfcfc] border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-gray-500">ORDER ID</th>
                  <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-gray-500">DATE</th>
                  <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-gray-500">TOTAL</th>
                  <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-gray-500">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-gray-900 font-medium">#{order.orderId}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium text-sm">
                      Rs {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border
                        ${order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                          order.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          order.status === 'SHIPPED' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                          order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          'bg-red-50 text-red-700 border-red-200'}
                      `}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
