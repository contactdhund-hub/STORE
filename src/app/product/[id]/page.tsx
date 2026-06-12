import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductOptions } from "./ProductOptions";
import { ProductGallery } from "./ProductGallery";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { ReviewSection } from "@/components/product/ReviewSection";

// Revalidate product pages every 60 seconds (ISR)
export const revalidate = 60;

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  // Single query: product + images + sizes + colors via JOINs
  const [productResult, reviews, relatedRaw] = await Promise.all([
    sql`
      SELECT 
        p.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', pi."id", 'url', pi."url")) FILTER (WHERE pi."id" IS NOT NULL), '[]') as images,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', ps."id", 'name', ps."name")) FILTER (WHERE ps."id" IS NOT NULL), '[]') as sizes,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', pc."id", 'name', pc."name", 'hex', pc."hex")) FILTER (WHERE pc."id" IS NOT NULL), '[]') as colors
      FROM "Product" p
      LEFT JOIN "ProductImage" pi ON pi."productId" = p."id"
      LEFT JOIN "ProductSize" ps ON ps."productId" = p."id"
      LEFT JOIN "ProductColor" pc ON pc."productId" = p."id"
      WHERE p."id" = ${id}
      GROUP BY p."id"
      LIMIT 1
    `,
    sql`SELECT * FROM "Review" WHERE "productId" = ${id} ORDER BY "createdAt" DESC`,
    sql`
      SELECT 
        p.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object('url', pi."url")) FILTER (WHERE pi."id" IS NOT NULL), '[]') as images,
        COALESCE(json_agg(DISTINCT ps."name") FILTER (WHERE ps."id" IS NOT NULL), '[]') as sizes,
        COALESCE(json_agg(DISTINCT jsonb_build_object('name', pc."name", 'hex', pc."hex")) FILTER (WHERE pc."id" IS NOT NULL), '[]') as colors
      FROM "Product" p
      LEFT JOIN "ProductImage" pi ON pi."productId" = p."id"
      LEFT JOIN "ProductSize" ps ON ps."productId" = p."id"
      LEFT JOIN "ProductColor" pc ON pc."productId" = p."id"
      WHERE p."id" != ${id}
      GROUP BY p."id"
      LIMIT 3
    `,
  ]);

  if (productResult.length === 0) {
    notFound();
  }

  const product = {
    ...productResult[0],
    reviews,
  } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */;

  const relatedProducts = relatedRaw.map((rp: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => ({
    ...rp,
    images: (rp.images || []).map((img: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => img.url),
    sizes: rp.sizes || [],
    colors: rp.colors || [],
    inStock: rp.inStock !== false
  }));



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
        <ProductGallery images={product.images} productName={product.name} />

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
      <ReviewSection productId={product.id} reviews={product.reviews as any /* eslint-disable-line @typescript-eslint/no-explicit-any */} />

      {/* You May Also Like */}
      {relatedProducts.length > 0 && (
        <div className="mb-12 border-t border-gray-100 pt-16">
          <h2 className="text-2xl font-bold text-[#0a1128] tracking-tight mb-8 text-center md:text-left">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rp: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
