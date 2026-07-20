"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, ChevronDown, ChevronUp, X } from "lucide-react";

interface FilterOptions {
  categories: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
}

export function ShopSidebar({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "ALL");
  const [size, setSize] = useState(searchParams.get("size") || "");
  const [color, setColor] = useState(searchParams.get("color") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Sections toggle
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    size: true,
    color: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const applyFilters = (newFilters: { [key: string]: string | null }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "ALL") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ q: search });
  };

  const clearAll = () => {
    setSearch("");
    setCategory("ALL");
    setSize("");
    setColor("");
    setMinPrice("");
    setMaxPrice("");
    router.push("/");
  };

  const SidebarContent = (
    <div className="flex flex-col gap-8 w-full font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 tracking-wide uppercase">Filters</h2>
        {(category !== "ALL" || size || color || minPrice || maxPrice || search) && (
          <button onClick={clearAll} className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-widest underline">
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..." 
          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-black outline-none placeholder:text-gray-400 transition-shadow"
        />
      </form>

      {/* Categories */}
      <div className="border-t border-gray-100 pt-6">
        <button onClick={() => toggleSection('categories')} className="flex items-center justify-between w-full text-left mb-4">
          <span className="text-sm font-bold tracking-widest uppercase text-gray-900">Category</span>
          {openSections.categories ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {openSections.categories && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setCategory("ALL"); applyFilters({ category: "ALL" }); }}
              className={`text-left text-sm transition-colors ${category === "ALL" ? "font-bold text-black" : "text-gray-500 hover:text-black"}`}
            >
              All Categories
            </button>
            {options.categories.map((c) => (
              <button
                key={c}
                onClick={() => { setCategory(c); applyFilters({ category: c }); }}
                className={`text-left text-sm transition-colors ${category === c ? "font-bold text-black" : "text-gray-500 hover:text-black"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-t border-gray-100 pt-6">
        <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full text-left mb-4">
          <span className="text-sm font-bold tracking-widest uppercase text-gray-900">Price (PKR)</span>
          {openSections.price ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {openSections.price && (
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              placeholder="Min" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={() => applyFilters({ minPrice })}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters({ minPrice })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-black outline-none placeholder:text-gray-400 text-center"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={() => applyFilters({ maxPrice })}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters({ maxPrice })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-black outline-none placeholder:text-gray-400 text-center"
            />
          </div>
        )}
      </div>

      {/* Sizes */}
      <div className="border-t border-gray-100 pt-6">
        <button onClick={() => toggleSection('size')} className="flex items-center justify-between w-full text-left mb-4">
          <span className="text-sm font-bold tracking-widest uppercase text-gray-900">Size</span>
          {openSections.size ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {openSections.size && (
          <div className="flex flex-wrap gap-2">
            {options.sizes.map((s) => (
              <button
                key={s}
                onClick={() => {
                  const newSize = size === s ? "" : s;
                  setSize(newSize);
                  applyFilters({ size: newSize });
                }}
                className={`min-w-[40px] h-10 px-2 border rounded-md text-[11px] font-bold transition-all flex items-center justify-center ${
                  size === s
                    ? 'border-black text-black ring-1 ring-black' 
                    : 'border-gray-200 text-gray-500 hover:border-gray-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="border-t border-gray-100 pt-6">
        <button onClick={() => toggleSection('color')} className="flex items-center justify-between w-full text-left mb-4">
          <span className="text-sm font-bold tracking-widest uppercase text-gray-900">Color</span>
          {openSections.color ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {openSections.color && (
          <div className="flex flex-wrap gap-3">
            {options.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  const newColor = color === c.name ? "" : c.name;
                  setColor(newColor);
                  applyFilters({ color: newColor });
                }}
                className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${
                  color === c.name 
                    ? 'ring-2 ring-offset-2 ring-black' 
                    : 'ring-1 ring-gray-200 hover:ring-gray-400'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden w-full mb-6">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-md font-bold text-sm tracking-widest uppercase text-gray-900 bg-white shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filter & Sort
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="relative w-4/5 max-w-xs h-full bg-white shadow-xl overflow-y-auto p-6 flex flex-col">
            <button onClick={() => setIsMobileOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black">
              <X size={24} />
            </button>
            <div className="mt-8">
              {SidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-[280px] flex-shrink-0">
        <div className="sticky top-24">
          {SidebarContent}
        </div>
      </aside>
    </>
  );
}
