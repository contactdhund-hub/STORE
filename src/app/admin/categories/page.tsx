import { sql } from "@/lib/db";
import { createCategory, deleteCategory } from "@/actions/category";
import { Trash2, Plus, List } from "lucide-react";

async function handleCreate(formData: FormData) {
  "use server";
  await createCategory(formData);
}

async function handleDelete(formData: FormData) {
  "use server";
  await deleteCategory(formData.get("id") as string);
}

export default async function CategoriesPage() {
  const categories = await sql`
    SELECT * FROM "Category" ORDER BY "createdAt" ASC
  `;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Category Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
          <h2 className="text-xl font-semibold mb-6">Add New Category</h2>
          <form action={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
              <input type="text" name="name" required placeholder="e.g. SUMMER SALE" className="w-full uppercase px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" />
            </div>

            <button type="submit" className="w-full bg-black text-white px-4 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-4">
              <Plus size={18} />
              Add Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {categories.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-4">
                <List size={48} className="text-slate-300" />
                <p>No categories found. Add your first category.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-600">
                  <tr>
                    <th className="px-6 py-4">Category Name</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((cat: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold tracking-wider uppercase text-slate-800">
                          {cat.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={cat.id} />
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
