import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductOptions } from "./ProductOptions";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { ReviewSection } from "@/components/product/ReviewSection";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  // Fetch product and all its relations in parallel
  const [products, productImages, productSizes, productColors, reviews] = await Promise.all([
    sql`SELECT * FROM "Product" WHERE "id" = ${id} LIMIT 1`,
    sql`SELECT * FROM "ProductImage" WHERE "productId" = ${id}`,
    sql`SELECT * FROM "ProductSize" WHERE "productId" = ${id}`,
    sql`SELECT * FROM "ProductColor" WHERE "productId" = ${id}`,
    sql`SELECT * FROM "Review" WHERE "productId" = ${id} ORDER BY "createdAt" DESC`,
  ]);

  if (products.length === 0) {
    notFound();
  }

  const product = {
    ...products[0],
    images: productImages,
    sizes: productSizes,
    colors: productColors,
    reviews,
  } as any;

  // Get related products (any 3 products that aren't this one)
  const relatedRaw = await sql`
    SELECT * FROM "Product" WHERE "id" != ${id} LIMIT 3
  `;

  let relatedProducts: any[] = [];
  if (relatedRaw.length > 0) {
    const relatedIds = relatedRaw.map(r => r.id);
    const [relImages, relSizes, relColors] = await Promise.all([
      sql`SELECT * FROM "ProductImage" WHERE "productId" = ANY(${relatedIds})`,
      sql`SELECT * FROM "ProductSize" WHERE "productId" = ANY(${relatedIds})`,
      sql`SELECT * FROM "ProductColor" WHERE "productId" = ANY(${relatedIds})`,
    ]);
    relatedProducts = relatedRaw.map(rp => ({
      ...rp,
      images: relImages.filter(img => img.productId === rp.id).map(img => img.url),
      sizes: relSizes.filter(s => s.productId === rp.id).map(s => s.name),
      colors: relColors.filter(c => c.productId === rp.id).map(c => ({ name: c.name, hex: c.hex })),
    }));
  }

  const mainImage = product.images[0]?.url || "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1200px]">
      {/* Breadcrumbs */}
      <nav className="text-[10px] font-bold tracking-widest text-gray-400 mb-8 uppercase flex items-center gap-2">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <Link href="/" className="hover:text-black transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-24">
        {/* Left Side: Image Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto hide-scrollbar w-full md:w-20 flex-shrink-0">
            <div className="w-[70px] h-[90px] border-2 border-black rounded-lg overflow-hidden flex-shrink-0 cursor-pointer p-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mainImage} className="w-full h-full object-cover rounded-md" alt="Thumb" />
            </div>
            {product.images.slice(1).map((img: any, idx: number) => (
              <div key={idx} className="w-[70px] h-[90px] border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:border-black transition-colors p-0.5">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={img.url} className="w-full h-full object-cover rounded-md" alt="Thumb" />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 bg-[#fcfcfc] rounded-2xl overflow-hidden aspect-[4/5] relative border border-gray-100">
            <div className="absolute top-5 left-5 bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-full z-10 tracking-widest">
              30% OFF
            </div>
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img 
               src={mainImage} 
               alt={product.name} 
               className="absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply"
             />
          </div>
        </div>

        {/* Right Side: Product Buy Box */}
        <div className="flex flex-col py-2">
          <ProductOptions product={product} />
        </div>
      </div>

      {/* Details & Care Instructions */}
      <div className="mb-24">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Product Details</h2>
          <div className="h-px bg-gray-100 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {product.description || "Relaxed fit cargo pants in premium cotton twill."}
            </p>
          </div>
          <div>
            <div className="bg-[#fcfcfc] p-8 rounded-xl border border-gray-100">
              <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-900 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                Care Instructions
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Premium quality materials. Hand wash recommended or machine wash cold on delicate cycle. Do not bleach. Iron on low heat if necessary.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <ReviewSection productId={product.id} reviews={product.reviews as any} />

      {/* You May Also Like */}
      {relatedProducts.length > 0 && (
        <div className="mb-12 border-t border-gray-100 pt-16">
          <h2 className="text-2xl font-bold text-[#0a1128] tracking-tight mb-8 text-center md:text-left">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rp: any) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
