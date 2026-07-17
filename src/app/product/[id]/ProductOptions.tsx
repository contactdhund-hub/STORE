"use client";

import { useState, useEffect } from "react";
import { Star, Heart, ShoppingBag, Truck, RefreshCcw } from "lucide-react";
import { useCart } from "@/store/useCart";
import { getStoreSettings } from "@/actions/settings";
import { toggleWishlist } from "@/actions/wishlist";

export function ProductOptions({ product, initialWishlisted = false }: { product: any, initialWishlisted?: boolean /* eslint-disable-line @typescript-eslint/no-explicit-any */ }) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes?.[0]?.name || null);
  const [selectedColor, setSelectedColor] = useState<{name: string, hex: string} | null>(product.colors?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [shippingConfig, setShippingConfig] = useState({ fee: 250, threshold: 2000 });
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  const reviews = product.reviews || [];
  const averageRating = reviews.length > 0 ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  useEffect(() => {
    getStoreSettings().then(settings => {
      setShippingConfig({ fee: settings.shippingFee, threshold: settings.freeShippingThreshold });
    }).catch(console.error);
  }, []);

  const handleWishlist = async () => {
    setIsWishlistLoading(true);
    const res = await toggleWishlist(product.id);
    if (res.success) {
      setIsWishlisted(res.isWishlisted!);
    } else {
      alert(res.error);
    }
    setIsWishlistLoading(false);
  };

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
          {[1,2,3,4,5].map(i => (
             <Star key={i} size={14} fill={i <= Math.round(Number(averageRating)) ? "currentColor" : "none"} className={i <= Math.round(Number(averageRating)) ? "text-black" : "text-gray-200"} />
          ))}
        </div>
        <span className="text-xs font-bold text-gray-900">{averageRating}</span>
        <span className="text-gray-300">•</span>
        <a href="#reviews" className="text-[10px] font-bold text-gray-400 hover:text-black underline uppercase tracking-widest">{reviews.length} Reviews</a>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-gray-100">
        <span className="text-3xl font-black text-[#0a1128]">Rs. {product.price.toLocaleString()}</span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="text-[15px] font-bold text-gray-400 line-through">Rs. {product.originalPrice.toLocaleString()}</span>
        )}
      </div>

      {/* Size Selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] font-bold tracking-widest text-[#0a1128] uppercase">Select Size</span>
            <button onClick={(e) => { e.preventDefault(); setIsSizeChartOpen(true); }} className="text-[10px] font-bold tracking-widest text-gray-400 uppercase hover:text-black">Size Chart</button>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {product.sizes.map((size: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
              <button
                key={size.id || size.name || size}
                onClick={() => setSelectedSize(size.name || size)}
                disabled={product.inStock === false}
                className={`w-[52px] h-[42px] border rounded-md text-[11px] font-bold transition-all ${
                  selectedSize === (size.name || size)
                    ? 'border-black text-black ring-1 ring-black' 
                    : 'border-gray-200 text-gray-500 hover:border-gray-400'
                } ${product.inStock === false ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {size.name || size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {product.colors && product.colors.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] font-bold tracking-widest text-[#0a1128] uppercase">Select Color</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
              <button
                key={color.id || color.name}
                onClick={() => setSelectedColor(color)}
                disabled={product.inStock === false}
                className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${
                  selectedColor?.name === color.name 
                    ? 'ring-2 ring-offset-2 ring-black' 
                    : 'ring-1 ring-gray-200 hover:ring-gray-400'
                } ${product.inStock === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
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
            onClick={() => setQuantity(Math.min(quantity + 1, product.stockQuantity ?? 34))}
            className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black"
          >
            +
          </button>
        </div>
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          In Stock: {product.stockQuantity ?? 34}
        </span>
      </div>

      {/* Buy Actions */}
      <div className="flex gap-3 mb-10 pb-10 border-b border-gray-100">
        <button 
          disabled={product.inStock === false}
          onClick={() => {
            if (product.inStock === false) return;
            addItem({
              id: `${product.id}-${selectedSize || 'OS'}-${selectedColor?.name || 'OC'}`,
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity,
              size: selectedSize,
              color: selectedColor,
              image: product.images?.[0]?.url || "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop"
            });
          }}
          className={`flex-1 h-[52px] rounded-md flex items-center justify-center gap-3 transition-colors shadow-sm ${product.inStock === false ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-black text-white hover:bg-gray-800'}`}
        >
          <ShoppingBag size={16} />
          <span className="text-[11px] font-bold tracking-[0.15em] uppercase">{product.inStock === false ? 'Sold Out' : 'Add to Bag'}</span>
        </button>
        <button 
          onClick={handleWishlist}
          disabled={isWishlistLoading}
          className="w-[52px] h-[52px] border border-gray-200 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500 transition-colors disabled:opacity-50"
        >
          <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-red-500" : ""} />
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
            <p className="text-[11px] text-gray-500">On all orders above Rs. {shippingConfig.threshold.toLocaleString()}</p>
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

      {isSizeChartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsSizeChartOpen(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Size Guide</h2>
              <button onClick={() => setIsSizeChartOpen(false)} className="text-gray-400 hover:text-black text-2xl">&times;</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-bold tracking-widest text-gray-500">
                  <tr><th className="py-3 px-4">Size</th><th className="py-3 px-4">Chest (in)</th><th className="py-3 px-4">Waist (in)</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="py-3 px-4 font-bold">S</td><td className="py-3 px-4">34-36</td><td className="py-3 px-4">28-30</td></tr>
                  <tr><td className="py-3 px-4 font-bold">M</td><td className="py-3 px-4">38-40</td><td className="py-3 px-4">32-34</td></tr>
                  <tr><td className="py-3 px-4 font-bold">L</td><td className="py-3 px-4">42-44</td><td className="py-3 px-4">36-38</td></tr>
                  <tr><td className="py-3 px-4 font-bold">XL</td><td className="py-3 px-4">46-48</td><td className="py-3 px-4">40-42</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
