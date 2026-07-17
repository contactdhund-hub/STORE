import { ProductCard } from "@/components/product/ProductCard";
import { HeroCarousel } from "@/components/layout/HeroCarousel";
import { ShopSidebar } from "@/components/shop/ShopSidebar";
import { sql } from "@/lib/db";

// Revalidate every 30 seconds instead of force-dynamic (ISR)
export const revalidate = 30;

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string, q?: string, size?: string, color?: string, minPrice?: string, maxPrice?: string }> }) {
  const params = await searchParams;
  const categoryFilter = params.category;
  const searchQuery = params.q;
  const sizeFilter = params.size;
  const colorFilter = params.color;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : null;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : null;

  const categoryParam = categoryFilter && categoryFilter !== 'ALL' ? categoryFilter : null;
  const searchParam = searchQuery ? `%${searchQuery}%` : null;

  // Fetch products with dynamic filters
  const products = await sql`
      SELECT 
        p.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object('url', pi."url")) FILTER (WHERE pi."id" IS NOT NULL), '[]') as images,
        COALESCE(json_agg(DISTINCT ps."name") FILTER (WHERE ps."id" IS NOT NULL), '[]') as sizes,
        COALESCE(json_agg(DISTINCT jsonb_build_object('name', pc."name", 'hex', pc."hex")) FILTER (WHERE pc."id" IS NOT NULL), '[]') as colors
      FROM "Product" p
      LEFT JOIN "ProductImage" pi ON pi."productId" = p."id"
      LEFT JOIN "ProductSize" ps ON ps."productId" = p."id"
      LEFT JOIN "ProductColor" pc ON pc."productId" = p."id"
      WHERE 
        (${searchParam}::text IS NULL OR LOWER(p."name") LIKE LOWER(${searchParam}) OR LOWER(p."description") LIKE LOWER(${searchParam}))
        AND (${categoryParam}::text IS NULL OR LOWER(p."category") = LOWER(${categoryParam}))
        AND (${minPrice}::numeric IS NULL OR p."price" >= ${minPrice})
        AND (${maxPrice}::numeric IS NULL OR p."price" <= ${maxPrice})
      GROUP BY p."id"
      HAVING 
        (${sizeFilter || null}::text IS NULL OR bool_or(ps."name" = ${sizeFilter || ''}))
        AND (${colorFilter || null}::text IS NULL OR bool_or(pc."name" = ${colorFilter || ''}))
      ORDER BY p."createdAt" DESC
  `;

  const slides = await sql`SELECT * FROM "HeroSlide" ORDER BY "order" ASC`;

  // Fetch dynamic filter options
  const [categoriesResult, sizesResult, colorsResult] = await Promise.all([
    sql`SELECT DISTINCT "category" FROM "Product" WHERE "category" IS NOT NULL ORDER BY "category"`,
    sql`SELECT DISTINCT "name" FROM "ProductSize" WHERE "name" IS NOT NULL ORDER BY "name"`,
    sql`SELECT DISTINCT "name", "hex" FROM "ProductColor" WHERE "name" IS NOT NULL`
  ]);

  const filterOptions = {
    categories: categoriesResult.map((r: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => r.category),
    sizes: sizesResult.map((r: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => r.name),
    colors: colorsResult.map((r: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => ({ name: r.name, hex: r.hex }))
  };

  // Map to match the frontend types
  const mappedProducts = products.map((p: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    price: p.price,
    originalPrice: p.originalPrice,
    category: p.category,
    images: (p.images || []).map((img: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => img.url),
    sizes: p.sizes || [],
    colors: p.colors || [],
    stockQuantity: p.stockQuantity,
    inStock: (p.stockQuantity ?? 34) > 0
  }));

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Carousel Section - Hide during search or filtering */}
      {!searchQuery && !categoryParam && !sizeFilter && !colorFilter && !minPrice && !maxPrice && (
        <HeroCarousel slides={slides as any /* eslint-disable-line @typescript-eslint/no-explicit-any */} />
      )}

      <div className="w-full max-w-[1800px] px-4 sm:px-6 md:px-8 py-6 mb-16">
        {/* Category Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-serif font-medium text-gray-800">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Featured Collection"}
          </h2>
          <span className="text-sm text-gray-500 font-sans">{mappedProducts.length} Products</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <ShopSidebar options={filterOptions} />
          
          <div className="flex-1 w-full">
            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-12 sm:gap-x-6">
              {mappedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {mappedProducts.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-500 font-sans">
                  No products found matching your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
