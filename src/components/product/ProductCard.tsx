"use client";

import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/store/useCart';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const imageUrl = product.images[0] || `https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop`;

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col items-center text-center pb-8 transition-transform duration-300 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative w-full aspect-[4/5] bg-[#f4f4f4] overflow-hidden mb-5 rounded-sm shadow-[0_2px_10px_rgba(0,0,0,0.03)] group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-500">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out ${product.inStock === false ? 'opacity-50 grayscale hover:scale-100' : 'group-hover:scale-105'}`}
        />
        
        {product.inStock === false && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <span className="bg-white/90 text-black px-4 py-2 text-xs font-bold tracking-[0.2em] uppercase border border-gray-100 shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
        
        {/* Add To Cart Hover Overlay */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
          <button 
            disabled={product.inStock === false}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (product.inStock === false) return;
              
              // Get the first size or null
              const defaultSize = product.sizes && product.sizes.length > 0 
                ? (typeof product.sizes[0] === 'string' ? product.sizes[0] : (product.sizes[0] as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).name)
                : null;
                
              addItem({
                id: `${product.id}-${defaultSize}`,
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                size: defaultSize,
                image: imageUrl
              });
            }}
            className={`w-full text-[11px] font-bold tracking-widest py-4 uppercase transition-colors ${product.inStock === false ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#0a1128] text-white hover:bg-black'}`}
          >
            {product.inStock === false ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
      
      {/* Details */}
      <div className="flex flex-col items-center w-full px-2">
        <p className="text-[10px] text-gray-500 font-medium tracking-[0.15em] uppercase mb-1.5 font-sans">{product.category}</p>
        <h3 className="text-[15px] font-serif font-medium text-gray-900 mb-2 truncate w-full group-hover:text-black transition-colors">{product.name}</h3>
        <p className="text-[14px] font-semibold text-gray-800 mb-3 font-sans">Rs {product.price.toLocaleString()}</p>
        
        {/* Color Swatches (if any) */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-3">
            {product.colors.map((color: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, index) => {
              const hex = color.hex || '#000';
              return (
                <div 
                  key={index}
                  className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: hex }}
                  title={color.name}
                />
              );
            })}
          </div>
        )}

        {/* Size Swatches */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {product.sizes.map((size: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, index) => {
              const sizeName = typeof size === 'string' ? size : size.name;
              return (
              <div 
                key={index} 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className={`w-7 h-7 flex items-center justify-center text-[10px] font-medium border rounded-sm transition-colors ${index === 0 ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'} cursor-default`}
              >
                {sizeName}
              </div>
            )})}
          </div>
        )}
      </div>
    </Link>
  );
}
