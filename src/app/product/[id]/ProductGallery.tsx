"use client";

import { useState } from "react";

export function ProductGallery({ images, productName }: { images: any[], productName: string }) {
  const [mainImage, setMainImage] = useState(
    images[0]?.url || "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop"
  );

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto hide-scrollbar w-full md:w-20 flex-shrink-0">
        {images.map((img: any, idx: number) => {
          const isSelected = mainImage === img.url;
          return (
            <div 
              key={idx} 
              onClick={() => setMainImage(img.url)}
              className={`w-[70px] h-[90px] border-2 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer transition-colors p-0.5 ${
                isSelected ? "border-black" : "border-transparent hover:border-gray-300"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} className="w-full h-full object-cover rounded-md" alt={`Thumb ${idx}`} />
            </div>
          );
        })}
      </div>

      {/* Main Image */}
      <div className="flex-1 bg-[#fcfcfc] rounded-2xl overflow-hidden aspect-[4/5] relative border border-gray-100">
        <div className="absolute top-5 left-5 bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-full z-10 tracking-widest">
          30% OFF
        </div>
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img 
           src={mainImage} 
           alt={productName} 
           className="absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply transition-opacity duration-300"
         />
      </div>
    </div>
  );
}
