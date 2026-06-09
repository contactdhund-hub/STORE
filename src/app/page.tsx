import { ProductCard } from "@/components/product/ProductCard";
import { HeroCarousel } from "@/components/layout/HeroCarousel";
import { db } from "@/lib/db";

// Force dynamic so it always fetches fresh DB data
export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const categoryFilter = params.category;

  const liveProducts = await db.product.findMany({
    where: categoryFilter && categoryFilter !== 'ALL' ? {
      category: {
        equals: categoryFilter,
        mode: 'insensitive'
      }
    } : undefined,
    include: {
      images: true,
      sizes: true,
      colors: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const slides = await db.heroSlide.findMany({
    orderBy: { order: 'asc' }
  });

  // Map Prisma relations to match the frontend types expected by ProductCard
  const mappedProducts = liveProducts.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    price: p.price,
    category: p.category,
    images: p.images.map(img => img.url),
    sizes: p.sizes.map(s => s.name),
    colors: p.colors.map(c => ({ name: c.name, hex: c.hex }))
  }));

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Carousel Section */}
      <HeroCarousel slides={slides} />

      <div className="w-full max-w-[1800px] px-4 sm:px-6 md:px-8 py-6 mb-16">
        {/* Category Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-serif font-medium text-gray-800">Featured Collection</h2>
          <span className="text-sm text-gray-500 font-sans">{mappedProducts.length} Products</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-12 sm:gap-x-6">
          {mappedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {mappedProducts.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500 font-sans">
              No products available. Add some from the admin dashboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
