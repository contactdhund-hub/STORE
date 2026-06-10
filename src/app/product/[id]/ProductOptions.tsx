"use client";

import { useState } from "react";
import { Star, Heart, ShoppingBag, Truck, RefreshCcw } from "lucide-react";
import { useCart } from "@/store/useCart";

export function ProductOptions({ product }: { product: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ }) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes?.[0]?.name || null);
  const [quantity, setQuantity] = useState(1);

  const mockOriginalPrice = product.price * 1.42;

  return (
    <div className="flex flex-col h-full">
      {/* Tags */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase border border-gray-200 px-2.5 py-1 rounded-sm">
          Collection
        </span>
        <span className="text-[10px] font-bold tracking-widest text-[#10b981] uppercase flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          In Stock
        </span>
      </div>

      {/* Title & Reviews */}
      <h1 className="text-[26px] md:text-[32px] font-bold text-[#0a1128] tracking-tight mb-2 leading-tight">{product.name}</h1>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="flex gap-0.5 text-[#0a1128]">
           <Star size={14} fill="currentColor" />
           <Star size={14} fill="currentColor" />
           <Star size={14} fill="currentColor" />
           <Star size={14} fill="currentColor" />
           <Star size={14} fill="currentColor" className="text-gray-200" />
        </div>
        <span className="text-xs font-bold text-gray-900">4.5</span>
        <span className="text-gray-300">•</span>
        <a href="#" className="text-[10px] font-bold text-gray-400 hover:text-black underline uppercase tracking-widest">0 Reviews</a>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-gray-100">
        <span className="text-3xl font-black text-[#0a1128]">Rs. {product.price.toLocaleString()}</span>
        <span className="text-[15px] font-bold text-gray-400 line-through">Rs. {mockOriginalPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
      </div>

      {/* Size Selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] font-bold tracking-widest text-[#0a1128] uppercase">Select Size</span>
            <a href="#" className="text-[10px] font-bold tracking-widest text-gray-400 uppercase hover:text-black">Size Chart</a>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {product.sizes.map((size: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(size.name)}
                className={`w-[52px] h-[42px] border rounded-md text-[11px] font-bold transition-all ${
                  selectedSize === size.name 
                    ? 'border-black text-black ring-1 ring-black' 
                    : 'border-gray-200 text-gray-500 hover:border-gray-400'
                }`}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & Stock */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center border border-gray-200 rounded-md h-[46px] w-[100px]">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black"
          >
            -
          </button>
          <span className="flex-1 text-center text-[13px] font-bold text-gray-900">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black"
          >
            +
          </button>
        </div>
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          In Stock: 34
        </span>
      </div>

      {/* Buy Actions */}
      <div className="flex gap-3 mb-10 pb-10 border-b border-gray-100">
        <button 
          onClick={() => {
            addItem({
              id: `${product.id}-${selectedSize}`,
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity,
              size: selectedSize,
              image: product.images?.[0]?.url || "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop"
            });
          }}
          className="flex-1 bg-black text-white h-[52px] rounded-md flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors shadow-sm"
        >
          <ShoppingBag size={16} />
          <span className="text-[11px] font-bold tracking-[0.15em] uppercase">Add to Bag</span>
        </button>
        <button className="w-[52px] h-[52px] border border-gray-200 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500 transition-colors">
          <Heart size={20} />
        </button>
      </div>

      {/* Info Blocks */}
      <div className="space-y-6">
        <div className="flex gap-4 items-start">
          <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 flex-shrink-0 border border-gray-100">
            <Truck size={16} />
          </div>
          <div className="pt-0.5">
            <h4 className="text-[11px] font-bold tracking-widest text-[#0a1128] uppercase mb-1">Free Shipping</h4>
            <p className="text-[11px] text-gray-500">On all orders above Rs. 2,000</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 flex-shrink-0 border border-gray-100">
            <RefreshCcw size={16} />
          </div>
          <div className="pt-0.5">
            <h4 className="text-[11px] font-bold tracking-widest text-[#0a1128] uppercase mb-1">7 Days Easy Return</h4>
            <p className="text-[11px] text-gray-500">Hassle-free return policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
