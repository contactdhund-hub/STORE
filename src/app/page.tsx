import { ProductCard } from "@/components/product/ProductCard";
import { HeroCarousel } from "@/components/layout/HeroCarousel";
import { sql } from "@/lib/db";

// Revalidate every 30 seconds instead of force-dynamic (ISR)
export const revalidate = 30;

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string, q?: string }> }) {
  const params = await searchParams;
  const categoryFilter = params.category;
  const searchQuery = params.q;

  // Single query with JOINs to get products + all relations in one round-trip
  let products;
  if (searchQuery) {
    const searchPattern = `%${searchQuery}%`;
    products = await sql`
      SELECT 
        p.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object('url', pi."url")) FILTER (WHERE pi."id" IS NOT NULL), '[]') as images,
        COALESCE(json_agg(DISTINCT ps."name") FILTER (WHERE ps."id" IS NOT NULL), '[]') as sizes,
        COALESCE(json_agg(DISTINCT jsonb_build_object('name', pc."name", 'hex', pc."hex")) FILTER (WHERE pc."id" IS NOT NULL), '[]') as colors
      FROM "Product" p
      LEFT JOIN "ProductImage" pi ON pi."productId" = p."id"
      LEFT JOIN "ProductSize" ps ON ps."productId" = p."id"
      LEFT JOIN "ProductColor" pc ON pc."productId" = p."id"
      WHERE LOWER(p."name") LIKE LOWER(${searchPattern}) OR LOWER(p."description") LIKE LOWER(${searchPattern})
      GROUP BY p."id"
      ORDER BY p."createdAt" DESC
    `;
  } else if (categoryFilter && categoryFilter !== 'ALL') {
    products = await sql`
      SELECT 
        p.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object('url', pi."url")) FILTER (WHERE pi."id" IS NOT NULL), '[]') as images,
        COALESCE(json_agg(DISTINCT ps."name") FILTER (WHERE ps."id" IS NOT NULL), '[]') as sizes,
        COALESCE(json_agg(DISTINCT jsonb_build_object('name', pc."name", 'hex', pc."hex")) FILTER (WHERE pc."id" IS NOT NULL), '[]') as colors
      FROM "Product" p
      LEFT JOIN "ProductImage" pi ON pi."productId" = p."id"
      LEFT JOIN "ProductSize" ps ON ps."productId" = p."id"
      LEFT JOIN "ProductColor" pc ON pc."productId" = p."id"
      WHERE LOWER(p."category") = LOWER(${categoryFilter})
      GROUP BY p."id"
      ORDER BY p."createdAt" DESC
    `;
  } else {
    products = await sql`
      SELECT 
        p.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object('url', pi."url")) FILTER (WHERE pi."id" IS NOT NULL), '[]') as images,
        COALESCE(json_agg(DISTINCT ps."name") FILTER (WHERE ps."id" IS NOT NULL), '[]') as sizes,
        COALESCE(json_agg(DISTINCT jsonb_build_object('name', pc."name", 'hex', pc."hex")) FILTER (WHERE pc."id" IS NOT NULL), '[]') as colors
      FROM "Product" p
      LEFT JOIN "ProductImage" pi ON pi."productId" = p."id"
      LEFT JOIN "ProductSize" ps ON ps."productId" = p."id"
      LEFT JOIN "ProductColor" pc ON pc."productId" = p."id"
      GROUP BY p."id"
      ORDER BY p."createdAt" DESC
    `;
  }

  const slides = await sql`SELECT * FROM "HeroSlide" ORDER BY "order" ASC`;

  // Map to match the frontend types
  const mappedProducts = products.map((p: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    price: p.price,
    category: p.category,
    images: (p.images || []).map((img: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => img.url),
    sizes: p.sizes || [],
    colors: p.colors || [],
    inStock: p.inStock !== false // Default to true if null/undefined
  }));

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Carousel Section */}
      {/* Hero Carousel Section - Hide during search */}
      {!searchQuery && <HeroCarousel slides={slides as any /* eslint-disable-line @typescript-eslint/no-explicit-any */} />}

      <div className="w-full max-w-[1800px] px-4 sm:px-6 md:px-8 py-6 mb-16">
        {/* Category Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-serif font-medium text-gray-800">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Featured Collection"}
          </h2>
          <span className="text-sm text-gray-500 font-sans">{mappedProducts.length} Products</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-12 sm:gap-x-6">
          {mappedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {mappedProducts.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500 font-sans">
              No products found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
