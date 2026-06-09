"use client";

import { useState } from "react";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { createSlide, deleteSlide } from "@/actions/carousel";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  order: number;
}

export function CarouselManager({ initialSlides }: { initialSlides: Slide[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      setLoadingId(id);
      await deleteSlide(id);
      setLoadingId(null);
    }
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingId("new");
    const formData = new FormData(e.currentTarget);
    await createSlide(formData);
    setIsAdding(false);
    setLoadingId(null);
  };

  return (
    <div>
      {/* Header Actions */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="font-semibold text-gray-800">Current Slides ({initialSlides.length})</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          {isAdding ? "Cancel" : <><Plus size={16} /> Add Slide</>}
        </button>
      </div>

      {/* Add Slide Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-6 border-b border-gray-100 bg-[#fcfcfc] grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-full mb-2">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-700">Add New Slide</h3>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Image URL</label>
            <input required name="image" type="url" placeholder="https://images.unsplash.com/..." className="w-full border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Title</label>
            <input required name="title" type="text" placeholder="NEW ARRIVALS" className="w-full border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Subtitle</label>
            <input required name="subtitle" type="text" placeholder="Spring Collection" className="w-full border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Button Link</label>
            <input name="link" type="text" defaultValue="/" className="w-full border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-black" />
          </div>
          <div className="col-span-full flex justify-end mt-2">
            <button disabled={loadingId === "new"} type="submit" className="bg-black text-white px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">
              {loadingId === "new" ? "Saving..." : "Save Slide"}
            </button>
          </div>
        </form>
      )}

      {/* Slides List */}
      <div className="divide-y divide-gray-100">
        {initialSlides.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <ImageIcon size={48} className="text-gray-200 mb-4" />
            <p>No slides configured. Add one above to display the carousel on the homepage.</p>
          </div>
        ) : (
          initialSlides.map((slide) => (
            <div key={slide.id} className="p-6 flex flex-col md:flex-row gap-6 items-center hover:bg-gray-50/50 transition-colors">
              <div className="w-full md:w-64 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-2">
                  <span className="text-[8px] font-bold tracking-widest uppercase">{slide.subtitle}</span>
                  <span className="text-sm font-black tracking-tighter uppercase">{slide.title}</span>
                </div>
              </div>
              
              <div className="flex-1 w-full flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-900">{slide.title}</h4>
                  <p className="text-sm text-gray-500">{slide.subtitle}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    Link: <span className="font-mono bg-gray-100 px-1 rounded">{slide.link}</span>
                  </p>
                </div>
                
                <button 
                  onClick={() => handleDelete(slide.id)}
                  disabled={loadingId === slide.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  title="Delete Slide"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
