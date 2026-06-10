import { sql } from "@/lib/db";
import { deleteProduct, toggleProductStock } from "@/actions/product";
import { NewProductModal } from "./new-product-modal";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export default async function AdminProducts() {
  const products = await sql`
    SELECT * FROM "Product" ORDER BY "createdAt" DESC
  `;

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 mb-1">Products</h1>
          <p className="text-sm text-slate-500">Manage your product inventory</p>
        </div>
        <NewProductModal />
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-4xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              All Categories
              <ChevronDown size={16} className="text-slate-400" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              All Status
              <ChevronDown size={16} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">PRODUCT</th>
                <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">CATEGORY</th>
                <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">PRICE</th>
                <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">STOCK</th>
                <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">STATUS</th>
                <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-slate-500 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 text-sm">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{product.category}</td>
                  <td className="px-6 py-4 text-slate-900 font-medium text-sm">PKR {product.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <form action={async () => {
                      "use server";
                      await toggleProductStock(product.id, !product.inStock);
                    }}>
                      <button type="submit" className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${product.inStock ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={async () => {
                      "use server";
                      await deleteProduct(product.id);
                    }}>
                      <button type="submit" className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors px-3 py-1.5 rounded-md hover:bg-red-50 inline-block">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">Loading products...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Showing {products.length} products
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft size={16} />
              Previous
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#0f172a] text-white text-sm font-medium">
              1
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
