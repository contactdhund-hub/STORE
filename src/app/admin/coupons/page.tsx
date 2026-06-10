import { sql } from "@/lib/db";
import { createCoupon, deleteCoupon, toggleCouponStatus } from "@/actions/coupon";
import { Trash2, Plus, Percent, DollarSign, Check, X } from "lucide-react";

// Server action wrapper for forms
async function handleCreate(formData: FormData) {
  "use server";
  await createCoupon(formData);
}

async function handleDelete(formData: FormData) {
  "use server";
  await deleteCoupon(formData.get("id") as string);
}

async function handleToggle(formData: FormData) {
  "use server";
  await toggleCouponStatus(formData.get("id") as string, formData.get("isActive") === "true");
}

export default async function CouponsPage() {
  const coupons = await sql`
    SELECT * FROM "Coupon" ORDER BY "createdAt" DESC
  `;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Discount Coupons</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Coupon Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
          <h2 className="text-xl font-semibold mb-6">Create New Coupon</h2>
          <form action={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Coupon Code</label>
              <input type="text" name="code" required placeholder="e.g. SUMMER20" className="w-full uppercase px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Discount Type</label>
              <select name="discountType" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (Rs.)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Discount Value</label>
              <input type="number" name="discountValue" required placeholder="e.g. 20" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" />
            </div>

            <button type="submit" className="w-full bg-black text-white px-4 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-4">
              <Plus size={18} />
              Add Coupon
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {coupons.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No coupons created yet.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-600">
                  <tr>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Discount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map((coupon: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                    <tr key={coupon.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold font-mono bg-slate-100 px-2 py-1 rounded text-slate-800">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          {coupon.discountType === "PERCENTAGE" ? <Percent size={14} className="text-blue-500" /> : <DollarSign size={14} className="text-green-500" />}
                          {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `Rs. ${coupon.discountValue}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <form action={handleToggle}>
                          <input type="hidden" name="id" value={coupon.id} />
                          <input type="hidden" name="isActive" value={coupon.isActive ? "false" : "true"} />
                          <button type="submit" className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${coupon.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                            {coupon.isActive ? <><Check size={12}/> Active</> : <><X size={12}/> Disabled</>}
                          </button>
                        </form>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={coupon.id} />
                          <button type="submit" className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
