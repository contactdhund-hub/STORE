"use client";

import { useState, useTransition } from "react";
import { createProduct } from "@/actions/product";
import { Plus, X } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

export function NewProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await createProduct(formData);
        setIsOpen(false);
        setImageUrls([]);
      } catch (error) {
        console.error(error);
        alert("Failed to create product");
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-[#0f172a] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
      >
        <Plus size={16} />
        Add Product
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
              <h2 className="text-2xl font-bold">Add New Product</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <form action={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input type="text" name="name" required disabled={isPending} className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-black focus:border-black transition-colors" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows={3} disabled={isPending} className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-black focus:border-black transition-colors" placeholder="Detailed description of the product..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (PKR)</label>
                  <input type="number" name="price" required disabled={isPending} className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-black focus:border-black transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input type="text" name="category" required disabled={isPending} placeholder="e.g. Straight Fit | Men" className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-black focus:border-black transition-colors" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (Comma Separated)</label>
                <input type="text" name="sizes" disabled={isPending} placeholder="e.g. S, M, L, XL, 32, 34" className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-black focus:border-black transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Colors (Format Name:Hex, Comma Separated)</label>
                <input type="text" name="colors" disabled={isPending} placeholder="e.g. Black:#111111, Navy:#000080" className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-black focus:border-black transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                <div className="flex flex-col gap-3">
                  {imageUrls.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                          <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <CldUploadWidget 
                    signatureEndpoint="/api/sign-cloudinary-params"
                    onSuccess={(result: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
                      if (result.info && result.info.secure_url) {
                        setImageUrls(prev => [...prev, result.info.secure_url]);
                      }
                    }}
                  >
                    {({ open }) => (
                      <button 
                        type="button" 
                        onClick={() => open()} 
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-black hover:text-black transition-colors flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100"
                      >
                        <Plus size={20} />
                        <span className="text-sm font-medium">Upload Image</span>
                      </button>
                    )}
                  </CldUploadWidget>
                </div>
                <input type="hidden" name="images" value={imageUrls.join(',')} />
                <p className="text-xs text-gray-500 mt-2">Leave blank to use a default placeholder image.</p>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2.5 rounded-md font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="bg-black text-white px-6 py-2.5 rounded-md font-bold tracking-wide hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                  {isPending ? "Creating..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
